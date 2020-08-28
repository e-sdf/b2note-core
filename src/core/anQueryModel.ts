import * as an from "./annotationsModel";
import * as formats from "./formats";

export interface GetQuery {
  type?: Array<an.AnnotationType>;
  creator?: string;
  "target-id"?: string;
  "target-source"?: string;
  value?: string;
  format?: formats.FormatType;
  download?: boolean;
  skip?: number;
  limit?: number;
}

export interface TargetsQuery {
  tag: string;
}

export type SearchQuery = string;
