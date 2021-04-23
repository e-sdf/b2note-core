// Annotations model according to <https://www.w3.org/TR/annotation-model>

import _ from "lodash";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as utils from "./utils";

// Annotation {{{1

export const annotationsUrl = "/annotations";
export const targetsUrl = "/targets";
export const resolveSourceUrl = "/resolve-source";

export type ID = string;
export type CreatorID = ID;
export type AnID = ID;

export type PID = string;
export type CreatorPID = PID;
export type AnPID = PID;

// Body Items {{{2

// eslint-disable-next-line no-shadow
export enum AnBodyItemType {
  COMPOSITE = "Composite",
  SPECIFIC_RESOURCE = "SpecificResource",
  TEXTUAL_BODY = "TextualBody"
}

// SpecificResource {{{3

export interface AnBodyItemSpecificResource {
  type: AnBodyItemType.SPECIFIC_RESOURCE;
  source: string;
}

export function mkAnBodyItemSpecificResource(source: string): AnBodyItemSpecificResource {
  return {
    type: AnBodyItemType.SPECIFIC_RESOURCE,
    source
  };
}

export function isAnBodyItemSpecificResource(item: AnBodyItem): boolean {
  return item.type === AnBodyItemType.SPECIFIC_RESOURCE;
}

// Textual {{{3

export interface AnBodyItemTextual {
  type: AnBodyItemType.TEXTUAL_BODY;
  value: string;
}

export function mkAnBodyItemTextual(value: string): AnBodyItemTextual {
  return {
    type: AnBodyItemType.TEXTUAL_BODY,
    value
  };
}

export function isAnBodyItemTextual(item: AnBodyItem): boolean {
  return item.type === AnBodyItemType.TEXTUAL_BODY;
}

export type AnBodyItem = AnBodyItemSpecificResource | AnBodyItemTextual;

// Bodies {{{2

export enum AnBodyType {
  SEMANTIC = "semantic",
  KEYWORD = "keyword",
  COMMENT = "comment",
  TRIPLE = "triple",
  UNKNOWN = "unknown"
}

export enum PurposeType {
  TAGGING = "tagging",
  COMMENTING = "commenting"
}

// Semantic {{{3

export interface SemanticAnBody {
  type: AnBodyItemType.COMPOSITE;
  items: Array<AnBodyItem>;
  purpose?: PurposeType.TAGGING;
}

export function mkSemanticAnBody(sources: Array<string>, value: string): SemanticAnBody {
  const specificItems = sources.map(source => mkAnBodyItemSpecificResource(source));
  const textualItem = mkAnBodyItemTextual(value);
  return {
    type: AnBodyItemType.COMPOSITE,
    items: [...specificItems, textualItem],
    purpose: PurposeType.TAGGING
  };
}

export function isSemanticAnBody(body: AnBody): boolean {
  return body.type === AnBodyItemType.COMPOSITE;
}

export function getLabelOfSemanticBody(body: SemanticAnBody): string {
  const item = body.items.filter(isAnBodyItemTextual)[0];
  if (!item) {
    throw new Error("TextualBody record not found in body item");
  } else {
    const textualItem = item as AnBodyItemTextual;
    if (!textualItem.value) {
      throw new Error("Value field not found in TextualBody item");
    } else {
      return textualItem.value;
    }
  }
}

// Keyword {{{3

export interface KeywordAnBody {
  type: AnBodyItemType.TEXTUAL_BODY;
  value: string;
  purpose?: PurposeType.TAGGING
}

export function mkKeywordAnBody(value: string): KeywordAnBody {
  return {
    type: AnBodyItemType.TEXTUAL_BODY,
    value,
    purpose: PurposeType.TAGGING
  };
}

export function isKeywordAnBody(body: AnBody): boolean {
  return body.type === AnBodyItemType.TEXTUAL_BODY && body.purpose === PurposeType.TAGGING;
}

export function getLabelOfKeywordBody(body: KeywordAnBody): string {
  return body.value;
}

// Comment {{{3

export interface CommentAnBody {
  type: AnBodyItemType.TEXTUAL_BODY;
  value: string;
  purpose: PurposeType.COMMENTING;
}

export function mkCommentAnBody(value: string): CommentAnBody {
  return {
    type: AnBodyItemType.TEXTUAL_BODY,
    value,
    purpose: PurposeType.COMMENTING
  };
}

export function isCommentAnBody(body: AnBody): boolean {
  return body.type === AnBodyItemType.TEXTUAL_BODY && body.purpose === PurposeType.COMMENTING;
}

export function getLabelOfCommentBody(body: CommentAnBody): string {
  return body.value;
}

// Triple {{{3
// Triple Term {{{4

export enum TripleTermType {
  SEMANTIC = "semantic",
  KEYWORD = "keyword",
  UNKNOWN = "unknown"
}

export interface SemanticTripleTerm {
  type: AnBodyItemType.COMPOSITE;
  items: Array<AnBodyItem>;
}

export interface KeywordTripleTerm {
  type: AnBodyItemType.TEXTUAL_BODY;
  value: string;
}

export type TripleTerm = SemanticTripleTerm | KeywordTripleTerm;

export function getLabelOfTripleTerm(term: TripleTerm): string {
  return matchSwitch(getTripleTermType(term), {
    [TripleTermType.SEMANTIC]: () => getLabelOfSemanticBody(term as SemanticAnBody),
    [TripleTermType.KEYWORD]: () => getLabelOfKeywordBody(term as KeywordAnBody),
    [TripleTermType.UNKNOWN]: () => "Unknown annotation type"
  });
}

export function isSemanticTripleTerm(term: TripleTerm): boolean {
  return term.type === AnBodyItemType.COMPOSITE;
}

export function isKeywordTripleTerm(term: TripleTerm): boolean {
  return term.type === AnBodyItemType.TEXTUAL_BODY;
}

export function getTripleTermType(term: TripleTerm): TripleTermType {
  return (
    isSemanticTripleTerm(term) ? TripleTermType.SEMANTIC
    : isKeywordTripleTerm(term) ? TripleTermType.KEYWORD
    : TripleTermType.UNKNOWN
  );
}

// }}}4

export interface Triple {
  subject: TripleTerm;
  predicate: TripleTerm;
  object: TripleTerm;
}

export function mkTriple(subject: TripleTerm, predicate: TripleTerm, object: TripleTerm): Triple {
  return { subject, predicate, object };
}

export function mkSemanticTripleTerm(sources: Array<string>, value: string): SemanticTripleTerm {
  const specificItems = sources.map(source => mkAnBodyItemSpecificResource(source));
  const textualItem = mkAnBodyItemTextual(value);
  return {
    type: AnBodyItemType.COMPOSITE,
    items: [...specificItems, textualItem],
  };
}

export function mkKeywordTripleTerm(value: string): KeywordTripleTerm {
  return {
    type: AnBodyItemType.TEXTUAL_BODY,
    value
  };
}

export interface TripleAnBody {
  type: AnBodyItemType.SPECIFIC_RESOURCE;
  value: Triple;
  purpose: PurposeType.TAGGING;
}

export function mkTripleAnBody(triple: Triple): TripleAnBody {
  return {
    type: AnBodyItemType.SPECIFIC_RESOURCE,
    value: triple,
    purpose: PurposeType.TAGGING
  };
}

export function isTripleAnBody(body: AnBody): boolean {
  return body.type === AnBodyItemType.SPECIFIC_RESOURCE;
}

export function getTripleTermLabel(tripleTerm: TripleTerm): string {
  return matchSwitch(getTripleTermType(tripleTerm), {
    [TripleTermType.SEMANTIC]: () => getLabelOfSemanticBody(tripleTerm as SemanticAnBody),
    [TripleTermType.KEYWORD]: () => getLabelOfKeywordBody(tripleTerm as KeywordAnBody),
    [TripleTermType.UNKNOWN]: () => "unknown triple type"
  });
}

export function getLabelOfTripleBody(body: TripleAnBody): string {
  return getTripleTermLabel(body.value.subject) + "-" + getTripleTermLabel(body.value.predicate) + "-" + getTripleTermLabel(body.value.object);
}

export function getSourcesFromTripleTerm(term: TripleTerm): Array<string> {
  return isSemanticTripleTerm(term) ?
    getSourcesFromAnBody(term as SemanticAnBody)
  : [];
}

// }}}3

export type AnBody = SemanticAnBody | KeywordAnBody | CommentAnBody | TripleAnBody;

// Querying {{{3

export function getAnBodyType(anBody: AnBody): AnBodyType {
  return (
      isSemanticAnBody(anBody) ? AnBodyType.SEMANTIC
    : isKeywordAnBody(anBody) ? AnBodyType.KEYWORD
    : isCommentAnBody(anBody) ? AnBodyType.COMMENT
    : isTripleAnBody(anBody) ? AnBodyType.TRIPLE
    : AnBodyType.UNKNOWN
  );
}

export function getLabelFromBody(anBody: AnBody): string {
  return matchSwitch(getAnBodyType(anBody), {
    [AnBodyType.SEMANTIC]: () => getLabelOfSemanticBody(anBody as SemanticAnBody),
    [AnBodyType.KEYWORD]: () => getLabelOfKeywordBody(anBody as KeywordAnBody),
    [AnBodyType.COMMENT]: () => getLabelOfCommentBody(anBody as CommentAnBody),
    [AnBodyType.TRIPLE]: () => getLabelOfTripleBody(anBody as TripleAnBody),
    [AnBodyType.UNKNOWN]: () => "Unknown annotation type"
  });
}

// Target {{{2

export enum SelectorType {
  XPATH = "XPathSelector",
  SVG = "SvgSelector",
  PDF = "PdfSelector",
  TABLE = "TableSelector"
}

// Text selection {{{3

export interface TextPositionSelector {
  type: "TextPositionSelector";
  start: number;
  end: number;
}

export interface XPathTextSelector {
  type: SelectorType.XPATH;
  selectedText: string;
  value: string;
  refinedBy?: TextPositionSelector;
}

export function mkXPathTextSelector(selectedText: string, xpath: string, startOffset: number, endOffset: number): XPathTextSelector {
  return {
    type: SelectorType.XPATH,
    selectedText,
    value: xpath,
    refinedBy: {
      type: "TextPositionSelector",
      start: startOffset,
      end: endOffset
    }
  };
}

// SVG selection {{{3

export interface SvgSelector {
  type: SelectorType.SVG;
  value: string;
}

export function mkSvgSelector(svg: string): SvgSelector {
  return {
    type: SelectorType.SVG,
    value: svg
  };
}

// Table Selector {{{3

export enum TableRangeType {
  ROWS = "RowRange",
  COLUMNS = "ColumnRange",
  CELLS = "CellRange"
}

export interface RowRange {
  type: TableRangeType.ROWS;
  startRow: number;
  endRow: number;
}

export interface ColumnRange {
  type: TableRangeType.COLUMNS;
  startColumn: number;
  endColumn: number;
}

export interface CellRange {
  type: TableRangeType.CELLS;
  startColumn: number;
  endColumn: number;
  startRow: number;
  endRow: number;
}

export type TableRange = RowRange|ColumnRange|CellRange

export function printTableRange(tr: TableRange): string {
  return matchSwitch(tr.type, {
    [TableRangeType.ROWS]: () => {
      const r = tr as RowRange;
      return `Rows ${r.startRow}-${r.endRow}`;
    },
    [TableRangeType.COLUMNS]: () => {
      const r = tr as ColumnRange;
      return `Columns ${r.startColumn}-${r.endColumn}`;
    },
    [TableRangeType.CELLS]: () => {
      const r = tr as CellRange;
      return `[${r.startColumn}:${r.startRow}]-[${r.endColumn}:${r.endRow}]`;
    }
  });
}

export interface TableSelector {
  type: SelectorType.TABLE;
  sheet: string;
  range?: TableRange;
}

export function mkTableSelector(sheet: string, range?: TableRange): TableSelector {
  return {
    type: SelectorType.TABLE,
    sheet,
    range
  };
}

// PDF Selector {{{3

export interface PdfSelector {
  type: SelectorType.PDF;
  pageNumber: number;
  selector?: SvgSelector;
}

export function mkPdfSelector(pageNumber: number, selector?: SvgSelector): PdfSelector {
  return {
    type: SelectorType.PDF,
    pageNumber,
    selector
  };
}

// Target {{{3

export type AnSelector = XPathTextSelector | SvgSelector | TableSelector | PdfSelector

export interface AnTarget {
  id: ID;
  idName?: string;
  source?: string;
  sourceName?: string;
  selector?: AnSelector;
  type: string;
}

// Provenance {{{2

export interface Creator {
  id: ID;
}

export interface AnCreator extends Creator {
  type: string;
}

export function mkCreator(creator: Creator): AnCreator {
  return {
    ...creator,
    type: "Person"
  };
}

export interface AnGenerator {
  type: string;
  name: string;
  version: string;
  homepage: string;
}

export function mkGenerator(name: string, version: string, homepage: string): AnGenerator {
  return {
    type: "Software",
    name,
    version,
    homepage,
  };
}

// Web Annotation Model B2NOTE extension {{{2

export enum VisibilityEnum {
  PRIVATE = "private",
  PUBLIC = "public"
}

// }}}2

export interface Annotation {
  "@context": string;
  body: AnBody;
  created: string;
  creator: AnCreator;
  generated: string;
  generator: AnGenerator;
  id: ID;
  motivation: PurposeType;
  target: AnTarget;
  type: string;
  visibility: VisibilityEnum; // Web Annotation Model B2NOTE extension
  catalogs?: Array<string>; // Web Annotation Model B2NOTE extension
}

export type AnnotationPartial = Partial<Annotation>;

export function mkAnnotation(body: AnBody, target: AnTarget, creator: AnCreator, generator: AnGenerator, motivation: PurposeType, visibility: VisibilityEnum, catalog?: string): Annotation {
  const ts = utils.mkTimestamp();
  return {
    "@context": "http://www.w3.org/ns/anno/jsonld",
    body,
    target,
    created: ts,
    creator,
    generated: ts,
    generator,
    id: "",
    motivation,
    type: "Annotation",
    visibility,
    ...catalog ? { catalogs: [ catalog ] } : {}
  };
}

export function getAnId(an: Annotation): ID {
  return utils.extractId(an.id);
}

export function getCreatorId(an: Annotation): ID {
  return utils.extractId(an.creator.id);
}

export function getLabel(annotation: Annotation): string {
  return getLabelFromBody(annotation.body);
}

export function isEqual(an1: Annotation, an2: Annotation): boolean {
  return (
    getAnBodyType(an1.body) === getAnBodyType(an2.body) &&
    _.isEqual(an1.body, an2.body) &&
    an1.creator.id === an2.creator.id
  );
}

export function isMine(annotation: Annotation, userPID: PID|null): boolean {
  return userPID !== null && utils.extractId(annotation.creator.id) === utils.extractId(userPID);
}

export function getSourcesFromAnBody(body: AnBody): Array<string> {
  if (isSemanticAnBody(body)) {
    const semBody = body as SemanticAnBody;
    const specificItems = semBody.items.filter(isAnBodyItemSpecificResource) as Array<AnBodyItemSpecificResource>;
    return specificItems.map(i => i.source);
  } else {
    return [];
  }
}
