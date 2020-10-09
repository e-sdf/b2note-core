import _ from "lodash";

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

export interface Ontology {
  id: string;
  creatorId: string;
  uri: string;
  terms: Array<OntologyTerm>;
}

export function isEqual(o1: Ontology, o2: Ontology): boolean {
  return _.isEqual(o1.terms, o2.terms);
}

export interface OntologyTerm {
  labels: string;
  description: string;
  shortForm: string;
  ontologyName: string;
  ontologyAcronym: string;
  synonyms: Array<string>;
  uris: string;
}

export function mkOntologyTerm(uri: string, label: string): OntologyTerm {
  return {
    labels: label,
    description: "",
    shortForm: "",
    ontologyName: "",
    ontologyAcronym: "",
    synonyms: [],
    uris: uri
  };
}

export type OTermsDict = Record<string, Array<OntologyTerm>>