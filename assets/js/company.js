// /assets/js/company.js
console.log("📄 company.js loaded");

function renderCompanyReportFromObject(c) {
  const container = document.getElementById("company-report");
  if (!container) return console.warn('No #company-report container found');

  // small helpers:
  const safe = v => (v === undefined || v === null) ? 'N/A' : v;
  const listOrNA = (arr, n=5) => (Array.isArray(arr) && arr.length) ? arr.slice(0,n).map(x => `<li>${x}</li>`).join('') : '<li>N/A</li>';
  const yesno = v => (v && v > 0) ? 'Yes' : 'No';

  document.title = `${c.company} — Ghost Score`;

  container.innerHTML = `
    <div class="card p-4">
      <a href="/" class="btn btn-sm btn-outline-secondary mb-3">&larr; Back</a>
      <h1>${safe(c.company)}</h1>
      <p><a href="${safe(c.website_url)}" target="_blank" rel="noopener">${safe(c.website_url)}</a></p>

      <div class="row text-center mb-4">
        <div class="col-md-4">
          <div class="small text-muted">Ghost Score</div>
          <div class="h3">${safe(c.ghost_score)}</div>
          <div class="text-muted">${safe(c.ghost_score_band)}</div>
        </div>
        <div class="col-md-4">
          <div class="small text-muted">Severity</div>
          <div class="h3">${safe(c.severity_band)}</div>
          <div class="text-muted">Avg severity ${safe(c.avg_severity)}</div>
        </div>
        <div class="col-md-4">
          <div class="small text-muted">Reports</div>
          <div class="h3">${safe(c.reports_count)}</div>
          <div class="text-muted">Effective ${safe(c.effective_reports)}</div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6">
          <p><strong>Top Jobs</strong></p>
          <ul>${listOrNA(c.top_jobs)}</ul>

          <p><strong>Top Locations</strong></p>
          <ul>${listOrNA(c.top_locations)}</ul>

          <p><strong>Ghosting Stages</strong></p>
          <ul>${listOrNA(c.ghosting_stages)}</ul>
        </div>

        <div class="col-md-6">
          <p><strong>Assignment Types</strong></p>
          <ul>${listOrNA(c.assignment_types, 15)}</ul>

          <p><strong>AI Screening reported?</strong> ${yesno(c.ai_screening_pct)}</p>
          <p><strong>Paid assignment?</strong> ${yesno(c.assignment_paid_pct)}</p>

          <p><strong>Average realisation</strong> ${safe(c.avg_realization_time)}</p>
        </div>
      </div>

      <h4>Candidate Experiences</h4>
      ${ (Array.isArray(c.comments) && c.comments.length) ? c.comments.map(cm => `
          <div class="border rounded p-3 mb-2">
            <div class="small text-muted">Anonymous candidate</div>
            <div>${cm}</div>
          </div>`).join('') : '<p class="text-muted">No comments</p>'}
    </div>
  `;
}

// Main loader: prefer embedded window.COMPANY_DATA
(function init() {
  const container = document.getElementById('company-report');
  if (!container) return;

  if (window.COMPANY_DATA) {
    try {
      renderCompanyReportFromObject(window.COMPANY_DATA);
      return;
    } catch (e) {
      console.error('Error rendering embedded company data', e);
    }
  }

  // if no embedded data, fallback to slug param + fetch entire companies.json (rare)
  (async function fallback() {
    try {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('slug');
      if (!slug) {
        container.innerHTML = `<div class="alert alert-danger">No company specified.</div>`;
        return;
      }
      const res = await fetch('/data/companies.json');
      const companies = await res.json();
      const company = companies.find(c => c.slug === slug);
      if (!company) {
        container.innerHTML = `<div class="alert alert-danger">Company not found.</div>`;
        return;
      }
      renderCompanyReportFromObject(company);
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="alert alert-warning">Unable to load company data.</div>`;
    }
  })();
})();
