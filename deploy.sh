#!/usr/bin/env bash
#
# Manual production deploy for the conversion-pulse dashboard.
#
# Same shape as the backend: cross-build linux/amd64, ship the tarball over SSH,
# import into the k3s containerd, apply the production overlay, wait for the
# rollout. No registry.
#
set -euo pipefail

VPS="${VPS:-conversion-pulse-prod}"  # SSH alias do host k3s (configure em ~/.ssh/config)
IMAGE="conversion-pulse/web"
SHA="$(git rev-parse --short HEAD)"
TAR="/tmp/conversion-pulse-web.tar.gz"
REMOTE_DIR="/opt/conversion-pulse-web"
NODE_PORT="30984"
SMOKE_URL="http://localhost:${NODE_PORT}/overview"

if [ -n "$(git status --porcelain)" ]; then
  echo "!! working tree is dirty — commit or stash before deploying" >&2
  exit 1
fi

echo "==> Building ${IMAGE}:${SHA} (linux/amd64)"
docker buildx build --platform linux/amd64 --load -t "${IMAGE}:${SHA}" .

echo "==> Saving + compressing image"
docker save "${IMAGE}:${SHA}" | gzip > "${TAR}"

echo "==> Uploading image + manifests to ${VPS}"
ssh "${VPS}" "mkdir -p ${REMOTE_DIR}/images ${REMOTE_DIR}/infra/k8s"
scp -q "${TAR}" "${VPS}:${REMOTE_DIR}/images/conversion-pulse-web.tar.gz"
rsync -az --delete infra/k8s/ "${VPS}:${REMOTE_DIR}/infra/k8s/"
rm -f "${TAR}"

echo "==> Deploying on k3s"
ssh -o ServerAliveInterval=30 -o ServerAliveCountMax=20 "${VPS}" "GIT_SHA='${SHA}' bash -s" <<'EOF'
set -euo pipefail
previous="$(kubectl -n conversion-pulse get deploy cpulse-web -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || true)"

gunzip -c /opt/conversion-pulse-web/images/conversion-pulse-web.tar.gz | k3s ctr images import -
rm -f /opt/conversion-pulse-web/images/conversion-pulse-web.tar.gz

cd /opt/conversion-pulse-web
sed -i -E "s|newTag: \"[^\"]+\"|newTag: \"${GIT_SHA}\"|" infra/k8s/overlays/production/kustomization.yaml
kubectl apply -k infra/k8s/overlays/production/
kubectl -n conversion-pulse rollout status deployment/cpulse-web --timeout=300s

if [ -n "${previous}" ] && [ "${previous}" != "conversion-pulse/web:${GIT_SHA}" ]; then
  k3s ctr images rm "docker.io/${previous}" >/dev/null 2>&1 || true
fi
EOF

echo "==> Smoke test ${SMOKE_URL}"
for i in 1 2 3 4 5 6; do
  STATUS="$(ssh "${VPS}" "curl -s -o /dev/null -w '%{http_code}' ${SMOKE_URL}" || true)"
  echo "    attempt ${i}: HTTP ${STATUS}"
  if [ "${STATUS}" = "200" ]; then
    echo "==> Deploy OK (${IMAGE}:${SHA})"
    exit 0
  fi
  sleep 10
done

echo "!! Smoke test failed — rolling back" >&2
ssh "${VPS}" bash -s <<'ROLLBACK'
set -e
kubectl -n conversion-pulse rollout undo deployment/cpulse-web
kubectl -n conversion-pulse rollout status deployment/cpulse-web --timeout=180s
ROLLBACK
exit 1
