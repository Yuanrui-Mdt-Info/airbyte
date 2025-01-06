/*
 * Copyright (c) 2022 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.server.handlers;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.collect.ImmutableMap;
import io.airbyte.analytics.TrackingClient;
import io.airbyte.api.model.generated.*;
import io.airbyte.api.model.generated.SourceEntityRead;
import io.airbyte.commons.json.Jsons;
import io.airbyte.config.*;
import io.airbyte.config.persistence.ConfigNotFoundException;
import io.airbyte.config.persistence.ConfigRepository;
import io.airbyte.config.persistence.SecretsRepositoryReader;
import io.airbyte.oauth.OAuthFlowImplementation;
import io.airbyte.oauth.OAuthImplementationFactory;
import io.airbyte.oauth.UnauthorizedException;
import io.airbyte.protocol.models.ConnectorSpecification;
import io.airbyte.scheduler.persistence.job_factory.OAuthConfigSupplier;
import io.airbyte.scheduler.persistence.job_tracker.TrackingMetadata;
import io.airbyte.server.converters.ApiPojoConverters;
import io.airbyte.validation.json.JsonValidationException;
import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.net.http.HttpClient;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OAuthHandler {

  private static final Logger LOGGER = LoggerFactory.getLogger(OAuthHandler.class);
  private static final String ERROR_MESSAGE = "failed while reporting usage.";

  private final ConfigRepository configRepository;
  private final OAuthImplementationFactory oAuthImplementationFactory;
  private final TrackingClient trackingClient;
  private final SecretsRepositoryReader secretsRepositoryReader;
  private final OAuthConfigSupplier oAuthConfigSupplier;

  public OAuthHandler(final ConfigRepository configRepository,
                      final HttpClient httpClient,
                      final TrackingClient trackingClient,
                      final SecretsRepositoryReader secretsRepositoryReader,
                      final OAuthConfigSupplier oAuthConfigSupplier) {

    this.configRepository = configRepository;
    this.oAuthImplementationFactory = new OAuthImplementationFactory(configRepository, httpClient);
    this.trackingClient = trackingClient;
    this.secretsRepositoryReader = secretsRepositoryReader;
    this.oAuthConfigSupplier = oAuthConfigSupplier;
  }

  public OAuthConsentRead getSourceOAuthConsent(final SourceOauthConsentRequest sourceDefinitionIdRequestBody)
      throws JsonValidationException, ConfigNotFoundException, IOException {
    final StandardSourceDefinition sourceDefinition =
        configRepository.getStandardSourceDefinition(sourceDefinitionIdRequestBody.getSourceDefinitionId());
    final OAuthFlowImplementation oAuthFlowImplementation = oAuthImplementationFactory.create(sourceDefinition);
    final ConnectorSpecification spec = sourceDefinition.getSpec();
    final ImmutableMap<String, Object> metadata = generateSourceMetadata(sourceDefinitionIdRequestBody.getSourceDefinitionId());
    final OAuthConsentRead result;
    if (OAuthConfigSupplier.hasOAuthConfigSpecification(spec)) {
      result = new OAuthConsentRead().consentUrl(oAuthFlowImplementation.getSourceConsentUrl(
          sourceDefinitionIdRequestBody.getWorkspaceId(),
          sourceDefinitionIdRequestBody.getSourceDefinitionId(),
          sourceDefinitionIdRequestBody.getRedirectUrl(),
          sourceDefinitionIdRequestBody.getoAuthInputConfiguration(),
          spec.getAdvancedAuth().getOauthConfigSpecification()));
      if ("a9497464-34f2-4f7b-9f12-9b873a69d2ea".equalsIgnoreCase(sourceDefinitionIdRequestBody.getSourceDefinitionId().toString())) {
        result.setConsentUrl(decodeScopeForHubstaff(result.getConsentUrl()));
      }
    } else {
      result = new OAuthConsentRead().consentUrl(oAuthFlowImplementation.getSourceConsentUrl(
          sourceDefinitionIdRequestBody.getWorkspaceId(),
          sourceDefinitionIdRequestBody.getSourceDefinitionId(),
          sourceDefinitionIdRequestBody.getRedirectUrl(), Jsons.emptyObject(), null));
    }
    try {
      trackingClient.track(sourceDefinitionIdRequestBody.getWorkspaceId(), "Get Oauth Consent URL - Backend", metadata);
    } catch (final Exception e) {
      LOGGER.error(ERROR_MESSAGE, e);
    }
    return result;
  }

  private String decodeScopeForHubstaff(String consentUrl) {
    try {
      URI uri = new URI(consentUrl);
      String query = uri.getQuery();
      Optional<String> scopeOpt = Arrays.stream(query.split("&"))
          .filter(param -> param.startsWith("scope="))
          .map(param -> param.substring("scope=".length()))
          .findFirst();
      if (scopeOpt.isPresent()) {
        String scope = scopeOpt.get();
        String decodedScope = URLDecoder.decode(scope, "UTF-8");
        // Reconstruct the URL with the decoded scope
        String newQuery = query.replace(scope, decodedScope);
        return new URI(uri.getScheme(), uri.getAuthority(), uri.getPath(), newQuery, uri.getFragment()).toString();
      }
    } catch (Exception e) {
      LOGGER.error(ERROR_MESSAGE, e);
    }
    return consentUrl;
  }

  public OAuthConsentRead getDestinationOAuthConsent(final DestinationOauthConsentRequest destinationDefinitionIdRequestBody)
      throws JsonValidationException, ConfigNotFoundException, IOException {
    final StandardDestinationDefinition destinationDefinition =
        configRepository.getStandardDestinationDefinition(destinationDefinitionIdRequestBody.getDestinationDefinitionId());
    final OAuthFlowImplementation oAuthFlowImplementation = oAuthImplementationFactory.create(destinationDefinition);
    final ConnectorSpecification spec = destinationDefinition.getSpec();
    final ImmutableMap<String, Object> metadata = generateDestinationMetadata(destinationDefinitionIdRequestBody.getDestinationDefinitionId());
    final OAuthConsentRead result;
    if (OAuthConfigSupplier.hasOAuthConfigSpecification(spec)) {
      result = new OAuthConsentRead().consentUrl(oAuthFlowImplementation.getDestinationConsentUrl(
          destinationDefinitionIdRequestBody.getWorkspaceId(),
          destinationDefinitionIdRequestBody.getDestinationDefinitionId(),
          destinationDefinitionIdRequestBody.getRedirectUrl(),
          destinationDefinitionIdRequestBody.getoAuthInputConfiguration(),
          spec.getAdvancedAuth().getOauthConfigSpecification()));
    } else {
      result = new OAuthConsentRead().consentUrl(oAuthFlowImplementation.getDestinationConsentUrl(
          destinationDefinitionIdRequestBody.getWorkspaceId(),
          destinationDefinitionIdRequestBody.getDestinationDefinitionId(),
          destinationDefinitionIdRequestBody.getRedirectUrl(), Jsons.emptyObject(), null));
    }
    try {
      trackingClient.track(destinationDefinitionIdRequestBody.getWorkspaceId(), "Get Oauth Consent URL - Backend", metadata);
    } catch (final Exception e) {
      LOGGER.error(ERROR_MESSAGE, e);
    }
    return result;
  }

  public Map<String, Object> completeSourceOAuth(final CompleteSourceOauthRequest oauthSourceRequestBody)
      throws JsonValidationException, ConfigNotFoundException, IOException {
    final StandardSourceDefinition sourceDefinition =
        configRepository.getStandardSourceDefinition(oauthSourceRequestBody.getSourceDefinitionId());
    final OAuthFlowImplementation oAuthFlowImplementation = oAuthImplementationFactory.create(sourceDefinition);
    final ConnectorSpecification spec = sourceDefinition.getSpec();
    final ImmutableMap<String, Object> metadata = generateSourceMetadata(oauthSourceRequestBody.getSourceDefinitionId());
    final Map<String, Object> result;
    if (OAuthConfigSupplier.hasOAuthConfigSpecification(spec)) {
      result = oAuthFlowImplementation.completeSourceOAuth(
          oauthSourceRequestBody.getWorkspaceId(),
          oauthSourceRequestBody.getSourceDefinitionId(),
          oauthSourceRequestBody.getQueryParams(),
          oauthSourceRequestBody.getRedirectUrl(),
          oauthSourceRequestBody.getoAuthInputConfiguration(),
          spec.getAdvancedAuth().getOauthConfigSpecification());
    } else {
      // deprecated but this path is kept for connectors that don't define OAuth Spec yet
      result = oAuthFlowImplementation.completeSourceOAuth(
          oauthSourceRequestBody.getWorkspaceId(),
          oauthSourceRequestBody.getSourceDefinitionId(),
          oauthSourceRequestBody.getQueryParams(),
          oauthSourceRequestBody.getRedirectUrl());
    }
    try {
      trackingClient.track(oauthSourceRequestBody.getWorkspaceId(), "Complete OAuth Flow - Backend", metadata);
    } catch (final Exception e) {
      LOGGER.error(ERROR_MESSAGE, e);
    }
    return result;
  }

  public Map<String, Object> completeDestinationOAuth(final CompleteDestinationOAuthRequest oauthDestinationRequestBody)
      throws JsonValidationException, ConfigNotFoundException, IOException {
    final StandardDestinationDefinition destinationDefinition =
        configRepository.getStandardDestinationDefinition(oauthDestinationRequestBody.getDestinationDefinitionId());
    final OAuthFlowImplementation oAuthFlowImplementation = oAuthImplementationFactory.create(destinationDefinition);
    final ConnectorSpecification spec = destinationDefinition.getSpec();
    final ImmutableMap<String, Object> metadata = generateDestinationMetadata(oauthDestinationRequestBody.getDestinationDefinitionId());
    final Map<String, Object> result;
    if (OAuthConfigSupplier.hasOAuthConfigSpecification(spec)) {
      result = oAuthFlowImplementation.completeDestinationOAuth(
          oauthDestinationRequestBody.getWorkspaceId(),
          oauthDestinationRequestBody.getDestinationDefinitionId(),
          oauthDestinationRequestBody.getQueryParams(),
          oauthDestinationRequestBody.getRedirectUrl(),
          oauthDestinationRequestBody.getoAuthInputConfiguration(),
          spec.getAdvancedAuth().getOauthConfigSpecification());
    } else {
      // deprecated but this path is kept for connectors that don't define OAuth Spec yet
      result = oAuthFlowImplementation.completeDestinationOAuth(
          oauthDestinationRequestBody.getWorkspaceId(),
          oauthDestinationRequestBody.getDestinationDefinitionId(),
          oauthDestinationRequestBody.getQueryParams(),
          oauthDestinationRequestBody.getRedirectUrl());
    }
    try {
      trackingClient.track(oauthDestinationRequestBody.getWorkspaceId(), "Complete OAuth Flow - Backend", metadata);
    } catch (final Exception e) {
      LOGGER.error(ERROR_MESSAGE, e);
    }
    return result;
  }

  public void setSourceInstancewideOauthParams(final SetInstancewideSourceOauthParamsRequestBody requestBody)
      throws JsonValidationException, IOException {
    final SourceOAuthParameter param = configRepository
        .getSourceOAuthParamByDefinitionIdOptional(null, requestBody.getSourceDefinitionId())
        .orElseGet(() -> new SourceOAuthParameter().withOauthParameterId(UUID.randomUUID()))
        .withConfiguration(Jsons.jsonNode(requestBody.getParams()))
        .withSourceDefinitionId(requestBody.getSourceDefinitionId());
    // TODO validate requestBody.getParams() against
    // spec.getAdvancedAuth().getOauthConfigSpecification().getCompleteOauthServerInputSpecification()
    configRepository.writeSourceOAuthParam(param);
  }

  public void setDestinationInstancewideOauthParams(final SetInstancewideDestinationOauthParamsRequestBody requestBody)
      throws JsonValidationException, IOException {
    final DestinationOAuthParameter param = configRepository
        .getDestinationOAuthParamByDefinitionIdOptional(null, requestBody.getDestinationDefinitionId())
        .orElseGet(() -> new DestinationOAuthParameter().withOauthParameterId(UUID.randomUUID()))
        .withConfiguration(Jsons.jsonNode(requestBody.getParams()))
        .withDestinationDefinitionId(requestBody.getDestinationDefinitionId());
    // TODO validate requestBody.getParams() against
    // spec.getAdvancedAuth().getOauthConfigSpecification().getCompleteOauthServerInputSpecification()
    configRepository.writeDestinationOAuthParam(param);
  }

  private ImmutableMap<String, Object> generateSourceMetadata(final UUID sourceDefinitionId)
      throws JsonValidationException, ConfigNotFoundException, IOException {
    final StandardSourceDefinition sourceDefinition = configRepository.getStandardSourceDefinition(sourceDefinitionId);
    return TrackingMetadata.generateSourceDefinitionMetadata(sourceDefinition);
  }

  private ImmutableMap<String, Object> generateDestinationMetadata(final UUID destinationDefinitionId)
      throws JsonValidationException, ConfigNotFoundException, IOException {
    final StandardDestinationDefinition destinationDefinition = configRepository.getStandardDestinationDefinition(destinationDefinitionId);
    return TrackingMetadata.generateDestinationDefinitionMetadata(destinationDefinition);
  }

  public SourceEntityRead getSourceEntities(SourceEntitiesRequest sourceEntitiesRequest)
      throws JsonValidationException, ConfigNotFoundException, IOException, UnauthorizedException {
    final StandardSourceDefinition sourceDefinition = configRepository.getStandardSourceDefinition(sourceEntitiesRequest.getSourceDefinitionId());
    final OAuthFlowImplementation oAuthFlowImplementation = oAuthImplementationFactory.create(sourceDefinition);
    return ApiPojoConverters
        .toSourceEntityRead(
            oAuthFlowImplementation.getSourceEntity(sourceEntitiesRequest.getWorkspaceId(), sourceEntitiesRequest.getSourceDefinitionId(),
                sourceEntitiesRequest.getAccessToken(), sourceEntitiesRequest.getData()));
  }

  public SourceEntityRead getUpdateSourceEntities(SourceEntitiesUpdateRequest entitiesUpdateRequest)
      throws ConfigNotFoundException, IOException, JsonValidationException {
    SourceConnection sourceConnection = secretsRepositoryReader.getSourceConnectionWithSecrets(entitiesUpdateRequest.getSourceId());

    final JsonNode sourceConfiguration = oAuthConfigSupplier.injectSourceOAuthParameters(
            sourceConnection.getSourceDefinitionId(),
            sourceConnection.getWorkspaceId(),
            sourceConnection.getConfiguration());
    sourceConnection.withConfiguration(sourceConfiguration);
    SourceConnection fullConfig = secretsRepositoryReader.hydrateSourcePartialConfig(sourceConnection);

    final StandardSourceDefinition sourceDefinition = configRepository.getStandardSourceDefinition(sourceConnection.getSourceDefinitionId());
    final OAuthFlowImplementation oAuthFlowImplementation = oAuthImplementationFactory.create(sourceDefinition);
    return ApiPojoConverters
        .toSourceEntityRead(oAuthFlowImplementation.getSourceEntityForUpdate(fullConfig.getConfiguration()));
  }

}
