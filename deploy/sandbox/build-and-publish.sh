#!/usr/bin/env bash
#
# Builds the three front ends and publishes them as one app on the NEXUS
# sandbox. See README.md in this directory for what the deployment is and why
# it is shaped this way.
#
#   ./deploy/sandbox/build-and-publish.sh            # build and publish
#   ./deploy/sandbox/build-and-publish.sh --build    # build only, no publish
#
set -euo pipefail

APP_NAME="privacy-portal"
APPS=(complaints account-history admin)

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(cd "${here}/../.." && pwd)"
frontend="${repo}/frontend"
staging="${here}/.staging"

publish=true
if [[ "${1:-}" == "--build" ]]; then
    publish=false
fi

echo "==> Applying sandbox environment overrides"
# Nx reads .env.local ahead of .env.<configuration>, and .env.local is ignored
# by git, so these are generated from the tracked copies rather than edited in
# place. That keeps the committed per-environment files untouched.
for app in "${APPS[@]}"; do
    cp "${here}/env/${app}.env" "${frontend}/apps/${app}/.env.local"
    echo "    apps/${app}/.env.local"
done

echo "==> Installing dependencies"
(cd "${frontend}" && npm install --no-audit --no-fund)

echo "==> Building"
(cd "${frontend}" && npx nx run-many --target=build \
    --projects="$(IFS=,; echo "${APPS[*]}")" \
    --configuration=production --skip-nx-cache)

echo "==> Assembling the site"
# Each app is mounted under its own prefix, matching NX_PUBLIC_BASE_HREF in the
# env files above and the location blocks in nginx.conf.
rm -rf "${staging}"
mkdir -p "${staging}"
cp "${here}/Dockerfile" "${here}/nginx.conf" "${staging}/"
for app in "${APPS[@]}"; do
    mkdir -p "${staging}/site/${app}"
    cp -r "${frontend}/dist/apps/${app}/." "${staging}/site/${app}/"
    echo "    site/${app}"
done

if [[ "${publish}" != true ]]; then
    echo
    echo "Built. Staged at ${staging}"
    echo "To publish:  cd ${staging} && publish-app ${APP_NAME}"
    exit 0
fi

echo "==> Publishing to Cloud Run as ${APP_NAME}"
(cd "${staging}" && /opt/sandbox/bin/publish-app "${APP_NAME}")

cat <<'NOTE'

Remember: a newly published app is unreachable on its sandbox URL until it is
registered on the gateway at https://apps.sandbox.aim.int.gov.ab.ca
NOTE
