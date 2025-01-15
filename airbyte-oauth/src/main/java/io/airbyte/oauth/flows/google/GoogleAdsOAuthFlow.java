/*
 * Copyright (c) 2022 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.oauth.flows.google;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.http.HttpStatusCodes;
import com.google.common.annotations.VisibleForTesting;
import io.airbyte.config.SourceEntity;
import io.airbyte.config.SourceEntityRead;
import io.airbyte.config.persistence.ConfigNotFoundException;
import io.airbyte.config.persistence.ConfigRepository;
import io.airbyte.oauth.UnauthorizedException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;
import org.apache.http.client.utils.URIBuilder;

public class GoogleAdsOAuthFlow extends GoogleOAuthFlow {

  @VisibleForTesting
  static final String SCOPE_URL = "https://www.googleapis.com/auth/adwords";

  public GoogleAdsOAuthFlow(final ConfigRepository configRepository, final HttpClient httpClient) {
    super(configRepository, httpClient);
  }

  @VisibleForTesting
  GoogleAdsOAuthFlow(final ConfigRepository configRepository, final HttpClient httpClient, final Supplier<String> stateSupplier) {
    super(configRepository, httpClient, stateSupplier);
  }

  @Override
  protected String getScope() {
    return SCOPE_URL;
  }

  @Override
  public SourceEntityRead getSourceEntity(UUID workspaceId, UUID sourceDefinitionId, String accessToken, Map<String, Object> data)
      throws IOException, UnauthorizedException, ConfigNotFoundException {
    final var url = "https://googleads.googleapis.com/v18/customers:listAccessibleCustomers";
    final JsonNode oAuthParamConfig = getSourceOAuthParamConfig(workspaceId, sourceDefinitionId);
    String developerToken = getConfigValueUnsafe(oAuthParamConfig, "developer_token");
    try {
      HttpRequest request = HttpRequest.newBuilder()
          .GET()
          .uri(new URIBuilder(url).build())
          .header("Content-Type", TOKEN_REQUEST_CONTENT_TYPE.URL_ENCODED.getContentType())
          .header("Authorization", String.format("Bearer %s", accessToken))
          .header("developer-token", developerToken)
          .build();

      final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (HttpStatusCodes.STATUS_CODE_OK == response.statusCode()) {
        JsonNode responseNode = new ObjectMapper().readTree(response.body());
        String responseField = "resourceNames";
        if (responseNode.has(responseField)) {
          return extractEntityOutput(responseNode.get("resourceNames"));
        } else {
          throw new IOException(String.format("Missing 'resourceNames' object in response. status_code:%s", response.statusCode()));
        }
      } else if (HttpStatusCodes.STATUS_CODE_UNAUTHORIZED == response.statusCode()) {
        throw new UnauthorizedException();
      }
    } catch (final InterruptedException | URISyntaxException e) {
      throw new IOException("Failed to get customer ids", e);
    }
    throw new IOException("Failed to get customer ids");
  }

  public SourceEntityRead extractEntityOutput(JsonNode responseNode) {
    long count = 0;
    List<SourceEntity> sourceEntityList = new ArrayList<>();
    if (responseNode != null && responseNode.isArray()) {
      count = responseNode.size();
      for (JsonNode data : responseNode) {
        sourceEntityList.add(new SourceEntity()
            .withId(getCustomerId(data.asText()))
            .withName("dummy"));// TODO set account name
      }
    }
    return new SourceEntityRead().withCount(count).withIsMultiselect(Boolean.FALSE).withEntities(sourceEntityList);
  }

  private String getCustomerId(String value) {
    // API returns a value in the customers/234XXX format
    if (value != null && value.contains("/")) {
      return value.split("/")[1];
    }
    return value;
  }

}
