from airbyte_cdk.sources.streams.http.http import HttpStream
from typing import Mapping, Any, List, Optional, Iterable, MutableMapping, Union
import requests
from .api import ZohoAPI
from datetime import datetime

class ZohoStreamFactory:
    def __init__(self, config: Mapping[str, Any]):
        self.config = config

    def produce(self) -> List[HttpStream]:
        stream_classes = [
            IncrementalAccountsZohoDeskStream,
            IncrementalContactsZohoDeskStream,
            IncrementalTicketsZohoDeskStream,
            IncrementalAgentsZohoDeskStream
        ]
        return [stream_class(self.config) for stream_class in stream_classes]

class ZohoDeskStream(HttpStream):
    def __init__(self, config: Mapping[str, Any], stream_name: str):
        self.config = config
        self.stream_name = stream_name.lower()
        self.start_datetime = datetime.fromisoformat(config.get("start_datetime", "2000-01-01T00:00:00+00:00"))
        self.zoho_api = ZohoAPI(config)
        authenticator = self.zoho_api.authenticator
        super().__init__(authenticator=authenticator)

    @property
    def primary_key(self) -> Union[str, List[str]]:
        return "id" 
    
    def extract_fields(self, item: Mapping[str, Any]) -> Mapping[str, Any]:
        fields_meta = self.zoho_api.fields_settings(self.stream_name)
        
        extracted_fields = {}
        for field in fields_meta:
            field_name = field["api_name"]
            extracted_fields[field_name] = item.get(field_name)
        
        return extracted_fields
    
    def get_json_schema(self) -> dict:
        fields_meta = self.zoho_api.fields_settings(self.stream_name)
        
        properties = {}
        for field in fields_meta:
            field_name = field.get("apiName")
            json_type = field.get("json_type", "string")  
            properties[field_name] = {"type": json_type}
        
        return {"type": "object", "properties": properties}
class IncrementalAccountsZohoDeskStream(ZohoDeskStream):
    def __init__(self, config: Mapping[str, Any]):
        super().__init__(config, "accounts")
        self.schema = {"type": "object", "properties": {"id": {"type": "string"}, "Modified_Time": {"type": "string"}}}
        self._module_meta = None

    def next_page_token(self, response: requests.Response) -> Optional[Any]:
        next_page = response.json().get('next_page_token')
        return next_page

    def request_params(
        self, stream_state: Mapping[str, Any], stream_slice: Mapping[str, Any] = None, next_page_token: Mapping[str, Any] = None
    ) -> MutableMapping[str, Any]:
        return {"module": "Accounts"}

    def parse_response(self, response: requests.Response, **kwargs) -> Iterable[Mapping[str, Any]]:
        if isinstance(response, list):
            data = response
        else:
            data = response.json().get("data", [])

        for item in data:
            created_time_str = item.get("createdTime")
            if created_time_str:
                created_time = datetime.fromisoformat(created_time_str.replace("Z", "+00:00"))
                if created_time >= self.start_datetime:
                    yield item

    def read_records(self, stream_slice: Mapping[str, Any] = None, **kwargs) -> Iterable[Mapping[str, Any]]:
        response = self._send_request(self.request_params(stream_slice))
        yield from self.parse_response(response)

    def _send_request(self, params: MutableMapping[str, Any]) -> requests.Response:
        return self.zoho_api.module_settings("accounts")

    def path(self, stream_state: Mapping[str, Any], stream_slice: Mapping[str, Any] = None, next_page_token: Mapping[str, Any] = None) -> str:
        return f"/api/v1/accounts"

    @property
    def primary_key(self) -> str:
        return "id"


    def url_base(self) -> str:
        return self.zoho_api.api_url

class IncrementalContactsZohoDeskStream(ZohoDeskStream):
    def __init__(self, config: Mapping[str, Any]):
        super().__init__(config, stream_name="Contacts")
        self.schema = {"type": "object", "properties": {"id": {"type": "string"}, "Modified_Time": {"type": "string"}}}

    def next_page_token(self, response: requests.Response) -> Optional[Mapping[str, Any]]:
        next_page = response.json().get('next_page_token')
        return next_page

    def request_params(
        self, stream_state: Mapping[str, Any], stream_slice: Mapping[str, Any] = None, next_page_token: Mapping[str, Any] = None
    ) -> MutableMapping[str, Any]:
        return {"module": "Contacts"}

    def parse_response(self, response: requests.Response, **kwargs) -> Iterable[Mapping[str, Any]]:
        if isinstance(response, list):
            data = response
        else:
            data = response.json().get("data", [])

        for item in data:
            created_time_str = item.get("createdTime")
            if created_time_str:
                created_time = datetime.fromisoformat(created_time_str.replace("Z", "+00:00"))
                if created_time >= self.start_datetime:
                    yield item

    def read_records(self, stream_slice: Mapping[str, Any] = None, **kwargs) -> Iterable[Mapping[str, Any]]:
        response = self._send_request(self.request_params(stream_slice))
        yield from self.parse_response(response)

    def _send_request(self, params: MutableMapping[str, Any]) -> requests.Response:
        return self.zoho_api.module_settings("contacts")

    def path(self, stream_state: Mapping[str, Any], stream_slice: Mapping[str, Any] = None, next_page_token: Mapping[str, Any] = None) -> str:
        return f"/api/v1/contacts"

    @property
    def primary_key(self) -> str:
        return "id"

    def url_base(self) -> str:
        return self.zoho_api.api_url

class IncrementalTicketsZohoDeskStream(ZohoDeskStream):
    def __init__(self, config: Mapping[str, Any]):
        super().__init__(config, stream_name="tickets")
        self.schema = {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "Modified_Time": {"type": "string"}
            }
        }

    def next_page_token(self, response: requests.Response) -> Optional[Mapping[str, Any]]:
        next_page = response.json().get('next_page_token')
        return next_page

    def request_params(
        self, stream_state: Mapping[str, Any], stream_slice: Mapping[str, Any] = None, next_page_token: Mapping[str, Any] = None
    ) -> MutableMapping[str, Any]:
        return {"module": "Tickets"}

    def parse_response(self, response: requests.Response, **kwargs) -> Iterable[Mapping[str, Any]]:
        if isinstance(response, list):
            data = response
        else:
            data = response.json().get("data", [])

        for item in data:
            created_time_str = item.get("createdTime")
            if created_time_str:
                created_time = datetime.fromisoformat(created_time_str.replace("Z", "+00:00"))
                if created_time >= self.start_datetime:
                    yield item

    def read_records(self, stream_slice: Mapping[str, Any] = None, **kwargs) -> Iterable[Mapping[str, Any]]:
        response = self._send_request(self.request_params(stream_slice))
        yield from self.parse_response(response)

    def _send_request(self, params: MutableMapping[str, Any]) -> requests.Response:
        return self.zoho_api.module_settings("tickets")

    def path(self, stream_state: Mapping[str, Any], stream_slice: Mapping[str, Any] = None, next_page_token: Mapping[str, Any] = None) -> str:
        return f"/api/v1/tickets"

    @property
    def primary_key(self) -> str:
        return "id"


    def url_base(self) -> str:
        return self.zoho_api.api_url


class IncrementalAgentsZohoDeskStream(ZohoDeskStream):
    def __init__(self, config: Mapping[str, Any]):
        super().__init__(config, stream_name="Agents")
        self.schema = {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "Modified_Time": {"type": "string"}
            }
        }

    def next_page_token(self, response: requests.Response) -> Optional[Mapping[str, Any]]:
        next_page = response.json().get('next_page_token')
        return next_page

    def request_params(
        self, stream_state: Mapping[str, Any], stream_slice: Mapping[str, Any] = None, next_page_token: Mapping[str, Any] = None
    ) -> MutableMapping[str, Any]:
        params = {"module": "Agents"}
        if next_page_token:
            params['page'] = next_page_token
        return params

    def parse_response(self, response: requests.Response, **kwargs) -> Iterable[Mapping[str, Any]]:
        if isinstance(response, list):
            data = response
        else:
            data = response.json().get("data", [])

        for item in data:
            yield item

    def read_records(self, stream_slice: Mapping[str, Any] = None, **kwargs) -> Iterable[Mapping[str, Any]]:
        response = self._send_request(self.request_params(stream_slice))
        yield from self.parse_response(response)

    def _send_request(self, params: MutableMapping[str, Any]) -> requests.Response:
        return self.zoho_api.module_settings("agents")

    def path(self, stream_state: Mapping[str, Any], stream_slice: Mapping[str, Any] = None, next_page_token: Mapping[str, Any] = None) -> str:
        return f"/api/v1/agents"

    @property
    def primary_key(self) -> str:
        return "id"


    def url_base(self) -> str:
        return self.zoho_api.api_url