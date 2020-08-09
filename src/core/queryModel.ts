import * as an from "./annotationsModel";

export interface GetQuery {
  type?: Array<an.AnnotationType>;
  creator?: string;
  "target-id"?: string;
  "target-source"?: string;
  value?: string;
  format?: an.Format;
  download?: boolean;
  skip?: number;
  limit?: number;
}

export interface TargetsQuery {
  tag: string;
}

export type SearchQuery = string;
