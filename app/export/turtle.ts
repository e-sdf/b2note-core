import _ from "lodash";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import type { AnRecord, AnGenerator, AnCreator } from "../annotationsModel";
import { AnRecordType, getAnType, getSources, getLabel, isComment, mkTimestamp } from "../annotationsModel";

export type Turtle = string;
      

function body2ttl(an: AnRecord): Turtle[] {

  function mkCompositeBody(sources: string[], value: string): Turtle[] {
    return [
      `    a oa:Composite ;`,
      `    oa:hasPurpose oa:tagging ;`,
      `    as:items (`,
      ...sources.map(s => `      <${s}> `),
      `    ) ;`,
      `    rdf:value "${value}"`
    ];
  }

  function mkKeywordAnBody(value: string): Turtle[] {
    return [
      `    a oa:TextualBody ;`,
      `    oa:hasPurpose oa:tagging ;`,
      `    rdf:value "${value}"`
    ];
  }

  function mkCommentAnBody(value: string): Turtle[] {
    return [
      `    a oa:TextualBody ;`,
      `    oa:hasPurpose oa:commenting ;`,
      `    rdf:value "${value}"`
    ];
  }

  function mkBody(): Turtle[] {
    const value = getLabel(an);
    return matchSwitch(getAnType(an), {
      [AnRecordType.SEMANTIC]: () => mkCompositeBody(getSources(an), value),
      [AnRecordType.KEYWORD]: () => mkKeywordAnBody(value),
      [AnRecordType.COMMENT]: () => mkCommentAnBody(value),
    });
  }

  return [
    `  oa:hasBody [`,
    ...mkBody(),
    `  ] ;`
  ];
}

function mkCreator(creator: AnCreator): Array<Turtle|null> {
  return [
    `  dcterms:creator [`,
    `    a foaf:Person ;`,
    `    [ foaf:nick "${creator.id} ] ;`,
    creator.name  ? `    foaf:name "${creator.name}" ;` : null,
    creator.orcid ? `    orcid:${creator.orcid}` : null,
    `  ] ;`
  ];
}

function mkGenerator(gen: AnGenerator): Turtle[] {
  return [
    `  as:generator [`,
    `    a as:Application ;`,
    `    schema:softwareVersion "${gen.version}" ;`,
    `    foaf:homepage <${gen.homepage}>`, 
    `  ] ;`  
  ];
}

function mkTagging(): Turtle[] {
  return [
    `  oa:motivatedBy oa:tagging .`
  ];
}

function mkCommenting(): Turtle[] {
  return [
    `  oa:motivatedBy oa:commenting .`
  ];
}

function an2ttl(an: AnRecord): Turtle[] {
  return [
    `<${an.id}>`,
    `  a oa:Annotation ;`,
    ...body2ttl(an),
    `  dcterms:created "${an.created}"^^xsd:dateTime ;`,
    ...(mkCreator(an.creator).filter(i => i !== null) as Turtle[]),
    `  dcterms:issued "${mkTimestamp()}"^^xsd:dateTime ;`,
    ...mkGenerator(an.generator),
    ...(isComment(an) ? mkCommenting() : mkTagging())
  ];
}

function mkPrefixes(): Turtle[] {
  return [
    `@prefix as: <http://www.w3.org/ns/activitystreams#> .`,
    `@prefix dcterms: <http://purl.org/dc/terms/> .`,
    `@prefix foaf: <http://xmlns.com/foaf/0.1/> .`,
    `@prefix oa: <http://www.w3.org/ns/oa#> .`,
    `@prefix orcid: <@prefix orcid: <https://orcid.org/> .`,
    `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .`,
    `@prefix schema: <http://schema.org/> .`,
    ``
  ];
}

export function anRecords2ttl(anl: AnRecord[]): Turtle {
  const ttl = [
    ...mkPrefixes(),
    ...anl.reduce((res: Turtle[], an: AnRecord) => [...res, ...an2ttl(an)], [])
  ];
  //console.log(ttl);
  return _.join(ttl, "\n");
}