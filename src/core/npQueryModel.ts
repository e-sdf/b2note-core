import * as formats from "./formats";

export interface GetNpQuery {
  creator?: string;
  value?: string;
  format?: formats.FormatType;
  download?: boolean;
}
