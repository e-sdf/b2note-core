import type { AnCreator, AnGenerator } from "./annotationsModel";
import { mkTimestamp, mkGenerator } from "./annotationsModel";

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
  const ts = mkTimestamp();
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
