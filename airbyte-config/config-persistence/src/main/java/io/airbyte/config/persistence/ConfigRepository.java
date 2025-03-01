/*
 * Copyright (c) 2022 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.config.persistence;

import static io.airbyte.db.instance.configs.jooq.generated.Tables.ACTOR;
import static io.airbyte.db.instance.configs.jooq.generated.Tables.ACTOR_CATALOG;
import static io.airbyte.db.instance.configs.jooq.generated.Tables.ACTOR_CATALOG_FETCH_EVENT;
import static io.airbyte.db.instance.configs.jooq.generated.Tables.ACTOR_DEFINITION;
import static io.airbyte.db.instance.configs.jooq.generated.Tables.ACTOR_DEFINITION_WORKSPACE_GRANT;
import static io.airbyte.db.instance.configs.jooq.generated.Tables.ACTOR_OAUTH_PARAMETER;
import static io.airbyte.db.instance.configs.jooq.generated.Tables.CONNECTION;
import static io.airbyte.db.instance.configs.jooq.generated.Tables.CONNECTION_OPERATION;
import static io.airbyte.db.instance.configs.jooq.generated.Tables.OPERATION;
import static io.airbyte.db.instance.configs.jooq.generated.Tables.WORKSPACE;
import static org.jooq.impl.DSL.asterisk;
import static org.jooq.impl.DSL.lower;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.base.Charsets;
import com.google.common.collect.Sets;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;
import io.airbyte.commons.json.Jsons;
import io.airbyte.commons.lang.MoreBooleans;
import io.airbyte.config.ActorCatalog;
import io.airbyte.config.AirbyteConfig;
import io.airbyte.config.ConfigSchema;
import io.airbyte.config.DestinationConnection;
import io.airbyte.config.DestinationOAuthParameter;
import io.airbyte.config.SourceConnection;
import io.airbyte.config.SourceOAuthParameter;
import io.airbyte.config.StandardDestinationDefinition;
import io.airbyte.config.StandardSourceDefinition;
import io.airbyte.config.StandardSync;
import io.airbyte.config.StandardSyncOperation;
import io.airbyte.config.StandardSyncState;
import io.airbyte.config.StandardWorkspace;
import io.airbyte.config.State;
import io.airbyte.config.WorkspaceServiceAccount;
import io.airbyte.db.Database;
import io.airbyte.db.ExceptionWrappingDatabase;
import io.airbyte.db.instance.configs.jooq.generated.enums.ActorType;
import io.airbyte.db.instance.configs.jooq.generated.enums.ReleaseStage;
import io.airbyte.db.instance.configs.jooq.generated.enums.StatusType;
import io.airbyte.db.instance.configs.jooq.generated.tables.Actor;
import io.airbyte.db.instance.configs.jooq.generated.tables.ActorDefinition;
import io.airbyte.metrics.lib.MetricQueries;
import io.airbyte.protocol.models.AirbyteCatalog;
import io.airbyte.protocol.models.CatalogHelpers;
import io.airbyte.protocol.models.ConfiguredAirbyteCatalog;
import io.airbyte.protocol.models.StreamDescriptor;
import io.airbyte.validation.json.JsonValidationException;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.*;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SuppressWarnings({"PMD.AvoidThrowingRawExceptionTypes", "PMD.CyclomaticComplexity", "PMD.AvoidLiteralsInIfCondition"})
public class ConfigRepository {

  private static final Logger LOGGER = LoggerFactory.getLogger(ConfigRepository.class);

  private final ConfigPersistence persistence;
  private final ExceptionWrappingDatabase database;

  public ConfigRepository(final ConfigPersistence persistence, final Database database) {
    this.persistence = persistence;
    this.database = new ExceptionWrappingDatabase(database);
  }

  /**
   * Conduct a health check by attempting to read from the database. Since there isn't an
   * out-of-the-box call for this, mimic doing so by reading the ID column from the Workspace table's
   * first row. This query needs to be fast as this call can be made multiple times a second.
   *
   * @return true if read succeeds, even if the table is empty, and false if any error happens.
   */
  public boolean healthCheck() {
    try {
      database.query(ctx -> ctx.select(WORKSPACE.ID).from(WORKSPACE).limit(1).fetch());
    } catch (final Exception e) {
      LOGGER.error("Health check error: ", e);
      return false;
    }
    return true;
  }

  public StandardWorkspace getStandardWorkspace(final UUID workspaceId, final boolean includeTombstone)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    final StandardWorkspace workspace = persistence.getConfig(ConfigSchema.STANDARD_WORKSPACE, workspaceId.toString(), StandardWorkspace.class);

    if (!MoreBooleans.isTruthy(workspace.getTombstone()) || includeTombstone) {
      return workspace;
    }
    throw new ConfigNotFoundException(ConfigSchema.STANDARD_WORKSPACE, workspaceId.toString());
  }

  public Optional<StandardWorkspace> getWorkspaceBySlugOptional(final String slug, final boolean includeTombstone)
      throws IOException {
    final Result<Record> result;
    if (includeTombstone) {
      result = database.query(ctx -> ctx.select(WORKSPACE.asterisk())
          .from(WORKSPACE)
          .where(WORKSPACE.SLUG.eq(slug))).fetch();
    } else {
      result = database.query(ctx -> ctx.select(WORKSPACE.asterisk())
          .from(WORKSPACE)
          .where(WORKSPACE.SLUG.eq(slug)).andNot(WORKSPACE.TOMBSTONE)).fetch();
    }

    if (result.size() == 0) {
      return Optional.empty();
    }
    return Optional.of(DbConverter.buildStandardWorkspace(result.get(0)));
  }

  public StandardWorkspace getWorkspaceBySlug(final String slug, final boolean includeTombstone)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    return getWorkspaceBySlugOptional(slug, includeTombstone).orElseThrow(() -> new ConfigNotFoundException(ConfigSchema.STANDARD_WORKSPACE, slug));
  }

  public List<StandardWorkspace> listStandardWorkspaces(final boolean includeTombstone) throws JsonValidationException, IOException {

    final List<StandardWorkspace> workspaces = new ArrayList<>();

    for (final StandardWorkspace workspace : persistence.listConfigs(ConfigSchema.STANDARD_WORKSPACE, StandardWorkspace.class)) {
      if (!MoreBooleans.isTruthy(workspace.getTombstone()) || includeTombstone) {
        workspaces.add(workspace);
      }
    }

    return workspaces;
  }

  public void writeStandardWorkspace(final StandardWorkspace workspace) throws JsonValidationException, IOException {
    persistence.writeConfig(ConfigSchema.STANDARD_WORKSPACE, workspace.getWorkspaceId().toString(), workspace);
  }

  public void setFeedback(final UUID workflowId) throws JsonValidationException, ConfigNotFoundException, IOException {
    final StandardWorkspace workspace = getStandardWorkspace(workflowId, false);

    workspace.setFeedbackDone(true);

    persistence.writeConfig(ConfigSchema.STANDARD_WORKSPACE, workspace.getWorkspaceId().toString(), workspace);
  }

  public StandardSourceDefinition getStandardSourceDefinition(final UUID sourceDefinitionId)
      throws JsonValidationException, IOException, ConfigNotFoundException {

    return persistence.getConfig(
        ConfigSchema.STANDARD_SOURCE_DEFINITION,
        sourceDefinitionId.toString(),
        StandardSourceDefinition.class);
  }

  public StandardSourceDefinition getSourceDefinitionFromSource(final UUID sourceId) {
    try {
      final SourceConnection source = getSourceConnection(sourceId);
      return getStandardSourceDefinition(source.getSourceDefinitionId());
    } catch (final Exception e) {
      throw new RuntimeException(e);
    }
  }

  public StandardSourceDefinition getSourceDefinitionFromConnection(final UUID connectionId) {
    try {
      final StandardSync sync = getStandardSync(connectionId);
      return getSourceDefinitionFromSource(sync.getSourceId());
    } catch (final Exception e) {
      throw new RuntimeException(e);
    }
  }

  public StandardWorkspace getStandardWorkspaceFromConnection(final UUID connectionId, final boolean isTombstone) {
    try {
      final StandardSync sync = getStandardSync(connectionId);
      final SourceConnection source = getSourceConnection(sync.getSourceId());
      return getStandardWorkspace(source.getWorkspaceId(), isTombstone);
    } catch (final Exception e) {
      throw new RuntimeException(e);
    }
  }

  public List<StandardSourceDefinition> listStandardSourceDefinitions(final boolean includeTombstone) throws JsonValidationException, IOException {
    final List<StandardSourceDefinition> sourceDefinitions = new ArrayList<>();
    for (final StandardSourceDefinition sourceDefinition : persistence.listConfigs(ConfigSchema.STANDARD_SOURCE_DEFINITION,
        StandardSourceDefinition.class)) {
      if (!MoreBooleans.isTruthy(sourceDefinition.getTombstone()) || includeTombstone) {
        sourceDefinitions.add(sourceDefinition);
      }
    }

    return sourceDefinitions;
  }

  public List<StandardSourceDefinition> listPublicSourceDefinitions(final boolean includeTombstone) throws IOException {
    return listStandardActorDefinitions(
        ActorType.source,
        DbConverter::buildStandardSourceDefinition,
        includeTombstones(ACTOR_DEFINITION.TOMBSTONE, includeTombstone),
        ACTOR_DEFINITION.PUBLIC.eq(true));
  }

  public List<StandardSourceDefinition> listGrantedSourceDefinitions(final UUID workspaceId, final boolean includeTombstones)
      throws IOException {
    return listActorDefinitionsJoinedWithGrants(
        workspaceId,
        JoinType.JOIN,
        ActorType.source,
        DbConverter::buildStandardSourceDefinition,
        includeTombstones(ACTOR_DEFINITION.TOMBSTONE, includeTombstones));
  }

  public List<Entry<StandardSourceDefinition, Boolean>> listGrantableSourceDefinitions(final UUID workspaceId,
                                                                                       final boolean includeTombstones)
      throws IOException {
    return listActorDefinitionsJoinedWithGrants(
        workspaceId,
        JoinType.LEFT_OUTER_JOIN,
        ActorType.source,
        record -> actorDefinitionWithGrantStatus(record, DbConverter::buildStandardSourceDefinition),
        ACTOR_DEFINITION.CUSTOM.eq(false),
        includeTombstones(ACTOR_DEFINITION.TOMBSTONE, includeTombstones));
  }

  public void writeStandardSourceDefinition(final StandardSourceDefinition sourceDefinition) throws JsonValidationException, IOException {
    persistence.writeConfig(ConfigSchema.STANDARD_SOURCE_DEFINITION, sourceDefinition.getSourceDefinitionId().toString(), sourceDefinition);
  }

  public void writeCustomSourceDefinition(final StandardSourceDefinition sourceDefinition, final UUID workspaceId)
      throws IOException {
    database.transaction(ctx -> {
      ConfigWriter.writeStandardSourceDefinition(List.of(sourceDefinition), ctx);
      writeActorDefinitionWorkspaceGrant(sourceDefinition.getSourceDefinitionId(), workspaceId, ctx);
      return null;
    });
  }

  public void deleteStandardSourceDefinition(final UUID sourceDefId) throws IOException {
    try {
      persistence.deleteConfig(ConfigSchema.STANDARD_SOURCE_DEFINITION, sourceDefId.toString());
    } catch (final ConfigNotFoundException e) {
      LOGGER.info("Attempted to delete source definition with id: {}, but it does not exist", sourceDefId);
    }
  }

  public void deleteSourceDefinitionAndAssociations(final UUID sourceDefinitionId)
      throws JsonValidationException, ConfigNotFoundException, IOException {
    deleteConnectorDefinitionAndAssociations(
        ConfigSchema.STANDARD_SOURCE_DEFINITION,
        ConfigSchema.SOURCE_CONNECTION,
        SourceConnection.class,
        SourceConnection::getSourceId,
        SourceConnection::getSourceDefinitionId,
        sourceDefinitionId);
  }

  public StandardDestinationDefinition getStandardDestinationDefinition(final UUID destinationDefinitionId)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    return persistence.getConfig(ConfigSchema.STANDARD_DESTINATION_DEFINITION, destinationDefinitionId.toString(),
        StandardDestinationDefinition.class);
  }

  public StandardDestinationDefinition getDestinationDefinitionFromDestination(final UUID destinationId) {
    try {
      final DestinationConnection destination = getDestinationConnection(destinationId);
      return getStandardDestinationDefinition(destination.getDestinationDefinitionId());
    } catch (final Exception e) {
      throw new RuntimeException(e);
    }
  }

  public StandardDestinationDefinition getDestinationDefinitionFromConnection(final UUID connectionId) {
    try {
      final StandardSync sync = getStandardSync(connectionId);
      return getDestinationDefinitionFromDestination(sync.getDestinationId());
    } catch (final Exception e) {
      throw new RuntimeException(e);
    }
  }

  public List<StandardDestinationDefinition> listStandardDestinationDefinitions(final boolean includeTombstone)
      throws JsonValidationException, IOException {
    final List<StandardDestinationDefinition> destinationDefinitions = new ArrayList<>();

    for (final StandardDestinationDefinition destinationDefinition : persistence.listConfigs(ConfigSchema.STANDARD_DESTINATION_DEFINITION,
        StandardDestinationDefinition.class)) {
      if (!MoreBooleans.isTruthy(destinationDefinition.getTombstone()) || includeTombstone) {
        destinationDefinitions.add(destinationDefinition);
      }
    }

    return destinationDefinitions;
  }

  public List<StandardDestinationDefinition> listPublicDestinationDefinitions(final boolean includeTombstone) throws IOException {
    return listStandardActorDefinitions(
        ActorType.destination,
        DbConverter::buildStandardDestinationDefinition,
        includeTombstones(ACTOR_DEFINITION.TOMBSTONE, includeTombstone),
        ACTOR_DEFINITION.PUBLIC.eq(true));
  }

  public List<StandardDestinationDefinition> listGrantedDestinationDefinitions(final UUID workspaceId, final boolean includeTombstones)
      throws IOException {
    return listActorDefinitionsJoinedWithGrants(
        workspaceId,
        JoinType.JOIN,
        ActorType.destination,
        DbConverter::buildStandardDestinationDefinition,
        includeTombstones(ACTOR_DEFINITION.TOMBSTONE, includeTombstones));
  }

  public List<Entry<StandardDestinationDefinition, Boolean>> listGrantableDestinationDefinitions(final UUID workspaceId,
                                                                                                 final boolean includeTombstones)
      throws IOException {
    return listActorDefinitionsJoinedWithGrants(
        workspaceId,
        JoinType.LEFT_OUTER_JOIN,
        ActorType.destination,
        record -> actorDefinitionWithGrantStatus(record, DbConverter::buildStandardDestinationDefinition),
        ACTOR_DEFINITION.CUSTOM.eq(false),
        includeTombstones(ACTOR_DEFINITION.TOMBSTONE, includeTombstones));
  }

  public void writeStandardDestinationDefinition(final StandardDestinationDefinition destinationDefinition)
      throws JsonValidationException, IOException {
    persistence.writeConfig(
        ConfigSchema.STANDARD_DESTINATION_DEFINITION,
        destinationDefinition.getDestinationDefinitionId().toString(),
        destinationDefinition);
  }

  public void writeCustomDestinationDefinition(final StandardDestinationDefinition destinationDefinition, final UUID workspaceId)
      throws IOException {
    database.transaction(ctx -> {
      ConfigWriter.writeStandardDestinationDefinition(List.of(destinationDefinition), ctx);
      writeActorDefinitionWorkspaceGrant(destinationDefinition.getDestinationDefinitionId(), workspaceId, ctx);
      return null;
    });
  }

  public void deleteStandardDestinationDefinition(final UUID destDefId) throws IOException {
    try {
      persistence.deleteConfig(ConfigSchema.STANDARD_DESTINATION_DEFINITION, destDefId.toString());
    } catch (final ConfigNotFoundException e) {
      LOGGER.info("Attempted to delete destination definition with id: {}, but it does not exist", destDefId);
    }
  }

  public void deleteStandardSyncDefinition(final UUID syncDefId) throws IOException {
    try {
      persistence.deleteConfig(ConfigSchema.STANDARD_SYNC, syncDefId.toString());
    } catch (final ConfigNotFoundException e) {
      LOGGER.info("Attempted to delete destination definition with id: {}, but it does not exist", syncDefId);
    }
  }

  public void deleteDestinationDefinitionAndAssociations(final UUID destinationDefinitionId)
      throws JsonValidationException, ConfigNotFoundException, IOException {
    deleteConnectorDefinitionAndAssociations(
        ConfigSchema.STANDARD_DESTINATION_DEFINITION,
        ConfigSchema.DESTINATION_CONNECTION,
        DestinationConnection.class,
        DestinationConnection::getDestinationId,
        DestinationConnection::getDestinationDefinitionId,
        destinationDefinitionId);
  }

  private <T> void deleteConnectorDefinitionAndAssociations(
                                                            final ConfigSchema definitionType,
                                                            final ConfigSchema connectorType,
                                                            final Class<T> connectorClass,
                                                            final Function<T, UUID> connectorIdGetter,
                                                            final Function<T, UUID> connectorDefinitionIdGetter,
                                                            final UUID definitionId)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    final Set<T> connectors = persistence.listConfigs(connectorType, connectorClass)
        .stream()
        .filter(connector -> connectorDefinitionIdGetter.apply(connector).equals(definitionId))
        .collect(Collectors.toSet());
    for (final T connector : connectors) {
      final Set<StandardSync> syncs = persistence.listConfigs(ConfigSchema.STANDARD_SYNC, StandardSync.class)
          .stream()
          .filter(sync -> sync.getSourceId().equals(connectorIdGetter.apply(connector))
              || sync.getDestinationId().equals(connectorIdGetter.apply(connector)))
          .collect(Collectors.toSet());

      for (final StandardSync sync : syncs) {
        persistence.deleteConfig(ConfigSchema.STANDARD_SYNC, sync.getConnectionId().toString());
      }
      persistence.deleteConfig(connectorType, connectorIdGetter.apply(connector).toString());
    }
    persistence.deleteConfig(definitionType, definitionId.toString());
  }

  public void writeActorDefinitionWorkspaceGrant(final UUID actorDefinitionId, final UUID workspaceId) throws IOException {
    database.query(ctx -> writeActorDefinitionWorkspaceGrant(actorDefinitionId, workspaceId, ctx));
  }

  private int writeActorDefinitionWorkspaceGrant(final UUID actorDefinitionId, final UUID workspaceId, final DSLContext ctx) {
    return ctx.insertInto(ACTOR_DEFINITION_WORKSPACE_GRANT)
        .set(ACTOR_DEFINITION_WORKSPACE_GRANT.ACTOR_DEFINITION_ID, actorDefinitionId)
        .set(ACTOR_DEFINITION_WORKSPACE_GRANT.WORKSPACE_ID, workspaceId)
        .execute();
  }

  public boolean actorDefinitionWorkspaceGrantExists(final UUID actorDefinitionId, final UUID workspaceId) throws IOException {
    final Integer count = database.query(ctx -> ctx.fetchCount(
        DSL.selectFrom(ACTOR_DEFINITION_WORKSPACE_GRANT)
            .where(ACTOR_DEFINITION_WORKSPACE_GRANT.ACTOR_DEFINITION_ID.eq(actorDefinitionId))
            .and(ACTOR_DEFINITION_WORKSPACE_GRANT.WORKSPACE_ID.eq(workspaceId))));
    return count == 1;
  }

  public void deleteActorDefinitionWorkspaceGrant(final UUID actorDefinitionId, final UUID workspaceId) throws IOException {
    database.query(ctx -> ctx.deleteFrom(ACTOR_DEFINITION_WORKSPACE_GRANT)
        .where(ACTOR_DEFINITION_WORKSPACE_GRANT.ACTOR_DEFINITION_ID.eq(actorDefinitionId))
        .and(ACTOR_DEFINITION_WORKSPACE_GRANT.WORKSPACE_ID.eq(workspaceId))
        .execute());
  }

  public boolean workspaceCanUseDefinition(final UUID actorDefinitionId, final UUID workspaceId)
      throws IOException {
    final Result<Record> records = actorDefinitionsJoinedWithGrants(
        workspaceId,
        JoinType.LEFT_OUTER_JOIN,
        ACTOR_DEFINITION.ID.eq(actorDefinitionId),
        ACTOR_DEFINITION.PUBLIC.eq(true).or(ACTOR_DEFINITION_WORKSPACE_GRANT.WORKSPACE_ID.eq(workspaceId)));
    return records.isNotEmpty();
  }

  public boolean workspaceCanUseCustomDefinition(final UUID actorDefinitionId, final UUID workspaceId)
      throws IOException {
    final Result<Record> records = actorDefinitionsJoinedWithGrants(
        workspaceId,
        JoinType.JOIN,
        ACTOR_DEFINITION.ID.eq(actorDefinitionId),
        ACTOR_DEFINITION.CUSTOM.eq(true));
    return records.isNotEmpty();
  }

  private <T> List<T> listStandardActorDefinitions(final ActorType actorType,
                                                   final Function<Record, T> recordToActorDefinition,
                                                   final Condition... conditions)
      throws IOException {
    final Result<Record> records = database.query(ctx -> ctx.select(asterisk()).from(ACTOR_DEFINITION)
        .where(conditions)
        .and(ACTOR_DEFINITION.ACTOR_TYPE.eq(actorType))
        .orderBy(lower(ACTOR_DEFINITION.NAME).asc())
        .fetch());

    return records.stream()
        .map(recordToActorDefinition)
        .toList();
  }

  private <T> List<T> listActorDefinitionsJoinedWithGrants(final UUID workspaceId,
                                                           final JoinType joinType,
                                                           final ActorType actorType,
                                                           final Function<Record, T> recordToReturnType,
                                                           final Condition... conditions)
      throws IOException {
    final Result<Record> records = actorDefinitionsJoinedWithGrants(
        workspaceId,
        joinType,
        ArrayUtils.addAll(conditions,
            ACTOR_DEFINITION.ACTOR_TYPE.eq(actorType),
            ACTOR_DEFINITION.PUBLIC.eq(false)));

    return records.stream()
        .map(recordToReturnType)
        .toList();
  }

  private <T> Entry<T, Boolean> actorDefinitionWithGrantStatus(final Record outerJoinRecord,
                                                               final Function<Record, T> recordToActorDefinition) {
    final T actorDefinition = recordToActorDefinition.apply(outerJoinRecord);
    final boolean granted = outerJoinRecord.get(ACTOR_DEFINITION_WORKSPACE_GRANT.WORKSPACE_ID) != null;
    return Map.entry(actorDefinition, granted);
  }

  private Result<Record> actorDefinitionsJoinedWithGrants(final UUID workspaceId,
                                                          final JoinType joinType,
                                                          final Condition... conditions)
      throws IOException {
    return database.query(ctx -> ctx.select(asterisk()).from(ACTOR_DEFINITION)
        .join(ACTOR_DEFINITION_WORKSPACE_GRANT, joinType)
        .on(ACTOR_DEFINITION.ID.eq(ACTOR_DEFINITION_WORKSPACE_GRANT.ACTOR_DEFINITION_ID),
            ACTOR_DEFINITION_WORKSPACE_GRANT.WORKSPACE_ID.eq(workspaceId))
        .where(conditions)
        .orderBy(lower(ACTOR_DEFINITION.NAME).asc())
        .fetch());
  }

  /**
   * Returns source with a given id. Does not contain secrets. To hydrate with secrets see { @link
   * SecretsRepositoryReader#getSourceConnectionWithSecrets(final UUID sourceId) }.
   *
   * @param sourceId - id of source to fetch.
   * @return sources
   * @throws JsonValidationException - throws if returned sources are invalid
   * @throws IOException - you never know when you IO
   * @throws ConfigNotFoundException - throws if no source with that id can be found.
   */
  public SourceConnection getSourceConnection(final UUID sourceId) throws JsonValidationException, ConfigNotFoundException, IOException {
    return persistence.getConfig(ConfigSchema.SOURCE_CONNECTION, sourceId.toString(), SourceConnection.class);
  }

  /**
   * MUST NOT ACCEPT SECRETS - Should only be called from { @link SecretsRepositoryWriter }
   *
   * Write a SourceConnection to the database. The configuration of the Source will be a partial
   * configuration (no secrets, just pointer to the secrets store).
   *
   * @param partialSource - The configuration of the Source will be a partial configuration (no
   *        secrets, just pointer to the secrets store)
   * @throws JsonValidationException - throws is the source is invalid
   * @throws IOException - you never know when you IO
   */
  public void writeSourceConnectionNoSecrets(final SourceConnection partialSource) throws JsonValidationException, IOException {
    persistence.writeConfig(ConfigSchema.SOURCE_CONNECTION, partialSource.getSourceId().toString(), partialSource);
  }

  /**
   * Returns all sources in the database. Does not contain secrets. To hydrate with secrets see
   * { @link SecretsRepositoryReader#listSourceConnectionWithSecrets() }.
   *
   * @return sources
   * @throws JsonValidationException - throws if returned sources are invalid
   * @throws IOException - you never know when you IO
   */
  public List<SourceConnection> listSourceConnection() throws JsonValidationException, IOException {
    return persistence.listConfigs(ConfigSchema.SOURCE_CONNECTION, SourceConnection.class);
  }

  /**
   * Returns destination with a given id. Does not contain secrets. To hydrate with secrets see
   * { @link SecretsRepositoryReader#getDestinationConnectionWithSecrets(final UUID destinationId) }.
   *
   * @param destinationId - id of destination to fetch.
   * @return destinations
   * @throws JsonValidationException - throws if returned destinations are invalid
   * @throws IOException - you never know when you IO
   * @throws ConfigNotFoundException - throws if no destination with that id can be found.
   */
  public DestinationConnection getDestinationConnection(final UUID destinationId)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    return persistence.getConfig(ConfigSchema.DESTINATION_CONNECTION, destinationId.toString(), DestinationConnection.class);
  }

  /**
   * MUST NOT ACCEPT SECRETS - Should only be called from { @link SecretsRepositoryWriter }
   *
   * Write a DestinationConnection to the database. The configuration of the Destination will be a
   * partial configuration (no secrets, just pointer to the secrets store).
   *
   * @param partialDestination - The configuration of the Destination will be a partial configuration
   *        (no secrets, just pointer to the secrets store)
   * @throws JsonValidationException - throws is the destination is invalid
   * @throws IOException - you never know when you IO
   */
  public void writeDestinationConnectionNoSecrets(final DestinationConnection partialDestination) throws JsonValidationException, IOException {
    persistence.writeConfig(ConfigSchema.DESTINATION_CONNECTION, partialDestination.getDestinationId().toString(), partialDestination);
  }

  /**
   * Returns all destinations in the database. Does not contain secrets. To hydrate with secrets see
   * { @link SecretsRepositoryReader#listDestinationConnectionWithSecrets() }.
   *
   * @return destinations
   * @throws JsonValidationException - throws if returned destinations are invalid
   * @throws IOException - you never know when you IO
   */
  public List<DestinationConnection> listDestinationConnection() throws JsonValidationException, IOException {
    return persistence.listConfigs(ConfigSchema.DESTINATION_CONNECTION, DestinationConnection.class);
  }

  public StandardSync getStandardSync(final UUID connectionId) throws JsonValidationException, IOException, ConfigNotFoundException {
    return persistence.getConfig(ConfigSchema.STANDARD_SYNC, connectionId.toString(), StandardSync.class);
  }

  public void writeStandardSync(final StandardSync standardSync) throws JsonValidationException, IOException {
    persistence.writeConfig(ConfigSchema.STANDARD_SYNC, standardSync.getConnectionId().toString(), standardSync);
  }

  public List<StandardSync> listStandardSyncs() throws ConfigNotFoundException, IOException, JsonValidationException {
    return persistence.listConfigs(ConfigSchema.STANDARD_SYNC, StandardSync.class);
  }

  public List<StandardSync> listStandardSyncsUsingOperation(final UUID operationId)
      throws IOException {
    final Result<Record> result = database.query(ctx -> ctx.select(CONNECTION.asterisk())
        .from(CONNECTION)
        .join(CONNECTION_OPERATION)
        .on(CONNECTION_OPERATION.CONNECTION_ID.eq(CONNECTION.ID))
        .where(CONNECTION_OPERATION.OPERATION_ID.eq(operationId))).fetch();
    return getStandardSyncsFromResult(result);
  }

  public List<StandardSync> listWorkspaceStandardSyncs(final UUID workspaceId) throws IOException {
    final Result<Record> result = database.query(ctx -> ctx.select(CONNECTION.asterisk())
        .from(CONNECTION)
        .join(ACTOR).on(CONNECTION.SOURCE_ID.eq(ACTOR.ID))
        .where(ACTOR.WORKSPACE_ID.eq(workspaceId))).fetch();
    return getStandardSyncsFromResult(result);
  }

  public List<StandardSync> listSourceStandardSyncsWithoutOperations(final UUID workspaceId,
                                                                     final UUID sourceId,
                                                                     final Integer pageSize,
                                                                     final Integer pageCurrent)
      throws IOException {
    final Result<Record> result = database.query(ctx -> ctx.select(CONNECTION.asterisk())
        .from(CONNECTION)
        .join(ACTOR).on(CONNECTION.SOURCE_ID.eq(ACTOR.ID))
        .where(ACTOR.WORKSPACE_ID.eq(workspaceId))).and(ACTOR.ID.eq(sourceId)).limit(pageSize).offset(pageSize * (pageCurrent - 1)).fetch();
    return getStandardSyncsWithoutOperationFromResult(result);
  }

  public List<StandardSync> listDestinationStandardSyncsWithoutOperations(final UUID workspaceId,
                                                                          final UUID destination,
                                                                          final Integer pageSize,
                                                                          final Integer pageCurrent)
      throws IOException {
    final Result<Record> result = database.query(ctx -> ctx.select(CONNECTION.asterisk())
        .from(CONNECTION)
        .join(ACTOR).on(CONNECTION.DESTINATION_ID.eq(ACTOR.ID))
        .where(ACTOR.WORKSPACE_ID.eq(workspaceId))).and(ACTOR.ID.eq(destination)).limit(pageSize).offset(pageSize * (pageCurrent - 1)).fetch();

    return getStandardSyncsWithoutOperationFromResult(result);
  }

  public Long pageSourceStandardSyncsCount(final UUID workspaceId, final UUID sourceId) throws IOException {
    return database.query(ctx -> {
      SelectConditionStep<Record1<Integer>> where = ctx.selectCount().from(CONNECTION).join(ACTOR).on(CONNECTION.SOURCE_ID.eq(ACTOR.ID))
          .where(ACTOR.WORKSPACE_ID.eq(workspaceId)).and(ACTOR.ID.eq(sourceId));
      return where;
    }).fetchOne().into(Long.class);
  }

  public Long pageDestinationStandardSyncsCount(final UUID workspaceId, final UUID destinationId) throws IOException {
    return database.query(ctx -> {
      SelectConditionStep<Record1<Integer>> where = ctx.selectCount().from(CONNECTION).join(ACTOR).on(CONNECTION.DESTINATION_ID.eq(ACTOR.ID))
          .where(ACTOR.WORKSPACE_ID.eq(workspaceId)).and(ACTOR.ID.eq(destinationId));
      return where;
    }).fetchOne().into(Long.class);
  }

  public List<StandardSync> pageWorkspaceStandardSyncs(final UUID workspaceId,
                                                       final UUID sourceId,
                                                       final UUID destinationId,
                                                       final String status,
                                                       final Integer pageSize,
                                                       final Integer pageCurrent,
                                                       final String sortFieldName,
                                                       final String sortDirection)
      throws IOException {
    final Result<Record> result = database.query(ctx -> {
      List<UUID> destinationList = null;
      if (destinationId != null) {
        destinationList = ctx.select(ACTOR.ID).from(ACTOR).where(ACTOR.ACTOR_DEFINITION_ID.eq(destinationId)).fetch(ACTOR.ID);
        if (destinationList == null || destinationList.isEmpty()) {
          destinationList = List.of(destinationId);
        }
      }
      Actor SOURCE_ACTOR = ACTOR.as("SOURCE_ACTOR");
      ActorDefinition SOURCE_ACTOR_DEFINITION = ACTOR_DEFINITION.as("SOURCE_ACTOR_DEFINITION");
      Actor DESTINATION_ACTOR = ACTOR.as("DESTINATION_ACTOR");
      ActorDefinition DESTINATION_ACTOR_DEFINITION = ACTOR_DEFINITION.as("DESTINATION_ACTOR_DEFINITION");

      SelectConditionStep<Record> where = ctx.select(CONNECTION.asterisk()).from(CONNECTION)
          .join(SOURCE_ACTOR).on(CONNECTION.SOURCE_ID.eq(SOURCE_ACTOR.ID))
          .join(SOURCE_ACTOR_DEFINITION).on(SOURCE_ACTOR.ACTOR_DEFINITION_ID.eq(SOURCE_ACTOR_DEFINITION.ID))
          .join(DESTINATION_ACTOR).on(CONNECTION.DESTINATION_ID.eq(DESTINATION_ACTOR.ID))
          .join(DESTINATION_ACTOR_DEFINITION).on(DESTINATION_ACTOR.ACTOR_DEFINITION_ID.eq(DESTINATION_ACTOR_DEFINITION.ID))
          .where(SOURCE_ACTOR.WORKSPACE_ID.eq(workspaceId));

      if (sourceId != null) {
        where.and(SOURCE_ACTOR.ACTOR_DEFINITION_ID.eq(sourceId));
      }
      if (destinationList != null && !destinationList.isEmpty()) {
        where.and(CONNECTION.DESTINATION_ID.in(destinationList));
      }
      if (StringUtils.isNotEmpty(status)) {
        where.and(CONNECTION.STATUS.eq(StatusType.valueOf(status)));
      } else {
        where.and(CONNECTION.STATUS.notEqual(StatusType.deprecated));
      }

      SortField<?> sortField = null;
      if (!ObjectUtils.isEmpty(sortFieldName)) {
        if ("name".equalsIgnoreCase(sortFieldName)) {
          sortField = convertTableFieldToSortField(CONNECTION.NAME, sortDirection);
        } else if ("status".equalsIgnoreCase(sortFieldName)) {
          sortField = convertTableFieldToSortField(CONNECTION.STATUS, sortDirection);
        } else if ("connectorName".equalsIgnoreCase(sortFieldName)) {
          sortField = convertTableFieldToSortField(SOURCE_ACTOR_DEFINITION.NAME, sortDirection);
        } else if ("entityName".equalsIgnoreCase(sortFieldName)) {
          sortField = convertTableFieldToSortField(DESTINATION_ACTOR_DEFINITION.NAME, sortDirection);
        } else {
          LOGGER.error("Could not found sorting field : {}", sortFieldName);
        }
      } else {
        /* Default newest first */
        sortField = convertTableFieldToSortField(CONNECTION.CREATED_AT, "desc");
      }

      if (sortField != null) {
        where.orderBy(sortField);
      }

      return where.limit(pageSize)
          .offset(pageSize * (pageCurrent - 1));
    }).fetch();

    return getStandardSyncsWithoutOperationFromResult(result);
  }

  private SortField<?> convertTableFieldToSortField(Field field, String sortDirection) {
    if ("desc".equalsIgnoreCase(sortDirection)) {
      return field.desc();
    } else {
      return field.asc();
    }
  }

  public List<SourceConnection> pageWorkspaceSourceConnection(final UUID workspaceId,
                                                              final UUID sourceDefinitionId,
                                                              final Integer pageSize,
                                                              final Integer pageCurrent,
                                                              final String sortFieldName,
                                                              final String sortDirection)
      throws IOException {
    final Result<Record> result = database.query(ctx -> {
      SelectConditionStep<Record> where = ctx.select(asterisk()).from(ACTOR)
          .join(ACTOR_DEFINITION).on(ACTOR.ACTOR_DEFINITION_ID.eq(ACTOR_DEFINITION.ID))
          .where(ACTOR.TOMBSTONE.eq(Boolean.FALSE))
          .and(ACTOR.ACTOR_TYPE.eq(ActorType.source));
      if (workspaceId != null) {
        where.and(ACTOR.WORKSPACE_ID.eq(workspaceId));
      }
      if (sourceDefinitionId != null) {
        where.and(ACTOR.ACTOR_DEFINITION_ID.eq(sourceDefinitionId));
      }
      SortField<?> sortField = null;
      if (!ObjectUtils.isEmpty(sortFieldName)) {
        if ("name".equalsIgnoreCase(sortFieldName)) {
          sortField = convertTableFieldToSortField(ACTOR.NAME, sortDirection);
        } else if ("sourceName".equalsIgnoreCase(sortFieldName)) {
          sortField = convertTableFieldToSortField(ACTOR_DEFINITION.NAME, sortDirection);
        } else {
          LOGGER.error("Could not found sorting field : {}", sortFieldName);
        }
      } else {
        /* Default integration name alphabetically */
        sortField = convertTableFieldToSortField(ACTOR_DEFINITION.NAME, "asc");
      }
      if (sortField != null) {
        where.orderBy(sortField);
      }
      return where.limit(pageSize)
          .offset(pageSize * (pageCurrent - 1));
    }).fetch();

    final List<SourceConnection> sourceConnections = new ArrayList<>();
    for (final Record record : result) {
      sourceConnections.add(DbConverter.buildSourceConnection(record));
    }
    return sourceConnections;
  }

  public List<DestinationConnection> pageWorkspaceDestinationConnection(final UUID workspaceId,
                                                                        final UUID destinationDefinitionId,
                                                                        final Integer pageSize,
                                                                        final Integer pageCurrent,
                                                                        final String sortFieldName,
                                                                        final String sortDirection)
      throws IOException {
    final Result<Record> result = database.query(ctx -> {
      SelectConditionStep<Record> where = ctx.select(asterisk()).from(ACTOR)
          .join(ACTOR_DEFINITION).on(ACTOR.ACTOR_DEFINITION_ID.eq(ACTOR_DEFINITION.ID))
          .where(ACTOR.TOMBSTONE.eq(Boolean.FALSE))
          .and(ACTOR.ACTOR_TYPE.eq(ActorType.destination));
      if (workspaceId != null) {
        where.and(ACTOR.WORKSPACE_ID.eq(workspaceId));
      }
      if (destinationDefinitionId != null) {
        where.and(ACTOR.ACTOR_DEFINITION_ID.eq(destinationDefinitionId));
      }
      SortField<?> sortField = null;
      if (!ObjectUtils.isEmpty(sortFieldName)) {
        if ("name".equalsIgnoreCase(sortFieldName)) {
          sortField = convertTableFieldToSortField(ACTOR.NAME, sortDirection);
        } else if ("destinationName".equalsIgnoreCase(sortFieldName)) {
          sortField = convertTableFieldToSortField(ACTOR_DEFINITION.NAME, sortDirection);
        } else {
          LOGGER.error("Could not found sorting field : {}", sortFieldName);
        }
      } else {
        /* Default integration name alphabetically */
        sortField = convertTableFieldToSortField(ACTOR_DEFINITION.NAME, "asc");
      }
      if (sortField != null) {
        where.orderBy(sortField);
      }
      return where.limit(pageSize)
          .offset(pageSize * (pageCurrent - 1));
    }).fetch();

    final List<DestinationConnection> destinationConnections = new ArrayList<>();
    for (final Record record : result) {
      destinationConnections.add(DbConverter.buildDestinationConnection(record));
    }
    return destinationConnections;
  }

  public Long pageWorkspaceStandardSyncsCount(final UUID workspaceId, final UUID sourceId, final UUID destinationId, final String status)
      throws IOException {
    return database.query(ctx -> {
      List<UUID> destinationList = null;
      if (destinationId != null) {
        destinationList = ctx.select(ACTOR.ID).from(ACTOR).where(ACTOR.ACTOR_DEFINITION_ID.eq(destinationId)).fetch(ACTOR.ID);
        if (destinationList == null || destinationList.isEmpty()) {
          destinationList = List.of(destinationId);
        }
      }
      SelectConditionStep<Record1<Integer>> where = ctx.selectCount().from(CONNECTION)
          .join(ACTOR).on(CONNECTION.SOURCE_ID.eq(ACTOR.ID))
          .where(ACTOR.WORKSPACE_ID.eq(workspaceId));
      if (sourceId != null) {
        where.and(ACTOR.ACTOR_DEFINITION_ID.eq(sourceId));
      }
      if (destinationList != null && !destinationList.isEmpty()) {
        where.and(CONNECTION.DESTINATION_ID.in(destinationList));
      }
      if (StringUtils.isNotEmpty(status)) {
        where.and(CONNECTION.STATUS.eq(StatusType.valueOf(status)));
      } else {
        where.and(CONNECTION.STATUS.notEqual(StatusType.deprecated));
      }
      return where;
    }).fetchOne().into(Long.class);
  }

  public Long pageWorkspaceSourceCount(final UUID workspaceId, final UUID sourceDefinitionId) throws IOException {
    return database.query(ctx -> {
      SelectConditionStep<Record1<Integer>> where = ctx.selectCount().from(ACTOR).where(ACTOR.TOMBSTONE.eq(Boolean.FALSE))
          .and(ACTOR.ACTOR_TYPE.eq(ActorType.source));
      if (workspaceId != null) {
        where.and(ACTOR.WORKSPACE_ID.eq(workspaceId));
      }
      if (sourceDefinitionId != null) {
        where.and(ACTOR.ACTOR_DEFINITION_ID.eq(sourceDefinitionId));
      }
      return where;
    }).fetchOne().into(Long.class);
  }

  public Long pageWorkspaceDestinationCount(final UUID workspaceId, final UUID destinationDefinitionId) throws IOException {
    return database.query(ctx -> {
      SelectConditionStep<Record1<Integer>> where = ctx.selectCount().from(ACTOR).where(ACTOR.TOMBSTONE.eq(Boolean.FALSE))
          .and(ACTOR.ACTOR_TYPE.eq(ActorType.destination));
      if (workspaceId != null) {
        where.and(ACTOR.WORKSPACE_ID.eq(workspaceId));
      }
      if (destinationDefinitionId != null) {
        where.and(ACTOR.ACTOR_DEFINITION_ID.eq(destinationDefinitionId));
      }
      return where;
    }).fetchOne().into(Long.class);
  }

  private List<StandardSync> getStandardSyncsFromResult(final Result<Record> result) throws IOException {
    final List<StandardSync> standardSyncs = new ArrayList<>();
    for (final Record record : result) {
      final UUID connectionId = record.get(CONNECTION.ID);
      final Result<Record> connectionOperationRecords = database.query(ctx -> ctx.select(asterisk())
          .from(CONNECTION_OPERATION)
          .where(CONNECTION_OPERATION.CONNECTION_ID.eq(connectionId))
          .fetch());
      final List<UUID> connectionOperationIds =
          connectionOperationRecords.stream().map(r -> r.get(CONNECTION_OPERATION.OPERATION_ID)).collect(Collectors.toList());
      standardSyncs.add(DbConverter.buildStandardSync(record, connectionOperationIds));
    }
    return standardSyncs;
  }

  private List<StandardSync> getStandardSyncsWithoutOperationFromResult(final Result<Record> result) throws IOException {
    final List<StandardSync> standardSyncs = new ArrayList<>();
    for (final Record record : result) {
      standardSyncs.add(DbConverter.buildStandardSyncForConnectionPage(record));
    }
    return standardSyncs;
  }

  public StandardSyncOperation getStandardSyncOperation(final UUID operationId) throws JsonValidationException, IOException, ConfigNotFoundException {
    return persistence.getConfig(ConfigSchema.STANDARD_SYNC_OPERATION, operationId.toString(), StandardSyncOperation.class);
  }

  public void writeStandardSyncOperation(final StandardSyncOperation standardSyncOperation) throws JsonValidationException, IOException {
    persistence.writeConfig(ConfigSchema.STANDARD_SYNC_OPERATION, standardSyncOperation.getOperationId().toString(), standardSyncOperation);
  }

  public List<StandardSyncOperation> listStandardSyncOperations() throws IOException, JsonValidationException {
    return persistence.listConfigs(ConfigSchema.STANDARD_SYNC_OPERATION, StandardSyncOperation.class);
  }

  /**
   * Updates {@link io.airbyte.db.instance.configs.jooq.generated.tables.ConnectionOperation} records
   * for the given {@code connectionId}.
   *
   * @param connectionId ID of the associated connection to update operations for
   * @param newOperationIds Set of all operationIds that should be associated to the connection
   * @throws IOException
   */
  public void updateConnectionOperationIds(final UUID connectionId, final Set<UUID> newOperationIds) throws IOException {
    database.transaction(ctx -> {
      final Set<UUID> existingOperationIds = ctx
          .selectFrom(CONNECTION_OPERATION)
          .where(CONNECTION_OPERATION.CONNECTION_ID.eq(connectionId))
          .fetchSet(CONNECTION_OPERATION.OPERATION_ID);

      final Set<UUID> existingOperationIdsToKeep = Sets.intersection(existingOperationIds, newOperationIds);

      // DELETE existing connection_operation records that aren't in the input list
      final Set<UUID> operationIdsToDelete = Sets.difference(existingOperationIds, existingOperationIdsToKeep);

      ctx.deleteFrom(CONNECTION_OPERATION)
          .where(CONNECTION_OPERATION.CONNECTION_ID.eq(connectionId))
          .and(CONNECTION_OPERATION.OPERATION_ID.in(operationIdsToDelete))
          .execute();

      // INSERT connection_operation records that are in the input list and don't yet exist
      final Set<UUID> operationIdsToAdd = Sets.difference(newOperationIds, existingOperationIdsToKeep);

      operationIdsToAdd.forEach(operationId -> ctx
          .insertInto(CONNECTION_OPERATION)
          .columns(CONNECTION_OPERATION.ID, CONNECTION_OPERATION.CONNECTION_ID, CONNECTION_OPERATION.OPERATION_ID)
          .values(UUID.randomUUID(), connectionId, operationId)
          .execute());

      return null;
    });
  }

  public int disabledConnections(final UUID workspaceId) throws IOException {
    return database.transaction(ctx -> {
      Set<UUID> actors = ctx.selectFrom(ACTOR).where(ACTOR.WORKSPACE_ID.eq(workspaceId)).and(ACTOR.ACTOR_TYPE.eq(ActorType.source))
          .fetchSet(ACTOR.ID);
      return ctx.update(CONNECTION)
          .set(CONNECTION.STATUS, StatusType.inactive)
          .where(CONNECTION.SOURCE_ID.in(actors))
          .and(CONNECTION.STATUS.eq(StatusType.active)).execute();
    });
  }

  public int disabledConnectionsForWorkspacesAll(final List<UUID> workspaceIds) throws IOException {
    return database.transaction(ctx -> {
      Set<UUID> actors = ctx.selectFrom(ACTOR).where(ACTOR.WORKSPACE_ID.in(workspaceIds)).and(ACTOR.ACTOR_TYPE.eq(ActorType.source))
          .fetchSet(ACTOR.ID);
      return ctx.update(CONNECTION)
          .set(CONNECTION.STATUS, StatusType.inactive)
          .set(CONNECTION.UPDATED_BY_SYSTEM, Boolean.TRUE)
          .where(CONNECTION.SOURCE_ID.in(actors))
          .and(CONNECTION.STATUS.eq(StatusType.active)).execute();
    });
  }

  public int enableSystemDisabledConnectionsForWorkspacesAll(final List<UUID> workspaceIds) throws IOException {
    return database.transaction(ctx -> {
      Set<UUID> actors = ctx.selectFrom(ACTOR).where(ACTOR.WORKSPACE_ID.in(workspaceIds)).and(ACTOR.ACTOR_TYPE.eq(ActorType.source))
          .fetchSet(ACTOR.ID);
      return ctx.update(CONNECTION)
          .set(CONNECTION.STATUS, StatusType.active)
          .set(CONNECTION.UPDATED_BY_SYSTEM, Boolean.FALSE)
          .where(CONNECTION.SOURCE_ID.in(actors)
              .and(CONNECTION.STATUS.eq(StatusType.inactive))
              .and(CONNECTION.UPDATED_BY_SYSTEM.eq(Boolean.TRUE)))
          .execute();
    });
  }

  public Long connectionsCount(UUID workspaceId) throws IOException {
    return database.query(ctx -> ctx.selectCount().from(ACTOR)
        .join(CONNECTION).on(ACTOR.ID.eq(CONNECTION.SOURCE_ID))
        .where(ACTOR.WORKSPACE_ID.eq(workspaceId))
        .and(ACTOR.ACTOR_TYPE.eq(ActorType.source))
        .and(CONNECTION.STATUS.ne(StatusType.deprecated))
        .fetchOne().into(Long.class));
  }

  public Long connectionsCount(List<UUID> workspaceIds) throws IOException {
    return database.query(ctx -> ctx.selectCount().from(ACTOR)
        .join(CONNECTION).on(ACTOR.ID.eq(CONNECTION.SOURCE_ID))
        .where(ACTOR.WORKSPACE_ID.in(workspaceIds))
        .and(ACTOR.ACTOR_TYPE.eq(ActorType.source))
        .and(CONNECTION.STATUS.ne(StatusType.deprecated))
        .fetchOne().into(Long.class));
  }

  public void deleteStandardSyncOperation(final UUID standardSyncOperationId) throws IOException {
    database.transaction(ctx -> {
      ctx.deleteFrom(CONNECTION_OPERATION)
          .where(CONNECTION_OPERATION.OPERATION_ID.eq(standardSyncOperationId)).execute();
      ctx.update(OPERATION)
          .set(OPERATION.TOMBSTONE, true)
          .where(OPERATION.ID.eq(standardSyncOperationId)).execute();
      return null;
    });
  }

  public SourceOAuthParameter getSourceOAuthParams(final UUID sourceOAuthParameterId)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    return persistence.getConfig(ConfigSchema.SOURCE_OAUTH_PARAM, sourceOAuthParameterId.toString(), SourceOAuthParameter.class);
  }

  public Optional<SourceOAuthParameter> getSourceOAuthParamByDefinitionIdOptional(final UUID workspaceId, final UUID sourceDefinitionId)
      throws IOException {
    final Result<Record> result = database.query(ctx -> {
      final SelectJoinStep<Record> query = ctx.select(asterisk()).from(ACTOR_OAUTH_PARAMETER);
      return query.where(ACTOR_OAUTH_PARAMETER.ACTOR_TYPE.eq(ActorType.source),
          ACTOR_OAUTH_PARAMETER.WORKSPACE_ID.eq(workspaceId),
          ACTOR_OAUTH_PARAMETER.ACTOR_DEFINITION_ID.eq(sourceDefinitionId)).fetch();
    });

    if (result.size() == 0) {
      return Optional.empty();
    }
    return Optional.of(DbConverter.buildSourceOAuthParameter(result.get(0)));
  }

  public void writeSourceOAuthParam(final SourceOAuthParameter sourceOAuthParameter) throws JsonValidationException, IOException {
    persistence.writeConfig(ConfigSchema.SOURCE_OAUTH_PARAM, sourceOAuthParameter.getOauthParameterId().toString(), sourceOAuthParameter);
  }

  public List<SourceOAuthParameter> listSourceOAuthParam() throws JsonValidationException, IOException {
    return persistence.listConfigs(ConfigSchema.SOURCE_OAUTH_PARAM, SourceOAuthParameter.class);
  }

  public DestinationOAuthParameter getDestinationOAuthParams(final UUID destinationOAuthParameterId)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    return persistence.getConfig(ConfigSchema.DESTINATION_OAUTH_PARAM, destinationOAuthParameterId.toString(), DestinationOAuthParameter.class);
  }

  public Optional<DestinationOAuthParameter> getDestinationOAuthParamByDefinitionIdOptional(final UUID workspaceId,
                                                                                            final UUID destinationDefinitionId)
      throws IOException {
    final Result<Record> result = database.query(ctx -> {
      final SelectJoinStep<Record> query = ctx.select(asterisk()).from(ACTOR_OAUTH_PARAMETER);
      return query.where(ACTOR_OAUTH_PARAMETER.ACTOR_TYPE.eq(ActorType.destination),
          ACTOR_OAUTH_PARAMETER.WORKSPACE_ID.eq(workspaceId),
          ACTOR_OAUTH_PARAMETER.ACTOR_DEFINITION_ID.eq(destinationDefinitionId)).fetch();
    });

    if (result.size() == 0) {
      return Optional.empty();
    }
    return Optional.of(DbConverter.buildDestinationOAuthParameter(result.get(0)));
  }

  public void writeDestinationOAuthParam(final DestinationOAuthParameter destinationOAuthParameter)
      throws JsonValidationException, IOException {
    persistence.writeConfig(ConfigSchema.DESTINATION_OAUTH_PARAM, destinationOAuthParameter.getOauthParameterId().toString(),
        destinationOAuthParameter);
  }

  public List<DestinationOAuthParameter> listDestinationOAuthParam() throws JsonValidationException, IOException {
    return persistence.listConfigs(ConfigSchema.DESTINATION_OAUTH_PARAM, DestinationOAuthParameter.class);
  }

  @Deprecated(forRemoval = true)
  // use StatePersistence instead
  public void updateConnectionState(final UUID connectionId, final State state) throws IOException {
    LOGGER.info("Updating connection {} state: {}", connectionId, state);
    final StandardSyncState connectionState = new StandardSyncState().withConnectionId(connectionId).withState(state);
    try {
      persistence.writeConfig(ConfigSchema.STANDARD_SYNC_STATE, connectionId.toString(), connectionState);
    } catch (final JsonValidationException e) {
      throw new IllegalStateException(e);
    }
  }

  private Map<UUID, AirbyteCatalog> findCatalogByHash(final String catalogHash, final DSLContext context) {
    final Result<Record2<UUID, JSONB>> records = context.select(ACTOR_CATALOG.ID, ACTOR_CATALOG.CATALOG)
        .from(ACTOR_CATALOG)
        .where(ACTOR_CATALOG.CATALOG_HASH.eq(catalogHash)).fetch();

    final Map<UUID, AirbyteCatalog> result = new HashMap<>();
    for (final Record record : records) {
      final AirbyteCatalog catalog = Jsons.deserialize(
          record.get(ACTOR_CATALOG.CATALOG).toString(), AirbyteCatalog.class);
      result.put(record.get(ACTOR_CATALOG.ID), catalog);
    }
    return result;
  }

  public ActorCatalog getActorCatalogById(final UUID actorCatalogId)
      throws IOException, ConfigNotFoundException {
    final Result<Record> result = database.query(ctx -> ctx.select(ACTOR_CATALOG.asterisk())
        .from(ACTOR_CATALOG).where(ACTOR_CATALOG.ID.eq(actorCatalogId))).fetch();
    if (result.size() > 0) {
      return DbConverter.buildActorCatalog(result.get(0));
    }
    throw new ConfigNotFoundException(ConfigSchema.ACTOR_CATALOG, actorCatalogId);
  }

  /**
   * Store an Airbyte catalog in DB if it is not present already
   *
   * Checks in the config DB if the catalog is present already, if so returns it identifier. It is not
   * present, it is inserted in DB with a new identifier and that identifier is returned.
   *
   * @param airbyteCatalog An Airbyte catalog to cache
   * @param context
   * @return the db identifier for the cached catalog.
   */
  private UUID getOrInsertActorCatalog(final AirbyteCatalog airbyteCatalog,
                                       final DSLContext context) {
    final OffsetDateTime timestamp = OffsetDateTime.now();
    final HashFunction hashFunction = Hashing.murmur3_32_fixed();
    final String catalogHash = hashFunction.hashBytes(Jsons.serialize(airbyteCatalog).getBytes(
        Charsets.UTF_8)).toString();
    final Map<UUID, AirbyteCatalog> catalogs = findCatalogByHash(catalogHash, context);

    for (final Map.Entry<UUID, AirbyteCatalog> entry : catalogs.entrySet()) {
      if (entry.getValue().equals(airbyteCatalog)) {
        return entry.getKey();
      }
    }

    final UUID catalogId = UUID.randomUUID();
    context.insertInto(ACTOR_CATALOG)
        .set(ACTOR_CATALOG.ID, catalogId)
        .set(ACTOR_CATALOG.CATALOG, JSONB.valueOf(Jsons.serialize(airbyteCatalog)))
        .set(ACTOR_CATALOG.CATALOG_HASH, catalogHash)
        .set(ACTOR_CATALOG.CREATED_AT, timestamp)
        .set(ACTOR_CATALOG.MODIFIED_AT, timestamp).execute();
    return catalogId;
  }

  public Optional<ActorCatalog> getActorCatalog(final UUID actorId,
                                                final String actorVersion,
                                                final String configHash)
      throws IOException {
    final Result<Record> records = database.transaction(ctx -> ctx.select(ACTOR_CATALOG.asterisk())
        .from(ACTOR_CATALOG).join(ACTOR_CATALOG_FETCH_EVENT)
        .on(ACTOR_CATALOG.ID.eq(ACTOR_CATALOG_FETCH_EVENT.ACTOR_CATALOG_ID))
        .where(ACTOR_CATALOG_FETCH_EVENT.ACTOR_ID.eq(actorId))
        .and(ACTOR_CATALOG_FETCH_EVENT.ACTOR_VERSION.eq(actorVersion))
        .and(ACTOR_CATALOG_FETCH_EVENT.CONFIG_HASH.eq(configHash))
        .orderBy(ACTOR_CATALOG_FETCH_EVENT.CREATED_AT.desc()).limit(1)).fetch();

    if (records.size() >= 1) {
      return Optional.of(DbConverter.buildActorCatalog(records.get(0)));
    }
    return Optional.empty();

  }

  /**
   * Stores source catalog information.
   *
   * This function is called each time the schema of a source is fetched. This can occur because the
   * source is set up for the first time, because the configuration or version of the connector
   * changed or because the user explicitly requested a schema refresh. Schemas are stored separately
   * and de-duplicated upon insertion. Once a schema has been successfully stored, a call to
   * getActorCatalog(actorId, connectionVersion, configurationHash) will return the most recent schema
   * stored for those parameters.
   *
   * @param catalog
   * @param actorId
   * @param connectorVersion
   * @param configurationHash
   * @return The identifier (UUID) of the fetch event inserted in the database
   * @throws IOException
   */
  public UUID writeActorCatalogFetchEvent(final AirbyteCatalog catalog,
                                          final UUID actorId,
                                          final String connectorVersion,
                                          final String configurationHash)
      throws IOException {
    final OffsetDateTime timestamp = OffsetDateTime.now();
    final UUID fetchEventID = UUID.randomUUID();
    return database.transaction(ctx -> {
      final UUID catalogId = getOrInsertActorCatalog(catalog, ctx);
      ctx.insertInto(ACTOR_CATALOG_FETCH_EVENT)
          .set(ACTOR_CATALOG_FETCH_EVENT.ID, fetchEventID)
          .set(ACTOR_CATALOG_FETCH_EVENT.ACTOR_ID, actorId)
          .set(ACTOR_CATALOG_FETCH_EVENT.ACTOR_CATALOG_ID, catalogId)
          .set(ACTOR_CATALOG_FETCH_EVENT.CONFIG_HASH, configurationHash)
          .set(ACTOR_CATALOG_FETCH_EVENT.ACTOR_VERSION, connectorVersion)
          .set(ACTOR_CATALOG_FETCH_EVENT.MODIFIED_AT, timestamp)
          .set(ACTOR_CATALOG_FETCH_EVENT.CREATED_AT, timestamp).execute();
      return catalogId;
    });
  }

  public int countConnectionsForWorkspace(final UUID workspaceId) throws IOException {
    return database.query(ctx -> ctx.selectCount()
        .from(CONNECTION)
        .join(ACTOR).on(CONNECTION.SOURCE_ID.eq(ACTOR.ID))
        .where(ACTOR.WORKSPACE_ID.eq(workspaceId))
        .and(CONNECTION.STATUS.notEqual(StatusType.deprecated))
        .andNot(ACTOR.TOMBSTONE)).fetchOne().into(int.class);
  }

  public int countSourcesForWorkspace(final UUID workspaceId) throws IOException {
    return database.query(ctx -> ctx.selectCount()
        .from(ACTOR)
        .where(ACTOR.WORKSPACE_ID.equal(workspaceId))
        .and(ACTOR.ACTOR_TYPE.eq(ActorType.source))
        .andNot(ACTOR.TOMBSTONE)).fetchOne().into(int.class);
  }

  public int countDestinationsForWorkspace(final UUID workspaceId) throws IOException {
    return database.query(ctx -> ctx.selectCount()
        .from(ACTOR)
        .where(ACTOR.WORKSPACE_ID.equal(workspaceId))
        .and(ACTOR.ACTOR_TYPE.eq(ActorType.destination))
        .andNot(ACTOR.TOMBSTONE)).fetchOne().into(int.class);
  }

  /**
   * MUST NOT ACCEPT SECRETS - Package private so that secrets are not accidentally passed in. Should
   * only be called from { @link SecretsRepositoryWriter }
   *
   * Takes as inputs configurations that it then uses to overwrite the contents of the existing Config
   * Database.
   *
   * @param configs - configurations to load.
   * @param dryRun - whether to test run of the load
   * @throws IOException - you never know when you IO.
   */
  void replaceAllConfigsNoSecrets(final Map<AirbyteConfig, Stream<?>> configs, final boolean dryRun) throws IOException {
    persistence.replaceAllConfigs(configs, dryRun);
  }

  /**
   * Dumps all configurations in the Config Database. Note: It will not contain secrets as the Config
   * Database does not contain connector configurations that include secrets. In order to hydrate with
   * secrets see { @link SecretsRepositoryReader#dumpConfigs() }.
   *
   * @return all configurations in the Config Database
   * @throws IOException - you never know when you IO
   */
  public Map<String, Stream<JsonNode>> dumpConfigsNoSecrets() throws IOException {
    return persistence.dumpConfigs();
  }

  /**
   * MUST NOT ACCEPT SECRETS - Package private so that secrets are not accidentally passed in. Should
   * only be called from { @link SecretsRepositoryWriter }
   *
   * Loads all Data from a ConfigPersistence into the database.
   *
   * @param seedPersistenceWithoutSecrets - seed persistence WITHOUT secrets
   * @throws IOException - you never know when you IO
   */
  public void loadDataNoSecrets(final ConfigPersistence seedPersistenceWithoutSecrets) throws IOException {
    persistence.loadData(seedPersistenceWithoutSecrets);
  }

  /**
   * The following methods are present to allow the JobCreationAndStatusUpdateActivity class to emit
   * metrics without exposing the underlying database connection.
   */

  public List<ReleaseStage> getSrcIdAndDestIdToReleaseStages(final UUID srcId, final UUID dstId) throws IOException {
    return database.query(ctx -> MetricQueries.srcIdAndDestIdToReleaseStages(ctx, srcId, dstId));
  }

  public List<ReleaseStage> getJobIdToReleaseStages(final long jobId) throws IOException {
    return database.query(ctx -> MetricQueries.jobIdToReleaseStages(ctx, jobId));
  }

  private Condition includeTombstones(final Field<Boolean> tombstoneField, final boolean includeTombstones) {
    if (includeTombstones) {
      return DSL.trueCondition();
    } else {
      return tombstoneField.eq(false);
    }
  }

  public WorkspaceServiceAccount getWorkspaceServiceAccountNoSecrets(final UUID workspaceId)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    return persistence.getConfig(ConfigSchema.WORKSPACE_SERVICE_ACCOUNT, workspaceId.toString(), WorkspaceServiceAccount.class);
  }

  public void writeWorkspaceServiceAccountNoSecrets(final WorkspaceServiceAccount workspaceServiceAccount)
      throws JsonValidationException, IOException {
    persistence.writeConfig(ConfigSchema.WORKSPACE_SERVICE_ACCOUNT, workspaceServiceAccount.getWorkspaceId().toString(),
        workspaceServiceAccount);
  }

  public List<StreamDescriptor> getAllStreamsForConnection(final UUID connectionId)
      throws JsonValidationException, ConfigNotFoundException, IOException {
    final StandardSync standardSync = getStandardSync(connectionId);
    return CatalogHelpers.extractStreamDescriptors(standardSync.getCatalog());
  }

  public ConfiguredAirbyteCatalog getConfiguredCatalogForConnection(final UUID connectionId)
      throws JsonValidationException, ConfigNotFoundException, IOException {
    final StandardSync standardSync = getStandardSync(connectionId);
    return standardSync.getCatalog();
  }

  public Map<String, String> mapStatus() {
    return Map.of("Active", StatusType.active.name(), "Inactive", StatusType.inactive.name());
  }

  public List<Map<String, String>> listFilterParam(ActorType actorType, UUID workspaceId) throws IOException {
    return database.query(ctx -> ctx.selectDistinct(ACTOR_DEFINITION.ID, ACTOR_DEFINITION.NAME, lower(ACTOR_DEFINITION.NAME).as("lower_name"))
        .from(ACTOR)
        .join(ACTOR_DEFINITION)
        .on(ACTOR_DEFINITION.ID.eq(ACTOR.ACTOR_DEFINITION_ID))
        .where(ACTOR.WORKSPACE_ID.eq(workspaceId).and(ACTOR.ACTOR_TYPE.eq(actorType)))
        .orderBy(lower(ACTOR_DEFINITION.NAME).asc()).fetch()).stream()
        .map(record -> {
          UUID uuid = record.get(ACTOR_DEFINITION.ID);
          return Map.of("key", record.get(ACTOR_DEFINITION.NAME), "value", uuid.toString());
        })
        .collect(Collectors.toList());

  }

  public List<Map<String, String>> listFilterParamSources(UUID workspaceId) throws IOException {
    return listFilterParam(ActorType.source, workspaceId);
  }

  public List<Map<String, String>> listFilterParamDestination(UUID workspaceId) throws IOException {
    return listFilterParam(ActorType.destination, workspaceId);
  }

  public StandardDestinationDefinition getStandardDestinationDefinationByDestinationId(final UUID destinationId) throws IOException {
    final Result<Record> result = database.query(ctx -> ctx.select(ACTOR_DEFINITION.asterisk())
        .from(ACTOR)
        .join(ACTOR_DEFINITION)
        .on(ACTOR_DEFINITION.ID.eq(ACTOR.ACTOR_DEFINITION_ID))
        .where(ACTOR.ID.eq(destinationId).and(ACTOR.ACTOR_TYPE.eq(ActorType.destination))).fetch());
    return DbConverter.buildStandardDestinationDefinition(result.get(0));
  }

  public StandardDestinationDefinition getStandardSourceDefinationBySourceId(final UUID sourceId) throws IOException {
    final Result<Record> result = database.query(ctx -> ctx.select(ACTOR_DEFINITION.asterisk())
        .from(ACTOR)
        .join(ACTOR_DEFINITION)
        .on(ACTOR_DEFINITION.ID.eq(ACTOR.ACTOR_DEFINITION_ID))
        .where(ACTOR.ID.eq(sourceId).and(ACTOR.ACTOR_TYPE.eq(ActorType.source))).fetch());
    return DbConverter.buildStandardDestinationDefinition(result.get(0));
  }

  public List<SourceConnection> getSourceConnectionByWorkspaceId(final UUID workspaceId) throws IOException {
    final Result<Record> result = database.query(ctx -> ctx.select(asterisk())
        .from(ACTOR)
        .where(ACTOR.WORKSPACE_ID.eq(workspaceId)
            .and(ACTOR.ACTOR_TYPE.eq(ActorType.source))
            .and(ACTOR.TOMBSTONE.eq(Boolean.FALSE)))
        .orderBy(lower(ACTOR.NAME).asc())
        .fetch());
    return result.stream().map(data -> DbConverter.buildSourceConnection(data)).collect(Collectors.toList());
  }

  public List<DestinationConnection> getDestinationConnectionByWorkspaceId(final UUID workspaceId) throws IOException {
    final Result<Record> result = database.query(ctx -> ctx.select(asterisk())
        .from(ACTOR)
        .where(ACTOR.WORKSPACE_ID.eq(workspaceId)
            .and(ACTOR.ACTOR_TYPE.eq(ActorType.destination))
            .and(ACTOR.TOMBSTONE.eq(Boolean.FALSE)))
        .orderBy(lower(ACTOR.NAME).asc())
        .fetch());
    return result.stream().map(data -> DbConverter.buildDestinationConnection(data)).collect(Collectors.toList());
  }

}
