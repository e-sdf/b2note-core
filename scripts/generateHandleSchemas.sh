#!/bin/bash

D="app"
HF="$D/handleModel.ts"
O="--topRef --noExtraProps"

S="handleModel.schema.js"
F="$D/$S"
echo "export const handleRespSchema = " > $F
typescript-json-schema --id "handleResp" $O --required $HF HandleResp >> $F