// ==UserScript==
// @name        GitHub Monospace Font Toggle
// @version     1.2.2
// @description A userscript that adds monospace font toggle to comments
// @license     MIT
// @author      StylishThemes
// @namespace   https://github.com/StylishThemes
// @include     https://github.com/*
// @run-at      document-idle
// @grant       GM_addStyle
// @require     https://greasyfork.org/scripts/28721-mutations/code/mutations.js?version=189706
// @icon        https://avatars3.githubusercontent.com/u/6145677?v=3&s=200
// @updateURL   https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-monospace-toggle.user.js
// @downloadURL https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-monospace-toggle.user.js
// ==/UserScript==
/* jshint esnext:true, unused:true */
(() => {
  "use strict";
  /*
  This code is also part of the GitHub-Dark Script
  (https://github.com/StylishThemes/GitHub-Dark-Script)
  Extracted out into a separate userscript in case users
  only want to add this functionality
  */
  const icon = `
    <svg class="octicon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewbox="0 0 32 32">
      <path d="M5.91 7.31v8.41c0 .66.05 1.09.14 1.31.09.21.23.37.41.48.18.11.52.16 1.02.16v.41H2.41v-.41c.5 0 .86-.05 1.03-.14.16-.11.3-.27.41-.5.11-.23.16-.66.16-1.3V11.7c0-1.14-.04-1.87-.11-2.2-.04-.26-.13-.42-.24-.53-.11-.1-.27-.14-.46-.14-.21 0-.48.05-.77.18l-.18-.41 3.14-1.28h.52v-.01zm-.95-5.46c.32 0 .59.11.82.34.23.23.34.5.34.82 0 .32-.11.59-.34.82-.23.22-.51.34-.82.34-.32 0-.59-.11-.82-.34s-.36-.5-.36-.82c0-.32.11-.59.34-.82.24-.23.51-.34.84-.34zm19.636 19.006h-3.39v-1.64h5.39v9.8h3.43v1.66h-9.18v-1.66h3.77v-8.16h-.02zm.7-6.44c.21 0 .43.04.63.13.18.09.36.2.5.34s.25.3.34.5c.07.18.13.39.13.61 0 .22-.04.41-.13.61s-.19.36-.34.5-.3.25-.5.32c-.2.09-.39.13-.62.13-.21 0-.43-.04-.61-.12-.19-.07-.35-.19-.5-.34-.14-.14-.25-.3-.34-.5-.07-.2-.13-.39-.13-.61s.04-.43.13-.61c.07-.18.2-.36.34-.5s.31-.25.5-.34c.17-.09.39-.12.6-.12zM2 30L27.82 2H30L4.14 30H2z"/>
    </svg>`;

  // Add monospace font toggle
  function addMonospaceToggle() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghd-monospace toolbar-item tooltipped tooltipped-n";
    button.setAttribute("aria-label", "Toggle monospaced font");
    button.setAttribute("tabindex", "-1");
    button.innerHTML = icon;
    $$(".toolbar-commenting").forEach(el => {
      if (el && !$(".ghd-monospace", el)) {
        el.insertBefore(button.cloneNode(true), el.childNodes[0]);
      }
    });
  }

  function addBindings() {
    $("body").addEventListener("click", event => {
      let textarea, active;
      const target = event.target;
      if (target && target.classList.contains("ghd-monospace")) {
        textarea = closest(".previewable-comment-form", target);
        textarea = $(".comment-form-textarea", textarea);
        textarea.classList.toggle("ghd-monospace-font");
        textarea.focus();
        active = textarea.classList.contains("ghd-monospace-font");
        target.classList.toggle("text-blue", active);
        return false;
      }
    });
  }

  function $(str, el) {
    return (el || document).querySelector(str);
  }

  function $$(str, el) {
    return Array.from((el || document).querySelectorAll(str));
  }

  function closest(selector, el) {
    while (el && el.nodeType === 1) {
      if (el.matches(selector)) {
        return el;
      }
      el = el.parentNode;
    }
    return null;
  }

  // don't initialize if GitHub Dark Script is active
  if (!$("#ghd-menu")) {
    // monospace font toggle
    GM_addStyle(`
      .ghd-monospace-font { font-family: Menlo, Inconsolata, "Droid Mono",
        monospace !important; font-size: 1em !important; }
      .ghd-monospace > svg { pointer-events: none; }
    `);

    document.addEventListener("ghmo:container", addMonospaceToggle);
    document.addEventListener("ghmo:comments", addMonospaceToggle);

    addBindings();
    addMonospaceToggle();
  }

})();
