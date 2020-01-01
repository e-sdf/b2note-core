import _ from "lodash";
import xml from "xmlbuilder";
import uuidv4 from "uuid/v4";
import uuidv5 from "uuid/v5";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import { AnRecord, getAnType, AnRecordType, getSources, getLabel, isComment } from "./annotationsModel";

const NS="b9166f20-c23f-41ef-93ab-632aa4767ad2";

function mkGenerator(): [string, Record<string, any>] {
  const uuid = uuidv5("generator", NS);
  return [uuid, {
    "@rdf:nodeID": uuid,
    "rdf:type": {
      "@rdf:resource": "http://www.w3.org/ns/activitystreams#Application"
    },
    "ns3:name": {
      "#text": "B2Note v3.0",
    },
    "ns3:homepage": {
      "@rdf:resource": "https://b2note.bsc.es"
    }
  }];
}

function mkCreator(nick: string): [string, Record<string, any>] {
  const uuid = uuidv5(nick, NS);
  return [uuid, {
    "@rdf:nodeID": uuid,
    "rdf:type": {
      "@rdf:resource": "http://xmlns.com/foaf/0.1/Person",
      "@ns3:nick": nick
    }
  }];
}

function mkPidSource(pid: string, source: string) {
  return {
    "@rdf:about": pid,
    "ns1:hasSource": {
      "@rdf:resource": source
    },
    "rdf:type": {
      "@rdf:resource": "http://www.w3.org/ns/oa#SpecificResource"
    }
  };
}

function mkAnBodyItemSpecific(source: string): [string, Record<string, any>] {
  const uuid = uuidv4();
  return [uuid, {
    "rdf:nodeID": uuid,
    "ns1:hasSource": {
      "@rdf:resource": source
    },
    "rdf:type": {
      "@rdf:resource": "http://www.w3.org/ns/oa#SpecificResource"
    }
  }];
}

function mkAnBodyItemTextual(value: string): [string, Record<string, any>] {
  const uuid = uuidv4();
  return [uuid, {
    "@rdf:nodeID": uuid,
    "rdf:value": {
      "#text": value
    },
    "rdf:type": {
      "@rdf:resource": "http://www.w3.org/ns/oa#TextualBody"
    }
  }];
}

function mkCompositeBody(sources: string[], value: string): [string, Record<string, any>, any[]] {
  const uuid = uuidv5("composite body", NS);
  const specificItemsTps = sources.map(mkAnBodyItemSpecific);
  const specificItemsUUIDs = specificItemsTps.map(_.head);
  const specificItems = specificItemsTps.map(_.flow(_.tail, _.head));
  const [textualItemUUID, textualItem] = mkAnBodyItemTextual(value);

  return [
    uuid,
    {
      "@rdf:nodeID": uuid,
      "ns1:hasPurpose": {
        "@rdf:resource": "http://www.w3.org/ns/oa#tagging"
      },
      "ns2:items": [ ...specificItemsUUIDs, textualItemUUID ].map(uuid => ({ "@rdf:nodeID": uuid })),
      "rdf:type": {
        "@rdf:resource": "http://www.w3.org/ns/oa#Composite"
      }
    },
    [...specificItems, textualItem]
  ];
}

function mkKeywordAnBody(value: string): [string, Record<string, any>] {
  const uuid = uuidv4();
  return [uuid, {
    "@rdf:nodeID": uuid,
    "rdf:type": {
      "@rdf:resource": "http://www.w3.org/ns/oa#TextualBody"
    },
    "ns1:hasPurpose": {
      "@rdf:resource": "http://www.w3.org/ns/oa#tagging"
    },
    "rdf:value": {
      "#text": value
    }
  }];
}

function mkCommentAnBody(value: string): [string, Record<string, any>] {
  const uuid = uuidv4();
  return [uuid, {
    "@rdf:nodeID": uuid,
    "rdf:type": {
      "@rdf:resource": "http://www.w3.org/ns/oa#TextualBody"
    },
    "ns1:hasPurpose": {
      "@rdf:resource": "http://www.w3.org/ns/oa#commenting"
    },
    "rdf:value": {
      "#text": value
    }
  }];
}

function mkTagging(): Record<string, any> {
  return {
    "ns1:motivatedBy": {
      "@rdf:resource": "http://www.w3.org/ns/oa#tagging"
    }
  };
}

function mkCommenting(): Record<string, any> {
  return {
    "ns1:motivatedBy": {
      "@rdf:resource": "http://www.w3.org/ns/oa#commenting"
    }
  };
}

function mkBody(an: AnRecord): [string, Record<string, any>, any[]] {
  const value = getLabel(an);
  return matchSwitch(getAnType(an), {
    [AnRecordType.SEMANTIC]: () => mkCompositeBody(getSources(an), value),
    [AnRecordType.KEYWORD]: () => [ ...mkKeywordAnBody(value), [] ] as [string, Record<string, any>, any[]],
    [AnRecordType.COMMENT]: () => [ ...mkCommentAnBody(value), [] ] as [string, Record<string, any>, any[]]
  });
}

function mkDescItems(an: AnRecord): any[] {
  const [generatorUUID, generator] = mkGenerator();
  const [creatorUUID, creator] = mkCreator(an.creator.nickname);
  const [bodyUUID, body, bodyItems] = mkBody(an);
  
  return [
    {
      "@rdf:about": an.id,
      ...(isComment(an) ? mkCommenting() : mkTagging()),
      "ns2:generator": {
        "@rdf:nodeID": generatorUUID
      },
      "ns4:issued": {
        "@rdf:datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
        "#text": an.created
      },
      "ns4:creator": {
        "@rdf:nodeID": creatorUUID
      },
      "rdf:type": {
        "@rdf:resource": "http://www.w3.org/ns/oa#Annotation"
      },
      "ns4:created": {
        "@rdf:datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
        "#text:": an.created
      },
      "ns1:hasBody": {
        "@rdf:nodeID": bodyUUID
      },
      "ns1:hasTarget": {
        "@rdf:resource": an.target.id
      },
    },
    generator,
    creator,
    mkPidSource(an.target.id, an.target.source),
    body,
    bodyItems
  ];
}

function anRecord2RdfObj(anl: AnRecord[]) {
  return {
    "rdf:RDF": {
      "@xmlns:ns1": "http://www.w3.org/ns/oa#",
      "@xmlns:ns2": "http://www.w3.org/ns/activitystreams#",
      "@xmlns:ns3": "http://xmlns.com/foaf/0.1/",
      "@xmlns:ns4": "http://purl.org/dc/terms/",
      "@xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdf:Description": anl.map(mkDescItems)
    }
  };
}

export function mkRDF(anRecords: AnRecord[]): string {
  const doc = anRecord2RdfObj(anRecords);
  const res = xml.create(doc).end({ pretty: true });
  // console.log(res);
  return res;
}