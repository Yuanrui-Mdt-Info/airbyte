#
# Copyright (c) 2022 Airbyte, Inc., all rights reserved.
#
import logging
from typing import Any, Dict, List, Mapping, Tuple

from pendulum.datetime import DateTime
import requests
from airbyte_cdk.sources.streams.http.requests_native_auth import Oauth2Authenticator
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
class ZohoOauth2Authenticator(Oauth2Authenticator):

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
        logger.info("Attempting to refresh access token...")
        logger.debug(f"Current object state: {self.__dict__}")  # Log the internal state of the object
        
        try:
            logger.debug(f"Requesting new token from {self._token_refresh_endpoint} with params: {self._prepare_refresh_token_params()}")
            response = requests.request(method="POST", url=self._token_refresh_endpoint, params=self._prepare_refresh_token_params())
            response.raise_for_status()
            response_json = response.json()
            logger.info("Access token successfully refreshed.")
            logger.debug(f"Response JSON: {response_json}")
            return response_json[self._access_token_name], response_json[self._expires_in_name]
        except requests.exceptions.HTTPError as http_err:
            logger.error(f"HTTP error occurred: {http_err}")
            raise
        except Exception as e:
            logger.error(f"Error while refreshing access token: {e}")
            raise
