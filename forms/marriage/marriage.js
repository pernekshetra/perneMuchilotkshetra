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

  /* ---------- Printable sheet ---------- */

  function row(label, valueHtml, extra) {
    return '<div class="m-row' + (extra || "") + '"><span class="m-lab">' + label + '</span><span class="m-col">:</span><span class="m-val">' + valueHtml + "</span></div>";
  }
  function line(name) { return '<span class="line" data-fit><span class="v" data-bind="' + name + '"></span></span>'; }
  function boxes(name, len, groups) {
    return '<span class="boxes" data-boxes="' + name + '" data-len="' + len + '"' + (groups ? ' data-groups="' + groups + '"' : "") + "></span>";
  }
  function dateBoxes(name) { return '<span class="boxes" data-boxes="' + name + '" data-fmt="date"></span>'; }

  function buildSheet(prefix) {
    var r = ROLES[prefix];
    var p = prefix + "_";
    return (
      row("1. Name of the " + r.en + " (" + r.kn + "/" + r.ml + ")", line(p + "name")) +
      row("2. Father’s Name", line(p + "father")) +
      row("3. Mother’s Name", line(p + "mother")) +
      row("4. Illam (Kutumba)", line(p + "illam")) +
      row("5. Tharavad", line(p + "tharavad")) +
      row("6. Date of Birth", dateBoxes(p + "dob") + '<span class="m-age">7. Age :&nbsp;' + boxes(p + "age", 2) + "</span>", " boxed") +
      row("8. Address",
        '<span class="m-addr"><span class="line multi" data-lines="2" data-fit><span class="v" data-bind="' + p + 'address"></span></span>' +
        '<span class="m-pin">Pin:&nbsp;' + boxes(p + "pin", 6) + "</span></span>", " tall") +
      row("9. Contact Number", boxes(p + "phone", 10), " boxed") +
      row("10. Aadhaar Card Number", boxes(p + "aadhaar", 12, "4,4,4"), " boxed") +
      row("11. Occupation", line(p + "occupation")) +

      '<div class="m-witness">' +
        '<div class="m-wfields">' +
          '<div class="m-tag">WITNESS OF THE ' + r.EN + "</div>" +
          row("Name &amp; Address", '<span class="line multi" data-lines="2" data-fit><span class="v" data-bind="' + p + 'w_name_addr"></span></span>', " tall") +
          row("Contact No", boxes(p + "w_phone", 10), " boxed") +
        "</div>" +
        '<div class="m-sigs">' +
          '<span class="sig-line">Signature of the ' + r.en + "</span>" +
          '<span class="sig-line">Signature of the Witness</span>' +
        "</div>" +
      "</div>" +

      '<div class="m-patti">' +
        '<p class="m-patti-h">FOR THE USE OF PATTIKKARAN</p>' +
        '<div class="m-patti-body">' +
          '<div class="m-patti-fields">' +
            row("Name of the Pattikkaran of " + r.en, '<span class="line"></span>') +
            '<div class="m-row m-row-2">' +
              '<span class="m-lab">House No</span><span class="m-col">:</span><span class="m-val"><span class="line"></span></span>' +
              '<span class="m-lab m-lab-s">Seeme</span><span class="m-col">:</span><span class="m-val"><span class="line"></span></span>' +
            "</div>" +
          "</div>" +
          '<div class="m-sigs one"><span class="sig-line">Signature of the Pattikkaran</span></div>' +
        "</div>" +
      "</div>"
    );
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
  document.querySelector("[data-sheet-person=groom]").innerHTML = buildSheet("groom");
  document.querySelector("[data-sheet-person=bride]").innerHTML = buildSheet("bride");

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
    check: checkDates,
    demo: {
      engagement_place: "PERNE KSHETHRA", engagement_date: "04/10/2026", marriage_date: "21/03/2027",
      groom_name: "PRAKASHA KODAKKARA", groom_father: "NARAYANA K", groom_mother: "LAKSHMI",
      groom_illam: "CHORLA", groom_tharavad: "KODAKKARA THARAVAD, ANANTHAPURA", groom_dob: "12/06/1997",
      groom_address: "KODAKKARA HOUSE, ANANTHAPURA POST, KUMBLA VIA, KASARAGOD DISTRICT, KERALA", groom_pin: "671321",
      groom_phone: "98765 43210", groom_aadhaar: "1234 5678 9012", groom_occupation: "TEACHER",
      groom_w_name_addr: "SURESHA K, KODAKKARA HOUSE, ANANTHAPURA", groom_w_phone: "91234 56780",
      bride_name: "ANANYA PUTHILA", bride_father: "RAMESHA P", bride_mother: "SAVITHRI",
      bride_illam: "THACHILA", bride_tharavad: "PUTHILA THARAVAD", bride_dob: "30/01/2000",
      bride_address: "PUTHILA HOUSE, PERNE, BANTWAL TALUK, DAKSHINA KANNADA, KARNATAKA", bride_pin: "574231",
      bride_phone: "99887 76655", bride_aadhaar: "9876 5432 1098", bride_occupation: "NURSE",
      bride_w_name_addr: "GOPALA P, PUTHILA HOUSE, PERNE", bride_w_phone: "90000 11111"
    }
  });
})();
