/*
 * Copyright (c) 2022 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.oauth.flows.facebook;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Preconditions;
import io.airbyte.commons.json.Jsons;
import io.airbyte.config.persistence.ConfigRepository;
import io.airbyte.oauth.BaseOAuth2Flow;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.function.Supplier;
import org.apache.http.client.utils.URIBuilder;


/**
 * Following docs from
 * https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
 */
public abstract class FacebookOAuthFlow extends BaseOAuth2Flow {

  private static final String ACCESS_TOKEN_URL = "https://graph.facebook.com/v21.0/oauth/access_token";
  private static final String AUTH_CODE_TOKEN_URL = "https://www.facebook.com/v21.0/dialog/oauth";
  private static final String ACCESS_TOKEN = "access_token";

  class Account {
    private String id;
    private String name;
    private String account_id;

    public Account(String id, String name, String account_id) {
      this.id = id;
      this.name = name;
      this.account_id = account_id;
    }

    public String getId() {
      return id;
    }

    public String getName() {
      return name;
    }

    public String getAccountId() {
      return account_id;
    }

    public String toJsonString() {
      try {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(this);
      } catch (Exception e) {
        throw new RuntimeException("Failed to convert Account object to JSON string", e);
      }
    }
  }

  public FacebookOAuthFlow(final ConfigRepository configRepository, final HttpClient httpClient) {
    super(configRepository, httpClient);
  }

  FacebookOAuthFlow(final ConfigRepository configRepository, final HttpClient httpClient, final Supplier<String> stateSupplier) {
    super(configRepository, httpClient, stateSupplier);
  }

  protected abstract String getScopes();

  @Override
  protected String formatConsentUrl(final UUID definitionId,
                                    final String clientId,
                                    final String redirectUrl,
                                    final JsonNode inputOAuthConfiguration)
      throws IOException {
    try {
      return new URIBuilder(AUTH_CODE_TOKEN_URL)
          .addParameter("client_id", clientId)
          .addParameter("redirect_uri", redirectUrl)
          .addParameter("state", getState())
          .addParameter("scope", getScopes())
          .build().toString();
    } catch (final URISyntaxException e) {
      throw new IOException("Failed to format Consent URL for OAuth flow", e);
    }
  }

  @Override
  protected String getAccessTokenUrl(final JsonNode inputOAuthConfiguration) {
    return ACCESS_TOKEN_URL;
  }

  @Override
  protected Map<String, Object> extractOAuthOutput(final JsonNode data, final String accessTokenUrl) {
    // Facebook does not have refresh token but calls it "long lived access token" instead:
    // see https://developers.facebook.com/docs/facebook-login/access-tokens/refreshing
    Preconditions.checkArgument(data.has(ACCESS_TOKEN), "Missing 'access_token' in query params from %s", ACCESS_TOKEN_URL);
    return Map.of(ACCESS_TOKEN, data.get(ACCESS_TOKEN).asText());
  }

  protected List<Account> getAdAccountIds(final String accessToken) throws IOException {
    try {
      final String url = "https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_id&access_token=" + accessToken;
      final HttpRequest request = HttpRequest.newBuilder()
              .GET()
              .uri(URI.create(url))
              .build();
      final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      final JsonNode jsonNode = Jsons.deserialize(response.body());
      List<Account> account_ids = new ArrayList<>();
      for (JsonNode data : jsonNode.get("data")) {
        Account account = new Account(data.get("id").asText(), data.get("name").asText(), data.get("account_id").asText());
        //account_ids.add(data.get("account_id").asText());
        account_ids.add(account);
      }
      return account_ids;
    } catch (final InterruptedException e) {
      throw new IOException("Failed to complete OAuth flow", e);
    }
  }

  @Override
  protected Map<String, Object> completeOAuthFlow(final String clientId,
                                                  final String clientSecret,
                                                  final String authCode,
                                                  final String redirectUrl,
                                                  final JsonNode inputOAuthConfiguration,
                                                  final JsonNode oAuthParamConfig)
      throws IOException {
    // Access tokens generated via web login are short-lived tokens
    // they arre valid for 1 hour and need to be exchanged for long-lived access token
    // https://developers.facebook.com/docs/facebook-login/access-tokens (Short-Term Tokens and
    // https://developers.facebook.com/docs/instagram-basic-display-api/overview#short-lived-access-tokens
    // Long-Term Tokens section)

    final Map<String, Object> data =
        super.completeOAuthFlow(clientId, clientSecret, authCode, redirectUrl, inputOAuthConfiguration, oAuthParamConfig);
    Preconditions.checkArgument(data.containsKey(ACCESS_TOKEN));
    final String shortLivedAccessToken = (String) data.get(ACCESS_TOKEN);
    final String longLivedAccessToken = getLongLivedAccessToken(clientId, clientSecret, shortLivedAccessToken);

    List<Account> adsAccountIds = getAdAccountIds(shortLivedAccessToken);
    ObjectMapper objectMapper = new ObjectMapper();
    String accountsJsonArray = objectMapper.writeValueAsString(adsAccountIds);

    Map<String, Object> output = new HashMap<>();
    output.put(ACCESS_TOKEN, longLivedAccessToken);
    //output.put("org_ids", String.join(",", adsAccountIds));
    output.put("org_ids", accountsJsonArray);

    return output;
    //return Map.of(ACCESS_TOKEN, longLivedAccessToken);
  }

  protected URI createLongLivedTokenURI(final String clientId, final String clientSecret, final String shortLivedAccessToken)
      throws URISyntaxException {
    // Exchange Short-lived Access token for Long-lived one
    // https://developers.facebook.com/docs/facebook-login/access-tokens/refreshing
    // It's valid for 60 days and resreshed once per day if using in requests.
    // If no requests are made, the token will expire after about 60 days and
    // the person will have to go through the login flow again to get a new
    // token.
    return new URIBuilder(ACCESS_TOKEN_URL)
        .addParameter("client_secret", clientSecret)
        .addParameter("client_id", clientId)
        .addParameter("grant_type", "fb_exchange_token")
        .addParameter("fb_exchange_token", shortLivedAccessToken)
        .build();
  }

  protected String getLongLivedAccessToken(final String clientId, final String clientSecret, final String shortLivedAccessToken) throws IOException {
    try {
      final URI uri = createLongLivedTokenURI(clientId, clientSecret, shortLivedAccessToken);
      final HttpRequest request = HttpRequest.newBuilder()
          .GET()
          .uri(uri)
          .build();
      final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      final JsonNode responseJson = Jsons.deserialize(response.body());
      Preconditions.checkArgument(responseJson.hasNonNull(ACCESS_TOKEN), "%s response should have access_token", responseJson);
      return responseJson.get(ACCESS_TOKEN).asText();
    } catch (final InterruptedException | URISyntaxException e) {
      throw new IOException("Failed to complete OAuth flow", e);
    }
  }

  @Override
  public List<String> getDefaultOAuthOutputPath() {
    return List.of();
  }

}
