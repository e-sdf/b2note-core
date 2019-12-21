import axios from "axios";

const solrUrl = "https://b2note.bsc.es/solr/b2note_index/select";

export interface OntologyInfo {
  label: string;
  description: string;
  shortForm: string;
  ontologyName: string;
  ontologyAcronym: string;
  synonyms: Array<string>;
  uris: string;
}

// SOLR requires a non-standard encoding where just # and " are encoded
function encodeSolrQuery(uri: string): string {
  return uri.replace(/#/g, "%23").replace(/"/g, "%22");
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
