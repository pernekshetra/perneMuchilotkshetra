/* Google Analytics 4 for pernekshetra.com. Every page loads this one file:
 *   <script src="/js/analytics.js" async></script>
 * To change the GA4 property, change MEASUREMENT_ID here only.
 *
 * Form maker pages (/forms/...) collect Aadhaar and phone numbers, so there:
 * - the reported URL keeps only the "lang" query parameter;
 * - the page title is fixed at load. Print renames the page to the PDF file
 *   name, which contains people's names, and GA must never see that;
 * - Google signals and ad personalisation are off.
 * Form values are never sent. Also keep "Form interactions" switched off in
 * GA Admin > Data streams > (web stream) > Enhanced measurement.
 */
(function () {
  var MEASUREMENT_ID = "G-22PTX83LGR";

  var tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
  document.head.appendChild(tag);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());

  var config = {};
  if (/^\/forms(\/|$)/.test(location.pathname)) {
    var lang = new URLSearchParams(location.search).get("lang");
    config.page_location = location.origin + location.pathname + (lang ? "?lang=" + encodeURIComponent(lang) : "");
    config.page_referrer = document.referrer ? document.referrer.split(/[?#]/)[0] : "";
    config.allow_google_signals = false;
    config.allow_ad_personalization_signals = false;
    window.gtag("set", { page_title: document.title });
  }
  window.gtag("config", MEASUREMENT_ID, config);
})();
