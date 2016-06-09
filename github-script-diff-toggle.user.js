// ==UserScript==
// @name         GitHub Diff File Toggle
// @version      1.1.0
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
(function() {
  "use strict";
  /*
  This code is also part of the GitHub-Dark Script (https://github.com/StylishThemes/GitHub-Dark-Script)
  Extracted out into a separate userscript in case users only want to add this functionality
  */
  var busy = false,

  icon = [
    "<svg class='octicon' xmlns='http://www.w3.org/2000/svg' width='10' height='6.5' viewBox='0 0 10 6.5'>",
      "<path d='M0 1.497L1.504 0l3.49 3.76L8.505.016 10 1.52 4.988 6.51 0 1.496z'/>",
    "</svg>",
  ].join(""),

  // Add file diffs toggle
  addFileToggle = function() {
    busy = true;
    var el, button,
      files = document.querySelectorAll("#files .file-actions"),
      indx = files.length;
    while (indx--) {
      el = files[indx];
      if (!el.querySelector(".ghd-file-toggle")) {
        button = document.querySelector("button");
        button.type = "button";
        button.className = "ghd-file-toggle btn btn-sm tooltipped tooltipped-n";
        button.setAttribute("aria-label", "Click to Expand or Collapse file");
        button.setAttribute("tabindex", "-1");
        button.innerHTML = icon;
        el.appendChild(button);
      }
    }
    // start with all but first entry collapsed
    if (files.length) {
      if (/^t/.test(GM_getValue("accordion"))) {
        toggleFile({
          target: document.querySelector(".ghd-file-toggle")
        }, true);
      }
    }
    busy = false;
  },

  matches = function(el, selector) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
    var matches = document.querySelectorAll(selector),
      i = matches.length;
    while (--i >= 0 && matches.item(i) !== el) {}
    return i > -1;
  },

  closest = function(el, selector) {
    while (el && !matches(el, selector)) {
      el = el.parentNode;
    }
    return matches(el, selector) ? el : null;
  },

  toggleSibs = function(target, state) {
    var el,
      isCollapsed = state || target.classList.contains("ghd-file-collapsed"),
      toggles = document.querySelectorAll(".file"),
      indx = toggles.length;
    while (indx--) {
      el = toggles[indx];
      if (el !== target) {
        el.classList[isCollapsed ? "add" : "remove"]("ghd-file-collapsed");
      }
    }
  },

  toggleFile = function(event, init) {
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
  },

  addBindings = function() {
    document.querySelector("body").addEventListener("click", function(event) {
      var target = event.target;
      if (target && target.classList.contains("ghd-file-toggle")) {
        toggleFile(event);
        return false;
      }
    });
  },

  targets = document.querySelectorAll([
    "#js-repo-pjax-container",
    "#js-pjax-container",
    ".js-preview-body"
  ].join(","));

  // Don't initialize if GitHub Dark Script is active
  if (!document.querySelector("#ghd-menu")) {
    GM_addStyle([
      ".ghd-file-collapsed > :not(.file-header) { display: none !important; }",
      // file collapsed icon
      ".ghd-file-collapsed .ghd-file-toggle svg { -webkit-transform:rotate(90deg); transform:rotate(90deg); }",
      ".ghd-file-toggle svg.octicon { pointer-events: none; vertical-align: middle; }"
    ].join(""));

    Array.prototype.forEach.call(targets, function(target) {
      new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          // preform checks before adding code wrap to minimize function calls
          if (!busy && mutation.target === target) {
            addFileToggle();
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
  GM_registerMenuCommand("GitHub Diff File Toggle", function() {
    var result = "" + !GM_getValue("accordion"),
      val = prompt("Accordion Mode? (true/false):", result);
    if (val) {
      result = /^t/.test(val);
      GM_setValue("accordion", result);
    }
  });

})();
