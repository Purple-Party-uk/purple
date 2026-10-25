/* Purple site behaviour. No framework, no tracking. */
(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cfg = window.PURPLE || {};
  const gbp = n => "£" + Number(n).toLocaleString("en-GB");

  function toast(msg){
    let t = $("#toast");
    if(!t){ t = document.createElement("div"); t.id = "toast"; t.setAttribute("role","status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2800);
  }

  /* Mobile menu */
  const burger = $("#burger"), menu = $("#menu");
  if(burger) burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });

  /* Header: transparent over the dark top, solid once scrolled */
  const onScroll = () => document.body.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* Fade-in on scroll */
  const rev = $$(".reveal");
  if(reduce || !("IntersectionObserver" in window)) rev.forEach(e => e.classList.add("in"));
  else {
    const io = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    rev.forEach((e, i) => { if(e.closest(".hero2")) e.style.transitionDelay = (i * 90) + "ms"; io.observe(e); });
  }

  /* Smooth scroll for in-page anchors */
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const id = a.getAttribute("href").slice(1); const el = id && document.getElementById(id);
    if(el){ e.preventDefault(); el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }
  }));

  /* Policy search (Policies page) */
  const q = $("#q");
  if(q){
    let index = null;
    const load = () => index ? Promise.resolve(index) : fetch(q.dataset.index).then(r => r.json()).then(d => (index = d));
    const esc = s => s.replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
    q.addEventListener("input", () => load().then(list => {
      const v = q.value.trim().toLowerCase(), out = $("#results");
      if(!v){ out.innerHTML = ""; return; }
      const hits = list.filter(p => (p.title + " " + p.summary + " " + p.theme).toLowerCase().includes(v));
      out.innerHTML = hits.length
        ? hits.map(p => `<a href="${p.url}"><strong>${esc(p.title)}</strong><span>${esc(p.theme)}</span></a>`).join("")
        : `<p style="color:var(--muted)">No policies match "${esc(q.value)}". Try a broader word, or browse the areas below.</p>`;
    }));
  }

  /* "On this page" list built from the policy's headings */
  const toc = $("#toc");
  if(toc){
    const hs = $$(".body > h2").filter(h => !h.closest(".say"));
    hs.forEach((h, i) => { if(!h.id) h.id = "s" + (i + 1); const li = document.createElement("li"); li.innerHTML = `<a href="#${h.id}">${h.textContent}</a>`; toc.appendChild(li); });
    const say = $("#say"); if(say){ const li = document.createElement("li"); li.innerHTML = `<a href="#say">Have your say</a>`; toc.appendChild(li); }
    toc.querySelectorAll("a").forEach(a => a.addEventListener("click", e => { e.preventDefault(); document.getElementById(a.getAttribute("href").slice(1)).scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }));
  }

  /* Have your say form */
  const f = $("#sayForm");
  if(f) f.addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#sayErr");
    if(!f.message.value.trim()){ err.textContent = "Please add your comments."; err.hidden = false; f.message.focus(); return; }
    if(!f.consent.checked){ err.textContent = "Please tick the box to agree to us storing your comments."; err.hidden = false; return; }
    if(!cfg.commentEndpoint){ err.textContent = "Comments are not switched on yet. Please try again soon."; err.hidden = false; return; }
    err.hidden = true;
    fetch(cfg.commentEndpoint, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } })
      .then(r => { if(!r.ok) throw 0; f.hidden = true; $("#sayDone").hidden = false; })
      .catch(() => { err.textContent = "Sorry, that didn't send. Please try again."; err.hidden = false; });
  });

  /* Bill: expand / collapse all */
  const tog = $("#toggleAll");
  if(tog){
    const all = () => $$(".billdoc details");
    const sync = () => { tog.textContent = all().every(d => d.open) ? "Collapse all" : "Expand all"; };
    tog.addEventListener("click", () => { const open = !all().every(d => d.open); all().forEach(d => d.open = open); sync(); });
    all().forEach(d => d.addEventListener("toggle", sync)); sync();
  }

  /* Speeches & Writing filter */
  $$(".filter").forEach(b => b.addEventListener("click", () => {
    $$(".filter").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    $$("#wlist li").forEach(li => li.hidden = !(b.dataset.type === "All" || li.dataset.type === b.dataset.type));
  }));

  /* Donate: counters + formatted amounts */
  $$("[data-gbp]").forEach(td => td.textContent = gbp(td.dataset.gbp));
  $$("[data-count]").forEach(el => {
    const target = +el.dataset.count, money = "money" in el.dataset, suf = el.dataset.suffix || "";
    const fmt = v => (money ? gbp(v) : v.toLocaleString("en-GB")) + suf;
    if(reduce){ el.textContent = fmt(target); return; }
    const start = performance.now(), dur = 1400;
    const step = t => { const k = Math.min(1, (t - start) / dur), e2 = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(target * e2)); if(k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });

  /* Donate: amount picker */
  const box = $("#amounts");
  if(box){
    const AMOUNTS = { monthly: [5, 10, 25, 50], once: [10, 25, 50, 100] };
    let freq = "monthly", amt = 10;
    const custom = $("#customAmt");
    const value = () => custom.value ? parseFloat(custom.value) : amt;
    const summary = () => {
      const v = value(), out = $("#giveSummary"), go = $("#giveGo");
      if(!v || v < 5){ out.innerHTML = `<p class="warn">Please choose £5 or more.</p>`; go.disabled = true; return; }
      go.disabled = false;
      const yearly = freq === "monthly" ? v * 12 : v;
      let html = freq === "monthly" ? `<p><b>${gbp(v)} a month</b>, which is ${gbp(yearly)} a year.</p>` : `<p><b>${gbp(v)}</b> once.</p>`;
      if(yearly > 1000) html += `<p class="note">Because this comes to more than £1,000 in a year, your name and the amount will be published on this page.</p>`;
      if(yearly > 500) html += `<p class="note">For donations over £500 we are required to confirm you are on a UK electoral register. We'll ask for your address at the next step.</p>`;
      out.innerHTML = html;
    };
    const render = () => {
      box.innerHTML = AMOUNTS[freq].map(a => { const on = a === amt && !custom.value; return `<button type="button" role="radio" aria-checked="${on}" class="amt${on ? " on" : ""}" data-amt="${a}"><b>£${a}</b>${freq === "monthly" ? " a month" : ""}</button>`; }).join("");
      $("#freqNote").textContent = freq === "monthly" ? "Taken every month until you cancel." : "A single payment.";
      summary();
    };
    $$(".seg button").forEach(b => b.addEventListener("click", () => {
      freq = b.dataset.freq; amt = AMOUNTS[freq][1];
      $$(".seg button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
      render();
    }));
    box.addEventListener("click", e => { const b = e.target.closest("[data-amt]"); if(!b) return; amt = +b.dataset.amt; custom.value = ""; render(); });
    custom.addEventListener("input", render);
    $("#giveGo").addEventListener("click", () => {
      if(!cfg.donateUrl){ toast("Donations open soon."); return; }
      // Passes the choice to the payment page. Adjust parameter names to match your provider.
      const u = new URL(cfg.donateUrl, location.href);
      u.searchParams.set("amount", value()); u.searchParams.set("frequency", freq);
      location.href = u.toString();
    });
    render();
  }

  /* Join: form not set yet */
  const jb = $("#joinBtn");
  if(jb && !cfg.joinFormUrl) jb.addEventListener("click", e => { e.preventDefault(); toast("Sign-up opens soon."); });
})();
