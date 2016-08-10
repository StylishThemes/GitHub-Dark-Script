// ==UserScript==
// @name         GitHub Make Tooltips
// @version      1.0.0
// @description  A userscript converts title tooltips into Github Tooltips
// @license      https://creativecommons.org/licenses/by-sa/4.0/
// @namespace    https://github.com/StylishThemes
// @include      https://github.com/*
// @run-at       document-idle
// @grant        GM_addStyle
// @author       StylishThemes
// @updateURL    https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-make-tooltips.user.js
// @downloadURL  https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-make-tooltips.user.js
// ==/UserScript==
/* jshint esnext:true, unused:true */
(function() {
  "use strict";

  GM_addStyle(".news .alert, .news .alert .body { overflow: visible !important; }");

  function init() {

    let indx = 0,
      els = document.querySelectorAll("[title]"),
      len = els.length;

    // loop with delay to allow user interaction
    function loop() {
      var el, txt,
        // max number of DOM modifications per loop
        max = 0;
      while ( max < 20 && indx < len ) {
        if (indx >= len) {
          return;
        }
        el = els[indx];
        if (el.nodeName !== "LINK" && !el.classList.contains("tooltipped")) {
          txt = el.title;
          el.classList.add(...["tooltipped", "tooltipped-n"]);
          if (txt.length > 45) {
            el.classList.add("tooltipped-multiline");
          }
          el.setAttribute("aria-label", txt);
          el.removeAttribute('title');
          max++;
        }
        indx++;
      }
      if (indx < len) {
        setTimeout(function(){
          loop();
        }, 200);
      }
    }
    loop();
  }

  init();
  document.addEventListener("pjax:end", init);

})();
