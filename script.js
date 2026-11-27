(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- theme ---------- */
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
  else if (matchMedia("(prefers-color-scheme: light)").matches) root.dataset.theme = "light";
  $("#themeToggle").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", root.dataset.theme);
  });

  /* ---------- mobile menu ---------- */
  const nav = $("#nav");
  $("#menuBtn").addEventListener("click", () => nav.classList.toggle("menu-open"));
  $$("#navLinks a").forEach(a => a.addEventListener("click", () => nav.classList.remove("menu-open")));

  /* ---------- scroll: nav state + progress bar ---------- */
  const progress = $("#progress");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 20);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- active nav link ---------- */
  const links = $$("#navLinks a");
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => sectionObs.observe(s));

  /* ---------- reveal on scroll (staggered) ---------- */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const siblings = $$(".reveal", e.target.parentElement);
      const i = Math.max(0, siblings.indexOf(e.target));
      e.target.style.transitionDelay = Math.min(i * 80, 400) + "ms";
      e.target.classList.add("in");
      setTimeout(() => (e.target.style.transitionDelay = ""), 1300);
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => revealObs.observe(el));

  /* ---------- count-up stats ---------- */
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, start = performance.now(), dur = 1400;
      const tick = t => {
        const p = Math.min((t - start) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(el => countObs.observe(el));

  /* ---------- rotating word ---------- */
  const words = ["messy data", "ERP transitions", "survey insights", "ML models", "customer insight"];
  const rot = $("#rotator");
  let wi = 0;
  setInterval(() => {
    rot.classList.add("out");
    setTimeout(() => {
      wi = (wi + 1) % words.length;
      rot.textContent = words[wi];
      rot.classList.remove("out");
    }, 350);
  }, 2600);

  /* ---------- research tabs ---------- */
  $$(".tab").forEach(tab => tab.addEventListener("click", () => {
    $$(".tab").forEach(t => t.classList.toggle("active", t === tab));
    $$(".case").forEach(c => c.classList.toggle("active", c.id === tab.dataset.tab));
  }));

  /* ---------- cursor glow + hero card tilt ---------- */
  const glow = $("#glow");
  const hero = $(".hero");
  const floats = $$(".float-card");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  addEventListener("pointermove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
  /* parallax: floating cards drift with the pointer, each at its own depth */
  if (hero && !reduce) {
    hero.addEventListener("pointermove", e => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      floats.forEach((f, i) => {
        const d = (i % 2 ? -1 : 1) * (10 + i * 6);
        f.style.setProperty("--px", x * d + "px");
        f.style.setProperty("--py", y * d + "px");
      });
    });
    hero.addEventListener("pointerleave", () => floats.forEach(f => { f.style.setProperty("--px", "0px"); f.style.setProperty("--py", "0px"); }));
  }

  /* ---------- copy email ---------- */
  const toast = $("#toast");
  $("#copyEmail").addEventListener("click", async e => {
    try { await navigator.clipboard.writeText(e.currentTarget.dataset.email); } catch {}
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  });

  $("#year").textContent = new Date().getFullYear();
})();
