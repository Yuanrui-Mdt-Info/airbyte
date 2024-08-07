#
# Copyright (c) 2022 Airbyte, Inc., all rights reserved.
#


import sys

from airbyte_cdk.entrypoint import launch
# from .source_zoho_desk import SourceZohoDesk
from source_zoho_desk import SourceZohoDesk

if __name__ == "__main__":
    source = SourceZohoDesk()
    launch(source, sys.argv[1:])
 