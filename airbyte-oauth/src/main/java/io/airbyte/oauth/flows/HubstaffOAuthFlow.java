/*
 * Copyright (c) 2022 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.oauth.flows;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.collect.ImmutableMap;
import io.airbyte.commons.json.Jsons;
import io.airbyte.config.persistence.ConfigNotFoundException;
import io.airbyte.config.persistence.ConfigRepository;
import io.airbyte.oauth.BaseOAuth2Flow;
import io.airbyte.protocol.models.OAuthConfigSpecification;
import io.airbyte.validation.json.JsonValidationException;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Supplier;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.http.client.utils.URIBuilder;

public class HubstaffOAuthFlow extends BaseOAuth2Flow {

  private static final String AUTHORIZE_URL = "https://account.hubstaff.com/authorizations/new";
  private static final String ACCESS_TOKEN_URL = "https://account.hubstaff.com/access_tokens";

  public HubstaffOAuthFlow(final ConfigRepository configRepository, final HttpClient httpClient) {
    super(configRepository, httpClient);
  }

  public HubstaffOAuthFlow(final ConfigRepository configRepository, final HttpClient httpClient, final Supplier<String> stateSupplier) {
    super(configRepository, httpClient, stateSupplier, TOKEN_REQUEST_CONTENT_TYPE.JSON);
  }

  private static final List<String> SCOPES = Arrays.asList(
      "profile",
      "email",
      "tasks:read",
      "hubstaff:read");

  private String getScopes() {
    return String.join("+", SCOPES);
  }

  @Override
  protected String formatConsentUrl(final UUID definitionId,
                                    final String clientId,
                                    final String redirectUrl,
                                    final JsonNode inputOAuthConfiguration)
      throws IOException {
    try {
      /*
       * https://developer.hubstaff.com/authentication#discovery
       */
      return new URIBuilder(AUTHORIZE_URL)
          .addParameter("client_id", clientId)
          .addParameter("redirect_uri", redirectUrl)
          .addParameter("state", getState())
          .addParameter("scope", getScopes())
          .addParameter("response_type", "code")
          .addParameter("nonce", RandomStringUtils.randomAlphanumeric(7))
          .build().toString();
    } catch (final URISyntaxException e) {
      throw new IOException("Failed to format Consent URL for OAuth flow", e);
    }
  }

  @Override
  protected Map<String, String> getAccessTokenQueryParameters(final String clientId,
                                                              final String clientSecret,
                                                              final String authCode,
                                                              final String redirectUrl) {
    return ImmutableMap.<String, String>builder()
        .put("grant_type", "authorization_code")
        .put("redirect_uri", redirectUrl)
        .put("code", authCode).build();
  }

  /**
   * Returns the URL where to retrieve the access token from.
   */
  @Override
  protected String getAccessTokenUrl(final JsonNode inputOAuthConfiguration) {
    return ACCESS_TOKEN_URL;
  }

  @Override
  public Map<String, Object> completeSourceOAuth(final UUID workspaceId,
                                                 final UUID sourceDefinitionId,
                                                 final Map<String, Object> queryParams,
                                                 final String redirectUrl,
                                                 final JsonNode inputOAuthConfiguration,
                                                 final OAuthConfigSpecification oAuthConfigSpecification)
      throws IOException, ConfigNotFoundException, JsonValidationException {
    validateInputOAuthConfiguration(oAuthConfigSpecification, inputOAuthConfiguration);
    final JsonNode oAuthParamConfig = getSourceOAuthParamConfig(workspaceId, sourceDefinitionId);
    return formatOAuthOutput(
        oAuthParamConfig,
        completeOAuthFlow(
            getClientIdUnsafe(oAuthParamConfig),
            getClientSecretUnsafe(oAuthParamConfig),
            extractCodeParameter(queryParams),
            redirectUrl,
            inputOAuthConfiguration,
            oAuthParamConfig,
            queryParams),
        oAuthConfigSpecification);
  }

  protected Map<String, Object> completeOAuthFlow(final String clientId,
                                                  final String clientSecret,
                                                  final String authCode,
                                                  final String redirectUrl,
                                                  final JsonNode inputOAuthConfiguration,
                                                  final JsonNode oAuthParamConfig,
                                                  final Map<String, Object> queryParams)
      throws IOException {

    final HttpRequest request = HttpRequest.newBuilder()
        .POST(HttpRequest.BodyPublishers
            .ofString(tokenReqContentType.getConverter().apply(
                getAccessTokenQueryParameters(clientId, clientSecret, authCode, redirectUrl))))
        .uri(URI.create(ACCESS_TOKEN_URL))
        .header("Content-Type", tokenReqContentType.getContentType())
        .header("Authorization", "Basic " + getAuthorizationData(clientId, clientSecret))
        .header("Accept", "application/json")
        .build();

    try {
      final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      return extractOAuthOutput(Jsons.deserialize(response.body()), ACCESS_TOKEN_URL);
    } catch (final InterruptedException e) {
      throw new IOException("Failed to complete OAuth flow", e);
    }
  }

  private String getAuthorizationData(String clientId, String clientSecret) {
    final byte[] authorization = Base64.getEncoder()
        .encode((clientId + ":" + clientSecret).getBytes(StandardCharsets.UTF_8));
    return new String(authorization, StandardCharsets.UTF_8);
  }

}
