// ==UserScript==
// @name        GitHub Diff File Toggle
// @version     1.2.2
// @description A userscript that adds a toggle to show or hide diff files
// @license     MIT
// @author      StylishThemes
// @namespace   https://github.com/StylishThemes
// @include     https://github.com/*
// @run-at      document-end
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @require     https://greasyfork.org/scripts/28721-mutations/code/mutations.js?version=189706
// @icon        https://avatars3.githubusercontent.com/u/6145677?v=3&s=200
// @updateURL   https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-diff-toggle.user.js
// @downloadURL https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-diff-toggle.user.js
// ==/UserScript==
/* jshint esnext:true, unused:true */
(() => {
  "use strict";
  /*
  This code is also part of the GitHub-Dark Script
  (https://github.com/StylishThemes/GitHub-Dark-Script)
  Extracted out into a separate userscript in case users only want to add this
  functionality
  */
  const icon =
    `<svg class="octicon" xmlns="http://www.w3.org/2000/svg" width="10" height="6.5" viewBox="0 0 10 6.5">
      <path d="M0 1.5L1.5 0l3.5 3.7L8.5.0 10 1.5 5 6.5 0 1.5z"/>
    </svg>`;

  // Add file diffs toggle
  function addFileToggle() {
    const files = $$("#files .file-actions");
    let button = document.createElement("button");
    button.type = "button";
    button.className = "ghd-file-toggle btn btn-sm tooltipped tooltipped-n";
    button.setAttribute("aria-label", "Click to Expand or Collapse file");
    button.setAttribute("tabindex", "-1");
    button.innerHTML = icon;
    files.forEach(el => {
      if (!$(".ghd-file-toggle", el)) {
        // hide GitHub toggle view button
        el.querySelector(".js-details-target").style.display = "none";
        el.appendChild(button.cloneNode(true));
      }
    });
    // start with all but first entry collapsed
    if (files.length) {
      if (/^t/.test(GM_getValue("accordion"))) {
        toggleFile({
          target: $(".ghd-file-toggle")
        }, "init");
      }
    }
  }

  function toggleSibs(target, state) {
    // oddly, when a "Details--on" class is applied, the content is hidden
    const isCollapsed = state || target.classList.contains("Details--on"),
      toggles = $$(".file");
    let el,
      indx = toggles.length;
    while (indx--) {
      el = toggles[indx];
      if (el !== target) {
        el.classList.toggle("Details--on", isCollapsed);
      }
    }
  }

  function toggleFile(event, init) {
    const accordion = GM_getValue("accordion"),
      el = closest(".file", event.target);
    if (el && accordion) {
      if (!init) {
        el.classList.toggle("Details--on");
      }
      toggleSibs(el, true);
    } else if (el) {
      el.classList.toggle("Details--on");
      // shift+click toggle all files!
      if (event.shiftKey) {
        toggleSibs(el);
      }
    }
    document.activeElement.blur();
    // move current open panel to the top
    if (!el.classList.contains("Details--on")) {
      location.hash = el.id;
    }
  }

  function addBindings() {
    $("body").addEventListener("click", event => {
      const target = event.target;
      if (target && target.classList.contains("ghd-file-toggle")) {
        toggleFile(event);
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

  // Don't initialize if GitHub Dark Script is active
  if (!$("#ghd-menu")) {
    GM_addStyle(`
      .Details--on .ghd-file-toggle svg {
        -webkit-transform:rotate(90deg); transform:rotate(90deg);
      }
      .ghd-file-toggle svg.octicon {
        pointer-events: none;
        vertical-align: middle;
      }
    `);

    document.addEventListener("ghmo:container", addFileToggle);
    document.addEventListener("ghmo:diff", addFileToggle);

    // Add GM options
    GM_registerMenuCommand("GitHub Diff File Toggle", () => {
      let result = "" + (GM_getValue("accordion") || false);
      const val = prompt("Accordion Mode? (true/false):", result);
      if (val) {
        result = /^t/.test(val);
        GM_setValue("accordion", result);
      }
    });

    addBindings();
    addFileToggle();
  }

})();
