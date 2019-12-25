import * as peg from "pegjs";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import { SearchType, Sexpr, BiOperatorType, UnOperatorType } from "./searchModel";

export interface ParseError {
  message: string;
  location: number;
}

export interface ParseResult {
  error?: ParseError;
  result?: Sexpr;
}

const grammar = `
start
  = query

query
  = lexpr:expr lwhite:white "${BiOperatorType.AND}"i rwhite:white rexpr:query { return { operator: "${BiOperatorType.AND}", lexpr, rexpr }; }
  / lexpr:expr lwhite:white "${BiOperatorType.OR}"i rwhite:white rexpr:query { return { operator: "${BiOperatorType.OR}", lexpr, rexpr }; }
  / lexpr:expr lwhite:white "${BiOperatorType.XOR}"i rwhite:white rexpr:query { return { operator: "${BiOperatorType.XOR}", lexpr, rexpr }; }
  / lwhite:white "${UnOperatorType.NOT}"i rwhite:white expr:expr { return { operator: "${UnOperatorType.NOT}", expr }; }
  / expr

expr
  = tag 
  / "(" query:query ")" { return query; }

tag
= "s:" value:value synonymsFlag:"+s"? { return { type: "${SearchType.SEMANTIC}", value, ...( synonymsFlag ? { synonymsFlag: true } : { synonymsFlag: false }) }; }
  / "k:" value:value { return { type: "${SearchType.KEYWORD}", value }; }
  / "c:" value:value { return { type: "${SearchType.COMMENT}", value }; }
  / "r:/" value:value "/" { return { type: "${SearchType.REGEX}", value }; }

value
  = val:[a-zA-Z0-9]+ { return val.join(""); }
  / '"' val:[^"]+ '"' { return val.join(""); }

white
  = [  ]*
`;

const parser = peg.generate(grammar);

export function parse(exp: string): ParseResult {
  try {
    const result = parser.parse(exp); 
    //console.log(result);
    return { result };
  } catch(error) {
    //console.log(error);
    return { error: { message: error.message, location: error.location.start.column } };
  }
}

export function type2marker(anType: SearchType): string {
  return matchSwitch(anType, {
    [SearchType.SEMANTIC]: () => "s",
    [SearchType.KEYWORD]: () => "k",
    [SearchType.COMMENT]: () => "c",
    [SearchType.REGEX]: () => "r"
  });
  }
}

