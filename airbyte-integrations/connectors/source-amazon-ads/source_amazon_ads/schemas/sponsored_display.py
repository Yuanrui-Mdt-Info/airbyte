#
# Copyright (c) 2022 Airbyte, Inc., all rights reserved.
#

from decimal import Decimal

from .common import CatalogModel, Targeting


class DisplayCampaign(CatalogModel):
    source_name: str
    campaignId: Decimal
    name: str
    budgetType: str
    budget: Decimal
    startDate: str
    endDate: str = None
    costType: str
    state: str
    portfolioId: str = None
    tactic: str
    deliveryProfile: str


class DisplayAdGroup(CatalogModel):
    source_name: str
    name: str
    campaignId: Decimal
    adGroupId: Decimal
    defaultBid: Decimal
    bidOptimization: str
    state: str
    tactic: str


class DisplayProductAds(CatalogModel):
    source_name: str
    state: str
    adId: Decimal
    campaignId: Decimal
    adGroupId: Decimal
    asin: str
    sku: str


class DisplayTargeting(Targeting):
    source_name: str
    pass
