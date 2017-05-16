// ==UserScript==
// @name        GitHub Make Tooltips
// @version     1.0.4
// @description A userscript converts title tooltips into Github Tooltips
// @license     MIT
// @author      StylishThemes
// @namespace   https://github.com/StylishThemes
// @include     https://github.com/*
// @run-at      document-idle
// @grant       GM_addStyle
// @icon        https://avatars3.githubusercontent.com/u/6145677?v=3&s=200
// @updateURL   https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-make-tooltips.user.js
// @downloadURL https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-make-tooltips.user.js
// ==/UserScript==
/* jshint esnext:true, unused:true */
(() => {
  "use strict";

  GM_addStyle(".news .alert, .news .alert .body { overflow: visible !important; }");

  function init() {

    let indx = 0,
      els = document.querySelector("body").querySelectorAll("[title]"),
      regex = /(link|time-ago|relative-time)/gi,
      len = els.length;

    // loop with delay to allow user interaction
    function loop() {
      let el, txt, direction,
        // max number of DOM modifications per loop
        max = 0;
      while ( max < 20 && indx < len ) {
        if (indx >= len) {
          return;
        }
        el = els[indx];
        if (!regex.test(el.nodeName) && !el.classList.contains("tooltipped")) {
          txt = el.title || "";
          // Change direction of star & fork tooltips - fixes #30
          direction = el.classList.contains("btn-with-count") ?
            "tooltipped-s" :
            "tooltipped-n";
          el.classList.add(...["tooltipped", direction]);
          if (txt.length > 45) {
            el.classList.add("tooltipped-multiline");
          }
          el.setAttribute("aria-label", txt);
          el.removeAttribute("title");
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
