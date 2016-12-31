// ==UserScript==
// @name         GitHub Diff File Toggle
// @version      1.1.1
// @description  A userscript that adds a toggle to show or hide diff files
// @license      https://creativecommons.org/licenses/by-sa/4.0/
// @namespace    https://github.com/StylishThemes
// @include      https://github.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @author       StylishThemes
// @updateURL    https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-diff-toggle.user.js
// @downloadURL  https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-diff-toggle.user.js
// ==/UserScript==
/* global GM_addStyle, GM_getValue, GM_setValue, GM_registerMenuCommand */
/* jshint esnext:true, unused:true */
(function() {
  "use strict";
  /*
  This code is also part of the GitHub-Dark Script
  (https://github.com/StylishThemes/GitHub-Dark-Script)
  Extracted out into a separate userscript in case users only want to add this
  functionality
  */
  let busy = false,
    mutationTimer;

  const icon =
    `<svg class="octicon" xmlns="http://www.w3.org/2000/svg" width="10" height="6.5" viewBox="0 0 10 6.5">
      <path d="M0 1.5L1.5 0l3.5 3.7L8.5.0 10 1.5 5 6.5 0 1.5z"/>
    </svg>`;

  // Add file diffs toggle
  function addFileToggle() {
    busy = true;
    const files = $$("#files .file-actions");
    let button = document.createElement("button");
    button.type = "button";
    button.className = "ghd-file-toggle btn btn-sm tooltipped tooltipped-n";
    button.setAttribute("aria-label", "Click to Expand or Collapse file");
    button.setAttribute("tabindex", "-1");
    button.innerHTML = icon;
    files.forEach(el => {
      if (!$(".ghd-file-toggle", el)) {
        el.appendChild(button.cloneNode(true));
      }
    });
    // start with all but first entry collapsed
    if (files.length) {
      if (/^t/.test(GM_getValue("accordion"))) {
        toggleFile({
          target: $(".ghd-file-toggle")
        }, true);
      }
    }
    busy = false;
  }

  function toggleSibs(target, state) {
    var el,
      isCollapsed = state || target.classList.contains("ghd-file-collapsed"),
      toggles = $$(".file"),
      indx = toggles.length;
    while (indx--) {
      el = toggles[indx];
      if (el !== target) {
        el.classList.toggle("ghd-file-collapsed", isCollapsed);
      }
    }
  }

  function toggleFile(event, init) {
    busy = true;
    var accordion = GM_getValue("accordion"),
      el = closest(event.target, ".file");
    if (accordion) {
      if (!init) {
        el.classList.toggle("ghd-file-collapsed");
      }
      toggleSibs(el, true);
    } else {
      el.classList.toggle("ghd-file-collapsed");
      // shift+click toggle all files!
      if (event.shiftKey) {
        toggleSibs(el);
      }
    }
    document.activeElement.blur();
    busy = false;
  }

  function addBindings() {
    $("body").addEventListener("click", function(event) {
      var target = event.target;
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

  function closest(el, selector) {
    while (el && el.nodeName !== "BODY" && !el.matches(selector)) {
      el = el.parentNode;
    }
    return el && el.matches(selector) ? el : [];
  }

  // Don't initialize if GitHub Dark Script is active
  if (!$("#ghd-menu")) {
    GM_addStyle(`
      .ghd-file-collapsed > :not(.file-header) { display: none !important; }
      .ghd-file-collapsed .ghd-file-toggle svg {
        -webkit-transform:rotate(90deg); transform:rotate(90deg);
      }
      .ghd-file-toggle svg.octicon {
        pointer-events: none;
        vertical-align: middle;
      }
    `);

    $$(
      `#js-repo-pjax-container,
      #js-pjax-container,
      .js-preview-body,
      .js-diff-progressive-container`
    ).forEach(target => {
      new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          // preform checks before adding code wrap to minimize function calls
          if (!busy && mutation.target === target) {
            clearTimeout(mutationTimer);
            mutationTimer = setTimeout(() => {
              addFileToggle();
            }, 400);
          }
        });
      }).observe(target, {
        childList: true,
        subtree: true
      });
    });

    addBindings();
    addFileToggle();
  }

  // Add GM options
  GM_registerMenuCommand("GitHub Diff File Toggle", () => {
    var result = "" + GM_getValue("accordion"),
      val = prompt("Accordion Mode? (true/false):", result);
    if (val) {
      result = /^t/.test(val);
      GM_setValue("accordion", result);
    }
  });

})();
