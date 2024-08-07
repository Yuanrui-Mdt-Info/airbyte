

# from dataclasses import dataclass
# from typing import Any, List, Optional

# @dataclass
# class ModuleMeta:
#     api_name: str
#     module_name: str
#     api_supported: bool
#     fields: List['FieldMeta']

#     @classmethod
#     def from_dict(cls, data: dict) -> 'ModuleMeta':
#         return cls(
#             api_name=data['apiName'],
#             module_name=data.get('apiName', ''),
#             api_supported=data.get('apiSupported', True),
#             fields=[],
#         )

#     def update_from_dict(self, data: dict) -> None:
#         self.api_name = data.get('apiName', self.api_name)
#         self.module_name = data.get('name', self.module_name)
#         self.api_supported = data.get('apiSupported', self.api_supported)

# @dataclass
# class FieldMeta:
#     json_type: str
#     length: int
#     api_name: str
#     data_type: str
#     decimal_place: int
#     system_mandatory: bool
#     display_label: str
#     pick_list_values: Optional[List['ZohoPickListItem']]

#     @classmethod
#     def from_dict(cls, data: dict) -> 'FieldMeta':
#         return cls(
#             json_type=data.get('jsonType'),
#             length=data.get('length'),
#             api_name=data.get('apiName'),
#             data_type=data.get('dataType'),
#             decimal_place=data.get('decimalPlace'),
#             system_mandatory=data.get('systemMandatory'),
#             display_label=data.get('displayLabel'),
#             pick_list_values=data.get('pickListValues', []),
#         )

# @dataclass
# class ZohoPickListItem:
#     value: str

#     @classmethod
#     def from_dict(cls, data: dict) -> 'ZohoPickListItem':
#         return cls(
#             value=data['value'],
#         )

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

@dataclass
class ModuleMeta:
    api_name: str
    module_name: str
    api_supported: bool
    fields: List['FieldMeta'] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> 'ModuleMeta':
        return cls(
            api_name=data['apiName'],
            module_name=data.get('displayLabel', ''),
            api_supported=True,  # Assuming all modules are API supported
            fields=[],
        )

    # def update_from_dict(self, data: dict) -> None:
    #     self.api_name = data.get('apiName', self.api_name)
    #     self.module_name = data.get('displayLabel', self.module_name)
    #     self.api_supported = data.get('apiSupported', self.api_supported)
    #     self.fields = [FieldMeta.from_dict(field) for field in data.get('fields', [])]

    def update_from_dict(self, data: dict) -> None:
        self.api_name = data.get('apiName', self.api_name)
        self.module_name = data.get('displayLabel', self.module_name)
        self.api_supported = data.get('apiSupported', self.api_supported)
        self.fields = [FieldMeta.from_dict(field) for field in data.get('fields', [])]
    
    # @classmethod
    # def from_dict(cls, data):
    #     for key, val in self._filter_by_names(dct).items():
    #         setattr(self, key, val)

    def get_json_schema(self) -> Dict[str, Any]:
        properties = {field.api_name: field.get_json_schema() for field in self.fields}
        required_fields = [field.api_name for field in self.fields if field.system_mandatory]

        schema = {
            "title": self.module_name,
            "type": "object",
            "properties": properties,
            "required": required_fields,
        }
        return schema

@dataclass
class FieldMeta:
    json_type: str
    length: int
    api_name: str
    data_type: str
    decimal_place: int
    system_mandatory: bool
    display_label: str
    pick_list_values: Optional[List['ZohoPickListItem']]

    @classmethod
    def from_dict(cls, data: dict) -> 'FieldMeta':
        return cls(
            json_type=data.get('jsonType'),
            length=data.get('length'),
            api_name=data.get('apiName'),
            data_type=data.get('dataType'),
            decimal_place=data.get('decimalPlace'),
            system_mandatory=data.get('systemMandatory'),
            display_label=data.get('displayLabel'),
            pick_list_values=data.get('pickListValues', []),
        )

    def get_json_schema(self) -> Dict[str, Any]:
        schema = {
            "type": self.json_type,
            "title": self.display_label,
        }

        if self.data_type == 'PickList':
            schema['enum'] = [pick_list_item.value for pick_list_item in self.pick_list_values]

        return schema

@dataclass
class ZohoPickListItem:
    value: str

    @classmethod
    def from_dict(cls, data: dict) -> 'ZohoPickListItem':
        return cls(
            value=data['value'],
        )


