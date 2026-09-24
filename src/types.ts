export type Listing = {
  id: string;
  name: string;
  /** JKK 検索フォーム「住宅名(カナ)」用（実行時に付与） */
  searchKana?: string;
  ward: string;
  layout: string;
  areaSqm: number;
  rentYen: string;
  commonFeeYen: string;
  boshuNo: string;
  mskKbn: string;
  jyutakuCd: string;
  yusenKbn: string;
};

export type MonitorState = {
  version: 1;
  updatedAt: string;
  listingIds: string[];
};
