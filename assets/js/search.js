console.log("✅ search.js loaded");

// Utility: wait until element exists in DOM
function waitForElement(selector) {
  return new Promise(resolve => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

(async function initSearch() {
  try {
    // Wait for search form (from header.html)
    const form = await waitForElement("#search-form");
    const input = document.getElementById("search-input");

    console.log("🔎 Search form ready");

    // Load companies.json
    const res = await fetch("data/companies.json");
    if (!res.ok) throw new Error("Failed to load companies.json");
    const companies = await res.json();
    console.log("📦 Companies loaded:", companies.length);

    // Fuse setup
    const fuse = new Fuse(companies, {
      keys: ["company", "aliases"],
      threshold: 0.3
    });

    // Form submit handler
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      const results = fuse.search(query);

      if (results.length > 0) {
        const company = results[0].item;
        console.log("➡️ Redirecting to:", company.slug);

        // ✅ Always keep .html and slug query param
        // window.location.href = `/companies/company-template.html?slug=${company.slug}`;
        window.location.href = `/companies/${company.slug}.html`;

        console.log("➡️ Redirecting to:", targetUrl);
        window.location.href = targetUrl;

      } else {
        console.warn("❌ Company not found:", query);

        // Show inline error message
        let errorBox = document.getElementById("search-error");
        if (!errorBox) {
          errorBox = document.createElement("div");
          errorBox.id = "search-error";
          errorBox.className = "text-danger mt-2";
          form.appendChild(errorBox);
        }
        errorBox.textContent = "Company not found. Try another name.";
      }
    });

  } catch (err) {
    console.error("❌ Search init failed:", err);
  }
})();
