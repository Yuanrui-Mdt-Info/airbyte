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
import io.airbyte.config.persistence.ConfigRepository;
import io.airbyte.oauth.UnauthorizedException;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;
import org.apache.http.client.utils.URIBuilder;

public class GoogleSheetsOAuthFlow extends GoogleOAuthFlow {

  // space-delimited string for multiple scopes, see:
  // https://datatracker.ietf.org/doc/html/rfc6749#section-3.3
  @VisibleForTesting
  static final String SCOPE_URL = "https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly";

  public GoogleSheetsOAuthFlow(final ConfigRepository configRepository, final HttpClient httpClient) {
    super(configRepository, httpClient);
  }

  @VisibleForTesting
  GoogleSheetsOAuthFlow(final ConfigRepository configRepository, final HttpClient httpClient, final Supplier<String> stateSupplier) {
    super(configRepository, httpClient, stateSupplier);
  }

  @Override
  protected String getScope() {
    return SCOPE_URL;
  }

  @Override
  public SourceEntityRead getSourceEntity(UUID workspaceId, UUID sourceDefinitionId, String accessToken, Map<String, Object> data)
      throws IOException, UnauthorizedException {
    final var driveFilesUrl = "https://www.googleapis.com/drive/v3/files";
    try {
      HttpRequest request = HttpRequest.newBuilder()
          .GET()
          .uri(createGoogleFilesURI(driveFilesUrl))
          .header("Content-Type", TOKEN_REQUEST_CONTENT_TYPE.URL_ENCODED.getContentType())
          .header("Authorization", String.format("Bearer %s", accessToken))
          .build();

      final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (HttpStatusCodes.STATUS_CODE_OK == response.statusCode()) {
        JsonNode responseNode = new ObjectMapper().readTree(response.body());
        String responseField = "files";
        if (responseNode.has(responseField)) {
          return extractEntityOutput(responseNode);
        } else {
          throw new IOException(String.format("Missing 'files' object in response. status_code:%s", response.statusCode()));
        }
      } else if (HttpStatusCodes.STATUS_CODE_UNAUTHORIZED == response.statusCode()) {
        throw new UnauthorizedException();
      }
    } catch (final InterruptedException | URISyntaxException e) {
      throw new IOException("Failed to get google sheet files ", e);
    }
    throw new IOException("Failed to get google sheet files");
  }

  private URI createGoogleFilesURI(String url) throws URISyntaxException {
    return new URIBuilder(url)
        .addParameter("q", "mimeType='application/vnd.google-apps.spreadsheet'")
        .addParameter("fields", "files")
        .build();
  }

  public SourceEntityRead extractEntityOutput(JsonNode responseNode) {
    long count = 0;
    JsonNode filesNode = responseNode.get("files");
    List<SourceEntity> sourceEntityList = new ArrayList<>();
    if (filesNode != null && filesNode.isArray()) {
      count = filesNode.size();
      for (JsonNode file : filesNode) {
        sourceEntityList.add(new SourceEntity()
            .withId(file.get("id").asText())
            .withName(file.get("name").asText())
            .withCreatedAt(formatDate(file.get("createdTime").asText()))
            .withModifiedAt(formatDate(file.get("modifiedTime").asText()))
            .withLogo(file.get("iconLink").asText())
            .withUrl(file.get("webViewLink").asText())
            .withMetadata(Map.of("data", file)));
      }
    }
    return new SourceEntityRead().withCount(count).withIsMultiselect(Boolean.FALSE).withEntities(sourceEntityList);
  }

  private String formatDate(String date) {
    return Instant.parse(date).atZone(ZoneId.systemDefault()).toLocalDate().toString();
  }

  @Override
  protected Map<String, Object> extractOAuthOutput(final JsonNode data, final String accessTokenUrl) throws IOException {
    final Map<String, Object> result = super.extractOAuthOutput(data, accessTokenUrl);
    if (data.has("access_token")) {
      // google also returns an access token the first time you complete oauth flow
      result.put("access_token", data.get("access_token").asText());
    }
    if (data.has("id_token")) {
      result.put("email", claimEmail(decodeJWTToken(data.get("id_token").asText())));
    }
    return result;
  }

}
