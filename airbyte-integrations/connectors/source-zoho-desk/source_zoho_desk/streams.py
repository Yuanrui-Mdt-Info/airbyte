#
# Copyright (c) 2022 Airbyte, Inc., all rights reserved.
#

import concurrent.futures
import datetime
import math
from abc import ABC
from dataclasses import asdict
from http import HTTPStatus
from typing import Any, Dict, Iterable, List, Mapping, MutableMapping, Optional

import requests
from airbyte_cdk.sources.streams.http import HttpStream

from api import ZohoAPI
from exceptions import IncompleteMetaDataException, UnknownDataTypeException
from types_zoho import FieldMeta, ModuleMeta, ZohoPickListItem

# 204 and 304 status codes are valid successful responses,
# but `.json()` will fail because the response body is empty
EMPTY_BODY_STATUSES = (HTTPStatus.NO_CONTENT, HTTPStatus.NOT_MODIFIED)


class ZohoDeskStream(HttpStream, ABC):
    primary_key: str = "id"
    module: ModuleMeta = None

    def next_page_token(self, response: requests.Response) -> Optional[Mapping[str, Any]]:
        if response.status_code in EMPTY_BODY_STATUSES:
            return None
        pagination = response.json()["info"]
        if not pagination["more_records"]:
            return None
        return {"page": pagination["page"] + 1}

    def request_params(
        self, stream_state: Mapping[str, Any], stream_slice: Mapping[str, any] = None, next_page_token: Mapping[str, Any] = None
    ) -> MutableMapping[str, Any]:
        return next_page_token or {}

    def parse_response(self, response: requests.Response, **kwargs) -> Iterable[Mapping]:
        data = [] if response.status_code in EMPTY_BODY_STATUSES else response.json()["data"]
        yield from data

    def path(self, *args, **kwargs) -> str:
        return f"/api/v1/{self.module.api_name}"

    def get_json_schema(self) -> Optional[Dict[Any, Any]]:
        try:
            return asdict(self.module.schema)
           

        except IncompleteMetaDataException:
            # to build a schema for a stream, a sequence of requests is made:
            # one `/settings/modules` which introduces a list of modules,
            # one `/settings/modules/{module_name}` per module and
            # one `/settings/fields?module={module_name}` per module.
            # Any of dataclass two can result in 204 and empty body what blocks us
            # from generating stream schema and, therefore, a stream.
            self.logger.warning(
                f"Could not retrieve fields Metadata for module {self.module.api_name}. " f"This stream will not be available for syncs."
            )
            return None
        except UnknownDataTypeException as exc:
            self.logger.warning(f"Unknown data type in module {self.module.api_name}, skipping. Details: {exc}")
            raise
    
    # def get_json_schema(self) -> Dict[str, Any]:
    #     properties = {field.api_name: field.get_json_schema() for field in self.fields}
    #     required_fields = [field.api_name for field in self.fields if field.system_mandatory]

    #     schema = {
    #         "title": self.module_name,
    #         "type": "object",
    #         "properties": properties,
    #         "required": required_fields,
    #     }
    #     return schema

    # def get_json_schema(self) -> Optional[Dict[Any, Any]]:
    #     try:
    #         if not self.module or not self.module.fields:
    #             raise IncompleteMetaDataException("Not enough data")

    #         properties = {field.api_name: field.get_json_schema() for field in self.module.fields}
    #         required_fields = [field.api_name for field in self.module.fields if field.system_mandatory]

    #         schema = {
    #             "title": self.module.module_name,
    #             "type": "object",
    #             "properties": properties,
    #             "required": required_fields,
    #         }
    #         return schema

    #     except IncompleteMetaDataException:
    #         self.logger.warning(
    #             f"Could not retrieve fields Metadata for module {self.module.api_name}. " f"This stream will not be available for syncs."
    #         )
    #         return None
    #     except UnknownDataTypeException as exc:
    #         self.logger.warning(f"Unknown data type in module {self.module.api_name}, skipping. Details: {exc}")
    #         raise
    
    # @property
    # def schema(self) -> Dict[str, Any]:
    #     return self.get_json_schema()


class IncrementalZohoDeskStream(ZohoDeskStream):
    cursor_field = "Modified_Time"

    def __init__(self, authenticator: "requests.auth.AuthBase" = None, config: Mapping[str, Any] = None):
        super().__init__(authenticator)
        self._config = config
        self._state = {}
        self._start_datetime = self._config.get("start_datetime") or "1970-01-01T00:00:00+00:00"
        

    @property
    def state(self) -> Mapping[str, Any]:
        if not self._state:
            self._state = {self.cursor_field: self._start_datetime}
        return self._state

    @state.setter
    def state(self, value: Mapping[str, Any]):
        self._state = value

    def read_records(self, *args, **kwargs) -> Iterable[Mapping[str, Any]]:
        for record in super().read_records(*args, **kwargs):
            current_cursor_value = datetime.datetime.fromisoformat(self.state[self.cursor_field])
            latest_cursor_value = datetime.datetime.fromisoformat(record[self.cursor_field])
            new_cursor_value = max(latest_cursor_value, current_cursor_value)
            self.state = {self.cursor_field: new_cursor_value.isoformat("T", "seconds")}
            yield record

    def request_headers(
        self, stream_state: Mapping[str, Any], stream_slice: Mapping[str, Any] = None, next_page_token: Mapping[str, Any] = None
    ) -> Mapping[str, Any]:
        last_modified = stream_state.get(self.cursor_field, self._start_datetime)
        # since API filters inclusively, we add 1 sec to prevent duplicate reads
        last_modified_dt = datetime.datetime.fromisoformat(last_modified)
        last_modified_dt += datetime.timedelta(seconds=1)
        last_modified = last_modified_dt.isoformat("T", "seconds")
        return {"If-Modified-Since": last_modified}


class ZohoStreamFactory:
    def __init__(self, config: Mapping[str, Any]):
        self.api = ZohoAPI(config)
        self._config = config


    def _init_modules_meta(self) -> List[ModuleMeta]:
        modules_meta_json = self.api.modules_settings()
        modules = [ModuleMeta.from_dict(module) for module in modules_meta_json]
        return list(filter(lambda module: module, modules))
    
    
    # def _init_modules_meta(self) -> List[ModuleMeta]:
    #     modules_meta_json = self.api.modules_settings()
    #     modules = [ModuleMeta.from_dict(module) for module in modules_meta_json]

    #     for module in modules:
    #         self._populate_fields_meta(module)

    #     return list(filter(lambda module: module.api_supported, modules))
    
    # def _populate_fields_meta(self, module: ModuleMeta):
    #     fields_meta_json = self.api.fields_settings(module.api_name)
    #     fields_meta = []
    #     for field in fields_meta_json:
    #         pick_list_values = field.get("pick_list_values", [])
    #         field["pick_list_values"] = [ZohoPickListItem.from_dict(pick_list_item) for pick_list_item in pick_list_values]
    #         field_meta = FieldMeta(
    #             json_type=field.get("json_type"),
    #             length=field.get("length"),
    #             api_name=field.get("api_name"),
    #             data_type=field.get("data_type"),
    #             decimal_place=field.get("decimal_place"),
    #             system_mandatory=field.get("system_mandatory"),
    #             display_label=field.get("display_label"),
    #             pick_list_values=field.get("pick_list_values"),
    #         )
    #         fields_meta.append(field_meta)
    #     module.fields = fields_meta

    def _populate_fields_meta(self, module: ModuleMeta):
        fields_meta_json = self.api.fields_settings(module.api_name)
        fields_meta = []
        for field in fields_meta_json:
            pick_list_values = field.get("pick_list_values", [])
            if pick_list_values:
                field["pick_list_values"] = [ZohoPickListItem.from_dict(pick_list_item) for pick_list_item in field["pick_list_values"]]
            fields_meta.append(FieldMeta.from_dict(field))
        module.fields = fields_meta

    
    # def _populate_module_meta(self, module: ModuleMeta):
    #     module_meta_json = self.api.module_settings(module.api_name)
    #     if module_meta_json:
    #         module_data = next(iter(module_meta_json), {})
    #         module.update_from_dict(module_data)
    #     else:
    #         print(f"No module meta data found for API name: {module.api_name}")

    # def _populate_module_meta(self, module: ModuleMeta):
    #     module_meta_json = self.api.module_settings(module.api_name)
        
    #     if module_meta_json:
    #         module_data = next(iter(module_meta_json), {})
            
    #         # Map the received data to the correct structure
    #         mapped_data = {
    #             'api_name': module_data.get('apiName', module.api_name),  # Use the existing api_name if 'apiName' is not present
    #             'module_name': module_data.get('name', ''),  # Use 'name' as module_name
    #             'api_supported': True,  # Assuming api_supported is always True
    #             'fields': []  # Initialize fields as an empty list
    #         }
            
    #         # Update the module object with the mapped data
    #         module.update_from_dict(mapped_data)
    #     else:
    #         print(f"No module meta data found for API name: {module.api_name}")

    def _populate_module_meta(self, module: ModuleMeta):
        module_meta_json = self.api.module_settings(module.api_name)
        module.update_from_dict(next(iter(module_meta_json), None))

    # def _populate_module_meta(self, module: ModuleMeta):
    #     module_meta_json = self.api.module_settings(module.apiName)
    #     import pdb; pdb.set_trace()
    #     # Check the type and structure of module_meta_json
    #     if isinstance(module_meta_json, dict):
    #         module.update_from_dict(module_meta_json)
    #     elif isinstance(module_meta_json, list) and module_meta_json:
    #         module.update_from_dict(module_meta_json[0])
    #     else:
    #         raise ValueError("Unexpected format for module_meta_json")

    # def produce(self) -> List[HttpStream]:
    #     modules = self._init_modules_meta()
    #     streams = []  
    #     def populate_module(module):
    #         self._populate_module_meta(module)
    #         self._populate_fields_meta(module)

    #     def chunk(max_len, lst):
    #         for i in range(math.ceil(len(lst) / max_len)):
    #             yield lst[i * max_len : (i + 1) * max_len]

    #     # for module in modules:
    #     #     populate_module(module)
    #     max_concurrent_request = self.api.max_concurrent_requests
    #     with concurrent.futures.ThreadPoolExecutor(max_workers=max_concurrent_request) as executor:
    #         for batch in chunk(max_concurrent_request, modules):
    #             executor.map(lambda module: populate_module(module), batch)
    #     bases = (IncrementalZohoDeskStream,)
    #     for module in modules:
    #         # xl = self._populate_fields_meta(module=module)
    #         # xy = self._populate_module_meta(module=module)
    #         # populate_module(module=module)
    #         stream_cls_attrs = {"url_base": self.api.api_url, "module": module}
    #         stream_cls_name = f"Incremental{module.api_name}ZohoDeskStream"
    #         incremental_stream_cls = type(stream_cls_name, bases, stream_cls_attrs)
    #         stream = incremental_stream_cls(self.api.authenticator, config=self._config)
    #         if stream.get_json_schema():
    #             streams.append(stream)
    #     return streams

    def produce(self, module_api_name: Optional[str] = None) -> List[HttpStream]:
        modules = self._init_modules_meta()
        streams = []
        def populate_module(module):
            self._populate_module_meta(module)
            self._populate_fields_meta(module)

        def chunk(max_len, lst):
            for i in range(math.ceil(len(lst) / max_len)):
                yield lst[i * max_len : (i + 1) * max_len]

        # if module_api_name is not None:
        #     desired_module = next((module for module in modules if module.api_name == module_api_name), None)
        #     if desired_module is not None:
        #         populate_module(desired_module)
        #         bases = (IncrementalZohoDeskStream,)
        #         stream_cls_attrs = {"url_base": self.api.api_url, "module": desired_module}
        #         stream_cls_name = f"Incremental{desired_module.api_name}ZohoDeskStream"
        #         incremental_stream_cls = type(stream_cls_name, bases, stream_cls_attrs)
        #         stream = incremental_stream_cls(self.api.authenticator, config=self._config)
        #         if stream.get_json_schema(desired_module):
        #             streams.append(stream)
        #         return streams

        # for module in modules:
        #     populate_module(module)
        max_concurrent_request = self.api.max_concurrent_requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_concurrent_request) as executor:
            for batch in chunk(max_concurrent_request, modules):
                executor.map(lambda module: populate_module(module), batch)
        bases = (IncrementalZohoDeskStream,)
        for module in modules:
            # xl = self._populate_fields_meta(module=module)
            # xy = self._populate_module_meta(module=module)
            # populate_module(module=module)
            stream_cls_attrs = {"url_base": self.api.api_url, "module": module}
            stream_cls_name = f"Incremental{module.api_name}ZohoDeskStream"
            incremental_stream_cls = type(stream_cls_name, bases, stream_cls_attrs)
            stream = incremental_stream_cls(self.api.authenticator, config=self._config)
            if stream.get_json_schema():
                streams.append(stream)
        return streams

config = ""
aa= ZohoStreamFactory(config=config)
# print(aa._init_modules_meta())
# bb = aa._init_modules_meta()
# print(bb)
# print(aa._populate_module_meta(bb[0]))
# print(aa._populate_fields_meta(bb[0]))
aa.produce()