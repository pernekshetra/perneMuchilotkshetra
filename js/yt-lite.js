/* Click-to-play YouTube embeds.
 * The page shows only a thumbnail. The YouTube player (about 1 MB) loads
 * when the visitor clicks it. Markup:
 *   <button type="button" class="yt-lite" data-yt="VIDEO_ID" aria-label="Play video">
 *     <img src="https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg" alt="">
 *   </button>
 */
(function () {
  function play(btn) {
    var id = btn.getAttribute("data-yt");
    var frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
    frame.title = btn.getAttribute("aria-label") || "YouTube video";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    frame.className = btn.className.replace(/\byt-lite\b/, "").trim();
    var style = btn.getAttribute("style");
    if (style) frame.setAttribute("style", style);
    frame.style.border = "0";
    btn.parentNode.replaceChild(frame, btn);
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".yt-lite");
    if (btn) { e.preventDefault(); play(btn); }
  });
})();
