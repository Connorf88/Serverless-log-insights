#!/usr/bin/env bash
set -e

# Usage: ./deploy.sh <resourceGroup> <location> <storageName>
resourceGroup="$1"
location="${2:-eastus}"
storageName="$3"

if [ -z "$resourceGroup" ] || [ -z "$storageName" ]; then
  echo "Usage: ./deploy.sh <resourceGroup> <location> <storageName>"
  exit 1
fi

echo "Creating resource group $resourceGroup in $location..."
az group create -n "$resourceGroup" -l "$location"

echo "Creating storage account $storageName..."
az storage account create \
  -n "$storageName" \
  -g "$resourceGroup" \
  -l "$location" \
  --sku Standard_LRS \
  --kind StorageV2

echo "Getting connection string..."
connstr=$(az storage account show-connection-string -n "$storageName" -g "$resourceGroup" -o tsv)
echo "Connection string (export as AZURE_STORAGE_CONNECTION_STRING in your environment or GitHub Secrets):"
echo "$connstr"

echo "Creating table 'LogItems'..."
az storage table create --name LogItems --account-name "$storageName"

echo ""
echo "Next steps:"
echo "1) Export connection string locally:"
echo "   export AZURE_STORAGE_CONNECTION_STRING=\"$connstr\""
echo "2) Set the connection string and TABLE_NAME in Function App settings or GitHub Secrets:"
echo "   AZURE_STORAGE_CONNECTION_STRING"
echo "   TABLE_NAME=LogItems"
echo ""
echo "Do NOT commit the connection string to git."
