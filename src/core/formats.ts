import { matchSwitch } from '@babakness/exhaustive-type-checking';
import { Response } from "express";

export enum FormatType { JSONLD = "json-ld", TTL = "rdf-ttl", RDF = "rdf-xml" }

export function mkFileExt(format: FormatType): string {
  return matchSwitch(format, {
    [FormatType.JSONLD]: () => "jsonld",
    [FormatType.TTL]: () => "ttl",
    [FormatType.RDF]: () => "rdf"
  });
}
