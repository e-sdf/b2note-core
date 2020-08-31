// Annotations model according to <https://www.w3.org/TR/annotation-model>

import * as utils from "./utils";

// Annotating {{{1

export const annotationsUrl = "/annotations";
export const targetsUrl = "/targets";
export const resolveSourceUrl = "/resolve-source";

export type ID = string;
export type CreatorID = ID;
export type AnID = ID;

export type PID = string;
export type CreatorPID = PID;
export type AnPID = PID;

export enum AnBodyItemType {
  COMPOSITE = "Composite",
  SPECIFIC_RESOURCE = "SpecificResource",
  TEXTUAL_BODY = "TextualBody"
}

export interface AnBodyItemSpecific {
  type: AnBodyItemType.SPECIFIC_RESOURCE;
  source: string;
}

export function mkAnBodyItemSpecific(source: string): AnBodyItemSpecific {
  return {
    type: AnBodyItemType.SPECIFIC_RESOURCE,
    source
  };
}

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

export type AnBodyItem = AnBodyItemSpecific | AnBodyItemTextual;

export function isSpecificResourceBodyItem(bodyItem: AnBodyItem): boolean {
  return bodyItem.type === AnBodyItemType.SPECIFIC_RESOURCE;
}

export function isTextualBodyItem(bodyItem: AnBodyItem): boolean {
  return bodyItem.type === AnBodyItemType.TEXTUAL_BODY;
}

export enum PurposeType {
  TAGGING = "tagging",
  COMMENTING = "commenting"
}

export interface AnCompositeBody {
  type: AnBodyItemType.COMPOSITE;
  items: Array<AnBodyItem>;
  purpose: PurposeType.TAGGING;
}

export function mkCompositeBody(specificItems: Array<AnBodyItemSpecific>, textualItem: AnBodyItemTextual): AnCompositeBody {
  return {
    type: AnBodyItemType.COMPOSITE,
    items: [...specificItems, textualItem],
    purpose: PurposeType.TAGGING
  };
}

export interface AnTextualBody {
  type: AnBodyItemType.TEXTUAL_BODY;
  value: string;
  purpose: PurposeType;
}

export function mkTextualBody(value: string, purpose: PurposeType): AnTextualBody {
  return {
    type: AnBodyItemType.TEXTUAL_BODY,
    value,
    purpose
  };
}

export type AnBody = AnCompositeBody | AnTextualBody;

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

// Web Annotation Model B2NOTE extension
export enum VisibilityEnum {
  PRIVATE = "private",
  PUBLIC = "public"
}

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

export function mkSemanticAnBody(sources: Array<string>, value: string): AnCompositeBody {
  const specificItems = sources.map(source => mkAnBodyItemSpecific(source));
  const textualItem = mkAnBodyItemTextual(value);
  return mkCompositeBody(specificItems, textualItem);
}

export function mkKeywordAnBody(value: string): AnTextualBody {
  return mkTextualBody(value, PurposeType.TAGGING);
}

export function mkCommentAnBody(value: string): AnTextualBody {
  return mkTextualBody(value, PurposeType.COMMENTING);
}

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

export enum AnnotationType {
  SEMANTIC = "semantic",
  KEYWORD = "keyword",
  COMMENT = "comment"
}

// Querying {{{1

export function isSemantic(annotation: Annotation): boolean {
  return annotation.body.type === AnBodyItemType.COMPOSITE;
}

export function isKeyword(annotation: Annotation): boolean {
  return annotation.motivation === PurposeType.TAGGING && annotation.body.type === AnBodyItemType.TEXTUAL_BODY;
}

export function isComment(annotation: Annotation): boolean {
  return annotation.motivation === PurposeType.COMMENTING && annotation.body.type === AnBodyItemType.TEXTUAL_BODY;
}

export function getAnType(annotation: Annotation): AnnotationType {
  return (
      isSemantic(annotation) ? AnnotationType.SEMANTIC
    : isKeyword(annotation) ? AnnotationType.KEYWORD
    : AnnotationType.COMMENT
  );
}

export function getLabel(annotation: Annotation): string {
  if (isSemantic(annotation)) {
    const anBody = annotation.body as AnCompositeBody;
    const item = anBody.items.filter((i: AnBodyItem) => i.type === AnBodyItemType.TEXTUAL_BODY )[0];
    if (!item) {
      throw new Error("TextualBody record not found in body item");
    } else {
      const textualItem = item as AnTextualBody;
      if (!textualItem.value) {
        throw new Error("Value field not found in TextualBody item");
      } else {
        return textualItem.value;
      }
    }
  } else {
    const anBody = annotation.body as AnTextualBody;
    return anBody.value;
  }
}

export function isEqual(an1: Annotation, an2: Annotation): boolean {
  return (
    getAnType(an1) === getAnType(an2) &&
    getLabel(an1) === getLabel(an2) &&
    an1.creator.id === an2.creator.id
  );
}

export function isMine(annotation: Annotation, userPID: PID|null): boolean {
  return userPID !== null && utils.extractId(annotation.creator.id) === utils.extractId(userPID);
}

export function getSources(annotation: Annotation): Array<string> {
  if (isSemantic(annotation)) {
    const anBody = annotation.body as AnCompositeBody;
    const specificItems = anBody.items.filter((i: AnBodyItem) => i.type === AnBodyItemType.SPECIFIC_RESOURCE) as Array<AnBodyItemSpecific>;
    return specificItems.map(i => i.source);
  } else {
    return [];
  }
}
