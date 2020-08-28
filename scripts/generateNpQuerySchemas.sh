#!/bin/bash

D="src/core"
QF="$D/npQueryModel.ts"
O="--topRef"

S="getNpQuery.schema.js"
F=$D/$S
echo "export const getNpQuerySchema = " > $F
typescript-json-schema --id "getNpQuery" $O --required $QF GetNpQuery >> $F