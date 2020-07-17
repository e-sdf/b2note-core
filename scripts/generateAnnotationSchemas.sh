#!/bin/bash

D="src/core"
AF="$D/annotationsModel.ts"
O="--topRef --noExtraProps"

S="annotation.schema.js"
F="$D/$S"
echo "export const annotationSchema = " > $F
typescript-json-schema --id "annotation" $O --required $AF Annotation >> $F

# Schema with optional fields for patch validations
S="annotation.opt.schema.js"
F="$D/$S"
echo "export const annotationOptSchema = " > $F
typescript-json-schema --id "annotationOpt" $O $AF Annotation >> $F

S="getQuery.schema.js"
F=$D/$S
echo "export const getQuerySchema = " > $F
typescript-json-schema --id "getQuery" $O --required $AF GetQuery >> $F

S="targetsQuery.schema.js"
F=$D/$S
echo "export const targetsQuerySchema = " > $F
typescript-json-schema --id "targetsQuery" $O --required $AF TargetsQuery >> $F