#
# Copyright (c) 2022 Airbyte, Inc., all rights reserved.
#

import logging
from types import MappingProxyType
from typing import Any, List, Mapping, MutableMapping, Tuple
from urllib.parse import urlsplit, urlunsplit
import threading
import requests

from .auth import ZohoOauth2Authenticator

logger = logging.getLogger(__name__)


class ZohoAPI:
    _DC_REGION_TO_ACCESS_URL = MappingProxyType(
        {
            "US": "https://accounts.zoho.com",
            "AU": "https://accounts.zoho.com.au",
            "EU": "https://accounts.zoho.eu",
            "IN": "https://accounts.zoho.in",
            "JP": "https://accounts.zoho.jp",
            "UK":"https://accounts.zoho.uk",
            "SA":"https://accounts.zoho.sa",
            "CA":"https://accounts.zohocloud.ca",
        }
    )
   
    _DC_REGION_TO_API_URL = MappingProxyType(
        {
            "US": "https://desk.zoho.com",
            "AU": "https://desk.zoho.com.au",
            "EU": "https://desk.zoho.eu",
            "IN": "https://desk.zoho.in",
            "JP": "https://desk.zoho.jp",
            "UK":"https://desk.zoho.uk",
            "SA":"https://desk.zoho.sa",
            "CA":"https://desk.zohoapis.ca",
        }
    )
    _API_LIMITS = MappingProxyType({
        "Free": 15000,
        "Standard": 200000,
        "Professional": 500000,
        "Enterprise": 1000000,
    })

    _CONCURRENCY_API_LIMITS = MappingProxyType({
        "Free": 5,
        "Standard": 10,
        "Professional": 15,
        "Enterprise": 25,
    })

    def __init__(self, config: Mapping[str, Any]):
        self.config = config
        self._authenticator = None
        self._api_call_count = 0
        self._api_call_lock = threading.Lock()  
        self._concurrent_requests = 0  
        self._concurrent_requests_lock = threading.Lock()

    @property
    def authenticator(self) -> ZohoOauth2Authenticator:
        if not self._authenticator:
            authenticator = ZohoOauth2Authenticator(
                token_refresh_endpoint=f"{self._access_url}/oauth/v2/token",
                client_id=self.config["client_id"],
                client_secret=self.config["client_secret"],
                refresh_token=self.config["refresh_token"],
                org_id=self.config["org_id"] 

            )
            self._authenticator = authenticator
        logging.debug(f"self._authentication {self._authenticator}")
        return self._authenticator

    @property
    def _access_url(self) -> str:
        return self._DC_REGION_TO_ACCESS_URL[self.config["dc_region"].upper()]

    

    @property
    def api_url(self) -> str:
        schema, domain, *_ = urlsplit(self._DC_REGION_TO_API_URL[self.config["dc_region"].upper()])
        return urlunsplit((schema, domain, *_))
    
    @property
    def max_api_calls(self) -> int:
        """Return the maximum allowed API calls based on the edition."""
        return self._API_LIMITS[self.config["edition"]]

    @property
    def max_concurrent_requests(self) -> int:
        """Return the maximum allowed concurrent requests based on the edition."""
        return self._CONCURRENCY_API_LIMITS[self.config["edition"]]

    def _increment_api_call_count(self):
        """Increment the API call count in a thread-safe manner."""
        with self._api_call_lock:
            if self._api_call_count >= self.max_api_calls:
                logger.warning(
                    "API call limit of %d reached for the %s edition. "
                    "Please upgrade your plan or retry after 24 hours.", 
                    self.max_api_calls, 
                    self.config["edition"]
                )
                raise Exception("API rate limit exceeded. Please upgrade your plan or retry after 24 hours.")
            self._api_call_count += 1
            logger.info(f"API call #{self._api_call_count} completed successfully.")

    def _manage_concurrent_requests(self, increment: bool):
        """Manage the number of concurrent requests."""
        with self._concurrent_requests_lock:
            if increment:
                if self._concurrent_requests >= self.max_concurrent_requests:
                    raise Exception("Concurrency limit exceeded.")
                self._concurrent_requests += 1
            else:
                self._concurrent_requests -= 1

    def _json_from_path(self, path: str, key: str, params: MutableMapping[str, str] = None) -> List[MutableMapping[Any, Any]]:
        """Handles the API request, tracking API and concurrency limits."""
        self._increment_api_call_count()  
        self._manage_concurrent_requests(increment=True)  
        try:
            response = requests.get(url=f"{self.api_url}{path}", headers=self.authenticator.get_auth_header(), params=params or {})
            if response.status_code == 204:
                logger.warning(f"{key.capitalize()} Metadata inaccessible: {response.content} [HTTP status {response.status_code}]")
                return []
            return response.json().get(key, [])
        finally:
            self._manage_concurrent_requests(increment=False)
    
    def module_settings(self, module_name: str, params: MutableMapping[str, str] = None) -> List[MutableMapping[Any, Any]]:
        return self._json_from_path(f"/api/v1/{module_name}", key="data", params=params)


    def modules_settings(self) -> List[MutableMapping[Any, Any]]:
        
        return self._json_from_path("/api/v1/modules", key="data")
    

    def fields_settings(self, module_name: str) -> List[MutableMapping[Any, Any]]:
        return self._json_from_path("/api/v1/organizationFields", key="data", params={"module": module_name})

    def check_connection(self) -> Tuple[bool, Any]:
        path = "/api/v1/settings"
        response = requests.get(url=f"{self.api_url}{path}", headers=self.authenticator.get_auth_header())
        if response.status_code == 401:
            return False, response.content
        response.raise_for_status()
        return True, None

 

