// ==UserScript==
// @name         GitHub Toggle Code Wrap
// @version      1.0.1
// @description  A userscript that adds a code wrap toggle button
// @license      https://creativecommons.org/licenses/by-sa/4.0/
// @namespace    https://github.com/StylishThemes
// @include      https://github.com/*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @author       StylishThemes
// @updateURL    https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-code-wrap.user.js
// @downloadURL  https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-code-wrap.user.js
// ==/UserScript==
/* global GM_registerMenuCommand, GM_getValue, GM_setValue, GM_addStyle */
/*jshint unused:true */
(function() {
  "use strict";
  /*
  This code is also part of the GitHub-Dark Script (https://github.com/StylishThemes/GitHub-Dark-Script)
  Extracted out into a separate userscript in case users only want to add this functionality
  */
  var busy = false,

  // set by GM popup menu
  globalWrap = GM_getValue("github-global-code-wrap", true),

  wrapIcon = "<svg xmlns='http://www.w3.org/2000/svg' width='768' height='768' viewBox='0 0 768 768'><path d='M544.5 352.5q52.5 0 90 37.5t37.5 90-37.5 90-90 37.5H480V672l-96-96 96-96v64.5h72q25.5 0 45-19.5t19.5-45-19.5-45-45-19.5H127.5v-63h417zm96-192v63h-513v-63h513zm-513 447v-63h192v63h-192z'/></svg>",

  // inline code wrap css
  wrapCss = {
    "wrapped" : "white-space: pre-wrap !important; word-break: break-all !important; overflow-wrap: break-word !important; display: block !important;",
    "unwrap"  : "white-space: pre !important; word-break: normal !important; display: block !important;"
  },

  findWrap = function(event) {
    var target = event.target;
    if (target.classList.contains("ghd-wrap-toggle")) {
      toggleClasses(target);
    }
  },

  // equivalent to .next("code, pre, .highlight, .diff-table");
  findNext = function(el) {
    var nextSib = el.nextElementSibling;
    if (/code|pre/i.test(nextSib.nodeName) ||
      nextSib && (nextSib.classList.contains("highlight") ||
      nextSib.classList.contains("diff-table"))) {
      return nextSib;
    } else {
      return el;
    }
  },

  toggleClasses = function(icon) {
    var css,
      code = findNext(icon);
    if (code.querySelector("code")) {
      code = code.querySelector("code");
    }
    if (!code) {
      console.error("Code wrap icon associated code not found", icon);
      return;
    }
    busy = true;
    // code with line numbers
    if (code.nodeName === "TABLE") {
      if (code.className.indexOf("wrap-table") < 0) {
        css = !globalWrap;
      } else {
        css = code.classList.contains("ghd-unwrap-table");
      }
      if (css) {
        code.classList.add("ghd-wrap-table");
        code.classList.remove("ghd-unwrap-table");
        icon.classList.add("wrapped");
        icon.classList.remove("unwrap");
      } else {
        code.classList.remove("ghd-wrap-table");
        code.classList.add("ghd-unwrap-table");
        icon.classList.remove("wrapped");
        icon.classList.add("unwrap");
      }
    } else {
      css = code.getAttribute("style") || "";
      if (css === "") {
        css = wrapCss[globalWrap ? "unwrap" : "wrapped"];
      } else {
        css = wrapCss[css === wrapCss.wrapped ? "unwrap" : "wrapped"];
      }
      code.setAttribute("style", css);
      if (css === wrapCss.wrapped) {
        icon.classList.add("wrapped");
        icon.classList.remove("unwrap");
      } else {
        icon.classList.add("unwrap");
        icon.classList.remove("wrapped");
      }
    }
    busy = false;
  },

  getPrevSib = function(el, name) {
    var prev = el.previousSibling;
    while (prev) {
      if (prev.nodeType !== 1 || !prev.classList.contains(name)) {
        prev = prev.previousSibling;
      } else {
        return prev;
      }
    }
    return null;
  },

  // Add code wrap toggle
  buildCodeWrap = function() {
    // mutation events happen quick, so we still add an update flag
    busy = true;
    // add wrap code icons
    var tmp,
    wrapper = document.querySelectorAll(".blob-wrapper"),
    indx = wrapper ? wrapper.length : 0,

    // <div class='ghd-wrap-toggle tooltipped tooltipped-w' aria-label='Toggle code wrap'>
    icon = document.createElement("div");
    icon.className = "ghd-wrap-toggle tooltipped tooltipped-w";
    icon.setAttribute("aria-label", "Toggle code wrap");
    icon.innerHTML = wrapIcon;
    // $(".blob-wrapper").prepend(wrapIcon);
    while (indx--) {
      if (!wrapper[indx].querySelector(".ghd-wrap-toggle")) {
        wrapper[indx].insertBefore(icon.cloneNode(true), wrapper[indx].childNodes[0]);
      }
    }

    // $(".markdown-body pre").before(wrapIcon);
    wrapper = document.querySelectorAll(".markdown-body pre");
    indx = wrapper ? wrapper.length : 0;
    while (indx--) {
      tmp = getPrevSib(wrapper[indx], "ghd-wrap-toggle");
      if (!tmp) {
        wrapper[indx].parentNode.insertBefore(icon.cloneNode(true), wrapper[indx]);
      }
    }

    busy = false;
  },

  init = function() {
    document.addEventListener("click", findWrap);
    if (!globalWrap) {
      document.querySelector("body").classList.add("nowrap");
    }
    buildCodeWrap();
  },

  // DOM targets - to detect GitHub dynamic ajax page loading
  targets = document.querySelectorAll([
    "#js-repo-pjax-container",
    // targeted by ZenHub
    "#js-repo-pjax-container > .container",
    "#js-pjax-container",
    ".js-preview-body"
  ].join(","));

  // don't initialize if GitHub Dark Script is active
  if (!document.querySelector("#ghd-menu")) {
    GM_addStyle([
      // icons next to a pre
      ".ghd-wrap-toggle { position:absolute; right:1.4em; margin-top:.2em; -moz-user-select:none; -webkit-user-select:none; cursor:pointer; z-index:20; }",
      // file & diff code tables
      ".ghd-wrap-table td.blob-code-inner { white-space: pre-wrap !important; word-break: break-all !important; }",
      ".ghd-unwrap-table td.blob-code-inner { white-space: pre !important; word-break: normal !important; }",

      // icons inside a wrapper immediatly around a pre
      ".highlight > .ghd-wrap-toggle { right:.5em; top:.5em; margin-top:0; }",
      // icons for non-syntax highlighted code blocks; see https://github.com/gjtorikian/html-proofer/blob/master/README.md
      ".markdown-body:not(.comment-body) .ghd-wrap-toggle:not(:first-child) { right: 3.4em; }",
      ".ghd-wrap-toggle svg { height:1.25em; width:1.25em; fill:rgba(110,110,110,.4); pointer-events:none; }",
      ".ghd-wrap-toggle.unwrap:hover svg, .ghd-wrap-toggle:hover svg { fill:#8b0000; }", // wrap disabled (red)
      "body:not(.nowrap) .ghd-wrap-toggle:not(.unwrap):hover svg, .ghd-wrap-toggle.wrapped:hover svg { fill:#006400; }", // wrap enabled (green)
      ".blob-wrapper, .markdown-body pre, .markdown-body .highlight { position:relative; }",
      // global code wrap
      ".blob-code-inner,",
      ".markdown-body pre > code,",
      ".markdown-body .highlight > pre {",
        "white-space: pre-wrap !important;",
        "word-break: break-all !important;",
        "overflow-wrap: break-word !important;",
        "display: block !important;",
      "}",
      "td.blob-code-inner {display: table-cell !important;}"
    ].join(""));

    // update TOC when content changes
    Array.prototype.forEach.call(targets, function(target) {
      new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          // preform checks before adding code wrap to minimize function calls
          if (!busy && mutation.target === target) {
            buildCodeWrap();
          }
        });
      }).observe(target, {
        childList: true,
        subtree: true
      });
    });

    // Add GM options
    GM_registerMenuCommand("Set Global Code Wrap Option", function() {
      var body = document.querySelector("body"),
        val = prompt("Global Code Wrap (true/false):", globalWrap);
      globalWrap = /^t/.test(val);
      GM_setValue("github-global-code-wrap", globalWrap);
      if (!globalWrap) {
        body.classList.add("nowrap");
      } else {
        body.classList.remove("nowrap");
      }
    });

    init();
  }

})();
