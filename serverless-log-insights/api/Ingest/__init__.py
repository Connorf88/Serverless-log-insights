import logging
import azure.functions as func
import os
import json
import csv
from io import StringIO
from azure.data.tables import TableServiceClient, UpdateMode
from datetime import datetime

TABLE_NAME = os.getenv("TABLE_NAME", "LogItems")
CONN_STR = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")

def parse_csv(text):
    reader = csv.DictReader(StringIO(text))
    rows = [r for r in reader]
    return rows

def ensure_table_client():
    if not CONN_STR:
        raise ValueError("AZURE_STORAGE_CONNECTION_STRING not set")
    svc = TableServiceClient.from_connection_string(CONN_STR)
    table_client = svc.get_table_client(table_name=TABLE_NAME)
    return table_client

def summarize_table(table_client):
    entities = table_client.list_entities(results_per_page=500)
    counts = {}
    for e in entities:
        src = e.get("PartitionKey", "unknown")
        counts[src] = counts.get(src, 0) + 1
    return counts

def create_entity_for_row(row):
    row_id = row.get("id") or row.get("timestamp") or str(hash(json.dumps(row)))
    partition = row.get("source", "default")
    entity = {
        "PartitionKey": partition,
        "RowKey": str(row_id),
        "raw": json.dumps(row),
        "ingestedAt": datetime.utcnow().isoformat()
    }
    if "message" in row:
        entity["message"] = row.get("message")
    return entity

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Ingest function processed a request.")
    try:
        op = req.params.get('op')
        table_client = ensure_table_client()

        if op == "summary":
            counts = summarize_table(table_client)
            return func.HttpResponse(json.dumps({"counts": counts}), mimetype="application/json", status_code=200)

        body_bytes = req.get_body()
        if not body_bytes:
            return func.HttpResponse("No body provided", status_code=400)

        text = body_bytes.decode('utf-8')
        rows = parse_csv(text)
        inserted = 0
        for r in rows:
            entity = create_entity_for_row(r)
            table_client.upsert_entity(entity, mode=UpdateMode.MERGE)
            inserted += 1

        return func.HttpResponse(json.dumps({"ingested": inserted}), mimetype="application/json", status_code=200)

    except Exception as e:
        logging.exception("Error in Ingest function")
        return func.HttpResponse("internal error", status_code=500)
