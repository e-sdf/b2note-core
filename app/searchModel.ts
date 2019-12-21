export enum SearchType { SEMANTIC = "semantic", KEYWORD = "keyword", COMMENT = "comment", REGEX = "regex" };

export enum BiOperatorType { AND = "AND", OR = "OR", XOR = "XOR" }

export enum UnOperatorType { NOT = "NOT" }

export interface BiOperatorExpr {
  operator: BiOperatorType;
  lexpr: Sexpr;
  rexpr: Sexpr;
}

export interface UnOperatorExpr {
  operator: UnOperatorType;
  expr: Sexpr;
}

export interface TagExpr {
  type: SearchType;
  value: string;
  synonymsFlag?: boolean; // Semantically relevant just for SEMANTIC type
}

export type Sexpr = BiOperatorExpr | UnOperatorExpr | TagExpr;

// Queries

export function isTagExpr (sExpr: Sexpr): boolean {
  return (sExpr as TagExpr).type !== undefined;
}

export function isUnaryExpr (sExpr: Sexpr): boolean {
  return (sExpr as UnOperatorExpr).expr !== undefined;
}

export function isBinaryExpr (sExpr: Sexpr): boolean {
  return (sExpr as BiOperatorExpr).lexpr !== undefined;
}
