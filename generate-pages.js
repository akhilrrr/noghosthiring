/** * Run: node scripts/generate.js  */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const COMPANIES_JSON = path.join(ROOT, 'data', 'companies.json');
const PARTIALS_DIR = path.join(ROOT, 'partials');
const HEADER_PARTIAL = path.join(PARTIALS_DIR, 'header.html');
const FOOTER_PARTIAL = path.join(PARTIALS_DIR, 'footer.html');
const OUT_DIR = path.join(ROOT, 'companies');

const LINKS = {
  submitReport: 'https://app.nocodb.com/#/nc/form/aeeada42-f15a-44af-9fea-279bc1501401',
  recordList: '/records.html',
  repReview: '/transparency.html',
};

const REPORT_CSS_HREF = '/assets/css/company-report.css';

const readFile = (p) => fs.readFileSync(p, 'utf8');
const writeFile = (p, s) => fs.writeFileSync(p, s, 'utf8');
const ensureDir = (p) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };

const esc = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const list = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return '<p class="muted">Not reported</p>';
  return `<ul class="list">${arr.map(v => `<li>${esc(v)}</li>`).join('')}</ul>`;
};

const pct = (num) => {
  if (typeof num !== 'number' || Number.isNaN(num)) return '0%';
  return `${Math.max(0, Math.min(100, Math.round(num)))}%`;
};

const paidLabel = (n) => Number(n) > 0 ? 'Paid Assignments Reported' : 'Unpaid / No Paid Assignments Reported';

const statusLabel = (c) => {
  if (Number(c.under_review_reports) > 0) return 'Under Review';
  if (Number(c.moderated_reports) > 0) return 'Moderated';
  return 'Unverified';
};

const scoreClass = (c) => {
  const band = String(c.ghost_score_band || '').toLowerCase();
  if (band === 'high') return 'score-high';
  if (band === 'medium') return 'score-medium';
  if (band === 'low') return 'score-low';
  const s = Number(c.ghost_score || 0);
  if (s >= 700) return 'score-high';
  if (s >= 400) return 'score-medium';
  return 'score-low';
};

const sub = (text) => `<div class="sub">${esc(text)}</div>`;

const headSplit = (headerHtml) => {
  const headMatch = headerHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headBits = headMatch ? headMatch[1] : '';
  const bodyBits = headerHtml.replace(/<head[^>]*>[\s\S]*?<\/head>/i, '').trim();
  return { headBits, bodyBits };
};

const H = (title, subtext) => `
  <h2 class="h">${esc(title)}</h2>
  ${subtext ? sub(subtext) : ''}
`;

const pageTemplate = (c, headBits, headerMarkup, footerMarkup) => {
  const status = statusLabel(c);
  const scoreCSS = scoreClass(c);

return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.company)} — Ghost Score Report</title>
${headBits}
<link rel="stylesheet" href="${REPORT_CSS_HREF}">
<meta name="description" content="Ghost Score report for ${esc(c.company)} showing severity, frequency and candidate experience details.">
<link rel="canonical" href="/companies/${esc(c.slug)}.html">
</head>
<body>
${headerMarkup}
<div class="container">
<div class="row">
<div class="col-md-3"></div>
<div class="col-md-6">
<main class="wrap">
  <article class="card">
    <header class="head">
      <h1 class="title">${esc(c.company)}</h1>
      <div class="meta">
        <a href="${esc(c.website_url)}" target="_blank" rel="noopener" class="link">${esc(c.website_url)}</a>
        <span class="dot">•</span>
        <span class="status ${status === 'Under Review' ? 'st-review' : status === 'Moderated' ? 'st-moderated' : 'st-unverified'}">${status}</span>
      </div>
    </header>

    <section class="grid3">
      <div class="kpi">
        <div class="kpi-label">Ghost Score</div>
        <div class="kpi-value ${scoreCSS}">${esc(c.ghost_score ?? '—')}</div>
        ${sub('Overall ghosting risk on a 0–999 scale; higher means greater likelihood of ghosting.')}
      </div>
      <div class="kpi">
        <div class="kpi-label">Severity Band</div>
        <div class="kpi-value">${esc(c.severity_band ?? '—')}</div>
        ${sub('How strongly ghosting affected reported candidates, grouped into Low, Medium, or High impact.')}
      </div>
      <div class="kpi">
        <div class="kpi-label">Avg Report Score</div>
        <div class="kpi-value">${esc(c.avg_report_score ?? '—')}</div>
        ${sub('Avg. severity rating from all reports (capped at 999), showing how intense experiences were.')}
      </div>
    </section>

    <hr style="border-color: #CCC;" />

    <section class="sec" style="margin-top: 0px;">
      ${H('Reports Overview', 'Counts and processing states for submissions related to this company.')}
      <div class="cols">
        <div>
          <div class="label">Total Reports</div>
          <div class="val">${esc(c.reports_count ?? 0)}</div>
        </div>
        <div>
          <div class="label">Effective</div>
          <div class="val">${esc(c.effective_reports ?? 0)}</div>
        </div>
        <div>
          <div class="label">Moderated</div>
          <div class="val">${esc(c.moderated_reports ?? 0)}</div>
        </div>
        <div>
          <div class="label">Under Review</div>
          <div class="val">${esc(c.under_review_reports ?? 0)}</div>
        </div>
      </div>
    </section>

    <hr style="border-color: #CCC;" />

    <section class="sec" style="margin-top: 0px;">
      ${H('Role & Process Insights', 'What roles, locations and steps candidates commonly reported.')}
      <div class="grid2">
        <div>
          <div class="block">
            <div class="btitle">Top Jobs</div>
            ${list(c.top_jobs)}
          </div>
          <div class="block">
            <div class="btitle">Experience Levels</div>
            ${list(c.top_experience_levels)}
          </div>
          <div class="block">
            <div class="btitle">Top Locations</div>
            ${list(c.top_locations)}
          </div>
          <div class="block">
            <div class="btitle">Recruiters Mentioned</div>
            ${list(c.top_recruiters)}
          </div>
        </div>

        <div>
          <div class="block">
            <div class="btitle">Ghosting Stages</div>
            ${list(c.ghosting_stages)}
          </div>
          <div class="block">
            <div class="btitle">Application Methods</div>
            ${Array.isArray(c.application_methods) && c.application_methods.length
              ? list(c.application_methods)
              : '<p class="muted">Not reported</p>'}
          </div>
          <div class="block">
            <div class="btitle">Assignment Types</div>
            ${list(c.assignment_types)}
          </div>
        </div>
      </div>
    </section>

    <section class="sec sec2">
      ${H('Screening & Evaluation', 'Signals about screening, extra steps, assignments and feedback.')}
      <div class="cols">
        <div style="margin-bottom: 15px;">
          <div class="label">AI Screening Reported</div>
          <div class="val">${pct(c.ai_screening_pct)}</div>
        </div>
        <div style="margin-bottom: 15px;">
          <div class="label">Additional Steps Before Interview</div>
          <div class="val">${pct(c.additional_steps_pct)}</div>
        </div>
        <div style="margin-bottom: 15px;">
          <div class="label">Assignment Paid?</div>
          <div class="val">${esc(paidLabel(c.assignment_paid_pct))}</div>
        </div>
        <div style="margin-bottom: 15px;">
          <div class="label">Avg Assignment Time</div>
          <div class="val">${Array.isArray(c.assignment_time) && c.assignment_time.length ? esc(c.assignment_time.join(', ')) : 'Not reported'}</div>
        </div>
      </div>

      <div class="cols mt8">
        <div style="margin-bottom: 15px;">
          <div class="label">Feedback / Acknowledgement</div>
          <div class="val">
            ${c.feedback_pct
              ? `Detailed: ${pct(c.feedback_pct.Detailed)} · Vague: ${pct(c.feedback_pct.Vague)} · None: ${pct(c.feedback_pct.None)}`
              : 'Not reported'}
          </div>
        </div>
        <div style="margin-bottom: 15px;">
          <div class="label">Avg Realization Time</div>
          <div class="val">${esc(c.avg_realization_time ?? 'Not reported')}</div>
        </div>
        <div style="margin-bottom: 15px;">
          <div class="label">Official Rejection</div>
          <div class="val">${pct(c.official_rejection_pct)}</div>
        </div>
      </div>
    </section>

    <hr style="border-color: #CCC;" />

    <section class="sec">
      ${H('Candidate Experience Notes', 'Direct quotes or comments from candidate submissions (if any).')}
      ${
        Array.isArray(c.comments) && c.comments.length
          ? `<ul class="comments">
  ${c.comments.map(cm => `
    <li><span class="comment-icon">❝</span> <em>${esc(cm)}</em></li>
  `).join('')}
</ul>`
          : '<p class="muted">No candidate comments were included in the recent submissions.</p>'
      }
    </section>

    <section class="sec actions actions-detail">
      <a class="btn btn-submit-report" href="${LINKS.submitReport}" target="_blank" rel="noopener">Submit a Report ↗</a>
      <a class="btn linkish btn-submit-report" href="${LINKS.recordList}">Browse Complete Record ↗</a>
      <a class="btn linkish btn-submit-report" href="${LINKS.repReview}">Are you a Company Representative? ↗</a>
    </section>
  </article>
</main>
</div>
<div class="col-md-3"></div>
</div>
</div>
${footerMarkup}
</body>
</html>`;
};

const notFoundTemplate = (headBits, headerMarkup, footerMarkup) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Not Found — #NoGhosting</title>
${headBits}
<link rel="stylesheet" href="${REPORT_CSS_HREF}">
<meta name="robots" content="noindex">
</head>
<body>
${headerMarkup}
<div class="container">
<div class="row">
<div class="col-md-3"></div>
<div class="col-md-6">
<main class="wrap">
  <article class="card">
    <header class="head">
      <h1 class="title">We couldn’t find that company</h1>
      <div class="meta">Try searching again or browse the full record.</div>
    </header>
    <section class="sec">
      <p class="muted">If you arrived here from a bookmark, the record may have been renamed or removed.</p>
      <div class="actions">
        <a class="btn" href="${LINKS.recordList}">Browse Complete Record</a>
        <a class="btn linkish" href="/">Back to Home</a>
      </div>
    </section>
  </article>
</main>
</div>
<div class="col-md-3"></div>
</div>
</div>
${footerMarkup}
</body>
</html>`;

(async function main() {
  try {
    console.log('• Reading companies.json');
    const companiesRaw = readFile(COMPANIES_JSON);
    let companies = JSON.parse(companiesRaw);

    if (!Array.isArray(companies)) {
      throw new Error('companies.json must be an array of company objects');
    }

    console.log('• Reading header/footer partials');
    const headerHtml = fs.existsSync(HEADER_PARTIAL) ? readFile(HEADER_PARTIAL) : '';
    const footerHtml = fs.existsSync(FOOTER_PARTIAL) ? readFile(FOOTER_PARTIAL) : '';
    const { headBits, bodyBits: headerMarkup } = headSplit(headerHtml);
    const footerMarkup = footerHtml || '';

    ensureDir(OUT_DIR);

    console.log(`• Generating ${companies.length} company pages`);
    let count = 0;

    for (const c of companies) {
      if (!c || !c.slug) continue;
      const outPath = path.join(OUT_DIR, `${c.slug}.html`);
      const html = pageTemplate(c, headBits, headerMarkup, footerMarkup);
      writeFile(outPath, html);
      count++;
    }

    console.log(`• Wrote ${count} pages to /companies`);

    console.log('• Writing 404.html');
    writeFile(path.join(OUT_DIR, '404.html'), notFoundTemplate(headBits, headerMarkup, footerMarkup));

    console.log('✅ Done.');
  } catch (err) {
    console.error('Generation failed:\n', err.stack || err);
    process.exit(1);
  }
})();