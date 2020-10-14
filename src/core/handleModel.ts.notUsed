export interface HandleData {
  format: string;
  value: string|Record<string, any>;
}

export interface HandleValues {
  index: number;
  type: string;
  data: HandleData;
  ttl: number;
  timestamp: string;
}

export interface HandleResp {
  responseCode: number;
  handle: string;
  values: Array<HandleValues>;
}