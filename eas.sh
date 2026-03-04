#!/usr/bin/env bash
set -euo pipefail

PROFILES=("development" "preview" "production")
PLATFORMS=("android" "ios" "all")

pick() {
  local prompt="$1" default="$2"
  shift 2
  local options=("$@")

  echo "$prompt" >&2
  for i in "${!options[@]}"; do
    local marker=""
    [[ "${options[$i]}" == "$default" ]] && marker=" (default)"
    echo "  $((i + 1))) ${options[$i]}$marker" >&2
  done

  read -rp "> " choice >&2
  if [[ -z "$choice" ]]; then
    echo "$default"
  elif [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= ${#options[@]} )); then
    echo "${options[$((choice - 1))]}"
  else
    echo "$choice"
  fi
}

confirm() {
  local prompt="$1" default="$2"
  local hint="Y/n"
  [[ "$default" == "no" ]] && hint="y/N"
  read -rp "$prompt [$hint] " answer
  answer="${answer:-$default}"
  [[ "$answer" =~ ^[Yy] ]]
}

# Profile
if [[ -n "${1:-}" ]]; then
  PROFILE="$1"
else
  PROFILE=$(pick "Profile?" "production" "${PROFILES[@]}")
fi

# Platform
if [[ -n "${2:-}" ]]; then
  PLATFORM="$2"
else
  PLATFORM=$(pick "Platform?" "android" "${PLATFORMS[@]}")
fi

# Auto-submit (only for production)
AUTO_SUBMIT="no"
if [[ "$PROFILE" == "production" ]]; then
  if [[ -n "${3:-}" ]]; then
    [[ "${3}" =~ ^[Yy] ]] && AUTO_SUBMIT="yes"
  else
    confirm "Auto-submit after build?" "yes" && AUTO_SUBMIT="yes"
  fi
fi

# Build command
CMD="eas build --profile $PROFILE --non-interactive"
if [[ "$PLATFORM" == "all" ]]; then
  CMD="$CMD --platform all"
else
  CMD="$CMD --platform $PLATFORM"
fi
if [[ "$AUTO_SUBMIT" == "yes" ]]; then
  CMD="$CMD --auto-submit"
fi

echo ""
echo "Command: $CMD"
echo ""
read -rp "Press Enter to run (Ctrl+C to cancel)..."
exec $CMD
