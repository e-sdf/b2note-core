import { matchSwitch } from '@babakness/exhaustive-type-checking';
import type { Response } from "express";

export enum FormatType { JSONLD = "json-ld", TTL = "rdf-ttl", RDF = "rdf-xml" }

export function mkFileExt(format: FormatType): string {
  return matchSwitch(format, {
    [FormatType.JSONLD]: () => "jsonld",
    [FormatType.TTL]: () => "ttl",
    [FormatType.RDF]: () => "rdf"
  });
}

export function setDownloadHeader(resp: Response, fname: string, format: FormatType): void {
  const ext = mkFileExt(format);
  resp.setHeader("Content-Disposition", "attachment");
  resp.setHeader("filename", fname + "." + ext);
}
