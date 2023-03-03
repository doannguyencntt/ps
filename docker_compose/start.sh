#!/bin/bash
node server/create-env-json.js
npm run build
node server/server.js
