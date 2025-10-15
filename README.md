# Serverless-log-insights
Ingest CSV logs, store in Azure Table Storage, visualize in a Static Web App
# Serverless Log Insights

A terminal-first, free-tier Azure project that ingests CSV logs via an HTTP endpoint, stores them in Azure Table Storage, and visualizes them in an Azure Static Web App dashboard. All editing done using nano in the terminal.

Quick highlights
- Frontend: Static HTML + Chart.js served from Azure Static Web Apps
- API: Python Azure Function (HTTP trigger) that ingests CSV and writes to Azure Table Storage
- Infra: az CLI script to create storage account and table
- CI/CD: GitHub Actions workflow for Azure Static Web Apps
- Use GitHub Secrets for connection strings and Static Web Apps token; never commit secrets

Repository layout
- frontend/
  - index.html
  - app.js
  - styles.css
- api/
  - Ingest/__init__.py
  - Ingest/function.json
  - requirements.txt
- infra/
  - deploy.sh
- .github/workflows/
  - azure-static-web-apps.yml
- README.md
- LICENSE

Local quick run
1. Run infra/deploy.sh to create storage account and table and capture the connection string.
2. Set AZURE_STORAGE_CONNECTION_STRING locally for testing and add it to GitHub Secrets for CI.
3. Create an Azure Static Web App in the portal or CLI, connect to this repo, and complete the workflow setup.

License: MIT
