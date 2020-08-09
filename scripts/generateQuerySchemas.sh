#!/bin/bash

D="src/core"
QF="$D/queryModel.ts"
O="--topRef"

S="getQuery.schema.js"
F=$D/$S
echo "export const getQuerySchema = " > $F
typescript-json-schema --id "getQuery" $O --required $QF GetQuery >> $F

S="targetsQuery.schema.js"
F=$D/$S
echo "export const targetsQuerySchema = " > $F
typescript-json-schema --id "targetsQuery" $O --required $QF TargetsQuery >> $F