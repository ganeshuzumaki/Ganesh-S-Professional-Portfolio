/* =========================================================
   Site analytics
   ---------------------------------------------------------
   1. Microsoft Clarity  → heatmaps, session recordings,
                           avg. session time, scroll depth
      Get the ID: clarity.microsoft.com → New project →
      Settings → Overview → "Project ID" (e.g. "abcd1234ef")
   2. Google Analytics 4 → visitors, page views, countries,
                           traffic sources, resume downloads
      Get the ID: analytics.google.com → Admin → Data streams
      → Web → "Measurement ID" (looks like "G-XXXXXXXXXX")

   Paste the IDs below. While they are empty, nothing is
   loaded and no data leaves the visitor's browser.
   ========================================================= */
const ANALYTICS = {
  clarityId: "zk6zjornr7",   // Microsoft Clarity project ID
  ga4Id: ""        // e.g. "G-XXXXXXXXXX"
};

(() => {
  // Don't track your own testing on localhost
  const isLocal = ["localhost", "127.0.0.1", ""].includes(location.hostname);
  if (isLocal) return;

  /* ---------- Microsoft Clarity ---------- */
  if (ANALYTICS.clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", ANALYTICS.clarityId);
  }

  /* ---------- Google Analytics 4 ---------- */
  if (ANALYTICS.ga4Id) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + ANALYTICS.ga4Id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", ANALYTICS.ga4Id);
  }

  /* ---------- Custom events ---------- */
  const track = (name, params = {}) => {
    if (window.gtag) gtag("event", name, params);
    if (window.clarity) clarity("event", name);
  };

  document.addEventListener("click", e => {
    const a = e.target.closest("a, button");
    if (!a) return;

    // Resume downloads (every resume button on the page)
    if (a.matches("a[download]") || /Resume\.pdf$/i.test(a.getAttribute("href") || "")) {
      track("resume_download", { link_location: a.dataset.loc || "unknown" });
      return;
    }
    // Contact intent
    if ((a.getAttribute("href") || "").startsWith("mailto:")) return track("email_click");
    if (a.id === "copyEmail") return track("email_copy");
    if (/linkedin\.com/i.test(a.href || "")) return track("linkedin_click");
    // Theme toggle (fun signal of engagement)
    if (a.id === "themeToggle") return track("theme_toggle");
  });

  // Which sections people actually reach
  const seen = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting && !seen.has(en.target.id)) {
        seen.add(en.target.id);
        track("section_view", { section: en.target.id });
      }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll("main section[id]").forEach(s => io.observe(s));
})();
