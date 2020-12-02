import type { OntologyMeta } from "../ontologyRegister";

export interface OntologySources {
  solr: boolean;
  custom: Array<OntologyMeta>;
}

export const defaultOntologySources: OntologySources = {
  solr: true,
  custom: []
};

export interface OntologyGetQuery {
  value?: string;
  uri?: string;
  "sources-ids"?: Array<string>
}

export interface OntologyPatchQuery {
  id: string;
  name: string;
}