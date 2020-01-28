#!/bin/bash

D="app"
PF="$D/profile.ts"
O="--topRef --noExtraProps"

# Schema with optional fields for patch validations
S="userProfileOpt.schema.js"
F="$D/$S"
echo "export const userProfileOptSchema = " > $F
typescript-json-schema --id "userProfileOpt" $O $PF UserProfile >> $F