# Serverless Log Insights

Terminal-first Azure free-tier project: ingest CSV logs via HTTP, store in Azure Table Storage, visualize in a Static Web App.

Structure:
- frontend/index.html, frontend/app.js, frontend/styles.css
- api/Ingest/__init__.py, api/Ingest/function.json, api/requirements.txt
- infra/deploy.sh
- .github/workflows/azure-static-web-apps.yml
- LICENSE, README.md

Follow README to deploy. Do not commit secrets.
