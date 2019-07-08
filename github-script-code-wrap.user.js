// ==UserScript==
// @name        GitHub Toggle Code Wrap
// @version     1.1.11
// @description A userscript that adds a code wrap toggle button
// @license     MIT
// @author      StylishThemes
// @namespace   https://github.com/StylishThemes
// @include     https://github.com/*
// @include     https://gist.github.com/*
// @run-at      document-idle
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @require     https://greasyfork.org/scripts/28721-mutations/code/mutations.js?version=634242
// @icon        https://avatars3.githubusercontent.com/u/6145677?v=3&s=200
// @updateURL   https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-code-wrap.user.js
// @downloadURL https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-script-code-wrap.user.js
// ==/UserScript==
/* jshint esnext:true, unused:true */
(() => {
  "use strict";
  // This code is also part of the GitHub-Dark Script
  // (https://github.com/StylishThemes/GitHub-Dark-Script)
  // Extracted out into a separate userscript in case users only want
  // to add this functionality
  // set by GM popup menu
  let globalWrap = GM_getValue("github-global-code-wrap", true),
    busy = false;

  const wrapIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 768 768">
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

  function findSibling(node, selector) {
    node = node.parentNode.firstElementChild;
    while ((node = node.nextElementSibling)) {
      if (node.matches(selector)) {
        return node;
      }
    }
    return null;
  }

  function toggleClasses(button) {
    let css;
    const target = findSibling(button, "code, pre, .highlight, .diff-table");

    if (!target) {
      console.error("Code wrap icon associated code not found", button);
      return;
    }
    // code with line numbers
    if (target.nodeName === "TABLE") {
      if (target.className.indexOf("wrap-table") < 0) {
        css = !globalWrap;
      } else {
        css = target.classList.contains("ghd-unwrap-table");
      }
      target.classList.toggle("ghd-wrap-table", css);
      target.classList.toggle("ghd-unwrap-table", !css);
      button.classList.toggle("wrapped", css);
      button.classList.toggle("unwrap", !css);
    } else {
      css = target.getAttribute("style") || "";
      if (css === "") {
        css = wrapCss[globalWrap ? "unwrap" : "wrapped"];
      } else {
        css = wrapCss[css === wrapCss.wrapped ? "unwrap" : "wrapped"];
      }
      target.setAttribute("style", css);
      button.classList.toggle("wrapped", css === wrapCss.wrapped);
      button.classList.toggle("unwrap", css === wrapCss.wrapped);
    }
  }

  function addCodeWrapButton(button, target) {
    target.insertBefore(button.cloneNode(true), target.childNodes[0]);
    target.classList.add("ghd-code-wrapper");
  }

  function moveMenu(codeWrap) {
    const menu = $("details", codeWrap);
    if (menu) {
      menu.classList.add("ghd-menu");
      codeWrap.parentNode.appendChild(menu);
    }
  }

  // Add code wrap toggle
  function buildCodeWrap() {
    if (busy) {
      return;
    }
    busy = true;

    // add wrap code buttons
    let wrapper = $$(".blob-wrapper"),
      indx = wrapper ? wrapper.length : 0;
    const button = document.createElement("button");
    button.className = "ghd-wrap-toggle tooltipped tooltipped-sw btn btn-sm" +
        (globalWrap ? "" : " unwrap");
    button.setAttribute("aria-label", "Toggle code wrap");
    button.innerHTML = wrapIcon;

    // Code in table with line numbers
    while (indx--) {
      if (!$(".ghd-wrap-toggle", wrapper[indx])) {
        addCodeWrapButton(button, wrapper[indx]);
        moveMenu(wrapper[indx]); // Fixes #66
      }
    }

    // Code in markdown comments & wiki pages
    wrapper = $$(`
      .markdown-body pre:not(.ghd-code-wrapper),
      .markdown-format pre:not(.ghd-code-wrapper)`
    );
    indx = wrapper ? wrapper.length : 0;
    while (indx--) {
      const pre = wrapper[indx];
      const code = $("code", pre);
      const wrap = pre.parentNode;
      if (code) {
        addCodeWrapButton(button, pre);
      } else if (wrap.classList.contains("highlight")) {
        addCodeWrapButton(button, wrap);
      }
    }
    busy = false;
  }

  function init() {
    document.addEventListener("click", findWrap);
    $("body").classList.toggle("nowrap", !globalWrap);
    buildCodeWrap();
  }

  function $(str, el) {
    return (el || document).querySelector(str);
  }

  function $$(str, el) {
    return [...(el || document).querySelectorAll(str)];
  }

  // don't initialize if GitHub Dark Script is active
  if (!$("#ghd-menu")) {
    GM_addStyle(`
      /* icons next to a pre */
      .ghd-wrap-toggle {
        padding: 3px 5px;
        position: absolute;
        right: 3px;
        top: 3px;
        -moz-user-select: none;
        -webkit-user-select: none;
        cursor: pointer;
        z-index: 20;
      }
      .ghd-code-wrapper:not(:hover) .ghd-wrap-toggle {
        border-color: transparent !important;
        background: transparent !important;
      }
      .ghd-menu {
        margin-top: 45px;
      }
      /* file & diff code tables */
      body .ghd-wrap-table td.blob-code-inner:not(.blob-code-hunk) {
        white-space: pre-wrap !important;
        word-break: break-all !important;
      }
      body .ghd-unwrap-table td.blob-code-inner:not(.blob-code-hunk) {
        white-space: pre !important;
        word-break: normal !important;
      }
      /* icons for non-syntax highlighted code blocks;
       * see https://github.com/gjtorikian/html-proofer/blob/master/README.md
       */
      .markdown-body:not(.comment-body) .ghd-wrap-toggle:not(:first-child) {
        right: 3.4em;
      }
      .ghd-wrap-toggle svg {
        height: 14px;
        width: 14px;
        fill: rgba(110, 110, 110, .4);
        pointer-events: none;
        vertical-align: text-bottom;
      }
      .ghd-code-wrapper:hover .ghd-wrap-toggle.unwrap svg,
      .ghd-code-wrapper:hover .ghd-wrap-toggle svg {
        fill: #8b0000; /* wrap disabled (red) */
      }
      body:not(.nowrap) .ghd-code-wrapper:hover .ghd-wrap-toggle:not(.unwrap) svg,
      .ghd-code-wrapper:hover .ghd-wrap-toggle.wrapped svg {
        fill: #006400; /* wrap enabled (green) */
      }
      .blob-wrapper, .markdown-body pre, .markdown-body .highlight,
      .ghd-code-wrapper {
        position: relative;
      }
      /* global code wrap */
      body:not(.nowrap) .blob-code-inner:not(.blob-code-hunk),
      body:not(.nowrap) .markdown-body pre > code,
      body:not(.nowrap) .markdown-body .highlight > pre {
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
