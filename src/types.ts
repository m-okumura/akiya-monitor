export type Listing = {
  id: string;
  name: string;
  ward: string;
  layout: string;
  areaSqm: number;
  rentYen: string;
  commonFeeYen: string;
  boshuNo: string;
  jyutakuCd: string;
  mskKbn: string;
};

export type MonitorState = {
  version: 1;
  updatedAt: string;
  listingIds: string[];
};
