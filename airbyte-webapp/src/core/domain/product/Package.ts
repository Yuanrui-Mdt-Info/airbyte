import { ProductItem } from "./Product";

export interface PackageItem {
  packageName: string;
  itemType: string;
  itemName: string;
  itemScope: string;
}

export interface ProcessedPackageMapItem {
  itemName: string;
  professional?: PackageItem;
  enterprise?: PackageItem;
}

export interface ProcessedProfessionalPackageMap {
  professionalFeatures: ProcessedPackageMapItem[];
  professionalDataReplication: ProcessedPackageMapItem[];
  professionalSupport: ProcessedPackageMapItem[];
}

export interface ProcessedEnterprisePackageMap {
  enterpriseFeatures: ProcessedPackageMapItem[];
  enterpriseDataReplication: ProcessedPackageMapItem[];
  enterpriseSupport: ProcessedPackageMapItem[];
}

export interface ProcessedPackageMap {
  features: ProcessedPackageMapItem[];
  dataReplication: ProcessedPackageMapItem[];
  support: ProcessedPackageMapItem[];
}

export interface PackageMap {
  Professional: PackageItem[];
  Enterprise: PackageItem[];
}

export interface PackagesInfo {
  userSubscriptionProductItemId: string | null;
  status: number;
  productItem: ProductItem[];
  packageMap: PackageMap;
}

export interface PackagesDetail {
  data: PackagesInfo;
}
