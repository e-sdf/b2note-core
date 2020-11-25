import * as an from "../annotationsModel";
import * as formats from "../formats";

export interface GetAnQuery {
  type?: Array<an.AnBodyType>;
  creator?: string;
  "target-id"?: Array<string>;
  "target-source"?: Array<string>;
  value?: string;
  format?: formats.FormatType;
  download?: boolean;
  skip?: number;
  limit?: number;
}

export interface AnTargetsQuery {
  tag: string;
}

export type SearchQuery = string;
