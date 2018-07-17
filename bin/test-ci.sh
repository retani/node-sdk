#!/bin/sh
# shellcheck shell=dash

#
# Run the tests in a docker environment.
# Add the --update argument to update the docker images before the tests.
# Add the --log CONTAINER option to write container logs to file.
#
# Usage: ./e2e.sh [--update] [--log container1,container2,...]
#

# Normalizes according to docker-compose project naming rules:
normalize() {
  tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g'
}

compose() {
  docker-compose -p "$PROJECT_NAME" "$@"
}

update() {
  echo '--- Updating docker images'
  compose pull > /dev/null
  echo # Newline for better readability
}

startup() {
  echo '--- Starting docker environment'
  compose up -d nginx api
  echo # Newline for better readability
}

log() {
  [ "$#" = 0 ] && return
  mkdir -p "logs/$NOW"
  local container
  for container in "$@"; do
    docker logs -f "$(compose ps -q "$container")" \
      > "logs/$NOW/$container-stdout.log" \
      2> "logs/$NOW/$container-stderr.log" &
  done
}

run_tests() {
  echo '+++ Running tests'
  
  # Must run as root on Buildkite to avoid permission issues.
  # The root user is remapped to the buildkite-agent via userns-remap:
  # https://docs.docker.com/engine/security/userns-remap/
  if [ "$BUILDKITE" = true ]; then
    compose run \
      -v "$PROJECT_DIR/build/node_modules:/srv/www/node_modules" \
      --user root yarntest "$@"
  else
    compose run \
      -v "$PROJECT_DIR/node_modules:/srv/www/node_modules" \
      yarntest "$@"
  fi
}

# Removes images built via docker-compose config:
cleanup_docker_images() {
  printf 'Removing %s image builds ... ' "$PROJECT_NAME"
  # shellcheck disable=SC2046
  docker rmi \
    $(printf "${PROJECT_NAME}_%s\n" $(compose config --services)) \
    >/dev/null 2>&1
  echo 'done'
}

cleanup() {
  local status=$?
  echo # Newline for better readability
  echo '--- Cleaning up'
  compose down -v
  cleanup_docker_images
  exit $status
}

# The project directory:
PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)

# ISO 8601 date:
NOW=$(date '+%Y-%m-%dT%H:%M:%SZ')

# Randomize and normalize the project name:
PROJECT_NAME="$(echo "$(basename "$PROJECT_DIR")_$NOW" | normalize)"

cd "$PROJECT_DIR/test" || exit 1

# Clean up on SIGINT and SIGTERM:
trap 'cleanup' INT TERM


while [ $# -gt 0 ]; do
  case "$1" in
    --update)
      UPDATE_ENABLED=true
      shift
      continue
      ;;
    --log)
      LOG_CONTAINERS=$(echo "$2" | tr , ' ')
      shift 2
      continue
      ;;
    *)
      break
  esac
done

if [ "$UPDATE_ENABLED" = true ]; then
  update
fi

startup

if [ ! -z "$LOG_CONTAINERS" ]; then
  # shellcheck disable=SC2086
  log $LOG_CONTAINERS
fi

run_tests "$@"

cleanup
