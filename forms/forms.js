/* ==========================================================================
   Perne Kshetra online forms - shared logic (no build step, no dependencies)

   - PerneForm.field(def) builds one labelled input (used by both forms).
   - Values are bound to the printable A4 sheet (sheet.css).
   - A draft is saved in localStorage; inputs with data-nosave are never saved.
   - Print uses window.print(); the browser makes the PDF.
   No data leaves the browser: there is no <form action> and no network call.

   Sheet markup:
     <span data-bind="name"></span>                   plain text
     <span data-bind="dob" data-fmt="date"></span>    dd-mm-yyyy
     <span data-boxes="phone" data-len="10"></span>   one box per character
     <span data-boxes="dob" data-fmt="date"></span>   DD MM YYYY boxes
     <div class="line multi" data-lines="2">...</div> ruled lines (built here)
     [data-fit]                                       shrink text to fit
   Input attributes:
     data-upper            CAPITALS
     data-mask             date | aadhaar | phone | digits
     data-nosave           never stored
     data-age-from / data-age-at   read-only age
     data-error            message for a pattern mismatch
   ========================================================================== */
(function () {
  "use strict";

  var PREFIX = "pernekshetra:form:";
  var MASKS = {
    date: { groups: [2, 2, 4], sep: "/" },
    aadhaar: { groups: [4, 4, 4], sep: " " },
    phone: { groups: [5, 5], sep: " " },
    digits: { groups: null, sep: "" }
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  function storageGet(key) {
    try { return JSON.parse(window.localStorage.getItem(key) || "{}") || {}; } catch (e) { return {}; }
  }
  function storageSet(key, obj) {
    try { window.localStorage.setItem(key, JSON.stringify(obj)); return true; } catch (e) { return false; }
  }
  function storageRemove(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  /* Dates are typed as DD/MM/YYYY. ISO (YYYY-MM-DD) is also accepted. */
  function parseDate(v) {
    v = v || "";
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
    if (m) return { d: m[1], m: m[2], y: m[3] };
    m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    return m ? { y: m[1], m: m[2], d: m[3] } : null;
  }
  function realDate(p) {
    if (!p) return false;
    var y = +p.y, mo = +p.m, d = +p.d;
    if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || d < 1) return false;
    return d <= new Date(y, mo, 0).getDate();
  }
  function fmtDate(v) {
    var p = parseDate(v);
    return p ? p.d + "-" + p.m + "-" + p.y : "";
  }
  function ageAt(dob, at) {
    var b = parseDate(dob);
    if (!realDate(b)) return "";
    var ref = parseDate(at);
    if (!realDate(ref)) ref = null;
    var now = new Date();
    var ry = ref ? +ref.y : now.getFullYear();
    var rm = ref ? +ref.m : now.getMonth() + 1;
    var rd = ref ? +ref.d : now.getDate();
    var age = ry - +b.y;
    if (rm < +b.m || (rm === +b.m && rd < +b.d)) age -= 1;
    return age >= 0 && age < 130 ? String(age) : "";
  }

  /* Format digits into groups and keep the caret after the same digit. */
  function applyMask(input) {
    var spec = MASKS[input.getAttribute("data-mask")];
    if (!spec) return;
    var raw = input.value;
    var caret = input.selectionStart == null ? raw.length : input.selectionStart;
    var digitsBefore = raw.slice(0, caret).replace(/\D/g, "").length;
    var digits = raw.replace(/\D/g, "");
    var out = digits;
    if (spec.groups) {
      var max = spec.groups.reduce(function (a, b) { return a + b; }, 0);
      digits = digits.slice(0, max);
      out = "";
      var pos = 0;
      spec.groups.forEach(function (n, i) {
        var part = digits.substr(pos, n);
        pos += n;
        if (part) out += (i > 0 ? spec.sep : "") + part;
      });
      // Dates: add "/" as soon as DD or MM is complete, but only while typing forward.
      var typingForward = input._lastLen !== undefined && raw.length > input._lastLen;
      if (spec.sep === "/" && typingForward && (digits.length === 2 || digits.length === 4)) out += "/";
    }
    if (out !== raw) {
      input.value = out;
      var n = 0, p = 0;
      while (p < out.length && n < digitsBefore) { if (/\d/.test(out[p])) n++; p++; }
      if (spec.sep === "/" && out[p] === "/") p++;
      try { input.setSelectionRange(p, p); } catch (e) { /* ignore */ }
    }
    input._lastLen = input.value.length;
  }

  function autosize(t) {
    t.style.height = "auto";
    t.style.height = Math.max(t.scrollHeight + 3, 84) + "px";
  }

  function PerneForm(form) {
    this.form = form;
    this.key = PREFIX + form.getAttribute("data-form-id");
    this.preview = $(".fp-preview");
  }

  /* ---------- Field builder ---------- */

  /* def: { id, en, tr, req, upper, mask, max, rows, options, hint, error, nosave, age:{from,at}, placeholder, kind:'name' }
     options: a list of values; the field becomes a dropdown. */
  /* The illams (also called Kutumba), for the illam dropdowns. */
  PerneForm.ILLAMS = ["BALLI", "CHANDANKULA", "CHORLA", "KEEKKOT", "KUNJATHA", "MUCHILTHA", "THACHILA"];

  PerneForm.field = function (def) {
    var a = ' id="' + def.id + '" name="' + def.id + '" aria-describedby="' + def.id + '-hint ' + def.id + '-err"';
    if (def.max) a += ' maxlength="' + def.max + '"';
    if (def.req) a += ' required aria-required="true"';
    if (def.upper) a += ' data-upper autocapitalize="characters"';
    else a += ' autocapitalize="words"';
    if (!def.mask) a += ' autocorrect="off" spellcheck="false"';
    if (def.mask) {
      a += ' data-mask="' + def.mask + '" inputmode="numeric"';
      var pat = { date: "\\d{2}/\\d{2}/\\d{4}", aadhaar: "\\d{4} \\d{4} \\d{4}", phone: "\\d{5} \\d{5}", digits: def.len ? "\\d{" + def.len + "}" : "\\d+" }[def.mask];
      a += ' pattern="' + pat + '"';
      var ph = { date: "DD/MM/YYYY", aadhaar: "0000 0000 0000", phone: "00000 00000", digits: def.len ? new Array(def.len + 1).join("0") : "" }[def.mask];
      if (ph) a += ' placeholder="' + ph + '"';
      var max = { date: 10, aadhaar: 14, phone: 11 }[def.mask] || def.len;
      if (max) a += ' maxlength="' + max + '"';
    }
    if (def.placeholder) a += ' placeholder="' + esc(def.placeholder) + '"';
    if (def.nosave) a += ' data-nosave autocomplete="off"';
    else a += ' autocomplete="off"';
    if (def.error) a += ' data-error="' + esc(def.error) + '"';
    if (def.age) a += ' readonly tabindex="-1" data-age-from="' + def.age.from + '" data-age-at="' + def.age.at + '"';
    a += ' enterkeyhint="next"';

    var input;
    if (def.options) {
      var sa = ' id="' + def.id + '" name="' + def.id + '" aria-describedby="' + def.id + '-hint ' + def.id + '-err"' +
        (def.req ? ' required aria-required="true"' : "") + (def.error ? ' data-error="' + esc(def.error) + '"' : "");
      input = "<select" + sa + '><option value="">' + esc(def.placeholder || "Choose") + "</option>" +
        def.options.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + "</option>"; }).join("") +
        "</select>";
    } else if (def.rows) {
      input = "<textarea" + a + ' rows="' + def.rows + '"></textarea>';
    } else {
      input = '<input type="' + (def.mask === "phone" ? "tel" : "text") + '"' + a + ">";
    }

    return '<div class="f" data-field="' + def.id + '">' +
      '<label class="f-label" for="' + def.id + '"><span class="en">' + esc(def.en) + "</span>" +
      (def.req ? '<span class="req" aria-hidden="true">*</span>' : "") +
      (def.tr ? '<span class="tr">' + esc(def.tr) + "</span>" : "") + "</label>" +
      '<div class="f-control">' + input + (def.age ? "" : '<i class="fa fa-check f-ok" aria-hidden="true"></i>') + "</div>" +
      '<p class="f-hint" id="' + def.id + '-hint">' + (def.hint ? esc(def.hint) : "") + "</p>" +
      '<p class="f-error" id="' + def.id + '-err" aria-live="polite"><i class="fa fa-exclamation-circle" aria-hidden="true"></i><span></span></p>' +
      "</div>";
  };

  /* ---------- Data ---------- */

  PerneForm.prototype.fields = function () {
    return $all("input[name], textarea[name], select[name]", this.form);
  };
  PerneForm.prototype.values = function () {
    var out = {};
    this.fields().forEach(function (f) { out[f.name] = (f.value || "").trim(); });
    return out;
  };
  PerneForm.prototype.save = function () {
    var out = {};
    this.fields().forEach(function (f) {
      if (f.hasAttribute("data-nosave") || f.readOnly) return;
      if (f.value) out[f.name] = f.value;
    });
    storageSet(this.key, out);
  };
  PerneForm.prototype.restore = function () {
    var data = storageGet(this.key);
    var any = false;
    this.fields().forEach(function (f) {
      if (f.hasAttribute("data-nosave") || f.readOnly) return;
      if (Object.prototype.hasOwnProperty.call(data, f.name)) { f.value = data[f.name]; any = true; }
    });
    return any;
  };

  PerneForm.prototype.toast = function (text) {
    var el = $(".fp-status");
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(this._toast);
    this._toast = setTimeout(function () { el.classList.remove("show"); }, 2600);
  };

  PerneForm.prototype.computeAges = function () {
    var form = this.form;
    $all("[data-age-from]", form).forEach(function (f) {
      var dob = form.elements[f.getAttribute("data-age-from")];
      var at = form.elements[f.getAttribute("data-age-at")];
      f.value = ageAt(dob && dob.value, at && at.value);
    });
  };

  /* ---------- Validation ---------- */

  PerneForm.prototype.checkField = function (f) {
    if (f.getAttribute("data-mask") === "date") {
      var p = parseDate(f.value);
      f.setCustomValidity(f.value && p && !realDate(p) ? "This date does not exist. Check the day and month." : "");
    }
    var v = f.validity;
    var msg = "";
    if (v.valueMissing) msg = "Please fill this in.";
    else if (v.customError) msg = f.validationMessage;
    else if (v.patternMismatch || v.tooShort) msg = f.getAttribute("data-error") || "Please check this value.";
    return msg;
  };

  PerneForm.prototype.paintField = function (f, force) {
    var wrap = f.closest(".f");
    if (!wrap) return;
    var touched = force || wrap.classList.contains("touched");
    var msg = this.checkField(f);
    wrap.classList.toggle("is-invalid", !!(touched && msg));
    wrap.classList.toggle("is-valid", !msg && !!f.value && !f.readOnly);
    f.setAttribute("aria-invalid", touched && msg ? "true" : "false");
    var err = wrap.querySelector(".f-error span");
    if (err) err.textContent = touched ? msg : "";
  };

  PerneForm.prototype.validate = function () {
    var self = this;
    var bad = [];
    this.fields().forEach(function (f) {
      if (f.readOnly) return;
      var wrap = f.closest(".f");
      if (wrap) wrap.classList.add("touched");
      self.paintField(f, true);
      if (self.checkField(f)) bad.push(f);
    });
    this.updateChips();
    var box = $(".fp-errors");
    if (!bad.length) {
      if (box) box.classList.remove("show");
      return true;
    }
    if (box) {
      box.innerHTML = "";
      var h = document.createElement("strong");
      h.textContent = bad.length === 1 ? "1 field needs your attention" : bad.length + " fields need your attention";
      var ul = document.createElement("ul");
      bad.forEach(function (f) {
        var lab = $('label[for="' + f.id + '"] .en', self.form);
        var group = f.closest("[data-section]");
        var gname = group ? group.getAttribute("data-title") : "";
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + f.id;
        a.textContent = (gname ? gname + ": " : "") + (lab ? lab.textContent : f.name);
        a.addEventListener("click", function (e) { e.preventDefault(); f.focus(); });
        li.appendChild(a);
        ul.appendChild(li);
      });
      box.appendChild(h);
      box.appendChild(ul);
      box.classList.add("show");
      box.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    this.closePreview();
    setTimeout(function () { bad[0].focus({ preventScroll: true }); }, 350);
    return false;
  };

  /* ---------- Section chips ---------- */

  PerneForm.prototype.updateChips = function () {
    var self = this;
    $all("[data-section]", this.form).forEach(function (sec) {
      var chip = $('.fp-chip[href="#' + sec.id + '"]');
      if (!chip) return;
      var inputs = $all("input[name], textarea[name], select[name]", sec).filter(function (f) { return !f.readOnly; });
      var filled = inputs.filter(function (f) { return f.value.trim(); }).length;
      var bad = inputs.some(function (f) { var w = f.closest(".f"); return w && w.classList.contains("is-invalid"); });
      var missingReq = inputs.some(function (f) { return f.required && !f.value.trim(); });
      var invalid = inputs.some(function (f) { return f.value && self.checkField(f); });
      chip.querySelector(".n").textContent = filled + "/" + inputs.length;
      chip.classList.toggle("is-bad", bad);
      chip.classList.toggle("is-done", !missingReq && !invalid && filled > 0);
    });
  };

  PerneForm.prototype.watchSections = function () {
    var chips = $all(".fp-chip");
    if (!chips.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        chips.forEach(function (c) { c.classList.toggle("is-active", c.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $all("[data-section]", this.form).forEach(function (s) { io.observe(s); });
  };

  /* ---------- Sheet rendering ---------- */

  PerneForm.prototype.render = function () {
    var v = this.values();

    $all("[data-bind]").forEach(function (el) {
      var val = v[el.getAttribute("data-bind")] || "";
      if (el.getAttribute("data-fmt") === "date") val = fmtDate(val);
      el.textContent = val;
    });

    $all("[data-boxes]").forEach(function (el) {
      var raw = v[el.getAttribute("data-boxes")] || "";
      var groups;
      if (el.getAttribute("data-fmt") === "date") {
        var p = parseDate(raw);
        groups = [
          { text: p ? p.d : "", ph: "DD" },
          { text: p ? p.m : "", ph: "MM" },
          { text: p ? p.y : "", ph: "YYYY" }
        ];
      } else {
        var len = +el.getAttribute("data-len") || 10;
        var clean = raw.replace(/\s+/g, "");
        var split = (el.getAttribute("data-groups") || String(len)).split(",").map(Number);
        var pos = 0;
        groups = split.map(function (n) {
          var g = { text: clean.substr(pos, n), ph: "", n: n };
          pos += n;
          return g;
        });
      }
      el.innerHTML = "";
      groups.forEach(function (g) {
        var grp = document.createElement("span");
        grp.className = "grp";
        var n = g.n || g.ph.length;
        for (var i = 0; i < n; i++) {
          var b = document.createElement("span");
          var ch = g.text.charAt(i);
          b.className = ch ? "b" : "b ph";
          b.textContent = ch || g.ph.charAt(i);
          grp.appendChild(b);
        }
        el.appendChild(grp);
      });
    });

    this.fit();
  };

  PerneForm.prototype.buildRules = function () {
    $all(".sheet .line.multi").forEach(function (el) {
      if (el.getAttribute("data-built")) return;
      var n = +el.getAttribute("data-lines") || 2;
      el.style.setProperty("--lines", n);
      var value = el.querySelector(".v");
      for (var i = 0; i < n; i++) {
        var r = document.createElement("i");
        r.className = "r";
        r.style.top = "calc(var(--row) * " + i + ")";
        el.insertBefore(r, value);
      }
      el.setAttribute("data-built", "1");
    });
  };

  /* Shrink text that does not fit its box. On narrow screens the preview is
     hidden, so it is laid out off-screen while we measure. */
  PerneForm.prototype.fit = function () {
    var panel = this.preview;
    var hidden = panel && !panel.offsetParent && !panel.classList.contains("is-open");
    if (hidden) panel.classList.add("fp-measure");
    $all(".sheet [data-fit]").forEach(function (box) {
      if (!box.offsetParent) return; // sheet of the other language
      var target = box.querySelector(".v") || box;
      target.style.fontSize = "";
      var size = parseFloat(window.getComputedStyle(target).fontSize);
      var min = size * 0.6;
      var guard = 0;
      while ((box.scrollHeight > box.clientHeight + 1 || box.scrollWidth > box.clientWidth + 1) && size > min && guard < 30) {
        size -= 0.5;
        target.style.fontSize = size + "px";
        guard++;
      }
    });
    if (hidden) panel.classList.remove("fp-measure");
  };

  PerneForm.prototype.scalePreview = function () {
    var panel = $(".fp-preview .sheets");
    if (!panel || !panel.clientWidth) return;
    var sheetPx = 210 * 96 / 25.4;
    var z = Math.min(1, panel.clientWidth / sheetPx);
    document.documentElement.style.setProperty("--preview-zoom", z.toFixed(3));
  };

  /* Highlight where the focused field lands on the printed page. */
  PerneForm.prototype.highlight = function (name) {
    $all(".sheet .is-hl").forEach(function (el) { el.classList.remove("is-hl"); });
    if (!name) return;
    var targets = $all('.sheet [data-bind="' + name + '"], .sheet [data-boxes="' + name + '"]').filter(function (el) { return el.offsetParent; });
    targets.forEach(function (el) {
      var box = el.closest(".line") || el;
      box.classList.add("is-hl");
    });
    var panel = this.preview;
    if (!targets.length || !panel || window.matchMedia("(max-width: 1099.98px)").matches) return;
    var t = targets[0].getBoundingClientRect();
    var p = panel.getBoundingClientRect();
    var head = $(".fp-preview-head", panel);
    var top = p.top + (head ? head.offsetHeight : 0) + 24;
    if (t.top < top || t.bottom > p.bottom - 24) {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel.scrollTo({ top: panel.scrollTop + (t.top - p.top) - p.height / 3, behavior: reduce ? "auto" : "smooth" });
    }
  };

  /* ---------- Preview overlay (narrow screens) ---------- */

  PerneForm.prototype.openPreview = function (opener) {
    if (!this.preview) return;
    this._opener = opener || document.activeElement;
    this.preview.classList.add("is-open");
    this.preview.setAttribute("role", "dialog");
    this.preview.setAttribute("aria-modal", "true");
    document.body.classList.add("fp-lock");
    this.preview.scrollTop = 0;
    this.scalePreview();
    this.render();
    var close = $(".fp-close", this.preview);
    if (close) close.focus();
  };
  PerneForm.prototype.closePreview = function () {
    if (!this.preview || !this.preview.classList.contains("is-open")) return;
    this.preview.classList.remove("is-open");
    this.preview.removeAttribute("role");
    this.preview.removeAttribute("aria-modal");
    document.body.classList.remove("fp-lock");
    this.scalePreview();
    if (this._opener && this._opener.focus) this._opener.focus();
  };

  /* ---------- Print and clear ---------- */

  PerneForm.prototype.print = function () {
    this.computeAges();
    this.render();
    if (!this.validate()) return;
    this.highlight(null);
    var title = document.title;
    var name = this.form.getAttribute("data-file-name");
    if (name) {
      var v = this.values();
      document.title = name.replace(/\{(\w+)\}/g, function (_, k) { return (v[k] || "").replace(/[^\wಀ-೿ഀ-ൿ]+/g, "-"); }).replace(/-+/g, "-").replace(/-$/, "");
    }
    var go = function () {
      window.print();
      setTimeout(function () { document.title = title; }, 1500);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go, go);
    else go();
  };

  PerneForm.prototype.clear = function (btn) {
    if (!btn.classList.contains("confirm")) {
      btn.classList.add("confirm");
      btn.setAttribute("data-label", btn.innerHTML);
      btn.textContent = "Tap again to clear everything";
      clearTimeout(this._clearTimer);
      this._clearTimer = setTimeout(function () {
        btn.classList.remove("confirm");
        btn.innerHTML = btn.getAttribute("data-label");
      }, 4000);
      return;
    }
    clearTimeout(this._clearTimer);
    btn.classList.remove("confirm");
    btn.innerHTML = btn.getAttribute("data-label");
    this.form.reset();
    storageRemove(this.key);
    $all(".f", this.form).forEach(function (w) { w.classList.remove("touched", "is-invalid", "is-valid"); });
    $all("textarea", this.form).forEach(autosize);
    var box = $(".fp-errors");
    if (box) box.classList.remove("show");
    this.computeAges();
    this.render();
    this.updateChips();
    this.toast("All data cleared from this device");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  PerneForm.prototype.fillDemo = function (data) {
    var form = this.form;
    Object.keys(data).forEach(function (k) { if (form.elements[k]) form.elements[k].value = data[k]; });
  };

  /* ---------- Wiring ---------- */

  PerneForm.prototype.init = function (opts) {
    var self = this;
    opts = opts || {};
    var form = this.form;

    form.addEventListener("submit", function (e) { e.preventDefault(); self.print(); });

    form.addEventListener("input", function (e) {
      var f = e.target;
      if (f.hasAttribute("data-mask")) applyMask(f);
      if (f.hasAttribute("data-upper")) {
        var s = f.selectionStart, en = f.selectionEnd;
        var up = f.value.toUpperCase();
        if (up !== f.value) {
          f.value = up;
          try { f.setSelectionRange(s, en); } catch (err) { /* ignore */ }
        }
      }
      if (f.tagName === "TEXTAREA") autosize(f);
      self.computeAges();
      self.paintField(f);
      self.render();
      self.save();
      self.updateChips();
      if (f.name) self.highlight(f.name);
    });

    form.addEventListener("focusin", function (e) {
      if (e.target.name) self.highlight(e.target.name);
    });
    form.addEventListener("focusout", function (e) {
      var f = e.target;
      if (!f.name) return;
      var wrap = f.closest(".f");
      if (wrap && f.value) wrap.classList.add("touched");
      self.paintField(f);
      self.updateChips();
      setTimeout(function () { if (!form.contains(document.activeElement)) self.highlight(null); }, 0);
    });

    /* Enter moves to the next field, like a paper form. */
    form.addEventListener("keydown", function (e) {
      var f = e.target;
      if (e.key !== "Enter" || f.tagName !== "INPUT" || e.isComposing) return;
      e.preventDefault();
      var list = $all("input:not([readonly]), textarea, select", form);
      var next = list[list.indexOf(f) + 1];
      if (next) next.focus();
      else f.blur();
    });

    $all("[data-action=print]").forEach(function (b) { b.addEventListener("click", function () { self.print(); }); });
    $all("[data-action=clear]").forEach(function (b) { b.addEventListener("click", function () { self.clear(b); }); });
    $all("[data-action=preview]").forEach(function (b) { b.addEventListener("click", function () { self.openPreview(b); }); });
    $all("[data-action=close-preview]").forEach(function (b) { b.addEventListener("click", function () { self.closePreview(); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") self.closePreview(); });

    window.addEventListener("beforeprint", function () { self.computeAges(); self.render(); self.highlight(null); });
    window.addEventListener("resize", function () { self.scalePreview(); });

    this.buildRules();
    var params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1" && opts.demo) this.fillDemo(opts.demo);
    else if (this.restore()) this.toast("Your saved draft is back");

    $all("[data-mask]", form).forEach(function (f) { f._lastLen = f.value.length; });
    $all("textarea", form).forEach(autosize);
    this.scalePreview();
    this.computeAges();
    this.render();
    this.fields().forEach(function (f) {
      if (f.value && !f.readOnly) { var w = f.closest(".f"); if (w) w.classList.add("touched"); self.paintField(f); }
    });
    this.updateChips();
    this.watchSections();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { self.render(); });
  };

  window.PerneForm = PerneForm;
})();
