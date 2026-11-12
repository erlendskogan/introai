/* ============================================================
   TDT4136 – Interaktivt kurs. Felles JavaScript.
   Bygger topbar, innholdsfortegnelse, margbegreper, quizer,
   regneoppgaver, refleksjonsfelt, steppere og fremdrift.
   ============================================================ */
(function () {
  "use strict";

  const MODULES = [
    { id: "m01", file: "m01-agenter.html", title: "Intro og intelligente agenter", ch: "Kap. 1–2", desc: "Hva er KI, rasjonelle agenter, PEAS, egenskaper ved omgivelser og agenttyper." },
    { id: "m02", file: "m02-uinformert-sok.html", title: "Problemløsning ved søk: uinformert søk", ch: "Kap. 3.1–3.4", desc: "Problemformulering, søketrær, BFS, DFS, IDS, UCS og hvordan man sammenligner algoritmer." },
    { id: "m03", file: "m03-informert-sok.html", title: "Informert søk: Greedy, A* og heuristikker", ch: "Kap. 3.5–3.6", desc: "Heuristikker, greedy best-first, A*, admissibilitet, konsistens og dominans." },
    { id: "m04", file: "m04-lokalt-sok.html", title: "Lokalt søk og komplekse omgivelser", ch: "Kap. 4", desc: "Hill-climbing, simulated annealing, genetiske algoritmer, AND-OR-søk, belief states og online søk." },
    { id: "m05", file: "m05-csp.html", title: "Constraint Satisfaction Problems (CSP)", ch: "Kap. 5", desc: "Variabler, domener, skranker, AC-3, backtracking, MRV/LCV, forward checking og tre-strukturerte CSP-er." },
    { id: "m06", file: "m06-adversarialt-sok.html", title: "Adversarialt søk og spill", ch: "Kap. 6", desc: "Spilltrær, minimax, alfa-beta-beskjæring, evalueringsfunksjoner, cutoff og MCTS." },
    { id: "m07", file: "m07-utsagnslogikk.html", title: "Utsagnslogikk", ch: "Kap. 7", desc: "Syntaks, semantikk, modeller, entailment, CNF, resolusjon, Horn-klausuler og forward/backward chaining." },
    { id: "m08", file: "m08-forsteordens-logikk.html", title: "Førsteordens logikk (FOL)", ch: "Kap. 8", desc: "Objekter, relasjoner, funksjoner, kvantorer og å oversette norsk/engelsk til FOL." },
    { id: "m09", file: "m09-fol-inferens.html", title: "Inferens i førsteordens logikk", ch: "Kap. 9", desc: "Unifisering, Generalized Modus Ponens, forward/backward chaining, skolemisering og resolusjon." },
    { id: "m11", file: "m11-nlp.html", title: "Naturlig språkbehandling (NLP)", ch: "Kap. 24", desc: "Språkmodeller, n-gram og glatting, ordklassetagging med HMM, PCFG, top-down/bottom-up og CYK-parsing, og NLP-oppgaver." },
    { id: "m12", file: "m12-spillteori.html", title: "Spillteori", ch: "Kap. 17.2", desc: "Utbyttematriser, dominerte strategier, Nash-likevekt (rene og blandede), Pareto-optimalitet, sosial velferd og gjentatte spill." },
    { id: "m10", file: "m10-eksamenstrening.html", title: "Eksamenstrening", ch: "Tidligere eksamener", desc: "Eksamensoppgaver fra 2015–2025 på pensum dekket så langt, med fullstendige løsningsforslag. Spillteori- og NLP-oppgavene ligger i modul 11–12." }
  ];
  window.COURSE_MODULES = MODULES;

  const LS = {
    get(k, d) { try { const v = localStorage.getItem("tdt4136:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("tdt4136:" + k, JSON.stringify(v)); } catch (e) {} }
  };
  window.CourseStore = LS;

  const moduleId = document.body.dataset.module || null;
  // Innebygd i alt.html (alle moduler på én side)
  const EMBED = /[?&]embed=1\b/.test(location.search) && window.parent !== window;
  if (EMBED) document.documentElement.classList.add("embedded");
  const mod = MODULES.find(m => m.id === moduleId);
  const pageKey = moduleId || location.pathname.split("/").pop();

  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (const kid of kids) if (kid != null) e.append(kid);
    return e;
  }

  function slug(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  }

  /* ---------------- Topbar ---------------- */
  function buildTopbar() {
    if (EMBED) return;
    const bar = el("div", { class: "topbar" },
      el("a", { class: "home", href: "index.html" }, "TDT4136 · KI-kurs"),
      mod ? el("span", { style: "color:var(--muted)" }, `${mod.id.replace("m", "Modul ")} — ${mod.title}`) : null,
      el("span", { class: "spacer" }),
      el("a", { href: "alt.html" + (mod ? "#" + mod.id : "") }, "Alt på én side"),
      el("a", { href: "ordliste.html" }, "Ordliste"),
      mod ? el("div", { class: "progress-wrap" }, el("div", { class: "progress-bar" })) : null,
      mod ? el("span", { class: "progress-label" }, "0 %") : null
    );
    document.body.prepend(bar);
  }

  /* ---------------- Seksjoner, TOC og fremdrift ---------------- */
  let sections = [];
  function buildSections() {
    const main = document.querySelector("main");
    if (!main) return;
    sections = [...main.querySelectorAll("h2")];
    sections.forEach((h, i) => { if (!h.id) h.id = slug(h.textContent) || "sek-" + i; });
    const toc = document.querySelector("nav.toc");
    if (toc) {
      toc.innerHTML = "";
      toc.append(el("h4", null, "Innhold"));
      const ol = el("ol");
      sections.forEach(h => ol.append(el("li", null, el("a", { href: "#" + h.id, "data-target": h.id }, h.textContent))));
      toc.append(ol);
    }
    if (!mod) return;
    // "Marker som fullført"-knapp på slutten av hver seksjon
    sections.forEach((h, i) => {
      const next = sections[i + 1];
      const btn = el("button", { class: "secondary" }, "Marker seksjonen som fullført");
      const wrap = el("div", { class: "section-done" }, btn);
      const done = () => LS.get(`${pageKey}:done`, {})[h.id];
      const render = () => {
        btn.textContent = done() ? "✓ Fullført" : "Marker seksjonen som fullført";
        btn.classList.toggle("is-done", !!done());
        btn.classList.toggle("secondary", !done());
      };
      btn.addEventListener("click", () => {
        const d = LS.get(`${pageKey}:done`, {});
        d[h.id] = !d[h.id]; LS.set(`${pageKey}:done`, d);
        render(); updateProgress();
      });
      render();
      if (next) next.before(wrap); else main.querySelector(".module-nav") ? main.querySelector(".module-nav").before(wrap) : main.append(wrap);
    });
    updateProgress();
  }
  function updateProgress() {
    if (!mod) return;
    const d = LS.get(`${pageKey}:done`, {});
    const n = sections.filter(h => d[h.id]).length;
    const pct = sections.length ? Math.round(100 * n / sections.length) : 0;
    LS.set(`${pageKey}:pct`, pct);
    if (EMBED) window.parent.postMessage({ type: "course:pct", id: moduleId, pct }, "*");
    const bar = document.querySelector(".progress-bar"); if (bar) bar.style.width = pct + "%";
    const lab = document.querySelector(".progress-label"); if (lab) lab.textContent = pct + " %";
    document.querySelectorAll("nav.toc a").forEach(a => a.classList.toggle("done", !!d[a.dataset.target]));
  }
  function trackActive() {
    const links = [...document.querySelectorAll("nav.toc a")];
    if (!links.length) return;
    const onScroll = () => {
      let cur = sections[0];
      for (const h of sections) if (h.getBoundingClientRect().top < 140) cur = h;
      links.forEach(a => a.classList.toggle("active", cur && a.dataset.target === cur.id));
    };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  /* ---------------- Modulnavigasjon ---------------- */
  function buildModuleNav() {
    if (!mod || EMBED) return;
    const main = document.querySelector("main");
    const i = MODULES.indexOf(mod);
    const nav = el("div", { class: "module-nav" });
    if (i > 0) nav.append(el("a", { href: MODULES[i - 1].file, class: "prev", html: `<small>← Forrige</small>${MODULES[i - 1].title}` }));
    else nav.append(el("a", { href: "index.html", class: "prev", html: `<small>← Tilbake</small>Forsiden` }));
    if (i < MODULES.length - 1) nav.append(el("a", { href: MODULES[i + 1].file, class: "next", html: `<small>Neste →</small>${MODULES[i + 1].title}` }));
    else nav.append(el("a", { href: "ordliste.html", class: "next", html: `<small>Neste →</small>Ordliste` }));
    main.append(nav);
  }

  /* ---------------- Margbegreper ----------------
     <span class="term" data-en="frontier">grensen<span class="def">Forklaring …</span></span>
     Valgfritt: data-title="Visningsnavn" (ellers brukes teksten i spennet).
     Fri margnote: <span class="aside" data-title="Tips">tekst</span>
  */
  const notes = [];
  function buildSidenotes() {
    const margin = document.querySelector("aside.margin");
    const items = [...document.querySelectorAll("main .term, main .aside")];
    items.forEach((t, idx) => {
      const isTerm = t.classList.contains("term");
      if (!isTerm) {
        // .aside er skjult; bruk et tomt, synlig anker på samme sted
        const anchor = el("span", { class: "aside-anchor" });
        t.before(anchor);
        const html = `${t.dataset.title ? `<b class="t">${t.dataset.title}</b>` : ""}${t.innerHTML}`;
        if (margin) { const n = el("div", { class: "sidenote custom", html }); margin.append(n); notes.push({ anchor, note: n }); }
        else { t.style.display = "block"; }
        return;
      }
      const defEl = isTerm ? t.querySelector(".def") : t;
      if (!defEl) return;
      const title = t.dataset.title || (isTerm ? [...t.childNodes].filter(n => !(n.nodeType === 1 && n.classList.contains("def"))).map(n => n.textContent).join("").trim() : "");
      const en = t.dataset.en || "";
      const html = `${title ? `<b class="t">${title}</b>` : ""}${en ? `<span class="en">eng: ${en}</span><br>` : ""}${defEl.innerHTML}`;
      t.dataset.noteIdx = idx;
      if (margin) {
        const n = el("div", { class: "sidenote" + (isTerm ? "" : " custom"), html });
        margin.append(n);
        notes.push({ anchor: t, note: n });
      }
      if (isTerm) {
        t.setAttribute("tabindex", "0");
        t.addEventListener("click", ev => {
          ev.stopPropagation();
          const vis = margin && getComputedStyle(margin).display !== "none";
          const pair = notes.find(p => p.anchor === t);
          if (vis && pair && pair.note.offsetParent) {
            pair.note.classList.add("flash"); t.classList.add("flash");
            setTimeout(() => { pair.note.classList.remove("flash"); t.classList.remove("flash"); }, 1200);
          } else showPop(t, html);
        });
      }
    });
    layoutSidenotes();
    window.addEventListener("resize", layoutSidenotes);
    document.addEventListener("toggle", layoutSidenotes, true);
    const mainEl = document.querySelector("main");
    if (window.ResizeObserver && mainEl) new ResizeObserver(() => layoutSidenotes()).observe(mainEl);
  }
  function layoutSidenotes() {
    const margin = document.querySelector("aside.margin");
    if (!margin || getComputedStyle(margin).display === "none") return;
    const base = margin.getBoundingClientRect().top + window.scrollY;
    let bottom = 0;
    for (const { anchor, note } of notes) {
      // skjulte anker (f.eks. i lukket <details>) -> skjul notatet
      if (!anchor.offsetParent) { note.style.display = "none"; continue; }
      note.style.display = "";
      const top = anchor.getBoundingClientRect().top + window.scrollY - base - 4;
      const y = Math.max(top, bottom + 8);
      note.style.top = y + "px";
      bottom = y + note.offsetHeight;
    }
    margin.style.minHeight = bottom + "px";
  }
  let pop = null;
  function showPop(t, html) {
    if (pop) pop.remove();
    pop = el("div", { class: "term-pop", html });
    document.body.append(pop);
    const r = t.getBoundingClientRect();
    const left = Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - 340);
    pop.style.left = Math.max(8, left) + "px";
    pop.style.top = (window.scrollY + r.bottom + 6) + "px";
  }
  document.addEventListener("click", () => { if (pop) { pop.remove(); pop = null; } });

  /* ---------------- Quiz (flervalg) ----------------
     <div class="quiz" data-answer="b">          (flere riktige: data-answer="a,c")
       <p class="q">Spørsmål</p>
       <ul class="opts"><li>…</li><li data-why="Hvorfor feil">…</li>…</ul>
       <div class="feedback">Forklaring som vises når riktig svar er funnet.</div>
     </div>
  */
  function buildQuizzes() {
    document.querySelectorAll(".quiz").forEach((q, qi) => {
      const answers = (q.dataset.answer || "").split(",").map(s => s.trim().toLowerCase());
      const lis = [...q.querySelectorAll("ul.opts > li")];
      let fb = q.querySelector(".feedback");
      if (!fb) { fb = el("div", { class: "feedback" }); q.append(fb); }
      const fbOrig = fb.innerHTML;
      let tries = 0; const found = new Set();
      lis.forEach((li, i) => {
        const letter = String.fromCharCode(97 + i);
        li.dataset.letter = letter.toUpperCase();
        li.addEventListener("click", () => {
          if (q.classList.contains("answered") || li.classList.contains("wrong") || li.classList.contains("correct")) return;
          tries++;
          if (answers.includes(letter)) {
            li.classList.add("correct"); found.add(letter);
            if (found.size === answers.length) {
              q.classList.add("answered");
              fb.innerHTML = `<span class="verdict" style="color:var(--good)">${tries === answers.length ? "Riktig på første forsøk!" : "Riktig."}</span> ${fbOrig}`;
              LS.set(`${pageKey}:quiz:${qi}`, tries === answers.length ? 1 : 0);
              q.append(retryBtn());
            } else {
              fb.style.display = "block";
              fb.innerHTML = `<span class="verdict" style="color:var(--good)">Riktig!</span> Det finnes flere riktige alternativer – fortsett.`;
            }
          } else {
            li.classList.add("wrong");
            fb.style.display = "block";
            fb.innerHTML = `<span class="verdict" style="color:var(--bad)">Ikke helt.</span> ${li.dataset.why || "Prøv igjen."}`;
          }
        });
      });
      function retryBtn() {
        return el("button", { class: "secondary retry", onclick: (e) => {
          e.target.remove(); tries = 0; found.clear();
          q.classList.remove("answered"); fb.style.display = ""; fb.innerHTML = fbOrig;
          lis.forEach(l => l.classList.remove("correct", "wrong"));
        } }, "Prøv på nytt");
      }
    });
  }

  /* ---------------- Regne-/kortsvar ----------------
     <div class="check" data-answer="9" data-mode="number|text|set|seq" data-alt="ni|nine">
       <p class="q">Spørsmål</p>
       <div class="explain">Løsning/forklaring</div>
     </div>
     number: tallsammenligning (toleranse data-tol, default 1e-6)
     text:   case-insensitivt, ignorerer mellomrom
     set:    kommaseparerte elementer, rekkefølge uviktig
     seq:    elementer separert med komma/mellomrom/pil, rekkefølge viktig
  */
  function norm(s) { return s.toLowerCase().replace(/\s+/g, "").replace(/[{}\[\]()]/g, ""); }
  function tokens(s) { return s.toLowerCase().split(/[\s,;→>\-]+/).map(x => x.replace(/[{}\[\]()]/g, "")).filter(Boolean); }
  function buildChecks() {
    document.querySelectorAll(".check").forEach(c => {
      const mode = c.dataset.mode || "text";
      const accepted = [c.dataset.answer, ...(c.dataset.alt ? c.dataset.alt.split("|") : [])].filter(x => x != null);
      const input = el("input", { type: "text", placeholder: c.dataset.placeholder || "Ditt svar" });
      const res = el("span", { class: "result" });
      const test = () => {
        const v = input.value;
        let ok = false;
        for (const a of accepted) {
          if (mode === "number") { const tol = parseFloat(c.dataset.tol || "1e-6"); ok = ok || Math.abs(parseFloat(v.replace(",", ".")) - parseFloat(a)) <= tol; }
          else if (mode === "set") { const A = tokens(a).sort().join(","), B = tokens(v).sort().join(","); ok = ok || A === B; }
          else if (mode === "seq") { ok = ok || tokens(a).join(",") === tokens(v).join(","); }
          else ok = ok || norm(a) === norm(v);
        }
        res.textContent = ok ? "✓ Riktig!" : "✗ Ikke riktig – prøv igjen eller se løsningen.";
        res.className = "result " + (ok ? "ok" : "no");
        if (ok) c.classList.add("revealed");
        layoutSidenotes();
      };
      input.addEventListener("keydown", e => { if (e.key === "Enter") test(); });
      const row = el("div", { class: "row" }, input,
        el("button", { onclick: test }, "Sjekk"),
        el("button", { class: "secondary", onclick: () => { c.classList.add("revealed"); layoutSidenotes(); } }, "Vis løsning"),
        res);
      const ex = c.querySelector(".explain");
      if (ex) ex.before(row); else c.append(row);
    });
  }

  /* ---------------- Refleksjon ----------------
     <div class="reflect"><p class="q">Spørsmål</p>
       <details><summary>Vis et forslag</summary>Forslag til svar</details></div>
  */
  function buildReflections() {
    document.querySelectorAll(".reflect").forEach((r, i) => {
      const key = `${pageKey}:reflect:${i}`;
      const ta = el("textarea", { placeholder: "Skriv tankene dine her før du ser på forslaget. Det lagres automatisk i nettleseren." });
      ta.value = LS.get(key, "");
      const saved = el("div", { class: "saved" }, ta.value ? "Lagret." : "");
      let t; ta.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { LS.set(key, ta.value); saved.textContent = "Lagret."; }, 400); });
      const d = r.querySelector("details");
      if (d) d.before(ta, saved); else r.append(ta, saved);
    });
  }

  /* ---------------- Oppgaver ----------------
     <div class="exercise" data-title="Oppgave 1: A* på graf" data-meta="Eksamen 2025 · 12 p">
       … oppgavetekst …
       <details class="hint"><summary>Hint</summary>…</details>
       <details class="solution"><summary>Vis løsningsforslag</summary>…</details>
     </div>
  */
  function buildExercises() {
    document.querySelectorAll(".exercise").forEach((x, i) => {
      if (x.dataset.title || x.dataset.meta) {
        x.prepend(el("div", { class: "ex-head" },
          el("span", { class: "ex-title" }, x.dataset.title || "Oppgave"),
          el("span", { class: "ex-meta" }, x.dataset.meta || "")));
      }
      const key = `${pageKey}:ex:${i}`;
      const cb = el("input", { type: "checkbox" });
      cb.checked = !!LS.get(key, false);
      cb.addEventListener("change", () => LS.set(key, cb.checked));
      x.append(el("label", { class: "done-toggle" }, cb, "Jeg har løst denne selv (på papir) før jeg så på løsningen"));
    });
  }

  /* ---------------- Stepper ----------------
     <div class="stepper"><div class="step">Steg 1 …</div><div class="step">Steg 2 …</div></div>
     Valgfritt: data-label="Steg" (tekst i telleren)
  */
  function buildSteppers() {
    document.querySelectorAll(".stepper").forEach(s => {
      const steps = [...s.querySelectorAll(":scope > .step")];
      if (!steps.length) return;
      let i = 0;
      const count = el("span", { class: "count" });
      const prev = el("button", { class: "secondary" }, "← Forrige");
      const next = el("button", null, "Neste →");
      const reset = el("button", { class: "secondary" }, "Start på nytt");
      const show = () => {
        steps.forEach((st, j) => st.classList.toggle("active", j === i));
        prev.disabled = i === 0; next.disabled = i === steps.length - 1;
        count.textContent = `${s.dataset.label || "Steg"} ${i + 1} / ${steps.length}`;
        layoutSidenotes();
      };
      prev.onclick = () => { if (i > 0) { i--; show(); } };
      next.onclick = () => { if (i < steps.length - 1) { i++; show(); } };
      reset.onclick = () => { i = 0; show(); };
      s.append(el("div", { class: "controls" }, prev, next, reset, count));
      show();
    });
  }

  /* ============================================================
     CourseKit – hjelpefunksjoner for interaktive figurer
     ============================================================ */
  const SVGNS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (k === "text") e.textContent = v; else e.setAttribute(k, v);
    }
    if (parent) parent.append(e);
    return e;
  }

  /**
   * Tegner en graf i et <svg>-element.
   * CourseKit.graph(svgEl, {
   *   nodes: { S:[x,y], A:[x,y], ... },
   *   edges: [["S","A",3], ["A","G",2], ...],   // vekt valgfri
   *   directed: false, r: 18,
   *   nodeLabels: { S: "h=7" }                  // ekstra tekst under noden (valgfritt)
   * })
   * Returnerer { node(id, cls), edge(a,b,cls), label(id, text), reset() }
   * cls er en av: node, node-hl, node-good, node-bad, node-warn / edge, edge-hl, edge-good, edge-bad
   */
  function graph(root, spec) {
    const r = spec.r || 18;
    root.innerHTML = "";
    if (spec.directed) {
      const defs = svg("defs", null, root);
      const m = svg("marker", { id: "arrow-" + Math.random().toString(36).slice(2), viewBox: "0 0 10 10", refX: 10, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
      svg("path", { d: "M0,0 L10,5 L0,10 z", class: "fill-muted" }, m);
      spec._marker = m.id;
    }
    const gE = svg("g", null, root), gN = svg("g", null, root);
    const E = {}, N = {}, L = {};
    for (const [a, b, w] of spec.edges) {
      const [x1, y1] = spec.nodes[a], [x2, y2] = spec.nodes[b];
      const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
      const line = svg("line", { x1: x1 + dx / d * r, y1: y1 + dy / d * r, x2: x2 - dx / d * r, y2: y2 - dy / d * r, class: "edge" }, gE);
      if (spec._marker) line.setAttribute("marker-end", `url(#${spec._marker})`);
      E[a + "|" + b] = line; if (!spec.directed) E[b + "|" + a] = line;
      if (w !== undefined && w !== null) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const ox = -dy / d * 11, oy = dx / d * 11;
        svg("text", { x: mx + ox, y: my + oy + 4, "text-anchor": "middle", class: "small", text: String(w) }, gE);
      }
    }
    for (const [id, [x, y]] of Object.entries(spec.nodes)) {
      const c = svg("circle", { cx: x, cy: y, r, class: "node" }, gN);
      svg("text", { x, y: y + 5, "text-anchor": "middle", class: "label", text: id }, gN);
      N[id] = c;
      const extra = spec.nodeLabels && spec.nodeLabels[id];
      L[id] = svg("text", { x, y: y + r + 14, "text-anchor": "middle", class: "small", text: extra || "" }, gN);
    }
    return {
      node(id, cls) { if (N[id]) N[id].setAttribute("class", cls || "node"); },
      edge(a, b, cls) { const e = E[a + "|" + b]; if (e) e.setAttribute("class", cls || "edge"); },
      label(id, text) { if (L[id]) L[id].textContent = text; },
      reset() { Object.values(N).forEach(c => c.setAttribute("class", "node")); Object.values(E).forEach(e => e.setAttribute("class", "edge")); for (const id in L) L[id].textContent = (spec.nodeLabels && spec.nodeLabels[id]) || ""; }
    };
  }

  /** Enkel prioritetskø (min-heap via sortering, holder for små eksempler). */
  function PQ(cmp) { const a = []; return { push(x) { a.push(x); a.sort(cmp); }, pop() { return a.shift(); }, get size() { return a.length; }, items() { return a.slice(); } }; }

  window.CourseKit = { el, svg, graph, PQ, relayout: () => layoutSidenotes(), store: LS };

  /* ---------------- Innebygd modus (alt.html) ---------------- */
  function setupEmbed() {
    if (!EMBED) return;
    const post = msg => window.parent.postMessage(Object.assign({ id: moduleId }, msg), "*");
    const topOf = e => e.getBoundingClientRect().top + window.scrollY;
    // setTimeout (ikke rAF): rAF strupes i iframes utenfor skjermen
    let tmr = 0;
    const report = () => {
      clearTimeout(tmr);
      tmr = setTimeout(() => post({
        type: "course:size",
        h: Math.ceil(document.documentElement.scrollHeight),
        sections: sections.map(h => ({ id: h.id, text: h.textContent, top: Math.round(topOf(h)) }))
      }), 30);
    };
    new ResizeObserver(report).observe(document.body);
    window.addEventListener("load", () => setTimeout(report, 50));
    report();
    const files = new Set(MODULES.map(m => m.file));
    document.addEventListener("click", ev => {
      const a = ev.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (href.startsWith("#")) {
        const t = document.getElementById(decodeURIComponent(href.slice(1)));
        if (t) { ev.preventDefault(); post({ type: "course:scroll", top: Math.round(topOf(t)) }); }
        return;
      }
      const [file, hash] = href.split("#");
      if (files.has(file)) {
        ev.preventDefault();
        const m = MODULES.find(x => x.file === file);
        post({ type: "course:goto", target: m.id, hash: hash || "" });
      } else if (!a.target) a.target = "_top";
    }, true);
    window.addEventListener("message", ev => {
      const d = ev.data || {};
      if (d.type === "course:locate") {
        const t = document.getElementById(d.hash);
        post({ type: "course:scroll", top: t ? Math.round(topOf(t)) : 0 });
      }
    });
  }

  /* ---------------- Init ---------------- */
  function init() {
    if ("shell" in document.body.dataset) return; // alt.html bruker bare MODULES/CourseStore
    buildTopbar();
    buildModuleNav();
    buildQuizzes();
    buildChecks();
    buildReflections();
    buildExercises();
    buildSteppers();
    buildSections();
    buildSidenotes();
    trackActive();
    window.addEventListener("load", layoutSidenotes);
    setupEmbed();
    document.dispatchEvent(new Event("course:ready"));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
