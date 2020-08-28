#!/bin/bash

D="src/core"
AF="$D/nanopubModel.ts"
O="--topRef --noExtraProps"

S="nanopub.schema.js"
F="$D/$S"
echo "export const nanopubSchema = " > $F
typescript-json-schema --id "nanopub" $O --required $AF Nanopub >> $F

# Schema with optional fields for patch validations
S="nanopub.opt.schema.js"
F="$D/$S"
echo "export const nanopubOptSchema = " > $F
typescript-json-schema --id :q!"nanopubOpt" $O $AF Nanopub >> $F
