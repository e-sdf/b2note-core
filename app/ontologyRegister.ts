import * as _ from "lodash";
import axios from "axios";

const solrUrl = "https://b2note.bsc.es/solr/b2note_index/select";

// SOLR requires a non-standard encoding where just # and " are encoded
function encodeSolrQuery(uri: string): string {
  return uri.replace(/#/g, "%23").replace(/"/g, "%22");
}

// Getting ontologies {{{1

export interface OntologyItem {
   short_form: string;
   labels: string;
   ontology_acronym: string;
   uris: string;
   "norm(labels)": number;
}

function mkExactSolrQueryUrl(query: string): string {
  const q = `(labels:"${query}")`;
  const notErrors = "%20AND%20NOT%20(labels:/Error[0-9].*/)";
  const sort = _.words(query).length <= 1 ? "&sort=norm(labels) desc" : "";
  const flags = "&fl=labels,uris,ontology_acronym,short_form,synonyms,norm(labels)&wt=json&indent=true&rows=1000";
  const res = solrUrl + "?q=(" + q + notErrors + ")" + sort + flags;
  console.log(res);
  return res;
}

function mkBroadSolrQueryUrl(query: string): string {
  const q = 
    (query.length <= 4 && _.words(query).length <= 1) ? `(labels:/${query}.*/)`
    : `(labels:"${query}"^100%20OR%20labels:${query}*^20%20OR%20text_auto:/${query}.*/^10%20OR%20labels:*${query}*)`;
  const notErrors = "%20AND%20NOT%20(labels:/Error[0-9].*/)";
  const sort = _.words(query).length <= 1 ? "&sort=norm(labels) desc" : "";
  const flags = "&fl=labels,uris,ontology_acronym,short_form,synonyms,norm(labels)&wt=json&indent=true&rows=1000";
  const res = solrUrl + "?q=(" + q + notErrors + ")" + sort + flags;
  return res;
}

export async function getExactOntologies(query: string): Promise<Array<OntologyItem>> {
  const resp = await axios.get(mkExactSolrQueryUrl(query));
  return resp.data.response.docs;
}

export async function getMatchingOntologies(query: string): Promise<Array<OntologyItem>> {
  const resp = await axios.get(mkBroadSolrQueryUrl(query));
  return resp.data.response.docs;
}

// Getting ontology info {{{1

export interface OntologyInfo {
  label: string;
  description: string;
  shortForm: string;
  ontologyName: string;
  ontologyAcronym: string;
  synonyms: Array<string>;
  uris: string;
}

export function getInfo(ontologyUri: string): Promise<OntologyInfo> {
  return new Promise((resolve, reject) => {
    const queryUrl = encodeSolrQuery(solrUrl + '?q=uris:("' + ontologyUri + '")&rows=100&wt=json');
    axios.get(queryUrl).then(
      res => {
        if (res?.data?.response?.docs?.length > 0) {
          const info = res.data.response.docs[0];
          console.log(info.synonyms);
          resolve({
            label: info.labels || "",
            description: info.description || "",
            shortForm: info.short_form || "",
            ontologyName: info.ontology_name || "",
            ontologyAcronym: info.ontology_acronym || "",
            synonyms: info.synonyms || [],
            uris: info.uris || ""
          });
        } else {
          reject("SOLR query returned 0 results for " + queryUrl);
        }
      },
      error => reject(error)
    ).catch(error => reject(error));
  });
}
