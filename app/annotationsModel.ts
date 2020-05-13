import { matchSwitch } from '@babakness/exhaustive-type-checking';
// Annotating {{{1

export const annotationsUrl = "/annotations";
export const targetsUrl = "/targets";
export const resolveSourceUrl = "/resolve-source";

export interface Target {
  pid: string;
  source: string;
}

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
  id: string;
  email?: string;
  name?: string;
  orcid?: string;
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

export function mkGenerator(version: string): AnGenerator {
  return {
    type: "Software",
    name: "B2NOTE",
    version,
    homepage: "https://b2note.bsc.es",
  };
}

export interface AnTarget {
  id: string;
  source: string;
  type: string;
}

export function mkTarget(target: Target): AnTarget {
  return { id: target.pid, source: target.source, type: AnBodyItemType.SPECIFIC_RESOURCE }; 
}

export interface AnRecord {
  "@context": string;
  body: AnBody;
  created: string;
  creator: AnCreator;
  generated: string;
  generator: AnGenerator;
  id: string;
  motivation: PurposeType;
  target: AnTarget;
  type: string;
}

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

export function mkTimestamp(): string {
  return (new Date()).toISOString();
}

export function mkAnRecord(body: AnBody, target: AnTarget, creator: AnCreator, generator: AnGenerator, motivation: PurposeType): AnRecord {
  const ts = mkTimestamp();
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
    type: "Annotation"
  };
}

export enum AnRecordType {
  SEMANTIC = "semantic",
  KEYWORD = "keyword",
  COMMENT = "comment"
}

export enum Format { JSONLD = "json-ld", TTL = "rdf-ttl", RDF = "rdf-xml" }

export function mkFileExt(format: Format): string {
  return matchSwitch(format, {
    [Format.JSONLD]: () => "jsonld",
    [Format.TTL]: () => "ttl",
    [Format.RDF]: () => "rdf"
  });
}

export interface GetQuery {
  type?: Array<AnRecordType>;
  creator?: string;
  "target-source"?: string;
  value?: string;
  format?: Format;
  download?: boolean;
  skip?: number;
  limit?: number;
}

export interface TargetsQuery {
  tag: string;
}

export type SearchQuery = string;

// Querying {{{1

export function isSemantic(anRecord: AnRecord): boolean {
  return anRecord.body.type === AnBodyItemType.COMPOSITE;
}

export function isKeyword(anRecord: AnRecord): boolean {
  return anRecord.motivation === PurposeType.TAGGING && anRecord.body.type === AnBodyItemType.TEXTUAL_BODY;
}

export function isComment(anRecord: AnRecord): boolean {
  return anRecord.motivation === PurposeType.COMMENTING && anRecord.body.type === AnBodyItemType.TEXTUAL_BODY;
}

export function getAnType(anRecord: AnRecord): AnRecordType {
  return (
      isSemantic(anRecord) ? AnRecordType.SEMANTIC 
    : isKeyword(anRecord) ? AnRecordType.KEYWORD
    : AnRecordType.COMMENT
  );
}

export function getLabel(anRecord: AnRecord): string {
  if (isSemantic(anRecord)) {
    const anBody = anRecord.body as AnCompositeBody;
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
    const anBody = anRecord.body as AnTextualBody;
    return anBody.value;
  }
}

export function getSources(anRecord: AnRecord): Array<string> {
  if (isSemantic(anRecord)) {
    const anBody = anRecord.body as AnCompositeBody;
    const specificItems = anBody.items.filter((i: AnBodyItem) => i.type === AnBodyItemType.SPECIFIC_RESOURCE) as Array<AnBodyItemSpecific>;
    return specificItems.map(i => i.source);
  } else {
    return [];
  }
}



