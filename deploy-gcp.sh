#!/bin/bash

# Load local .env into current shell variables
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo "Deploying to Google Cloud Run with build environment variables..."
gcloud run deploy tradiecheck-app --source . \
  --allow-unauthenticated \
  --region=australia-southeast1 \
  --set-build-env-vars="VITE_SUPABASE_URL=${VITE_SUPABASE_URL},VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY},VITE_ENABLE_API_CONFIG=${VITE_ENABLE_API_CONFIG}" \
  --set-env-vars="TRADES_API_KEY=${TRADES_API_KEY},TRADES_API_SECRET=${TRADES_API_SECRET},HRW_API_KEY=${HRW_API_KEY},HRW_API_SECRET=${HRW_API_SECRET},ASBESTOS_API_KEY=${ASBESTOS_API_KEY},ASBESTOS_API_SECRET=${ASBESTOS_API_SECRET}"

echo "Deployment complete!"
