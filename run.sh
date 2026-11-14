#!/usr/bin/env bash
set -e

# SignalScope: Bun installs and builds the TanStack Start / Nitro app; Node runs it.
# Audit and remaining production risks: docs/CODEBASE_AUDIT.md.
script_path="${BASH_SOURCE[0]}"
case "$script_path" in
  */*) script_directory="${script_path%/*}" ;;
  *) script_directory="." ;;
esac
repo_root=""
default_port=8081

verify_tools() {
  printf '%s\n' 'Checking required tools…'
  local missing=0 tool
  for tool in bun node sleep; do
    if ! command -v "$tool" >/dev/null 2>&1; then
      printf 'Missing required tool: %s\n' "$tool" >&2
      missing=1
    fi
  done
  if (( missing )); then exit 1; fi
}

enter_project() {
  printf '%s\n' 'Locating project…'
  repo_root="$(cd "$script_directory" && pwd -P)"
  cd "$repo_root"
  if [[ ! -f package.json || ! -f bun.lock || ! -f vite.config.ts ]]; then
    printf 'Expected SignalScope project files were not found in %s\n' "$repo_root" >&2
    exit 1
  fi
}

check_environment() {
  printf '%s\n' 'Checking required environment variables…'
  # The current source and configuration have no required runtime variables.
  # PORT is assigned below. No .env.example, .env.sample or .env.template exists.
  local required_variables=() variable missing=0
  for variable in "${required_variables[@]}"; do
    if [[ -z "${!variable:-}" ]]; then
      printf 'Missing required environment variable: %s\n' "$variable" >&2
      missing=1
    fi
  done
  if (( missing )); then exit 1; fi
}

install_dependencies() {
  printf '%s\n' 'Installing project dependencies…'
  # Bun uses this repository's node_modules; repeated installs preserve it.
  bun install --frozen-lockfile --silent
}

port_in_use() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1 &&
    lsof -nP -t -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    return 0
  fi
  # Bash's TCP redirection also catches a listener if process listing is absent.
  ( : >"/dev/tcp/127.0.0.1/$port" ) >/dev/null 2>&1
}

stop_target_port() {
  printf 'Checking existing listener on port %s…\n' "$default_port"
  local pids="" pid line remaining
  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -nP -t -iTCP:"$default_port" -sTCP:LISTEN 2>/dev/null || true)"
  elif command -v ss >/dev/null 2>&1; then
    while IFS= read -r line; do
      remaining="$line"
      while [[ "$remaining" =~ pid=([0-9]+) ]]; do
        pids+=" ${BASH_REMATCH[1]}"
        remaining="${remaining#*pid=${BASH_REMATCH[1]}}"
      done
    done < <(ss -ltnp "( sport = :$default_port )" 2>/dev/null || true)
    if [[ -z "$pids" ]] && command -v fuser >/dev/null 2>&1; then
      pids="$(fuser -n tcp "$default_port" 2>/dev/null || true)"
    fi
  elif command -v fuser >/dev/null 2>&1; then
    pids="$(fuser -n tcp "$default_port" 2>/dev/null || true)"
  else
    printf '%s\n' 'Warning: lsof, ss and fuser are unavailable; skipping process management.' >&2
    return
  fi
  for pid in $pids; do
    [[ "$pid" =~ ^[0-9]+$ ]] || continue
    if [[ "$pid" == "$$" || "$pid" == "$PPID" ]]; then
      printf 'Refusing to stop the launcher process (%s).\n' "$pid" >&2
      continue
    fi
    if kill -9 "$pid" 2>/dev/null; then
      printf 'Stopped process %s on port %s.\n' "$pid" "$default_port"
    else
      printf 'Warning: could not stop process %s on port %s.\n' "$pid" "$default_port" >&2
    fi
  done
  if [[ -n "$pids" ]]; then sleep 0.2; fi
}

select_port() {
  printf '%s\n' 'Selecting an available port…'
  local resolved_port="$default_port"
  while port_in_use "$resolved_port"; do
    ((resolved_port += 1))
    if (( resolved_port > 65535 )); then
      printf 'No available TCP port at or above %s.\n' "$default_port" >&2
      exit 1
    fi
  done
  export PORT="$resolved_port"
  printf 'Using port %s.\n' "$PORT"
}

build_application() {
  printf '%s\n' 'Building application…'
  bun run build
}

launch_application() {
  printf 'Starting SignalScope on port %s…\n' "$PORT"
  exec bun run start
}

main() {
  verify_tools
  enter_project
  check_environment
  install_dependencies
  stop_target_port
  select_port
  build_application
  launch_application
}

main "$@"
