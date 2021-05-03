import _ from "lodash";
import type { Domain } from "./domainModel";

const ontologyRegisterUrl = "/ontology-register";
export const ontologiesUrl = ontologyRegisterUrl + "/ontologies";
export const termsUrl = ontologyRegisterUrl + "/terms";

export enum OntologyFormat {
  TURTLE = "Turtle",
  N_TRIPLES = "N-Triples",
  N_QUADS = "N-Quads",
  TRIG = "TriG",
  RDF_XML= "RDF/XML",
  JSON_LD = "JSON-LD",
  RDF_THIFT = "RDF Thrift",
  RDF_JSON = "RDF/JSON",
  TRIX = "TriX"
}

export interface OntologyMeta {
  id: string;
  name?: string;
  creatorId: string;
  uri: string;
  noOfTerms: number;
  domainsIds?: Array<string>;
}

export interface Ontology extends OntologyMeta {
  terms: Array<OntologyTerm>;
}

export function isEqual(o1: Ontology, o2: Ontology): boolean {
  return _.isEqual(o1.terms, o2.terms);
}

export interface OntologyTerm {
  label: string;
  description: string;
  shortForm: string;
  ontologyName: string;
  ontologyAcronym: string;
  synonyms: Array<string>;
  uris: string;
}

export function mkOntologyTerm(uri: string, label: string, description = ""): OntologyTerm {
  return {
    label: label,
    description,
    shortForm: "",
    ontologyName: "",
    ontologyAcronym: "",
    synonyms: [],
    uris: uri
  };
}

export type OTermsDict = Record<string, Array<OntologyTerm>>
