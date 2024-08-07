import requests
import webbrowser
from urllib.parse import urlencode, urlunparse
class ZohoOauth2Authenticator1:
    def get_auth_url(self):
        base_url = "https://accounts.zoho.com/oauth/v2/auth"
        params = {
            "response_type":"code",
            "client_id":"1000.EEQ42OZH1XKY5QL0TYY6OHOW2ADTCF",
            # "scope":"Desk.tickets.READ,Desk.basic.READ Desk.settings.READ Desk.contacts.READ",
            "scope":"ZohoCRM.settings.ALL",
            "redirect_uri":"https://staging.daspire.com/auth_flow",
            "state":"12345",
            "access_type": "offline"


        }
        query_string = urlencode(params)
        full_url = f"{base_url}?{query_string}"
        webbrowser.open(full_url)
        return "done"

aa = ZohoOauth2Authenticator1()
aa.get_auth_url()