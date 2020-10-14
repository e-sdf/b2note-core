import type { Ontology } from "../ontologyRegister";

export interface OntologySources {
  solr: boolean;
  custom: Array<Ontology>;
}

export const defaultOntologySources: OntologySources = {
  solr: true,
  custom: []
};

export interface OntologyQuery {
  value?: string;
  uri?: string;
  "sources-ids"?: Array<string>
}