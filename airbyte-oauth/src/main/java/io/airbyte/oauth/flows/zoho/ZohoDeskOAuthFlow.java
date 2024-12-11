/*
 * Copyright (c) 2022 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.oauth.flows.zoho;

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
import java.util.*;
import java.util.function.Supplier;
import org.apache.http.client.utils.URIBuilder;

public class ZohoDeskOAuthFlow extends BaseOAuth2Flow {

  private static String defaultDeskUrl = "https://desk.zoho.com";
  private static final String AUTHORIZE_URL = "https://accounts.zoho.com/oauth/v2/auth";
  private static final String TOKEN_URL = "%s/oauth/v2/token";

  enum LocationWiseHost {

    EU("https://desk.zoho.eu"),

    AU("https://desk.zoho.com.au"),

    IN("https://desk.zoho.in"),

    JP("https://desk.zoho.jp"),

    UK("https://desk.zoho.uk"),

    US("https://desk.zoho.com"),

    CA("https://desk.zoho.ca"),

    SA("https://desk.zoho.sa"),
    ;

    private final String deskUrl;

    LocationWiseHost(String deskUrl) {
      this.deskUrl = deskUrl;
    }

    public String getDeskUrl() {
      return deskUrl;
    }

    public static String getDeskHost(String location) {
      try {
        return LocationWiseHost.valueOf(location.toUpperCase()).getDeskUrl();
      } catch (IllegalArgumentException e) {
        return defaultDeskUrl;
      }
    }

  }

  public ZohoDeskOAuthFlow(final ConfigRepository configRepository, final HttpClient httpClient) {
    super(configRepository, httpClient);
  }

  public ZohoDeskOAuthFlow(final ConfigRepository configRepository, final HttpClient httpClient, final Supplier<String> stateSupplier) {
    super(configRepository, httpClient, stateSupplier);
  }

  private static final List<String> SCOPES = Arrays.asList(
      "Desk.basic.READ",
      "Desk.contacts.READ",
      "Desk.tickets.READ",
      "Desk.settings.READ");

  public String getScopes() {
    return String.join(" ", SCOPES);
  }

  @Override
  protected String formatConsentUrl(UUID definitionId, String clientId, String redirectUrl, JsonNode inputOAuthConfiguration) throws IOException {
    try {
      // final String regionCountry = getConfigValueUnsafe(inputOAuthConfiguration, "dc_region");
      // String authUrl = ZohoDeskOAuthFlow.RegionHost.valueOf(regionCountry).getHost();
      return new URIBuilder(AUTHORIZE_URL)
          .addParameter("client_id", clientId)
          .addParameter("scope", getScopes())
          .addParameter("response_type", "code")
          .addParameter("redirect_uri", redirectUrl)
          .addParameter("state", getState())
          .addParameter("prompt", "consent")
          .addParameter("access_type", "offline")
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
        .put("client_id", clientId)
        .put("client_secret", clientSecret)
        .put("redirect_uri", redirectUrl)
        .put("code", authCode)
        .put("grant_type", "authorization_code")
        .build();
  }

  /*
   * This method is not actually called because, for Zoho Desk, we custom implement a
   * completeOAuthFlow()
   */
  @Override
  protected String getAccessTokenUrl(JsonNode inputOAuthConfiguration) {
    return TOKEN_URL;
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

    final var accessTokenUrl = TOKEN_URL.formatted(queryParams.get("accounts-server"));

    HttpRequest request = HttpRequest.newBuilder()
        .POST(HttpRequest.BodyPublishers
            .ofString(BaseOAuth2Flow.toUrlEncodedString(getAccessTokenQueryParameters(clientId, clientSecret, authCode, redirectUrl))))
        .uri(URI.create(accessTokenUrl))
        .header("Content-Type", "application/x-www-form-urlencoded")
        .header("Accept", "application/json")
        .build();

    try {
      final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      Map<String, Object> output = extractOAuthOutput(Jsons.deserialize(response.body()), accessTokenUrl);
      // add location to response because which is help in connector to identify api region
      if (output.containsKey("refresh_token")) {
        output.put("dc_region", queryParams.get("location").toString().toUpperCase());
        String host = LocationWiseHost.getDeskHost(queryParams.get("location").toString().toUpperCase());
        List<String> orgIds = getOrgIds(Jsons.deserialize(response.body()).get("access_token").asText(), host);
        output.put("org_ids", String.join(",", orgIds));
      }
      return output;
    } catch (final InterruptedException e) {
      throw new IOException("Failed to complete OAuth flow", e);
    }
  }

  public List<String> getOrgIds(String accessToken, String host) throws IOException {
    try {
      String url = "%s/api/v1/organizations";
      String token = "Zoho-oauthtoken %s";
      HttpRequest request = HttpRequest.newBuilder()
          .GET()
          .uri(URI.create(String.format(url, host)))
          .header("Authorization", String.format(token, accessToken))
          .build();
      final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      List<String> orgIds = new ArrayList<>();
      JsonNode jsonNode = Jsons.deserialize(response.body());
      for (JsonNode data : jsonNode.get("data")) {
        orgIds.add(data.get("id").asText());
      }
      return orgIds;
    } catch (InterruptedException | IOException e) {
      throw new IOException("Failed to fetch Org ids", e);
    }
  }

}
