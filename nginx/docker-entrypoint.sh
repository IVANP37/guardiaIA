#!/bin/sh
set -e
export OLLAMA_UPSTREAM="${OLLAMA_UPSTREAM:-http://host.docker.internal:11434}"
export OLLAMA_UPSTREAM="${OLLAMA_UPSTREAM%/}"
envsubst '${OLLAMA_UPSTREAM}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
