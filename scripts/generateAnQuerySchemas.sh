#!/bin/bash

D="src/core"
QF="$D/anQueryModel.ts"
O="--topRef"

S="getAnQuery.schema.js"
F=$D/$S
echo "export const getAnQuerySchema = " > $F
typescript-json-schema --id "getAnQuery" $O --required $QF GetAnQuery >> $F

S="anTargetsQuery.schema.js"
F=$D/$S
echo "export const anTargetsQuerySchema = " > $F
typescript-json-schema --id "anTargetsQuery" $O --required $QF AnTargetsQuery >> $F