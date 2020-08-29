import * as formats from "./formats";

export interface GetNpQuery {
  creator?: string;
  format?: formats.FormatType;
  download?: boolean;
}
