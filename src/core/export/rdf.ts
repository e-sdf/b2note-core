import * as _ from "lodash";
import * as xml from "xmlbuilder";
import { v4 as uuidv4 } from "uuid";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import type { PID, Annotation, AnGenerator, TripleAnBody } from "../annotationsModel";
import { annotationsUrl, AnBodyType, getAnBodyType, getSourcesFromAnBody, getLabel, isCommentAnBody } from "../annotationsModel";
import { usersUrl } from "../user";

function mkId(): string {
  return "n" + uuidv4().replace(/-/g, "");
}

function mkGenerator(gen: AnGenerator): [string, Record<string, any>] {
  const uuid = mkId();
  return [uuid, {
    "@rdf:nodeID": uuid,
    "rdf:type": {
      "@rdf:resource": "http://www.w3.org/ns/activitystreams#Application"
    },
    "ns3:name": {
      "#text": gen.name + " " + gen.version,
    },
    "ns3:homepage": {
      "@rdf:resource": gen.homepage
    }
  }];
}

function mkCreator(pid: PID): [string, Record<string, any>] {
  const uuid = mkId();
  return [uuid, {
    "@rdf:nodeID": uuid,
    "rdf:type": {
      "@rdf:resource": "http://xmlns.com/foaf/0.1/Person",
      "@ns3:openid": pid
    }
  }];
}

function mkPidSource(pid: string, source: string): any {
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
  const uuid = mkId();
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
  const uuid = mkId();
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
  const uuid = mkId();
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
  const uuid = mkId();
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
  const uuid = mkId();
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

function mkTripleAnBody(tripleAnBody: TripleAnBody): [string, Record<string, any>] {
  const uuid = mkId();
  return [uuid, {
    todo: "Triple Body: TODO"
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

function mkBody(an: Annotation): [string, Record<string, any>, any[]] {
  const value = getLabel(an);
  return matchSwitch(getAnBodyType(an.body), {
    [AnBodyType.SEMANTIC]: () => mkCompositeBody(getSourcesFromAnBody(an.body), value),
    [AnBodyType.KEYWORD]: () => [ ...mkKeywordAnBody(value), [] ] as [string, Record<string, any>, any[]],
    [AnBodyType.COMMENT]: () => [ ...mkCommentAnBody(value), [] ] as [string, Record<string, any>, any[]],
    [AnBodyType.TRIPLE]: () => [ ...mkTripleAnBody(an.body as TripleAnBody), [] ] as [string, Record<string, any>, any[]],
    [AnBodyType.UNKNOWN]: () => ["unknown", {}, []]
  });
}

function mkDescItems(an: Annotation, serverUrl: string): any[] {
  const [generatorUUID, generator] = mkGenerator(an.generator);
  const [creatorUUID, creator] = mkCreator(serverUrl + usersUrl + "/" + an.creator.id);
  const [bodyUUID, body, bodyItems] = mkBody(an);

  return [
    {
      "@rdf:about": serverUrl + annotationsUrl + "/" + an.id,
      ...(isCommentAnBody(an.body) ? mkCommenting() : mkTagging()),
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
    //TODO: accomodate to new structure
    //mkPidSource(an.target.id, an.target.source),
    body,
    bodyItems
  ];
}

function annotation2RdfObj(anl: Annotation[], serverUrl: string): Record<string, any> {
  return {
    "rdf:RDF": {
      "@xmlns:ns1": "http://www.w3.org/ns/oa#",
      "@xmlns:ns2": "http://www.w3.org/ns/activitystreams#",
      "@xmlns:ns3": "http://xmlns.com/foaf/0.1/",
      "@xmlns:ns4": "http://purl.org/dc/terms/",
      "@xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdf:Description": anl.map(an => mkDescItems(an, serverUrl))
    }
  };
}

export function mkRDF(annotations: Annotation[], serverUrl: string): string {
  const doc = annotation2RdfObj(annotations, serverUrl);
  const res = xml.create(doc).end({ pretty: true });
  // console.log(res);
  return res;
}
