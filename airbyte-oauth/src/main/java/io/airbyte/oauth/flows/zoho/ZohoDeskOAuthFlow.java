/*
 * Copyright (c) 2022 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.oauth.flows.zoho;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.collect.ImmutableMap;
import io.airbyte.config.persistence.ConfigRepository;
import io.airbyte.oauth.BaseOAuth2Flow;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;
import org.apache.http.client.utils.URIBuilder;

public class ZohoDeskOAuthFlow extends BaseOAuth2Flow {

  enum RegionHost {

    EU("https://accounts.zoho.eu/oauth/v2/auth", "https://accounts.zoho.eu/oauth/v2/token"),

    AU("https://accounts.zoho.com.au/oauth/v2/auth", "https://accounts.zoho.com.au/oauth/v2/token"),

    IN("https://accounts.zoho.in/oauth/v2/auth", "https://accounts.zoho.in/oauth/v2/token"),

    JP("https://accounts.zoho.jp/oauth/v2/auth", "https://accounts.zoho.jp/oauth/v2/token"),

    UK("https://accounts.zoho.uk/oauth/v2/auth", "https://accounts.zoho.uk/oauth/v2/token"),

    US("https://accounts.zoho.com/oauth/v2/auth", "https://accounts.zoho.com/oauth/v2/token"),

    CA("https://accounts.zohocloud.ca/oauth/v2/auth", "https://accounts.zohocloud.ca/oauth/v2/token"),

    SA("https://accounts.zoho.sa/oauth/v2/auth", "https://accounts.zoho.sa/oauth/v2/token"),
    ;

    private final String host;
    private final String tokenUrl;

    RegionHost(String host, String tokenUrl) {
      this.host = host;
      this.tokenUrl = tokenUrl;
    }

    public String getHost() {
      return host;
    }

    public String getTokenUrl() {
      return tokenUrl;
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
      final String regionCountry = getConfigValueUnsafe(inputOAuthConfiguration, "dc_region");
      String authUrl = ZohoDeskOAuthFlow.RegionHost.valueOf(regionCountry).getHost();

      return new URIBuilder(authUrl)
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

  @Override
  protected String getAccessTokenUrl(JsonNode inputOAuthConfiguration) {
    final String regionCountry = getConfigValueUnsafe(inputOAuthConfiguration, "dc_region");
    return ZohoDeskOAuthFlow.RegionHost.valueOf(regionCountry).getTokenUrl();
  }

}
