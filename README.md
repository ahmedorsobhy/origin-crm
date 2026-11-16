# Origin CRM

React app (units + clients pipeline + reports/attendance) on Supabase, served via GitHub Pages.

- `index.html` + `bundle.js` (repo root): the deployed site.
- `src/src_app.jsx`: full app source (uses `lucide-react`).
- `src/entry.jsx`, `src/icon_shim.jsx`: bundling entry and icon mapping for the deploy build.
- `sql/`: schema and migrations, run in the Supabase SQL editor (schema first, then `add-*.sql` in order of creation).

## Build
Create `src/src_app_deploy.jsx` by replacing the `lucide-react` import with `./icon_shim.jsx`, then:

    sed 's#} from "lucide-react";#} from "./icon_shim.jsx";#' src/src_app.jsx > src/src_app_deploy.jsx
    esbuild src/entry.jsx --bundle --minify --outfile=bundle.js --loader:.jsx=jsx

Needs `react`, `react-dom`, `react-icons` installed.

## Finance module
Deals ("Mark as sold" → approval), commission splits up the manager chain with quarterly target tiers (retroactive within the quarter), cash out, salaries and fixed monthly expenses, treasury accounts and a statement report.

- Run `sql/add-finance-module.sql` once in the Supabase SQL editor (safe to re-run).
- Full finance access: **Admin** and **CEO** roles. Everyone else sees only their own deals, rates, earnings and salary (enforced by Row Level Security), and managers also see their team's deals and target progress.
- Set each person's target, salary and commission chain from Finance → Team plans.
