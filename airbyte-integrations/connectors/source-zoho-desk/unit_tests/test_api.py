import pytest
from unittest.mock import patch, MagicMock
from source_zoho_desk.api import ZohoAPI

MOCK_CONFIG = {
    "client_id": "test_client_id",
    "client_secret": "test_client_secret",
    "refresh_token": "test_refresh_token",
    "dc_region": "US",
    "edition": "Free",
    "environment": "production"
}

@pytest.fixture
def api():
    return ZohoAPI(config=MOCK_CONFIG)

@patch('source_zoho_desk.api.ZohoOauth2Authenticator')
def test_authenticator(mock_authenticator_class, api):
    mock_authenticator = MagicMock()
    mock_authenticator_class.return_value = mock_authenticator
    authenticator = api.authenticator
    assert authenticator == mock_authenticator

@patch('source_zoho_desk.api.requests.get')
@patch('source_zoho_desk.api.ZohoAPI.authenticator', autospec=True)
def test_api_url(mock_authenticator, mock_get, api):
    mock_authenticator.get_auth_header.return_value = {}
    api_url = api.api_url
    expected_url_start = "https://desk.zoho.com"
    assert api_url.startswith(expected_url_start)

@patch('source_zoho_desk.api.requests.get')
@patch('source_zoho_desk.api.ZohoAPI.authenticator', autospec=True)
def test_json_from_path(mock_authenticator, mock_get, api):
    mock_authenticator.get_auth_header.return_value = {}
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"data": [{"id": "1"}]}
    mock_get.return_value = mock_response

    result = api._json_from_path("/api/v1/test", key="data")
    assert result == [{"id": "1"}]

    mock_response.status_code = 204
    result = api._json_from_path("/api/v1/test", key="data")
    assert result == []

    mock_response.status_code = 403
    result = api._json_from_path("/api/v1/test", key="data")
    assert result == {""}

@patch('source_zoho_desk.api.requests.get')
@patch('source_zoho_desk.api.ZohoAPI.authenticator', autospec=True)
def test_module_settings(mock_authenticator, mock_get, api):
    mock_authenticator.get_auth_header.return_value = {}
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"data": [{"id": "1"}]}
    mock_get.return_value = mock_response

    result = api.module_settings("test_module")
    assert result == [{"id": "1"}]

@patch('source_zoho_desk.api.requests.get')
@patch('source_zoho_desk.api.ZohoAPI.authenticator', autospec=True)
def test_modules_settings(mock_authenticator, mock_get, api):
    mock_authenticator.get_auth_header.return_value = {}
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"data": [{"id": "1"}]}
    mock_get.return_value = mock_response

    result = api.modules_settings()
    assert result == [{"id": "1"}]

@patch('source_zoho_desk.api.requests.get')
@patch('source_zoho_desk.api.ZohoAPI.authenticator', autospec=True)
def test_fields_settings(mock_authenticator, mock_get, api):
    mock_authenticator.get_auth_header.return_value = {}
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"data": [{"apiName": "field1", "json_type": "string"}]}
    mock_get.return_value = mock_response

    result = api.fields_settings("test_module")
    assert result == [{"apiName": "field1", "json_type": "string"}]

@patch('source_zoho_desk.api.requests.get')
@patch('source_zoho_desk.api.ZohoAPI.authenticator', autospec=True)
def test_check_connection(mock_authenticator, mock_get, api):
    mock_authenticator.get_auth_header.return_value = {}
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.content = b""
    mock_get.return_value = mock_response

    result = api.check_connection()
    assert result == (True, None)

    mock_response.status_code = 401
    mock_response.content = b"Unauthorized"
    mock_get.return_value = mock_response

    result = api.check_connection()
    assert result == (False, b"Unauthorized")
