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

export enum PurposeType {
  TAGGING = "tagging",
  COMMENTING = "commenting"
}

// Semantic {{{3

export interface SemanticAnBody {
  type: AnBodyItemType.COMPOSITE;
  items: Array<AnBodyItem>;
  purpose: PurposeType.TAGGING;
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
  purpose: PurposeType.TAGGING
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

export enum TripleTermType {
  SEMANTIC = "semantic",
  KEYWORD = "keyword"
}

export type TripleTerm = SemanticAnBody | KeywordAnBody;

export interface Triple {
  subject: TripleTerm;
  predicate: TripleTerm;
  object: TripleTerm;
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

export function getTripleTermType(tripleTerm: TripleTerm): TripleTermType {
  return matchSwitch(tripleTerm.type, {
    [AnBodyItemType.COMPOSITE]: () => TripleTermType.SEMANTIC,
    [AnBodyItemType.TEXTUAL_BODY]: () => TripleTermType.KEYWORD
  });
}

export function isTripleAnBody(body: AnBody): boolean {
  return body.type === AnBodyItemType.SPECIFIC_RESOURCE;
}

export function getTripleTermLabel(tripleTerm: TripleTerm): string {
  return matchSwitch(getTripleTermType(tripleTerm), {
    [TripleTermType.SEMANTIC]: () => getLabelOfSemanticBody(tripleTerm as SemanticAnBody),
    [TripleTermType.KEYWORD]: () => getLabelOfKeywordBody(tripleTerm as KeywordAnBody)
  });
}

export function getLabelOfTripleBody(body: TripleAnBody): string {
  return getTripleTermLabel(body.value.subject) + "-" + getTripleTermLabel(body.value.predicate) + "-" + getTripleTermLabel(body.value.object);
}
// }}}3

export type AnBody = SemanticAnBody | KeywordAnBody | CommentAnBody | TripleAnBody;

// Target {{{2

export interface TextPositionSelector {
  type: "TextPositionSelector";
  start: number;
  end: number;
}

export interface XPathSelector {
  type: "XPathSelector";
  value: string;
  refinedBy?: TextPositionSelector;
}

export function mkTargetSelector(xpath: string, startOffset: number, endOffset: number): XPathSelector {
  return {
    type: "XPathSelector",
    value: xpath,
    refinedBy: {
      type: "TextPositionSelector",
      start: startOffset,
      end: endOffset
    }
  };
}

export interface AnTarget {
  id: ID;
  source?: string;
  selector?: XPathSelector;
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
}

export type AnnotationPartial = Partial<Annotation>;

export function mkAnnotation(body: AnBody, target: AnTarget, creator: AnCreator, generator: AnGenerator, motivation: PurposeType, visibility: VisibilityEnum): Annotation {
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
    visibility
  };
}

export function getAnId(an: Annotation): ID {
  return utils.extractId(an.id);
}

export function getCreatorId(an: Annotation): ID {
  return utils.extractId(an.creator.id);
}

// Querying {{{1

export enum AnnotationType {
  SEMANTIC = "semantic",
  KEYWORD = "keyword",
  COMMENT = "comment",
  TRIPLE = "triple",
  UNKNOWN = "unknown"
}

export function isSemantic(annotation: Annotation): boolean {
  return isSemanticAnBody(annotation.body);
}

export function isKeyword(annotation: Annotation): boolean {
  return isKeywordAnBody(annotation.body);
}

export function isComment(annotation: Annotation): boolean {
  return isCommentAnBody(annotation.body);
}

export function isTriple(annotation: Annotation): boolean {
  return isTripleAnBody(annotation.body);
}

export function getAnType(annotation: Annotation): AnnotationType {
  return (
      isSemantic(annotation) ? AnnotationType.SEMANTIC
    : isKeyword(annotation) ? AnnotationType.KEYWORD
    : isComment(annotation) ? AnnotationType.COMMENT
    : isTriple(annotation) ? AnnotationType.TRIPLE
    : AnnotationType.UNKNOWN
  );
}

export function getLabel(annotation: Annotation): string {
  return matchSwitch(getAnType(annotation), {
    [AnnotationType.SEMANTIC]: () => getLabelOfSemanticBody(annotation.body as SemanticAnBody),
    [AnnotationType.KEYWORD]: () => getLabelOfKeywordBody(annotation.body as KeywordAnBody),
    [AnnotationType.COMMENT]: () => getLabelOfCommentBody(annotation.body as CommentAnBody),
    [AnnotationType.TRIPLE]: () => getLabelOfTripleBody(annotation.body as TripleAnBody),
    [AnnotationType.UNKNOWN]: () => "Unknown annotation type"
  });
}

export function isEqual(an1: Annotation, an2: Annotation): boolean {
  return (
    getAnType(an1) === getAnType(an2) &&
    _.isEqual(an1.body, an2.body) &&
    an1.creator.id === an2.creator.id
  );
}

export function isMine(annotation: Annotation, userPID: PID|null): boolean {
  return userPID !== null && utils.extractId(annotation.creator.id) === utils.extractId(userPID);
}

export function getSources(annotation: Annotation): Array<string> {
  if (isSemantic(annotation)) {
    const anBody = annotation.body as SemanticAnBody;
    const specificItems = anBody.items.filter(isAnBodyItemSpecificResource) as Array<AnBodyItemSpecificResource>;
    return specificItems.map(i => i.source);
  } else {
    return [];
  }
}
