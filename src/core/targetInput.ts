import { matchSwitch } from "@babakness/exhaustive-type-checking";
import type { TableRange, AnTarget } from "./annotationsModel";
import { AnBodyItemType, mkPdfSelector, mkXPathTextSelector, mkSvgSelector, mkTableSelector } from "./annotationsModel";

export enum TargetType {
  PAGE = "PageTarget",
  LINK = "LinkTarget",
  TEXT_SELECTION = "TextSelectionTarget",
  IMAGE_REGION = "ImageRegionTarget",
  IMAGE_REGION_ON_PAGE = "ImageRegionOnPageTarget",
  TABLE = "TableTarget",
  PDF = "PdfTarget"
}

interface PidInput {
  pid: string; // URI of the landing page
  pidName?: string;
}

interface SourceInput {
  source: string; // The resource URI
  sourceName?: string;
}

export interface PageTargetInput extends PidInput {
  type: TargetType.PAGE;
}

export interface LinkTargetInput extends PidInput, SourceInput {
  type: TargetType.LINK;
}

export interface TextSelectionTargetInput extends PidInput {
  type: TargetType.TEXT_SELECTION;
  xPath: string;
  startOffset: number;
  endOffset: number;
  selectedText: string;
}

export interface ImageRegionTargetInput extends PidInput {
  type: TargetType.IMAGE_REGION;
  svgSelector: string; // SVG specifying a region of image
}

export interface ImageRegionOnPageTargetInput extends PidInput, SourceInput {
  type: TargetType.IMAGE_REGION_ON_PAGE;
  svgSelector: string; // SVG specifying a region of image
}

export interface TableTargetInput extends PidInput {
  type: TargetType.TABLE;
  sheet: string;
  range?: TableRange;
}

export interface PdfTargetInput extends PidInput {
  type: TargetType.PDF;
  pageNumber: number;
  svgSelector?: string;
}

export type TargetInput = 
  PageTargetInput
| LinkTargetInput
| TextSelectionTargetInput
| ImageRegionTargetInput
| ImageRegionOnPageTargetInput
| TableTargetInput
| PdfTargetInput


function mkTypePart(): {type: AnBodyItemType } {
  return {
    type: AnBodyItemType.SPECIFIC_RESOURCE
  };
}

function mkPidPart(input: PidInput): { id: string, idName?: string } {
  return {
    id: input.pid, 
    ... input.pidName ? { idName: input.pidName } : {},
  };
}

function mkSourcePart(input: SourceInput): { source: string, sourceName?: string } {
  return {
    source: input.source,
    ... input.sourceName ? { sourceName: input.sourceName } : {},
  };
}

export function mkTarget(targetInput: TargetInput): AnTarget {
  const pageForm = targetInput as PageTargetInput;
  const linkForm = targetInput as LinkTargetInput;
  const tsForm = targetInput as TextSelectionTargetInput;
  const imgForm = targetInput as ImageRegionTargetInput;
  const tableForm = targetInput as TableTargetInput;
  const pdfForm = targetInput as PdfTargetInput;
  
  return matchSwitch(targetInput.type, {
    [TargetType.PAGE]: () => ({
      ...mkPidPart(pageForm),
      ...mkTypePart() 
    }),
    [TargetType.LINK]: () => ({
      ...mkPidPart(pageForm),
      ...mkSourcePart(linkForm),
      ...mkTypePart()
    }),
    [TargetType.TEXT_SELECTION]: () => ({
      ...mkPidPart(pageForm),
      selector: mkXPathTextSelector(tsForm.selectedText, tsForm.xPath, tsForm.startOffset, tsForm.endOffset),
      ...mkTypePart()
    }),
    [TargetType.IMAGE_REGION]: () => ({
      ...mkPidPart(pageForm),
      selector: mkSvgSelector(imgForm.svgSelector),
      ...mkTypePart()
    }),
    [TargetType.IMAGE_REGION_ON_PAGE]: () => ({
      ...mkPidPart(pageForm),
      ...mkSourcePart(linkForm),
      selector: mkSvgSelector(imgForm.svgSelector),
      ...mkTypePart()
    }),
    [TargetType.TABLE]: () => ({
      ...mkPidPart(pageForm),
      selector: mkTableSelector(tableForm.sheet, tableForm.range),
      ...mkTypePart()
    }),
    [TargetType.PDF]: () => ({
      ...mkPidPart(pageForm),
      ...mkPdfSelector(pdfForm.pageNumber, pdfForm.svgSelector ? mkSvgSelector(pdfForm.svgSelector) : undefined),
      ...mkTypePart()
    })
  });
}