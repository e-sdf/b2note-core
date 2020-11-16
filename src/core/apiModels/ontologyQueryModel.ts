import type { OntologyMeta } from "../ontologyRegister";

export interface OntologySources {
  solr: boolean;
  custom: Array<OntologyMeta>;
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