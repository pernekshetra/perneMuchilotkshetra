/* ==========================================================================
   Marriage registration form: builds the Bridegroom and Bride input sections
   and their printable sheet blocks from one field list.
   TODO(proofread): a native reader must check the kn / ml label strings.
   ========================================================================== */
(function () {
  "use strict";

  var DATE_ERR = "Use DD/MM/YYYY, for example 21/03/2027.";

  var PERSON = {
    name: { en: "Name of the {ROLE}", kn: "ಹೆಸರು", ml: "പേര്", upper: 1, req: 1, max: 60, hint: "Exactly as on the school or birth certificate." },
    father: { en: "Father’s name", kn: "ತಂದೆಯ ಹೆಸರು", ml: "അച്ഛന്റെ പേര്", upper: 1, max: 60 },
    mother: { en: "Mother’s name", kn: "ತಾಯಿಯ ಹೆಸರು", ml: "അമ്മയുടെ പേര്", upper: 1, max: 60 },
    illam: { en: "Illam (Kutumba)", kn: "ಇಲ್ಲಂ (ಕುಟುಂಬ)", ml: "ഇല്ലം (കുടുംബം)", options: window.PerneForm.ILLAMS, placeholder: "Choose illam" },
    tharavad: { en: "Tharavad", kn: "ತರವಾಡು", ml: "തറവാട്", upper: 1, max: 60 },
    dob: { en: "Date of birth", kn: "ಜನ್ಮ ದಿನಾಂಕ", ml: "ജനന തീയതി", mask: "date", req: 1, error: DATE_ERR },
    age: { en: "Age", kn: "ವಯಸ್ಸು", ml: "വയസ്സ്" },
    address: { en: "Address", kn: "ವಿಳಾಸ", ml: "മേൽവിലാസം", upper: 1, max: 150, rows: 2, hint: "House name, post, village and district." },
    pin: { en: "PIN code", kn: "ಪಿನ್ ಕೋಡ್", ml: "പിൻ കോഡ്", mask: "digits", len: 6, error: "Enter the 6-digit PIN code." },
    phone: { en: "Mobile number", kn: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", ml: "മൊബൈൽ നമ്പർ", mask: "phone", error: "Enter a 10-digit mobile number." },
    aadhaar: { en: "Aadhaar number", kn: "ಆಧಾರ್ ಸಂಖ್ಯೆ", ml: "ആധാർ നമ്പർ", mask: "aadhaar", nosave: 1, error: "Enter all 12 digits.", hint: "For privacy, this number is never saved on this device." },
    occupation: { en: "Occupation", kn: "ಉದ್ಯೋಗ", ml: "തൊഴിൽ", upper: 1, max: 50 },
    w_name_addr: { en: "Witness name and address", kn: "ಸಾಕ್ಷಿಯ ಹೆಸರು ಮತ್ತು ವಿಳಾಸ", ml: "സാക്ഷിയുടെ പേരും മേൽവിലാസവും", upper: 1, max: 130, rows: 2 },
    w_phone: { en: "Witness mobile number", kn: "ಸಾಕ್ಷಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", ml: "സാക്ഷിയുടെ മൊബൈൽ നമ്പർ", mask: "phone", error: "Enter a 10-digit mobile number." }
  };

  var ROLES = {
    groom: { en: "Bridegroom", EN: "BRIDEGROOM", kn: "ವರ", ml: "വരൻ" },
    bride: { en: "Bride", EN: "BRIDE", kn: "ವಧು", ml: "വധു" }
  };

  function field(prefix, key) {
    var d = PERSON[key];
    var role = ROLES[prefix];
    var def = {};
    Object.keys(d).forEach(function (k) { def[k] = d[k]; });
    def.id = prefix + "_" + key;
    def.en = d.en.replace("{ROLE}", role.en.toLowerCase());
    def.tr = d.kn + " · " + d.ml;
    if (key === "age") def.age = { from: prefix + "_dob", at: "marriage_date" };
    return window.PerneForm.field(def);
  }

  function buildInputs(prefix) {
    var r = ROLES[prefix];
    var h = function (k) { return field(prefix, k); };
    return '<div class="fp-section-head"><h2>' + r.en + '</h2><span class="tr">' + r.kn + " · " + r.ml + "</span></div>" +
      h("name") + h("father") + h("mother") +
      '<div class="f-row">' + h("illam") + h("tharavad") + "</div>" +
      '<div class="f-row dob">' + h("dob") + h("age") + "</div>" +
      h("address") +
      '<div class="f-row">' + h("pin") + h("phone") + "</div>" +
      h("aadhaar") + h("occupation") +
      '<h3 class="fp-subhead">Witness of the ' + r.en.toLowerCase() + "</h3>" +
      h("w_name_addr") + h("w_phone");
  }

  /* ---------- Printable sheet (page 1: cards A to F) ---------- */

  function line(name, cls) { return '<span class="line' + (cls ? " " + cls : "") + '" data-fit><span class="v" data-bind="' + name + '"></span></span>'; }
  function multi(name) { return '<span class="line multi" data-lines="2" data-fit><span class="v" data-bind="' + name + '"></span></span>'; }
  function boxes(name, len, groups) {
    return '<span class="boxes" data-boxes="' + name + '" data-len="' + len + '"' + (groups ? ' data-groups="' + groups + '"' : "") + "></span>";
  }
  function dateBoxes(name) { return '<span class="boxes" data-boxes="' + name + '" data-fmt="date"></span>'; }
  function row(n, label, valueHtml, cls) {
    return '<div class="mf-r' + (cls ? " " + cls : "") + '">' + (n === null ? "" : '<span class="mf-n">' + n + "</span>") +
      '<span class="mf-l">' + label + '</span><span class="mf-v">' + valueHtml + "</span></div>";
  }
  function card(letter, title, body, opts) {
    opts = opts || {};
    return '<section class="mf-card' + (opts.use ? " use" : "") + '">' +
      '<div class="mf-card-h"><span class="mf-badge">' + letter + "</span><span class=\"t\">" + title + "</span>" +
      (opts.tr ? '<span class="tr">' + opts.tr + "</span>" : "") + "</div>" +
      '<div class="mf-card-b">' + body + "</div></section>";
  }
  function sig(text) { return '<span class="mf-sig">' + text + "</span>"; }

  function buildSheet(prefix, letters) {
    var r = ROLES[prefix];
    var p = prefix + "_";
    var details =
      row("1.", "Name of the " + r.en, line(p + "name")) +
      row("2.", "Father’s Name", line(p + "father")) +
      row("3.", "Mother’s Name", line(p + "mother")) +
      row("4.", "Illam (Kutumba)", line(p + "illam", "mf-illam") + '<span class="sub"><b>5.</b> Tharavad</span>' + line(p + "tharavad")) +
      row("6.", "Date of Birth", dateBoxes(p + "dob") + '<span class="sub push"><b>7.</b> Age</span>' + boxes(p + "age", 2)) +
      row("8.", "Address", '<span class="mf-addr2" style="flex:1">' + multi(p + "address") +
        '<span class="sub">PIN</span>' + boxes(p + "pin", 6) + "</span>", "tall") +
      '<div class="mf-split"><div>' +
        row("9.", "Contact Number", boxes(p + "phone", 10)) +
        row("10.", "Aadhaar Number", boxes(p + "aadhaar", 12, "4,4,4")) +
        row("11.", "Occupation", line(p + "occupation"), "nb") +
      "</div>" + sig("Signature of the " + r.en) + "</div>";

    var witness =
      '<div class="mf-split mf-w"><div>' +
        row(null, "Name &amp; Address", multi(p + "w_name_addr"), "tall") +
        row(null, "Contact No.", boxes(p + "w_phone", 10), "nb") +
      "</div>" + sig("Signature of the Witness") + "</div>";

    var use =
      '<div class="mf-split mf-use"><div>' +
        row(null, "", '<span class="sub">Name of the Pattikkaran of ' + r.en + '</span><span class="line"></span>') +
        row(null, "", '<span class="sub">House No.</span><span class="line"></span><span class="sub">Seeme</span><span class="line"></span>', "nb") +
      "</div>" + sig("Signature of the Pattikkaran") + "</div>";

    return card(letters[0], r.EN + " DETAILS", details, { tr: r.kn + " / " + r.ml }) +
      card(letters[1], "WITNESS OF THE " + r.EN, witness) +
      card(letters[2], "FOR THE USE OF PATTIKKARAN", use, { use: 1 });
  }

  /* ---------- Marriage section (shared) ---------- */

  var F = window.PerneForm.field;
  document.querySelector("[data-marriage-fields]").innerHTML =
    F({ id: "engagement_place", en: "Place of engagement", tr: "ನಿಶ್ಚಿತಾರ್ಥದ ಸ್ಥಳ · വിവാഹനിശ്ചയ സ്ഥലം", upper: 1, max: 40 }) +
    '<div class="f-row">' +
      F({ id: "engagement_date", en: "Date of engagement", tr: "ನಿಶ್ಚಿತಾರ್ಥ · വിവാഹനിശ്ചയം", mask: "date", error: DATE_ERR }) +
      F({ id: "marriage_date", en: "Proposed marriage date", tr: "ವಿವಾಹ · വിവാഹം", mask: "date", error: DATE_ERR }) +
    "</div>";

  document.querySelector("[data-person=groom]").innerHTML = buildInputs("groom");
  document.querySelector("[data-person=bride]").innerHTML = buildInputs("bride");
  document.querySelector("[data-sheet-person=groom]").innerHTML = buildSheet("groom", "ABC");
  document.querySelector("[data-sheet-person=bride]").innerHTML = buildSheet("bride", "DEF");

  document.getElementById("year").textContent = new Date().getFullYear();

  /* Date rules. Preview and print stay off while any of these fail.
     - Engagement on or before the marriage date.
     - Age on the marriage date (or today, if there is no marriage date yet):
       bridegroom at least 21, bride at least 18. */
  var MIN_AGE = { groom: 21, bride: 18 };
  function checkDates(v) {
    var D = window.PerneForm.date;
    var out = [];
    var eng = D.key(v.engagement_date), mar = D.key(v.marriage_date);
    if (eng > mar) {
      out.push({ field: "engagement_date", msg: "The engagement date must be on or before the marriage date (" + v.marriage_date + ")." });
      out.push({ field: "marriage_date", msg: "The marriage date must be on or after the engagement date (" + v.engagement_date + ")." });
    }
    var at = isNaN(mar) ? "" : v.marriage_date;
    var when = at ? "on the marriage date" : "today";
    ["groom", "bride"].forEach(function (p) {
      var dob = v[p + "_dob"];
      if (!D.real(dob)) return;
      var who = ROLES[p].en.toLowerCase();
      var age = D.ageAt(dob, at);
      if (age === "") {
        out.push({ field: p + "_dob", msg: "The " + who + "’s date of birth must be before " + (at ? "the marriage date." : "today.") });
      } else if (+age < MIN_AGE[p]) {
        out.push({ field: p + "_dob", msg: "The " + who + " must be at least " + MIN_AGE[p] + " years old " + when + ". Age " + when + ": " + age + "." });
      }
    });
    return out;
  }

  new window.PerneForm(document.querySelector("form[data-form-id]")).init({
    check: checkDates
  });
})();
