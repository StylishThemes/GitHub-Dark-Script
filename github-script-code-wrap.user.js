// ==UserScript==
// @name        GitHub Toggle Code Wrap
// @version     1.1.3
// @description A userscript that adds a code wrap toggle button
// @license     MIT
// @author      StylishThemes
// @namespace   https://github.com/StylishThemes
// @include     https://github.com/*
// @run-at      document-idle
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @require     https://greasyfork.org/scripts/28721-mutations/code/mutations.js?version=189706
// @icon        https://avatars3.githubusercontent.com/u/6145677?v=3&s=200
// @updateURL   https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-code-wrap.user.js
// @downloadURL https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-code-wrap.user.js
// ==/UserScript==
/* jshint esnext:true, unused:true */
(() => {
  "use strict";
  /*
  This code is also part of the GitHub-Dark Script
  (https://github.com/StylishThemes/GitHub-Dark-Script)
  Extracted out into a separate userscript in case users only want
  to add this functionality
  */
  // set by GM popup menu
  let globalWrap = GM_getValue("github-global-code-wrap", true),
    busy = false;

  const wrapIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="0 0 768 768">
      <path d="M544.5 352.5q52.5 0 90 37.5t37.5 90-37.5 90-90 37.5H480V672l-96-96 96-96v64.5h72q25.5 0 45-19.5t19.5-45-19.5-45-45-19.5H127.5v-63h417zm96-192v63h-513v-63h513zm-513 447v-63h192v63h-192z"/>
    </svg>`,

    // inline code wrap css
    wrapCss = {
      "wrapped": "white-space: pre-wrap !important; word-break: break-all !important; overflow-wrap: break-word !important; display: block !important;",
      "unwrap": "white-space: pre !important; word-break: normal !important; display: block !important;"
    };

  function findWrap(event) {
    const target = event.target;
    if (target.classList.contains("ghd-wrap-toggle")) {
      toggleClasses(target);
    }
  }

  // equivalent to .next("code, pre, .highlight, .diff-table");
  function findNext(el) {
    const nextSib = el.nextElementSibling;
    if (
      /code|pre/i.test(nextSib.nodeName) ||
      nextSib && (
        nextSib.classList.contains("highlight") ||
        nextSib.classList.contains("diff-table")
      )
    ) {
      return nextSib;
    }
    return el;
  }

  function toggleClasses(icon) {
    let css,
      code = findNext(icon);
    if ($("code", code)) {
      code = $("code", code);
    }
    if (!code) {
      console.error("Code wrap icon associated code not found", icon);
      return;
    }
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
  }

  function getPrevSib(el, name) {
    let prev = el.previousSibling;
    while (prev) {
      if (prev.nodeType !== 1 || !prev.classList.contains(name)) {
        prev = prev.previousSibling;
      } else {
        return prev;
      }
    }
    return null;
  }

  // Add code wrap toggle
  function buildCodeWrap() {
    if (busy) {
      return;
    }
    busy = true;
    // add wrap code icons
    let tmp,
      wrapper = $$(".blob-wrapper"),
      indx = wrapper ? wrapper.length : 0,

      // <div class="ghd-wrap-toggle tooltipped tooltipped-w"
      // aria-label="Toggle code wrap">
      icon = document.createElement("div");
      icon.className = "ghd-wrap-toggle tooltipped tooltipped-w";
      icon.setAttribute("aria-label", "Toggle code wrap");
      icon.innerHTML = wrapIcon;

    // $(".blob-wrapper").prepend(wrapIcon);
    while (indx--) {
      if (!$(".ghd-wrap-toggle", wrapper[indx])) {
        wrapper[indx].insertBefore(
          icon.cloneNode(true), wrapper[indx].childNodes[0]
        );
      }
    }

    // $(".markdown-body pre").before(wrapIcon);
    wrapper = $$(".markdown-body pre");
    indx = wrapper ? wrapper.length : 0;
    while (indx--) {
      tmp = getPrevSib(wrapper[indx], "ghd-wrap-toggle");
      if (!tmp) {
        wrapper[indx].parentNode.insertBefore(
          icon.cloneNode(true), wrapper[indx]
        );
      }
    }
    busy = false;
  }

  function init() {
    document.addEventListener("click", findWrap);
    if (!globalWrap) {
      $("body").classList.add("nowrap");
    }
    buildCodeWrap();
  }

  function $(str, el) {
    return (el || document).querySelector(str);
  }

  function $$(str, el) {
    return Array.from((el || document).querySelectorAll(str));
  }

  // don't initialize if GitHub Dark Script is active
  if (!$("#ghd-menu")) {
    GM_addStyle(`
      /* icons next to a pre */
      .ghd-wrap-toggle {
        position: absolute;
        right: 1.4em;
        margin-top: .2em;
        -moz-user-select: none;
        -webkit-user-select: none;
        cursor: pointer;
        z-index: 20;
      }
      /* file & diff code tables */
      .ghd-wrap-table td.blob-code-inner {
        white-space: pre-wrap !important;
        word-break: break-all !important;
      }
      .ghd-unwrap-table td.blob-code-inner {
        white-space: pre !important;
        word-break: normal !important;
      }
      /* icons inside a wrapper immediatly around a pre */
      .highlight > .ghd-wrap-toggle {
        right: .5em;
        top: .5em;
        margin-top: 0;
      }
      /* icons for non-syntax highlighted code blocks;
       * see https://github.com/gjtorikian/html-proofer/blob/master/README.md
       */
      .markdown-body:not(.comment-body) .ghd-wrap-toggle:not(:first-child) {
        right: 3.4em;
      }
      .ghd-wrap-toggle svg {
        height: 1.25em;
        width: 1.25em;
        fill: rgba(110, 110, 110, .4);
        pointer-events: none;
      }
      .ghd-wrap-toggle.unwrap:hover svg, .ghd-wrap-toggle:hover svg {
        fill: #8b0000; /* wrap disabled (red) */
      }
      body:not(.nowrap) .ghd-wrap-toggle:not(.unwrap):hover svg,
      .ghd-wrap-toggle.wrapped:hover svg {
        fill: #006400; /* wrap enabled (green) */
      }
      .blob-wrapper, .markdown-body pre, .markdown-body .highlight {
        position:relative;
      }
      /* global code wrap */
      .blob-code-inner,
      .markdown-body pre > code,
      .markdown-body .highlight > pre {
        white-space: pre-wrap !important;
        word-break: break-all !important;
        overflow-wrap: break-word !important;
        display: block !important;
      }
      td.blob-code-inner {
        display: table-cell !important;
      }
    `);

    document.addEventListener("ghmo:container", buildCodeWrap);
    document.addEventListener("ghmo:preview", buildCodeWrap);

    // Add GM options
    GM_registerMenuCommand("Set Global Code Wrap Option", () => {
      const body = $("body"),
        val = prompt("Global Code Wrap (true/false):", "" + globalWrap);
      globalWrap = /^t/.test(val);
      GM_setValue("github-global-code-wrap", globalWrap);
      body.classList.toggle("nowrap", !globalWrap);
    });

    init();
  }

})();
