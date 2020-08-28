import _ from "lodash";
import { AnCreator, AnGenerator } from "./annotationsModel";
import { mkGenerator } from "./annotationsModel";
import * as utils from "./utils";

export const nanopubsUrl = "/nanopubs";

export enum TermTypes {
  KEYWORD = "keyword",
  SEMANTIC = "semantic"
}

export interface KeywordTerm {
  termType: TermTypes.KEYWORD;
  value: string;
}

export function mkKeywordTerm(value: string): KeywordTerm {
  return {
    termType: TermTypes.KEYWORD,
    value
  };
}

export interface SemanticTerm {
  termType: TermTypes.SEMANTIC;
  value: string;
  uris: Array<string>;
}

export function mkSemanticTerm(value: string, uris: Array<string>): SemanticTerm {
  return {
    termType: TermTypes.SEMANTIC,
    value,
    uris
  };
}

export type Term = KeywordTerm | SemanticTerm;

export interface Assertion {
  subject: Term;
  predicate: Term;
  object: Term;
}

export function mkAssertion(subject: Term, predicate: Term, object: Term): Assertion {
  return {
    subject,
    predicate,
    object
  };
}

export interface Provenance {
  creator: AnCreator;
}

export function mkProvenance(creator: AnCreator): Provenance {
  return { creator };
}

export interface PublicationInfo {
  created: string;
  generator: AnGenerator;
}

export function mkPublicationInfo(version: string): PublicationInfo {
  const ts = utils.mkTimestamp();
  return {
    created: ts,
    generator: mkGenerator(version)
  };
}

export interface Nanopub {
  "@context": string;
  id: string;
  assertion: Assertion;
  provenance: Provenance;
  publicationInfo: PublicationInfo;
}

export function mkNanopub(assertion: Assertion, provenance: Provenance, publicationInfo: PublicationInfo): Nanopub {
  return {
    "@context": "http://www.w3.org/ns/anno/jsonld",
    id: "",
    assertion,
    provenance,
    publicationInfo
  };
}

export function isEqual(np1: Nanopub, np2: Nanopub): boolean {
  return _.isEqual(np1.assertion, np2.assertion);
}
