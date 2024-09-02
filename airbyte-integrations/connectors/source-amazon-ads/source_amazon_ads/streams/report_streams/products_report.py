#
# Copyright (c) 2022 Airbyte, Inc., all rights reserved.
#


from copy import copy

from .report_streams import ReportStreamV3
import datetime
from dateutil.relativedelta import relativedelta
import pendulum

REPORTTYPE_ID_MAP = {
    "campaign": "spCampaigns",
    "targeting": "spTargeting",
    "searchTerm": "spSearchTerm",
    "advertiser": "spAdvertisedProduct"
}
METRICS_MAP = {
    "campaign": [
        "impressions", "clicks", "cost", "purchases1d",
        "purchases7d", "purchases14d", "purchases30d", "purchasesSameSku1d",
        "purchasesSameSku7d", "purchasesSameSku14d", "purchasesSameSku30d",
        "unitsSoldClicks1d", "unitsSoldClicks7d", "unitsSoldClicks14d",
        "unitsSoldClicks30d", "sales1d", "sales7d", "sales14d", "sales30d",
        "attributedSalesSameSku1d", "attributedSalesSameSku7d", "attributedSalesSameSku14d",
        "attributedSalesSameSku30d", "unitsSoldSameSku1d", "unitsSoldSameSku7d", "unitsSoldSameSku14d",
        "unitsSoldSameSku30d", "kindleEditionNormalizedPagesRead14d", "kindleEditionNormalizedPagesRoyalties14d", "campaignBiddingStrategy", "costPerClick", "clickThroughRate", "spend",
        "campaignName", "campaignId", "campaignStatus", "campaignBudgetAmount", "campaignBudgetType",
        "campaignRuleBasedBudgetAmount", "campaignApplicableBudgetRuleId", "campaignApplicableBudgetRuleName",
        "campaignBudgetCurrencyCode","date"
        ],
    "targeting": ["impressions",
                  "clicks",
                  "costPerClick",
                  "clickThroughRate",
                  "cost",
                  "purchases1d",
                  "purchases7d",
                  "purchases14d",
                  "purchases30d",
                  "purchasesSameSku1d",
                  "purchasesSameSku7d",
                  "purchasesSameSku14d",
                  "purchasesSameSku30d",
                  "unitsSoldClicks1d",
                  "unitsSoldClicks7d",
                  "unitsSoldClicks14d",
                  "unitsSoldClicks30d",
                  "sales1d",
                  "sales7d",
                  "sales14d",
                  "sales30d",
                  "attributedSalesSameSku1d",
                  "attributedSalesSameSku7d",
                  "attributedSalesSameSku14d",
                  "attributedSalesSameSku30d",
                  "unitsSoldSameSku1d",
                  "unitsSoldSameSku7d",
                  "unitsSoldSameSku14d",
                  "unitsSoldSameSku30d",
                  "kindleEditionNormalizedPagesRead14d",
                  "kindleEditionNormalizedPagesRoyalties14d",
                  "salesOtherSku7d",
                  "unitsSoldOtherSku7d",
                  "acosClicks7d",
                  "acosClicks14d",
                  "roasClicks7d",
                  "roasClicks14d",
                  "keywordId",
                  "keyword",
                  "campaignBudgetCurrencyCode",
                  "date",
                  "portfolioId",
                  "campaignName",
                  "campaignId",
                  "campaignBudgetType",
                  "campaignBudgetAmount",
                  "campaignStatus",
                  "keywordBid",
                  "adGroupName",
                  "adGroupId",
                  "keywordType",
                  "matchType",
                  "targeting",
                  "adKeywordStatus"
        ],
    "searchTerm": ["impressions",
                  "clicks",
                  "costPerClick",
                  "clickThroughRate",
                  "cost",
                  "purchases1d",
                  "purchases7d",
                  "purchases14d",
                  "purchases30d",
                  "purchasesSameSku1d",
                  "purchasesSameSku7d",
                  "purchasesSameSku14d",
                  "purchasesSameSku30d",
                  "unitsSoldClicks1d",
                  "unitsSoldClicks7d",
                  "unitsSoldClicks14d",
                  "unitsSoldClicks30d",
                  "sales1d",
                  "sales7d",
                  "sales14d",
                  "sales30d",
                  "attributedSalesSameSku1d",
                  "attributedSalesSameSku7d",
                  "attributedSalesSameSku14d",
                  "attributedSalesSameSku30d",
                  "unitsSoldSameSku1d",
                  "unitsSoldSameSku7d",
                  "unitsSoldSameSku14d",
                  "unitsSoldSameSku30d",
                  "kindleEditionNormalizedPagesRead14d",
                  "kindleEditionNormalizedPagesRoyalties14d",
                  "salesOtherSku7d",
                  "unitsSoldOtherSku7d",
                  "acosClicks7d",
                  "acosClicks14d",
                  "roasClicks7d",
                  "roasClicks14d",
                  "keywordId",
                  "keyword",
                  "campaignBudgetCurrencyCode",
                  "date",
                  "portfolioId",
                  "campaignName",
                  "campaignId",
                  "campaignBudgetType",
                  "campaignBudgetAmount",
                  "campaignStatus",
                  "keywordBid",
                  "adGroupName",
                  "adGroupId",
                  "keywordType",
                  "matchType",
                  "targeting",
                  "adKeywordStatus"
        ],
    "advertiser": ["date",
                   "campaignName",
                   "campaignId",
                   "adGroupName",
                   "adGroupId",
                   "adId",
                   "portfolioId",
                   "impressions",
                   "clicks",
                   "costPerClick",
                   "clickThroughRate",
                   "cost",
                   "spend",
                   "campaignBudgetCurrencyCode",
                   "campaignBudgetAmount",
                   "campaignBudgetType",
                   "campaignStatus",
                   "advertisedAsin",
                   "advertisedSku",
                   "purchases1d",
                   "purchases7d",
                   "purchases14d",
                   "purchases30d",
                   "purchasesSameSku1d",
                   "purchasesSameSku7d",
                   "purchasesSameSku14d",
                   "purchasesSameSku30d",
                   "unitsSoldClicks1d",
                   "unitsSoldClicks7d",
                   "unitsSoldClicks14d",
                   "unitsSoldClicks30d",
                   "sales1d",
                   "sales7d",
                   "sales14d",
                   "sales30d",
                   "attributedSalesSameSku1d",
                   "attributedSalesSameSku7d",
                   "attributedSalesSameSku14d",
                   "attributedSalesSameSku30d",
                   "salesOtherSku7d",
                   "unitsSoldSameSku1d",
                   "unitsSoldSameSku7d",
                   "unitsSoldSameSku14d",
                   "unitsSoldSameSku30d",
                   "unitsSoldOtherSku7d",
                   "kindleEditionNormalizedPagesRead14d",
                   "kindleEditionNormalizedPagesRoyalties14d",
                   "acosClicks7d",
                   "acosClicks14d",
                   "roasClicks7d",
                   "roasClicks14d"
                   ]
}


class SponsoredProductsReportStream(ReportStreamV3):
    """
    https://advertising.amazon.com/API/docs/en-us/sponsored-products/2-0/openapi#/Reports
    """

    def report_init_endpoint(self, record_type: str) -> str:
        return f"/reporting/reports"

    metrics_map = METRICS_MAP
    reportType_id_map = REPORTTYPE_ID_MAP

    # 2023-7-18, change the start time to the day before yesterday, the end time to yesterday
    def _get_init_report_body(self, report_date: str, record_type: str, profile):
        metrics_list = self.metrics_map[record_type]
        today = pendulum.today(tz=profile.timezone).date()
        if self.attribute_window:
            start_date = today.subtract(days=self.attribute_window)
            end_date = start_date.add(days=1)
        else:
            start_date = pendulum.from_format(report_date, self.REPORT_DATE_FORMAT).date()       
            end_date = today.subtract(days=1)
            
            if end_date.diff(start_date).in_days() > self.REPORTING_PERIOD:
                start_date = end_date.subtract(days=1)
                
            if start_date >= today:
                start_date = end_date.subtract(days=1)
                
        start_time = start_date.strftime("%Y-%m-%d")
        end_time = end_date.strftime("%Y-%m-%d")
        body = {
            "name": f"ADS-{record_type}-{report_date}",
            "startDate": start_time,
            "endDate": end_time,
            "configuration": {
                "adProduct": "SPONSORED_PRODUCTS",
                "groupBy": [record_type],
                "columns": metrics_list,
                "reportTypeId": self.reportType_id_map[record_type],
                "timeUnit": "DAILY",
                "format": "GZIP_JSON"
            }
        }
        
        return {**body}
