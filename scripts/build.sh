#!/bin/bash
# Builds bundle.js and stamps a build id so phones pick up new versions by themselves.
set -e
cd "$(dirname "$0")/.."
BUILD_ID=$(date -u +%Y%m%d%H%M%S)
cat src/src_app.jsx src/team_ops.jsx | sed 's#} from "lucide-react";#} from "./icon_shim.jsx";#' > src/src_app_deploy.jsx
NODE_PATH=${NODE_PATH:-/opt/npm-tools/node_modules} ${ESBUILD:-/opt/npm-tools/node_modules/.bin/esbuild} src/entry.jsx --bundle --minify --outfile=bundle.js --loader:.jsx=jsx "--define:__BUILD_ID__=\"$BUILD_ID\""
rm -f src/src_app_deploy.jsx
sed -i -E "s#<script src=\"bundle.js[^\"]*\"></script>#<script src=\"bundle.js?v=$BUILD_ID\"></script>#" index.html
echo "{\"v\":\"$BUILD_ID\"}" > version.json
echo "built $BUILD_ID"
