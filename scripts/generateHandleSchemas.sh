#!/bin/bash

D="src/core"
HF="$D/handleModel.ts"
O="--topRef"

S="handleModel.schema.js"
F="$D/$S"
echo "export const handleRespSchema = " > $F
typescript-json-schema --id "handleResp" $O --required $HF HandleResp >> $F