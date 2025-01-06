/*
 * Copyright (c) 2022 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.server.errors;

public class UnauthorizedKnownException extends KnownException {

  public UnauthorizedKnownException(final String message) {
    super(message);
  }

  public UnauthorizedKnownException(final String message, final Throwable cause) {
    super(message, cause);
  }

  @Override
  public int getHttpCode() {
    return 401;
  }

}
