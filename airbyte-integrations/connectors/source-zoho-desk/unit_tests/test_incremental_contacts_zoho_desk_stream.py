import pytest
from unittest.mock import MagicMock, patch
from source_zoho_desk.streams import IncrementalContactsZohoDeskStream

MOCK_CONFIG = {"key": "value"}

@pytest.fixture
def mock_zoho_api():
    with patch('source_zoho_desk.streams.ZohoAPI') as MockZohoAPI:
        yield MockZohoAPI

@pytest.fixture
def stream(mock_zoho_api):
    mock_zoho_api_instance = mock_zoho_api.return_value
    mock_zoho_api_instance.module_settings.return_value = {}
    return IncrementalContactsZohoDeskStream(config=MOCK_CONFIG)

def test_next_page_token(stream):
    response = MagicMock()
    response.json.return_value = {'next_page_token': 'token'}
    token = stream.next_page_token(response)
    assert token == 'token'

def test_request_params(stream):
    params = stream.request_params(stream_state={})
    assert params == {"module": "Contacts"}

def test_parse_response(stream):
    response = MagicMock()
    response.json.return_value = {"data": [{"id": "1", "Modified_Time": "2024-01-01T00:00:00Z"}]}
    parsed_data = list(stream.parse_response(response))
    assert parsed_data == [{"id": "1", "Modified_Time": "2024-01-01T00:00:00Z"}]

def test_read_records(stream):
    response = MagicMock()
    response.json.return_value = {"data": [{"id": "1", "Modified_Time": "2024-01-01T00:00:00Z"}]}
    with patch.object(stream, '_send_request', return_value=response):
        records = list(stream.read_records())
        assert records == [{"id": "1", "Modified_Time": "2024-01-01T00:00:00Z"}]
