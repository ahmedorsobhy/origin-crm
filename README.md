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
