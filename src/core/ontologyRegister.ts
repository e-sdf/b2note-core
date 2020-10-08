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
  descriptions: Array<string>;
  shortForm: string;
  ontologyName: string;
  ontologyAcronym: string;
  synonyms: Array<string>;
  uris: string;
}

export function mkOntologyTerm(uri: string, label: string): OntologyTerm {
  return {
    labels: label,
    descriptions: [],
    shortForm: "",
    ontologyName: "",
    ontologyAcronym: "",
    synonyms: [],
    uris: uri
  };
}

export type OTermsDict = Record<string, Array<OntologyTerm>>

// SOLR requires a non-standard encoding where just # and " are encoded
function encodeSolrQuery(uri: string): string {
  return uri.replace(/#/g, "%23").replace(/"/g, "%22");
}

// Getting ontologies {{{1

function mkSolrQueryUrl(solrUrl: string, query: string): string {
  const q =
    (query.length <= 4 && _.words(query).length <= 1) ? `(labels:/${query}.*/)`
    : `(labels:"${query}"^100%20OR%20labels:${query}*^20%20OR%20text_auto:/${query}.*/^10%20OR%20labels:*${query}*)`;
  const notErrors = "%20AND%20NOT%20(labels:/Error[0-9].*/)";
  const sort = _.words(query).length <= 1 ? "&sort=norm(labels) desc" : "";
  const flags = "&wt=json&indent=true&rows=1000";
  const res = solrUrl + "?q=(" + q + notErrors + ")" + sort + flags;
  return res;
}

function mkSolrExactQueryUrl(solrUrl: string, tag: string): string {
  const q = `(labels:/${tag}/)`;
  const notErrors = "%20AND%20NOT%20(labels:/Error[0-9].*/)";
  const sort = "&sort=norm(labels) desc";
  const flags = "&wt=json&indent=true&rows=1000";
  const res = solrUrl + "?q=(" + q + notErrors + ")" + sort + flags;
  return res;
}

function resultToDict(docs: any): OTermsDict {
  const ontologies: Array<OntologyTerm> = docs.map((o: any): OntologyTerm => ({
    labels: o.labels || "",
    descriptions: o.description || "",
    shortForm: o.short_form || "",
    ontologyName: o.ontology_name || "",
    ontologyAcronym: o.ontology_acronym || "",
    synonyms: o.synonyms || [],
    uris: o.uris || ""
  }));
  const ontologiesUniq = _.uniqBy(ontologies, "uris");
  const groups = _.groupBy(ontologiesUniq, o => o.labels.toLowerCase());
  return groups;
}
