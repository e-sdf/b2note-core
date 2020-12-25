import type { Domain } from "../domainModel";

export type DomainGetQuery = Partial<Domain>

export type DomainPatchQuery = {
  id: string;
  name: string;
}