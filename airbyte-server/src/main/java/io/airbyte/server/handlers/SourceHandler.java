/*
 * Copyright (c) 2022 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.server.handlers;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.collect.Lists;
import io.airbyte.api.model.generated.*;
import io.airbyte.commons.lang.MoreBooleans;
import io.airbyte.config.SourceConnection;
import io.airbyte.config.StandardSourceDefinition;
import io.airbyte.config.persistence.ConfigNotFoundException;
import io.airbyte.config.persistence.ConfigRepository;
import io.airbyte.config.persistence.SecretsRepositoryReader;
import io.airbyte.config.persistence.SecretsRepositoryWriter;
import io.airbyte.config.persistence.split_secrets.JsonSecretsProcessor;
import io.airbyte.protocol.models.ConnectorSpecification;
import io.airbyte.server.converters.ConfigurationUpdate;
import io.airbyte.validation.json.JsonSchemaValidator;
import io.airbyte.validation.json.JsonValidationException;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;

public class SourceHandler {

  private final Supplier<UUID> uuidGenerator;
  private final ConfigRepository configRepository;
  private final SecretsRepositoryReader secretsRepositoryReader;
  private final SecretsRepositoryWriter secretsRepositoryWriter;
  private final JsonSchemaValidator validator;
  private final ConnectionsHandler connectionsHandler;
  private final ConfigurationUpdate configurationUpdate;
  private final JsonSecretsProcessor secretsProcessor;

  SourceHandler(final ConfigRepository configRepository,
                final SecretsRepositoryReader secretsRepositoryReader,
                final SecretsRepositoryWriter secretsRepositoryWriter,
                final JsonSchemaValidator integrationSchemaValidation,
                final ConnectionsHandler connectionsHandler,
                final Supplier<UUID> uuidGenerator,
                final JsonSecretsProcessor secretsProcessor,
                final ConfigurationUpdate configurationUpdate) {
    this.configRepository = configRepository;
    this.secretsRepositoryReader = secretsRepositoryReader;
    this.secretsRepositoryWriter = secretsRepositoryWriter;
    this.validator = integrationSchemaValidation;
    this.connectionsHandler = connectionsHandler;
    this.uuidGenerator = uuidGenerator;
    this.configurationUpdate = configurationUpdate;
    this.secretsProcessor = secretsProcessor;
  }

  public SourceHandler(final ConfigRepository configRepository,
                       final SecretsRepositoryReader secretsRepositoryReader,
                       final SecretsRepositoryWriter secretsRepositoryWriter,
                       final JsonSchemaValidator integrationSchemaValidation,
                       final ConnectionsHandler connectionsHandler) {
    this(
        configRepository,
        secretsRepositoryReader,
        secretsRepositoryWriter,
        integrationSchemaValidation,
        connectionsHandler,
        UUID::randomUUID,
        JsonSecretsProcessor.builder()
            .maskSecrets(true)
            .copySecrets(true)
            .build(),
        new ConfigurationUpdate(configRepository, secretsRepositoryReader));
  }

  public SourceRead createSource(final SourceCreate sourceCreate)
      throws ConfigNotFoundException, IOException, JsonValidationException {
    // validate configuration
    final ConnectorSpecification spec = getSpecFromSourceDefinitionId(
        sourceCreate.getSourceDefinitionId());
    validateSource(spec, sourceCreate.getConnectionConfiguration());

    // persist
    final UUID sourceId = uuidGenerator.get();
    persistSourceConnection(
        sourceCreate.getName() != null ? sourceCreate.getName() : "default",
        sourceCreate.getSourceDefinitionId(),
        sourceCreate.getWorkspaceId(),
        sourceId,
        false,
        sourceCreate.getConnectionConfiguration(),
        spec);

    // read configuration from db
    return buildSourceRead(sourceId, spec);
  }

  public SourceRead updateSource(final SourceUpdate sourceUpdate)
      throws ConfigNotFoundException, IOException, JsonValidationException {

    final SourceConnection updatedSource = configurationUpdate
        .source(sourceUpdate.getSourceId(), sourceUpdate.getName(),
            sourceUpdate.getConnectionConfiguration());
    final ConnectorSpecification spec = getSpecFromSourceId(updatedSource.getSourceId());
    validateSource(spec, sourceUpdate.getConnectionConfiguration());

    // persist
    persistSourceConnection(
        updatedSource.getName(),
        updatedSource.getSourceDefinitionId(),
        updatedSource.getWorkspaceId(),
        updatedSource.getSourceId(),
        updatedSource.getTombstone(),
        updatedSource.getConfiguration(),
        spec);

    // read configuration from db
    return buildSourceRead(sourceUpdate.getSourceId(), spec);
  }

  public SourceRead getSource(final SourceIdRequestBody sourceIdRequestBody)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    return buildSourceRead(sourceIdRequestBody.getSourceId());
  }

  public SourceRead getSourceRead(final SourceIdRequestBody sourceIdRequestBody)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    return buildSourceRead(sourceIdRequestBody.getSourceId());
  }

  public SourceRead cloneSource(final SourceCloneRequestBody sourceCloneRequestBody)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    // read source configuration from db
    final SourceRead sourceToClone = buildSourceReadWithSecrets(sourceCloneRequestBody.getSourceCloneId());
    final SourceCloneConfiguration sourceCloneConfiguration = sourceCloneRequestBody.getSourceConfiguration();

    final String copyText = " (Copy)";
    final String sourceName = sourceToClone.getName() + copyText;

    final SourceCreate sourceCreate = new SourceCreate()
        .name(sourceName)
        .sourceDefinitionId(sourceToClone.getSourceDefinitionId())
        .connectionConfiguration(sourceToClone.getConnectionConfiguration())
        .workspaceId(sourceToClone.getWorkspaceId());

    if (sourceCloneConfiguration != null) {
      if (sourceCloneConfiguration.getName() != null) {
        sourceCreate.name(sourceCloneConfiguration.getName());
      }

      if (sourceCloneConfiguration.getConnectionConfiguration() != null) {
        sourceCreate.connectionConfiguration(configurationUpdate
            .source(sourceCloneRequestBody.getSourceCloneId(), sourceName, sourceCloneConfiguration.getConnectionConfiguration()).getConfiguration());
      }
    }

    return createSource(sourceCreate);
  }

  public SourceReadList listSourcesForWorkspace(final WorkspaceIdRequestBody workspaceIdRequestBody)
      throws ConfigNotFoundException, IOException, JsonValidationException {

    final List<SourceConnection> sourceConnections = configRepository.listSourceConnection()
        .stream()
        .filter(sc -> sc.getWorkspaceId().equals(workspaceIdRequestBody.getWorkspaceId()) && !MoreBooleans.isTruthy(sc.getTombstone()))
        .toList();

    final List<SourceRead> reads = Lists.newArrayList();
    for (final SourceConnection sc : sourceConnections) {
      reads.add(buildSourceRead(sc.getSourceId()));
    }

    return new SourceReadList().sources(reads);
  }

  public SourcePageReadList pageSourcesForWorkspace(final PageRequestBody pageRequestBody)
      throws IOException {
    if (pageRequestBody.getPageSize() == null || pageRequestBody.getPageSize() == 0) {
      pageRequestBody.setPageSize(10);
    }
    if (pageRequestBody.getPageCurrent() == null || pageRequestBody.getPageCurrent() == 0) {
      pageRequestBody.setPageCurrent(1);
    }
    List<SourceConnection> sourceConnections = configRepository.pageWorkspaceSourceConnection(pageRequestBody.getWorkspaceId(),
        pageRequestBody.getPageSize(), pageRequestBody.getPageCurrent());
    final List<SourceRead> sourceReads = Lists.newArrayList();
    for (final SourceConnection sourceConnection : sourceConnections) {
      try {
        StandardSourceDefinition standardSourceDefinition = configRepository.getStandardSourceDefinition(sourceConnection.getSourceDefinitionId());
        final JsonNode sanitizedConfig = secretsProcessor.prepareSecretsForOutput(sourceConnection.getConfiguration(),
            standardSourceDefinition.getSpec().getConnectionSpecification());
        sourceConnection.setConfiguration(sanitizedConfig);
        sourceReads.add(toSourceRead(sourceConnection, standardSourceDefinition));
      } catch (final Exception e) {
        throw new RuntimeException(e);
      }
    }
    return new SourcePageReadList().sources(sourceReads).total(configRepository.pageWorkspaceSourceCount(pageRequestBody.getWorkspaceId()))
        .pageCurrent(pageRequestBody.getPageCurrent()).pageSize(pageRequestBody.getPageSize());
  }

  public SourceReadList listSourcesForSourceDefinition(final SourceDefinitionIdRequestBody sourceDefinitionIdRequestBody)
      throws JsonValidationException, IOException, ConfigNotFoundException {

    final List<SourceConnection> sourceConnections = configRepository.listSourceConnection()
        .stream()
        .filter(sc -> sc.getSourceDefinitionId().equals(sourceDefinitionIdRequestBody.getSourceDefinitionId())
            && !MoreBooleans.isTruthy(sc.getTombstone()))
        .toList();

    final List<SourceRead> reads = Lists.newArrayList();
    for (final SourceConnection sourceConnection : sourceConnections) {
      reads.add(buildSourceRead(sourceConnection.getSourceId()));
    }

    return new SourceReadList().sources(reads);
  }

  public SourceReadList searchSources(final SourceSearch sourceSearch)
      throws ConfigNotFoundException, IOException, JsonValidationException {
    final List<SourceRead> reads = Lists.newArrayList();

    for (final SourceConnection sci : configRepository.listSourceConnection()) {
      if (!sci.getTombstone()) {
        final SourceRead sourceRead = buildSourceRead(sci.getSourceId());
        if (connectionsHandler.matchSearch(sourceSearch, sourceRead)) {
          reads.add(sourceRead);
        }
      }
    }

    return new SourceReadList().sources(reads);
  }

  public void deleteSource(final SourceIdRequestBody sourceIdRequestBody)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    // get existing source
    final SourceRead source = buildSourceRead(sourceIdRequestBody.getSourceId());
    deleteSource(source);
  }

  public void deleteSource(final SourceRead source)
      throws JsonValidationException, IOException, ConfigNotFoundException {
    // "delete" all connections associated with source as well.
    // Delete connections first in case it fails in the middle, source will still be visible
    final WorkspaceIdRequestBody workspaceIdRequestBody = new WorkspaceIdRequestBody()
        .workspaceId(source.getWorkspaceId());
    for (final ConnectionRead connectionRead : connectionsHandler
        .listConnectionsForWorkspace(workspaceIdRequestBody).getConnections()) {
      if (!connectionRead.getSourceId().equals(source.getSourceId())) {
        continue;
      }

      connectionsHandler.deleteConnection(connectionRead.getConnectionId());
    }

    final ConnectorSpecification spec = getSpecFromSourceId(source.getSourceId());
    final var fullConfig = secretsRepositoryReader.getSourceConnectionWithSecrets(source.getSourceId()).getConfiguration();

    // persist
    persistSourceConnection(
        source.getName(),
        source.getSourceDefinitionId(),
        source.getWorkspaceId(),
        source.getSourceId(),
        true,
        fullConfig,
        spec);
  }

  private SourceRead buildSourceRead(final UUID sourceId)
      throws ConfigNotFoundException, IOException, JsonValidationException {
    final SourceConnection sourceConnection = configRepository.getSourceConnection(sourceId);
    final StandardSourceDefinition standardSourceDefinition = configRepository
        .getStandardSourceDefinition(sourceConnection.getSourceDefinitionId());
    final JsonNode sanitizedConfig = secretsProcessor.prepareSecretsForOutput(sourceConnection.getConfiguration(),
        standardSourceDefinition.getSpec().getConnectionSpecification());
    sourceConnection.setConfiguration(sanitizedConfig);
    return toSourceRead(sourceConnection, standardSourceDefinition);
  }

  private SourceRead buildSourceRead(final UUID sourceId, final ConnectorSpecification spec)
      throws ConfigNotFoundException, IOException, JsonValidationException {
    // read configuration from db
    final SourceConnection sourceConnection = configRepository.getSourceConnection(sourceId);
    final StandardSourceDefinition standardSourceDefinition = configRepository
        .getStandardSourceDefinition(sourceConnection.getSourceDefinitionId());
    final JsonNode sanitizedConfig = secretsProcessor.prepareSecretsForOutput(sourceConnection.getConfiguration(), spec.getConnectionSpecification());
    sourceConnection.setConfiguration(sanitizedConfig);
    return toSourceRead(sourceConnection, standardSourceDefinition);
  }

  private SourceRead buildSourceReadWithSecrets(final UUID sourceId)
      throws ConfigNotFoundException, IOException, JsonValidationException {
    // read configuration from db
    final SourceConnection sourceConnection = secretsRepositoryReader.getSourceConnectionWithSecrets(sourceId);
    final StandardSourceDefinition standardSourceDefinition = configRepository
        .getStandardSourceDefinition(sourceConnection.getSourceDefinitionId());
    return toSourceRead(sourceConnection, standardSourceDefinition);
  }

  private void validateSource(final ConnectorSpecification spec, final JsonNode implementationJson)
      throws JsonValidationException {
    validator.ensure(spec.getConnectionSpecification(), implementationJson);
  }

  private ConnectorSpecification getSpecFromSourceId(final UUID sourceId)
      throws IOException, JsonValidationException, ConfigNotFoundException {
    final SourceConnection source = configRepository.getSourceConnection(sourceId);
    return getSpecFromSourceDefinitionId(source.getSourceDefinitionId());
  }

  private ConnectorSpecification getSpecFromSourceDefinitionId(final UUID sourceDefId)
      throws IOException, JsonValidationException, ConfigNotFoundException {
    final StandardSourceDefinition sourceDef = configRepository.getStandardSourceDefinition(sourceDefId);
    return sourceDef.getSpec();
  }

  private void persistSourceConnection(final String name,
                                       final UUID sourceDefinitionId,
                                       final UUID workspaceId,
                                       final UUID sourceId,
                                       final boolean tombstone,
                                       final JsonNode configurationJson,
                                       final ConnectorSpecification spec)
      throws JsonValidationException, IOException {
    final SourceConnection sourceConnection = new SourceConnection()
        .withName(name)
        .withSourceDefinitionId(sourceDefinitionId)
        .withWorkspaceId(workspaceId)
        .withSourceId(sourceId)
        .withTombstone(tombstone)
        .withConfiguration(configurationJson);

    secretsRepositoryWriter.writeSourceConnection(sourceConnection, spec);
  }

  protected static SourceRead toSourceRead(final SourceConnection sourceConnection,
                                           final StandardSourceDefinition standardSourceDefinition) {
    return new SourceRead()
        .sourceDefinitionId(standardSourceDefinition.getSourceDefinitionId())
        .sourceName(standardSourceDefinition.getName())
        .sourceId(sourceConnection.getSourceId())
        .workspaceId(sourceConnection.getWorkspaceId())
        .sourceDefinitionId(sourceConnection.getSourceDefinitionId())
        .connectionConfiguration(sourceConnection.getConfiguration())
        .name(sourceConnection.getName());
  }

  public List<WebBackendConnectionFilterParamItem> listFilterParam() throws IOException {
    List<WebBackendConnectionFilterParamItem> result = new LinkedList<>();
    List<Map<String, String>> listMap = configRepository.listFilterParamSources();
    listMap.forEach(item -> {
      WebBackendConnectionFilterParamItem paramItem = new WebBackendConnectionFilterParamItem();
      paramItem.setValue(item.get("value"));
      paramItem.setKey(item.get("key"));
      result.add(paramItem);
    });
    return result;
  }

}
