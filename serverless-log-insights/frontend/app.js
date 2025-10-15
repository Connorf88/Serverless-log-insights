const ingestBtn = document.getElementById('ingestBtn');
const refreshBtn = document.getElementById('refreshBtn');
const csvInput = document.getElementById('csvInput');
const ingestStatus = document.getElementById('ingestStatus');
const refreshStatus = document.getElementById('refreshStatus');
const ctx = document.getElementById('sourceChart').getContext('2d');

let chart;

function showStatus(el, msg, timeout = 3000) {
  el.textContent = msg;
  if (timeout > 0) setTimeout(() => { el.textContent = ''; }, timeout);
}

async function postCsv() {
  const csv = csvInput.value.trim();
  if (!csv) { showStatus(ingestStatus, 'Enter CSV first'); return; }

  try {
    showStatus(ingestStatus, 'Sending...');
    const res = await fetch('/api/Ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv
    });
    if (!res.ok) {
      const text = await res.text();
      showStatus(ingestStatus, 'Error: ' + res.status + ' ' + text, 6000);
      return;
    }
    const data = await res.json();
    showStatus(ingestStatus, `Ingested ${data.ingested} rows`);
    await refreshData();
  } catch (err) {
    showStatus(ingestStatus, 'Network error');
    console.error(err);
  }
}

async function refreshData() {
  try {
    showStatus(refreshStatus, 'Loading...');
    const res = await fetch('/api/Ingest?op=summary');
    if (!res.ok) { showStatus(refreshStatus, 'Failed to fetch'); return; }
    const summary = await res.json();
    const labels = Object.keys(summary.counts || {});
    const values = labels.map(l => summary.counts[l]);

    if (!chart) {
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Log count by source', data: values, backgroundColor: '#4f9aff' }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } }
        }
      });
    } else {
      chart.data.labels = labels;
      chart.data.datasets[0].data = values;
      chart.update();
    }
    showStatus(refreshStatus, 'Updated', 1500);
  } catch (err) {
    showStatus(refreshStatus, 'Error loading', 4000);
    console.error(err);
  }
}

ingestBtn.addEventListener('click', postCsv);
refreshBtn.addEventListener('click', refreshData);
window.addEventListener('load', refreshData);
