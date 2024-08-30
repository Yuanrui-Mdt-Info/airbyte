import pytest
import requests
from unittest.mock import patch, MagicMock
from source_zoho_desk.auth import ZohoOauth2Authenticator

MOCK_REFRESH_TOKEN = "test_refresh_token"
MOCK_CLIENT_ID = "test_client_id"
MOCK_CLIENT_SECRET = "test_client_secret"
MOCK_ACCESS_TOKEN = "test_access_token"
MOCK_EXPIRES_IN = 3600
MOCK_TOKEN_REFRESH_ENDPOINT = "https://accounts.zoho.com/oauth/v2/token"

@pytest.fixture
def authenticator():
    return ZohoOauth2Authenticator(
        token_refresh_endpoint=MOCK_TOKEN_REFRESH_ENDPOINT,
        client_id=MOCK_CLIENT_ID,
        client_secret=MOCK_CLIENT_SECRET,
        refresh_token=MOCK_REFRESH_TOKEN
    )

@patch('source_zoho_desk.auth.requests.request')
def test_refresh_access_token(mock_request, authenticator):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "access_token": MOCK_ACCESS_TOKEN,
        "expires_in": MOCK_EXPIRES_IN
    }
    mock_request.return_value = mock_response

    access_token, expires_in = authenticator.refresh_access_token()

    assert access_token == MOCK_ACCESS_TOKEN
    assert expires_in == MOCK_EXPIRES_IN
    mock_request.assert_called_once_with(
        method="POST",
        url=MOCK_TOKEN_REFRESH_ENDPOINT,
        params={
            "refresh_token": MOCK_REFRESH_TOKEN,
            "client_id": MOCK_CLIENT_ID,
            "client_secret": MOCK_CLIENT_SECRET,
            "grant_type": "refresh_token"
        }
    )

@patch('source_zoho_desk.auth.requests.request')
def test_refresh_access_token_error(mock_request, authenticator):
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError("400 Client Error")
    mock_request.return_value = mock_response

    with pytest.raises(Exception, match="Error while refreshing access token: 400 Client Error"):
        authenticator.refresh_access_token()

@patch('source_zoho_desk.auth.ZohoOauth2Authenticator.get_access_token')
def test_get_auth_header(mock_get_access_token, authenticator):
    mock_get_access_token.return_value = MOCK_ACCESS_TOKEN
    
    auth_header = authenticator.get_auth_header()
    
    assert auth_header == {"Authorization": f"Zoho-oauthtoken {MOCK_ACCESS_TOKEN}"}
    mock_get_access_token.assert_called_once()
