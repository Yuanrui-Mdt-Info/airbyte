#
# Copyright (c) 2022 Airbyte, Inc., all rights reserved.
#
from typing import Any, Dict, List, Mapping, Tuple

from pendulum.datetime import DateTime
import requests
from airbyte_cdk.sources.streams.http.requests_native_auth import Oauth2Authenticator

class ZohoOauth2Authenticator(Oauth2Authenticator):

    def __init__(self, token_refresh_endpoint: str, 
                 client_id: str, client_secret: str, 
                 refresh_token: str, scopes: List[str] = None, 
                 token_expiry_date: DateTime = None, 
                 token_expiry_date_format: str = None, 
                 access_token_name: str = "access_token", 
                 expires_in_name: str = "expires_in", 
                 refresh_request_body: Mapping[str, Any] = None, 
                 grant_type: str = "refresh_token", 
                 token_expiry_is_time_of_expiration: bool = False, 
                 refresh_token_error_status_codes: Tuple[int] = ..., 
                 refresh_token_error_key: str = "", 
                 refresh_token_error_values: Tuple[str] = ...):
        
        super().__init__(token_refresh_endpoint, 
                         client_id, client_secret, 
                         refresh_token, 
                         scopes, 
                         token_expiry_date, 
                         token_expiry_date_format, 
                         access_token_name, expires_in_name, 
                         refresh_request_body, 
                         grant_type, token_expiry_is_time_of_expiration, 
                         refresh_token_error_status_codes, refresh_token_error_key, 
                         refresh_token_error_values)

    def _prepare_refresh_token_params(self) -> Dict[str, str]:
        return {
            "refresh_token": self._refresh_token,
            "client_id": self._client_id,
            "client_secret": self._client_secret,
            "grant_type": "refresh_token",
        }

    def get_auth_header(self) -> Mapping[str, Any]:
        token = self.get_access_token()
        return {"Authorization": f"Zoho-oauthtoken {token}"}

    def refresh_access_token(self) -> Tuple[str, int]:
        """
        This method is overridden because token parameters should be passed via URL params, not via the request payload.
        Returns a tuple of (access_token, token_lifespan_in_seconds)
        """
        try:
            response = requests.request(method="POST", url=self._token_refresh_endpoint, params=self._prepare_refresh_token_params())
            response.raise_for_status()
            response_json = response.json()
            return response_json[self._access_token_name], response_json[self._expires_in_name]
        except Exception as e:
            raise Exception(f"Error while refreshing access token: {e}") from e

