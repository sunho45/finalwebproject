#!/bin/sh
set -eu

export PORT="${PORT:-10000}"
export API_PORT="${API_PORT:-4000}"

envsubst '${PORT} ${API_PORT}' < /etc/nginx/templates/render.conf.template > /etc/nginx/http.d/default.conf

npm --prefix server start &
api_pid="$!"

nginx -g 'daemon off;' &
nginx_pid="$!"

trap 'kill "$api_pid" "$nginx_pid" 2>/dev/null || true' INT TERM

while kill -0 "$api_pid" 2>/dev/null && kill -0 "$nginx_pid" 2>/dev/null; do
  sleep 2
done

kill "$api_pid" "$nginx_pid" 2>/dev/null || true
wait
