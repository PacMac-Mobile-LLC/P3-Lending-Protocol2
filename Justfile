set shell := ["bash", "-cu"]
set dotenv-load := true

bootstrap:
    npm install
    npm --prefix server install
    npm --prefix contracts install
    npx playwright install chromium

dev:
    ./scripts/dev-up.sh

supabase-reset:
    if [ -f supabase/config.toml ]; then supabase db reset; else echo "supabase/config.toml not found; initialize local Supabase first."; fi

supabase-test:
    if [ -f supabase/config.toml ]; then supabase test db; else echo "supabase/config.toml not found; initialize local Supabase first."; fi

test:
    npm run test
    npm --prefix server run test
    npm --prefix contracts test

e2e:
    npm run e2e

e2e-ui:
    npm run e2e-ui

lint:
    npm run lint
    npm --prefix server run build

typecheck:
    npm run typecheck
    npm --prefix server run build

format:
    npm run format

ci:
    npm run lint
    npm --prefix server run build
    npm run test
    npm --prefix server run test
    npm --prefix contracts test
    npm run e2e
