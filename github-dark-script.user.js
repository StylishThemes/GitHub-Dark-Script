// ==UserScript==
// @name        GitHub Dark Script
// @version     2.5.9
// @description GitHub Dark in userscript form, with a settings panel
// @license     MIT
// @author      StylishThemes
// @namespace   https://github.com/StylishThemes
// @include     /^https?://((blog|gist|guides|help|raw|status|developer)\.)?github\.com/((?!generated_pages\/preview).)*$/
// @include     https://*.githubusercontent.com/*
// @include     https://*graphql-explorer.githubapp.com/*
// @run-at      document-start
// @inject-into content
// @grant       GM.addStyle
// @grant       GM_addStyle
// @grant       GM.getValue
// @grant       GM_getValue
// @grant       GM.setValue
// @grant       GM_setValue
// @grant       GM.info
// @grant       GM_info
// @grant       GM.xmlHttpRequest
// @grant       GM_xmlhttpRequest
// @grant       GM.registerMenuCommand
// @grant       GM_registerMenuCommand
// @connect     githubusercontent.com
// @connect     raw.githubusercontent.com
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require     https://greasyfork.org/scripts/15563-jscolor/code/jscolor.js?version=106439
// @require     https://greasyfork.org/scripts/28721-mutations/code/mutations.js?version=634242
// @icon        https://avatars3.githubusercontent.com/u/6145677?v=3&s=200
// @updateURL   https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-dark-script.user.js
// @downloadURL https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-dark-script.user.js
// @homepageURL https://github.com/StylishThemes/GitHub-Dark-Script
// ==/UserScript==
/* global jscolor */
(async () => {
  "use strict";

  const version = GM.info.script.version,

    // delay until package.json allowed to load
    delay = 8.64e7, // 24 hours in milliseconds

    // Keyboard shortcut to open ghd panel (only a two key combo coded)
    keyboardOpen = "g+0",
    keyboardToggle = "g+-",
    // keyboard shortcut delay from first to second letter
    keyboardDelay = 1000,

    // base urls to fetch style and package.json
    root = "https://raw.githubusercontent.com/StylishThemes/GitHub-Dark/master/",

    defaults = {
      attach: "scroll",
      color: "#4183C4",
      enable: true,
      font: "Menlo",
      image: "url('data:image/png;base64,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')",
      tab: 0, // 0 is disabled
      theme: "Twilight", // GitHub
      themeCm: "Twilight", // CodeMirror
      themeJp: "Twilight", // Jupyter
      type: "tiled",
      wrap: false,

      // toggle buttons
      enableCodeWrap: true,
      enableMonospace: true,
      // diff toggle + accordion mode
      modeDiffToggle: "1",

      // internal variables
      date: 0,
      version: 0,
      rawCss: "",
      cssgithub: "",
      csscodemirror: "",
      cssjupyter: "",
      processedCss: ""
    },

    // extract style & theme name
    regex = /\/\*! [^*]+ \*\//,
    themesXref = {
      github: {
        placeholder: "syntax-theme",
        folder: "themes/github/"
      },
      codemirror: {
        placeholder: "syntax-codemirror",
        folder: "themes/codemirror/"
      },
      jupyter: {
        placeholder: "syntax-jupyter",
        folder: "themes/jupyter/"
      }
    },
    // available theme names
    themes = {
      github: {
        "Ambiance": "ambiance",
        "Chaos": "chaos",
        "Clouds Midnight": "clouds-midnight",
        "Cobalt": "cobalt",
        "GitHub Dark": "github-dark",
        "Idle Fingers": "idle-fingers",
        "Kr Theme": "kr-theme",
        "Merbivore": "merbivore",
        "Merbivore Soft": "merbivore-soft",
        "Mono Industrial": "mono-industrial",
        "Mono Industrial Clear": "mono-industrial-clear",
        "Monokai": "monokai",
        "Monokai Spacegray Eighties": "monokai-spacegray-eighties",
        "Obsidian": "obsidian",
        "One Dark": "one-dark",
        "Pastel on Dark": "pastel-on-dark",
        "Railscasts": "railscasts",
        "Solarized Dark": "solarized-dark",
        "Terminal": "terminal",
        "Tomorrow Night": "tomorrow-night",
        "Tomorrow Night Blue": "tomorrow-night-blue",
        "Tomorrow Night Bright": "tomorrow-night-bright",
        "Tomorrow Night Eigthies": "tomorrow-night-eighties",
        "Twilight": "twilight",
        "Vibrant Ink": "vibrant-ink"
      },
      // CodeMirror themes
      codemirror: {
        "Ambiance": "ambiance",
        "Base16 Ocean Dark": "base16-ocean-dark",
        "Cobalt": "cobalt",
        "Dracula": "dracula",
        "Material": "material",
        "Monokai": "monokai",
        "Monokai Spacegray Eighties": "monokai-spacegray-eighties",
        "One Dark": "one-dark",
        "Pastel on Dark": "pastel-on-dark",
        "Railscasts": "railscasts",
        "Solarized Dark": "solarized-dark",
        "Tomorrow Night Bright": "tomorrow-night-bright",
        "Tomorrow Night Eigthies": "tomorrow-night-eighties",
        "Twilight": "twilight",
        "Vibrant Ink": "vibrant-ink"
      },
      // Jupyter (pygments) themes
      jupyter: {
        "Base16 Ocean Dark": "base16-ocean",
        "Dracula": "dracula",
        "GitHub Dark": "github-dark",
        "Idle Fingers": "idle-fingers",
        "Monokai": "monokai",
        "Monokai Spacegray Eighties": "monokai-spacegray-eighties",
        "Obsidian": "obsidian",
        "Pastel on Dark": "pastel-on-dark",
        "Railscasts": "railscasts",
        "Solarized Dark": "solarized-dark",
        "Tomorrow Night": "tomorrow-night",
        "Tomorrow Night Blue": "tomorrow-night-blue",
        "Tomorrow Night Bright": "tomorrow-night-bright",
        "Tomorrow Night Eigthies": "tomorrow-night-eighties",
        "Twilight": "twilight"
      }
    },

    type = {
      tiled: `
        background-repeat: repeat !important;
        background-size: auto !important;
        background-position: left top !important;
      `,
      fit: `
        background-repeat: no-repeat !important;
        background-size: cover !important;
        background-position: center top !important;
      `
    },

    wrapCss = {
      wrapped: `
        white-space: pre-wrap !important;
        word-break: break-all !important;
        overflow-wrap: break-word !important;
        display: block !important;
      `,
      unwrap: `
        white-space: pre !important;
        word-break: normal !important;
        display: block !important;
      `
    },

    // https://github.com/StylishThemes/GitHub-code-wrap/blob/master/github-code-wrap.css
    wrapCodeCss = `
      /* GitHub: Enable wrapping of long code lines */
      .blob-code-inner:not(.blob-code-hunk),
      .markdown-body pre > code,
      .markdown-body .highlight > pre { ${wrapCss.wrapped} }
      td.blob-code-inner {
        display: table-cell !important;
      }
    `,

    wrapIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="0 0 768 768">
        <path d="M544.5 352.5q52.5 0 90 37.5t37.5 90-37.5 90-90 37.5H480V672l-96-96 96-96v64.5h72q25.5 0 45-19.5t19.5-45-19.5-45-45-19.5H127.5v-63h417zm96-192v63h-513v-63h513zm-513 447v-63h192v63h-192z"/>
      </svg>
    `,

    monospaceIcon = `
      <svg class="octicon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32">
        <path d="M5.91 7.31v8.41c0 .66.05 1.09.14 1.31.09.21.23.37.41.48.18.11.52.16 1.02.16v.41H2.41v-.41c.5 0 .86-.05 1.03-.14.16-.11.3-.27.41-.5.11-.23.16-.66.16-1.3V11.7c0-1.14-.04-1.87-.11-2.2-.04-.26-.13-.42-.24-.53-.11-.1-.27-.14-.46-.14-.21 0-.48.05-.77.18l-.18-.41 3.14-1.28h.52v-.01zm-.95-5.46c.32 0 .59.11.82.34.23.23.34.5.34.82 0 .32-.11.59-.34.82-.23.22-.51.34-.82.34-.32 0-.59-.11-.82-.34s-.36-.5-.36-.82c0-.32.11-.59.34-.82.24-.23.51-.34.84-.34zm19.636 19.006h-3.39v-1.64h5.39v9.8h3.43v1.66h-9.18v-1.66h3.77v-8.16h-.02zm.7-6.44c.21 0 .43.04.63.13.18.09.36.2.5.34s.25.3.34.5c.07.18.13.39.13.61 0 .22-.04.41-.13.61s-.19.36-.34.5-.3.25-.5.32c-.2.09-.39.13-.62.13-.21 0-.43-.04-.61-.12-.19-.07-.35-.19-.5-.34-.14-.14-.25-.3-.34-.5-.07-.2-.13-.39-.13-.61s.04-.43.13-.61c.07-.18.2-.36.34-.5s.31-.25.5-.34c.17-.09.39-.12.6-.12zM2 30L27.82 2H30L4.14 30H2z"/>
      </svg>
    `,

    fileIcon = `
      <svg class="octicon" xmlns="http://www.w3.org/2000/svg" width="10" height="6.5" viewBox="0 0 10 6.5">
        <path d="M0 1.5L1.5 0l3.5 3.7L8.5.0 10 1.5 5 6.5 0 1.5z"/>
      </svg>
    `,

    $style = make({
      el: "style",
      cl4ss: "ghd-style"
    });

  let timer, picker; // jscolor picker
  let isInitialized = "pending";
  // prevent mutationObserver from going nuts
  let isUpdating = false;
  // set when css code to test is pasted into the settings panel
  let testing = false;
  const debug = true;
  let data = {};

  function updatePanel() {
    if (!isInitialized || !$("#ghd-settings-inner")) { return }
    // prevent multiple change events from processing
    isUpdating = true;

    let temp;
    const body = $("body");
    const panel = $("#ghd-settings-inner");

    $(".ghd-attach", panel).value = data.attach || defaults.attach;
    $(".ghd-font", panel).value = data.font || defaults.font;
    $(".ghd-image", panel).value = data.image || defaults.image;
    $(".ghd-tab", panel).value = data.tab || defaults.tab;
    $(".ghd-theme", panel).value = data.theme || defaults.theme;
    $(".ghd-themecm", panel).value = data.themeCm || defaults.themeCm;
    $(".ghd-themejp", panel).value = data.themeJp || defaults.themeJp;
    $(".ghd-type", panel).value = data.type || defaults.type;

    $(".ghd-enable", panel).checked = isBool("enable");
    $(".ghd-wrap", panel).checked = isBool("wrap");

    $(".ghd-codewrap-checkbox", panel).checked = isBool("enableCodeWrap");
    $(".ghd-monospace-checkbox", panel).checked = isBool("enableMonospace");

    const el = $(".ghd-diff-select", panel);
    temp = `${data.modeDiffToggle || defaults.modeDiffToggle}`;
    el.value = temp;
    toggleClass(el, "enabled", temp !== "0");

    // update version tooltip
    $(".ghd-versions", panel).setAttribute("aria-label", getVersionTooltip());

    temp = data.color || defaults.color;
    $(".ghd-color").value = temp;
    // update swatch color & color picker value
    $("#ghd-swatch").style.backgroundColor = temp;

    if (picker) {
      picker.fromString(temp);
    }
    $style.disabled = !data.enable;

    toggleClass(body, "ghd-disabled", !data.enable);
    toggleClass(body, "nowrap", !data.wrap);

    if (data.enableCodeWrap !== data.lastCW ||
      data.enableMonospace !== data.lastMS ||
      data.modeDiffToggle !== data.lastDT) {
      data.lastCW = data.enableCodeWrap;
      data.lastMS = data.enableMonospace;
      data.lastDT = data.modeDiffToggle;
      updateToggles();
    }

    isUpdating = false;
  }

  async function getStoredValues(init) {
    data = await GM.getValue("data", defaults);
    try {
      data = JSON.parse(data);
      if (!Object.keys(data).length || ({}).toString.call(data) !== "[object Object]") {
        throw new Error();
      }
    } catch (err) { // compat
      data = await GM.getValue("data", defaults);
    }
    if (debug) {
      if (init) {
        console.info("GitHub-Dark Script initializing!");
      }
      console.info("Retrieved stored values", data);
    }
  }

  async function setStoredValues(reset) {
    data.processedCss = $style.textContent;
    await GM.setValue("data", JSON.stringify(reset ? defaults : data));
    updatePanel();
    if (debug) {
      console.info(`${reset ? "Resetting" : "Saving"} current values`, data);
    }
  }

  // modified from http://stackoverflow.com/a/5624139/145346
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ].join(", ") : "";
  }

  // convert version "1.2.3" into "001002003" for easier comparison
  function convertVersion(val) {
    let index;
    const parts = val ? val.split(".") : "";
    let str = "";
    const len = parts.length;

    for (index = 0; index < len; index++) {
      str += (`000${parts[index]}`).slice(-3);
    }
    if (debug) {
      console.info(`Converted version "${val}" to "${str}" for easy comparison`);
    }
    return val ? str : val;
  }

  function checkVersion() {
    if (debug) {
      console.info("Fetching package.json");
    }
    GM.xmlHttpRequest({
      method: "GET",
      url: `${root}package.json`,
      onload: response => {
        const pkg = JSON.parse(response.responseText);

        // save last loaded date, so package.json is only loaded once a day
        data.date = new Date().getTime();

        const ver = convertVersion(pkg.version);
        // if new available, load it & parse
        if (ver > data.version) {
          if (data.version !== 0 && debug) {
            console.info(`Updating from ${data.version} to ${ver}`);
          }
          data.version = ver;
          fetchAndApplyStyle();
        } else {
          addSavedStyle();
        }
        // save new date/version
        GM.setValue("data", JSON.stringify(data));
      }
    });
  }

  function fetchAndApplyStyle() {
    if (debug) {
      console.info(`Fetching ${root}github-dark.css`);
    }
    GM.xmlHttpRequest({
      method: "GET",
      url: `${root}github-dark.css`,
      onload: response => {
        data.rawCss = response.responseText;
        processStyle();
      }
    });
  }

  // load syntax highlighting theme
  function fetchAndApplyTheme(name, group) {
    if (!data.enable) {
      if (debug) {
        console.info("Disabled: stop theme processing");
      }
      return;
    }
    if (data[`last${group}`] === name && data[`css${group}`] !== "") {
      return applyTheme(name, group);
    }
    const themeUrl = `${root}${themesXref[group].folder}${themes[group][name]}.min.css`;
    if (debug) {
      console.info(`Fetching ${group} ${name} theme`, themeUrl);
    }
    GM.xmlHttpRequest({
      method: "GET",
      url: themeUrl,
      onload: response => {
        let theme = response.responseText;
        if (response.status === 200 && theme) {
          data[`css${group}`] = theme;
          data[`last${group}`] = name;
          applyTheme(name, group);
        } else {
          theme = data[`css${group}`];
          console.error(`Failed to load ${group} theme file: "${name}"`);
          console.info(`Falling back to previous ${group} theme of ${theme.substring(0, theme.indexOf("*/") + 2)}`);
        }
      }
    });
  }

  async function applyTheme(_name, group) {
    let theme, css;
    if (debug) {
      theme = (data[`css${group}`] || "").match(regex);
      console.info(`Adding syntax ${group} theme "${theme}" to css`);
    }
    css = data.processedCss || "";
    css = css.replace(
      `/*[[${themesXref[group].placeholder}]]*/`,
      data[`css${group}`] || ""
    );
    applyStyle(css);
    await setStoredValues();
    isUpdating = false;
  }

  function setTabSize() {
    return data.tab > 0 ?
      `pre, .highlight, .diff-table, .tab-size {
          tab-size: ${data.tab} !important;
          -moz-tab-size: ${data.tab} !important;
        }` :
      "";
  }

  function processStyle() {
    const url = (data.image || "").startsWith("url") ? data.image : (data.image === "none" ? "none" : `url('${data.image}')`);
    if (!data.enable) {
      if (debug) {
        console.info("Disabled: stop processing");
      }
      return;
    }
    if (debug) {
      console.info("Processing set styles");
    }

    const processed = (data.rawCss || "")
      // remove moz-document wrapper
      .replace(/@-moz-document regexp\((.*)\) \{(\n|\r)+/, "")
      // replace background image; if no "url" at start, then use "none"
      .replace(/\/\*\[\[bg-choice\]\]\*\/ url\(.*\)/, url)
      // Add tiled or fit window size css
      .replace("/*[[bg-options]]*/", type[data.type || "tiled"])
      // set scroll or fixed background image
      .replace("/*[[bg-attachment]]*/ fixed", data.attach || "scroll")
      // replace base-color
      .replace(/\/\*\[\[base-color\]\]\*\/ #\w{3,6}/g, data.color || "#4183C4")
      // replace base-color-rgb
      .replace(/\/\*\[\[base-color-rgb\]\]\*\//g, hexToRgb(data.color || "#4183c4"))
      // add font choice
      .replace("/*[[font-choice]]*/", data.font || "Menlo")
      // add tab size
      .replace(/\/\*\[\[tab-size\]\]\*\//g, setTabSize())
      // code wrap css
      .replace("/*[[code-wrap]]*/", data.wrap ? wrapCodeCss : "")
      // remove default syntax
      .replace(/\s+\/\* grunt build - remove start[\s\S]+grunt build - remove end \*\/$/m, "");

    data.processedCss = processed;
    fetchAndApplyTheme(data.theme, "github");
    fetchAndApplyTheme(data.themeCm, "codemirror");
    fetchAndApplyTheme(data.themeJp, "jupyter");
  }

  function applyStyle(css) {
    if (debug) {
      console.info("Applying style", `"${(css || "").match(regex)}"`);
    }
    $style.textContent = css || "";
  }

  function addSavedStyle() {
    if (debug) {
      console.info("Adding previously saved style");
    }

    // apply already processed css to prevent FOUC
    $style.textContent = data.processedCss;
  }

  function updateStyle() {
    isUpdating = true;

    if (debug) {
      console.info("Updating user settings");
    }

    const body = $("body"),
      panel = $("#ghd-settings-inner");

    data.attach = $(".ghd-attach", panel).value;
    // get hex value directly
    data.color = picker.toHEXString();
    data.enable = $(".ghd-enable", panel).checked;
    data.font = $(".ghd-font", panel).value;
    data.image = $(".ghd-image", panel).value;
    data.tab = $(".ghd-tab", panel).value;
    data.theme = $(".ghd-theme", panel).value;
    data.themeCm = $(".ghd-themecm", panel).value;
    data.themeJp = $(".ghd-themejp", panel).value;
    data.type = $(".ghd-type", panel).value;
    data.wrap = $(".ghd-wrap", panel).checked;

    data.enableCodeWrap = $(".ghd-codewrap-checkbox", panel).checked;
    data.enableMonospace = $(".ghd-monospace-checkbox", panel).checked;

    data.modeDiffToggle = $(".ghd-diff-select", panel).value;

    $style.disabled = !data.enable;

    toggleClass(body, "ghd-disabled", !data.enable);
    toggleClass(body, "nowrap", !data.wrap);

    if (testing) {
      processStyle();
      testing = false;
    } else {
      fetchAndApplyStyle();
    }
    isUpdating = false;
  }

  // user can force GitHub-dark update
  async function forceUpdate(css) {
    if (css) {
      // add raw css directly for style testing
      data.rawCss = css;
      processStyle();
    } else {
      // clear saved date
      data.version = 0;
      data.cssgithub = "";
      data.csscodemirror = "";
      data.cssjupyter = "";
      await GM.setValue("data", JSON.stringify(data));
      closePanel("forced");
    }
  }

  function getVersionTooltip() {
    let indx;
    const ver = [];
    // convert stored css version from "001014049" into "1.14.49" for tooltip
    const parts = String(data.version).match(/\d{3}/g);
    const len = parts && parts.length || 0;

    for (indx = 0; indx < len; indx++) {
      ver.push(parseInt(parts[indx]));
    }
    return `Script v${version}\nCSS ${(ver.length ? `v${ver.join(".")}` : "unknown")}`;
  }

  function buildOptions(group) {
    let options = "";
    Object.keys(themes[group]).forEach(theme => {
      options += `<option value="${theme}">${theme}</option>`;
    });
    return options;
  }

  async function buildSettings() {
    if (debug) {
      console.info("Adding settings panel & GitHub Dark link to profile dropdown");
    }
    // Script-specific CSS
    GM.addStyle(`
      #ghd-menu:hover { cursor:pointer }
      #ghd-settings { position:fixed; z-index:65535; top:0; bottom:0; left:0; right:0; opacity:0; visibility:hidden; }
      #ghd-settings.in { opacity:1; visibility:visible; background:rgba(0,0,0,.5); }
      #ghd-settings-inner { position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); width:25rem; box-shadow:0 .5rem 1rem #111; color:#c0c0c0 }
      #ghd-settings label { margin-left:.5rem; position:relative; top:-1px }
      #ghd-settings-close { height:1rem; width:1rem; fill:#666; float:right; cursor:pointer }
      #ghd-settings-close:hover { fill:#ccc }
      #ghd-settings .ghd-right { float:right; padding:5px; }
      #ghd-settings p { line-height:22px; }
      #ghd-settings .form-select, #ghd-settings input[type="text"] { height:30px; min-height:30px; }
      #ghd-swatch { width:25px; height:22px; display:inline-block; margin:3px 10px; border-radius:4px; }
      #ghd-settings input, #ghd-settings select { border:#555 1px solid; }
      #ghd-settings .ghd-attach, #ghd-settings .ghd-diff-select { padding-right:25px; }
      #ghd-settings input[type="checkbox"] { margin-top:3px; width: 16px !important; height: 16px !important; border-radius: 3px !important; }
      #ghd-settings .boxed-group-inner { padding:0; }
      #ghd-settings .ghd-footer { padding:10px; border-top:#555 solid 1px; }
      #ghd-settings .ghd-settings-wrapper { max-height:60vh; overflow-y:auto; padding:4px 10px; }
      #ghd-settings .ghd-tab { width:6em; }
      #ghd-settings .octicon { vertical-align:text-bottom !important; }
      #ghd-settings .ghd-paste-area { position:absolute; bottom:50px; top:37px; left:2px; right:2px; width:396px !important; height:-moz-calc(100% - 85px);
        resize:none !important; border-style:solid; z-index:0; }

      /* code wrap toggle: https://gist.github.com/silverwind/6c1701f56e62204cc42b
      icons next to a pre */
      .ghd-wrap-toggle { padding: 3px 5px; position:absolute; right:3px; top:3px; -moz-user-select:none; -webkit-user-select:none; cursor:pointer; z-index:20; }
      .ghd-code-wrapper:not(:hover) .ghd-wrap-toggle { border-color:transparent !important; background:transparent !important; }
      .ghd-menu { margin-top:45px; }
      /* file & diff code tables */
      .ghd-wrap-table .blob-code-inner:not(.blob-code-hunk) { white-space:pre-wrap !important; word-break:break-all !important; }
      .ghd-unwrap-table .blob-code-inner:not(.blob-code-hunk) { white-space:pre !important; word-break:normal !important; }
      .ghd-wrap-toggle > *, .ghd-monospace > *, .ghd-file-toggle > * { pointer-events:none; vertical-align:middle !important; }
      /* icons for non-syntax highlighted code blocks; see https://github.com/gjtorikian/html-proofer/blob/master/README.md */
      .markdown-body:not(.comment-body) .ghd-wrap-toggle:not(:first-child) { right:3.4em; }
      .ghd-wrap-toggle svg { height:14px; width:14px; fill:rgba(110,110,110,.4); vertical-align:text-bottom; }
      /* wrap disabled (red) */
      .ghd-code-wrapper:hover .ghd-wrap-toggle.unwrap svg, .ghd-code-wrapper:hover .ghd-wrap-toggle svg { fill:#8b0000; }
      /* wrap enabled (green) */
      body:not(.nowrap) .ghd-code-wrapper:hover .ghd-wrap-toggle:not(.unwrap) svg, .ghd-code-wrapper:hover .ghd-wrap-toggle.wrapped svg { fill:#006400; }
      .markdown-body pre, .markdown-body .highlight, .ghd-code-wrapper { position:relative; }
      /* monospace font toggle */
      .ghd-monospace-font { font-family:"${data.font}", Menlo, Inconsolata, "Droid Mono", monospace !important; font-size:1em !important; }
      /* file collapsed icon */
      .Details--on .ghd-file-toggle svg { -webkit-transform:rotate(90deg); transform:rotate(90deg); }
    `);

    const opts = buildOptions("github");
    const optscm = buildOptions("codemirror");
    const optsjp = buildOptions("jupyter");
    const ver = getVersionTooltip();

    // circle-question-mark icon
    const icon = `
      <svg class="octicon" xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 16 14">
        <path d="M6 10h2v2H6V10z m4-3.5c0 2.14-2 2.5-2 2.5H6c0-0.55 0.45-1 1-1h0.5c0.28 0 0.5-0.22 0.5-0.5v-1c0-0.28-0.22-0.5-0.5-0.5h-1c-0.28 0-0.5 0.22-0.5 0.5v0.5H4c0-1.5 1.5-3 3-3s3 1 3 2.5zM7 2.3c3.14 0 5.7 2.56 5.7 5.7S10.14 13.7 7 13.7 1.3 11.14 1.3 8s2.56-5.7 5.7-5.7m0-1.3C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7S10.86 1 7 1z" />
      </svg>
    `;

    // Settings panel markup
    make({
      el: "div",
      appendTo: "body",
      attr: {id: "ghd-settings"},
      html: `
        <div id="ghd-settings-inner" class="boxed-group">
          <h3>GitHub-Dark Settings
            <a href="https://github.com/StylishThemes/GitHub-Dark-Script/wiki" class="tooltipped tooltipped-e" aria-label="See documentation">${icon}</a>
            <svg id="ghd-settings-close" xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="160 160 608 608"><path d="M686.2 286.8L507.7 465.3l178.5 178.5-45 45-178.5-178.5-178.5 178.5-45-45 178.5-178.5-178.5-178.5 45-45 178.5 178.5 178.5-178.5z"/></svg>
          </h3>
          <div class="boxed-group-inner">
            <form>
              <div class="ghd-settings-wrapper">
                <p class="ghd-checkbox">
                  <label>Enable GitHub-Dark<input class="ghd-enable ghd-right" type="checkbox"></label>
                </p>
                <p>
                  <label>Color:</label>
                  <input class="ghd-color ghd-right form-control" type="text" value="#4183C4">
                  <span id="ghd-swatch" class="ghd-right"></span>
                </p>
                <h4>Background</h4>
                <p>
                  <label>Image:</label>
                  <input class="ghd-image ghd-right form-control" type="text">
                  <a href="https://github.com/StylishThemes/GitHub-Dark/wiki/Image" class="tooltipped tooltipped-e" aria-label="Click to learn about GitHub's Content Security&#10;Policy and how to add a custom image">${icon}</a>
                </p>
                <p>
                  <label>Image type:</label>
                  <select class="ghd-type ghd-right form-select">
                    <option value="tiled">Tiled</option>
                    <option value="fit">Fit window</option>
                  </select>
                </p>
                <p>
                  <label>Image attachment:</label>
                  <select class="ghd-attach ghd-right form-select">
                    <option value="scroll">Scroll</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </p>
                <h4>Code</h4>
                <p><label>GitHub Theme:</label> <select class="ghd-theme ghd-right form-select">${opts}</select></p>
                <p><label>CodeMirror Theme:</label> <select class="ghd-themecm ghd-right form-select">${optscm}</select></p>
                <p><label>Jupyter Theme:</label> <select class="ghd-themejp ghd-right form-select">${optsjp}</select></p>
                <p>
                  <label>Font Name:</label> <input class="ghd-font ghd-right form-control" type="text">
                  <a href="http://www.cssfontstack.com/" class="tooltipped tooltipped-e" aria-label="Add a system installed (monospaced) font name;&#10;this script will not load external fonts!">${icon}</a>
                </p>
                <p>
                  <label>Tab Size:</label>
                  <select class="ghd-tab ghd-right form-select">
                    <option value="0">disable</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                  </select>
                </p>
                <p class="ghd-checkbox">
                  <label>Wrap<input class="ghd-wrap ghd-right" type="checkbox"></label>
                </p>
                <h4>Toggles</h4>
                <p class="ghd-checkbox">
                  <label>Code Wrap<input class="ghd-codewrap-checkbox ghd-right" type="checkbox"></label>
                </p>
                <p class="ghd-checkbox">
                  <label>Comment Monospace Font<input class="ghd-monospace-checkbox ghd-right" type="checkbox"></label>
                </p>
                <p class="ghd-range">
                  <label>Diff File Collapse</label>
                  <select class="ghd-diff-select ghd-right form-select">
                    <option value="0">Disabled</option>
                    <option value="1">Enabled</option>
                    <option value="2">Accordion</option>
                  </select>
                </p>
              </div>
              <div class="ghd-footer">
                <div class="BtnGroup">
                  <a href="#" class="ghd-update btn btn-sm tooltipped tooltipped-n tooltipped-multiline" aria-label="Update style if the newest release is not loading; the page will reload!">Force Update Style</a>
                  <a href="#" class="ghd-textarea-toggle btn btn-sm tooltipped tooltipped-n" aria-label="Paste CSS update">
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16" fill="#eee">
                      <path d="M15 11 1 11 8 3z"/>
                    </svg>
                  </a>
                  <div class="ghd-paste-area-content" aria-hidden="true" style="display:none">
                    <textarea class="ghd-paste-area" placeholder="Paste GitHub-Dark Style here!"></textarea>
                  </div>
                </div>&nbsp;
                <a href="#" class="ghd-reset btn btn-sm btn-danger tooltipped tooltipped-n" aria-label="Reset to defaults;&#10;there is no undo!">Reset All Settings</a>
                <span class="ghd-versions ghd-right tooltipped tooltipped-n" aria-label="${ver}">
                  <svg class="ghd-info" xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24">
                    <path fill="#444" d="M12,9c0.82,0,1.5-0.68,1.5-1.5S12.82,6,12,6s-1.5,0.68-1.5,1.5S11.18,9,12,9z M12,1.5 C6.211,1.5,1.5,6.211,1.5,12S6.211,22.5,12,22.5S22.5,17.789,22.5,12S17.789,1.5,12,1.5z M12,19.5c-4.148,0-7.5-3.352-7.5-7.5 S7.852,4.5,12,4.5s7.5,3.352,7.5,7.5S16.148,19.5,12,19.5z M13.5,12c0-0.75-0.75-1.5-1.5-1.5s-0.75,0-1.5,0S9,11.25,9,12h1.5 c0,0,0,3.75,0,4.5S11.25,18,12,18s0.75,0,1.5,0s1.5-0.75,1.5-1.5h-1.5C13.5,16.5,13.5,12.75,13.5,12z"/>
                  </svg>
                </span>
              </div>
            </form>
          </div>
        </div>
      `
    });
    updateToggles();
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
    // mutation events happen quick, so we still add an update flag
    isUpdating = true;
    const icon = make({
      el: "button",
      cl4ss: `ghd-wrap-toggle tooltipped tooltipped-sw btn btn-sm${
        data.wrap ? "" : " unwrap"}`,
      attr: {"aria-label": "Toggle code wrap"},
      html: wrapIcon
    });
    $$(".blob-wrapper").forEach(el => {
      if (el && !$(".ghd-wrap-toggle", el)) {
        addCodeWrapButton(icon, el);
        moveMenu(el); // Fixes #66
      }
    });
    $$(`
      .markdown-body pre:not(.ghd-code-wrapper),
      .markdown-format pre:not(.ghd-code-wrapper)`
    ).forEach(pre => {
      const code = $("code", pre);
      const wrap = pre.parentNode;
      if (code) {
        addCodeWrapButton(icon, pre);
      } else if (wrap.classList.contains("highlight")) {
        addCodeWrapButton(icon, wrap);
      }
    });
    isUpdating = false;
  }

  // Add monospace font toggle
  function addMonospaceToggle() {
    isUpdating = true;
    const button = make({
      el: "button",
      cl4ss: "ghd-monospace toolbar-item tooltipped tooltipped-n",
      attr: {
        "type": "button",
        "aria-label": "Toggle monospaced font",
        "tabindex": "-1"
      },
      html: monospaceIcon
    });
    $$(".toolbar-commenting").forEach(el => {
      if (el && !$(".ghd-monospace", el)) {
        // prepend
        el.insertBefore(button.cloneNode(true), el.childNodes[0]);
      }
    });
    isUpdating = false;
  }

  // Add file diffs toggle
  function addFileToggle() {
    isUpdating = true;

    const button = make({
      el: "button",
      cl4ss: "ghd-file-toggle btn btn-sm tooltipped tooltipped-n",
      attr: {
        "type": "button",
        "aria-label": "Click to Expand or Collapse file",
        "tabindex": "-1"
      },
      html: fileIcon
    });

    $$("#files .file-actions").forEach(el => {
      if (el && !$(".ghd-file-toggle", el)) {
        // hide GitHub toggle view button
        el.querySelector(".js-details-target").style.display = "none";
        el.appendChild(button.cloneNode(true));
      }
    });

    const firstButton = $(".ghd-file-toggle");
    // accordion mode = start with all but first entry collapsed
    if (firstButton && data.modeDiffToggle === "2") {
      toggleFile({
        target: firstButton
      }, true);
    }
    isUpdating = false;
  }

  // Add toggle buttons after page updates
  function updateToggles() {
    if (isUpdating) {
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (data.enableCodeWrap) {
        buildCodeWrap();
      } else {
        removeAll(".ghd-wrap-toggle");
        toggleClass($$(".Details--on"), "Details--on", false);
      }
      if (data.enableMonospace) {
        addMonospaceToggle();
      } else {
        removeAll(".ghd-monospace");
        toggleClass($$(".ghd-monospace-font"), "ghd-monospace-font", false);
      }
      if (data.modeDiffToggle !== "0") {
        addFileToggle();
      } else {
        removeAll(".ghd-file-toggle");
        toggleClass($$(".Details--on"), "Details--on", false);
      }
    }, 200);
  }

  function makeRow(vals, str) {
    return make({
      el: "tr",
      cl4ss: "ghd-shortcut",
      html: `<td class="keys"><kbd>${vals[0]}</kbd> <kbd>${vals[1]}</kbd></td><td>${str}</td>`
    });
  }

  // add keyboard shortcut to help menu (press "?")
  function buildShortcut() {
    let row;
    const el = $(".keyboard-mappings tbody");

    if (el && !$(".ghd-shortcut")) {
      row = makeRow(keyboardOpen.split("+"), "GitHub-Dark: open settings");
      el.appendChild(row);
      row = makeRow(keyboardToggle.split("+"), "GitHub-Dark: toggle style");
      el.appendChild(row);
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

  function toggleCodeWrap(el) {
    let css;
    const overallWrap = data.wrap;
    const target = findSibling(el, ".highlight, .diff-table, code, pre");

    if (!target) {
      if (debug) {
        console.info("Code wrap icon associated code not found", el);
      }
      return;
    }
    // code with line numbers
    if (target.nodeName === "TABLE") {
      if (!target.className.includes("wrap-table")) {
        css = !overallWrap;
      } else {
        css = target.classList.contains("ghd-unwrap-table");
      }
      toggleClass(target, "ghd-wrap-table", css);
      toggleClass(target, "ghd-unwrap-table", !css);
      toggleClass(el, "wrapped", css);
      toggleClass(el, "unwrap", !css);
    } else {
      css = target.getAttribute("style") || "";
      if (css === "") {
        css = wrapCss[overallWrap ? "unwrap" : "wrapped"];
      } else {
        css = wrapCss[css === wrapCss.wrapped ? "unwrap" : "wrapped"];
      }
      target.setAttribute("style", css);
      toggleClass(el, "wrapped", css === wrapCss.wrapped);
      toggleClass(el, "unwrap", css === wrapCss.unwrap);
    }
  }

  function toggleMonospace(el) {
    let tmp = el.closest(".previewable-comment-form");

    // single comment
    const textarea = $(".comment-form-textarea", tmp);

    if (textarea) {
      toggleClass(textarea, "ghd-monospace-font");
      textarea.focus();
      tmp = textarea.classList.contains("ghd-monospace-font");
      toggleClass(el, "ghd-icon-active", tmp);
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
    isUpdating = true;
    const el = event.target.closest(".file");
    if (el && data.modeDiffToggle === "2") {
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
    isUpdating = false;
    document.activeElement.blur();
    // move current open panel to the top
    if (el && !el.classList.contains("Details--on")) {
      location.hash = el.id;
    }
  }

  function bindEvents() {
    let el, lastKey;

    const panel = $("#ghd-settings-inner");
    const swatch = $("#ghd-swatch", panel);

    // finish initialization
    $("#ghd-settings-inner .ghd-enable").checked = data.enable;
    toggleClass($("body"), "ghd-disabled", !data.enable);

    // Create our menu entry
    const menu = make({
      el: "a",
      cl4ss: "dropdown-item",
      html: "GitHub Dark Settings",
      attr: {id: "ghd-menu"}
    });

    // .header changed to .Header 22 Aug 2017
    el = $$(`
      .header .dropdown-item[href="/settings/profile"],
      .header .dropdown-item[data-ga-click*="go to profile"],
      .Header .dropdown-item[href="/settings/profile"],
      .Header .dropdown-item[data-ga-click*="go to profile"]`
    );
    // get last found item - gists only have the "go to profile" item;
    // GitHub has both
    el = el[el.length - 1];

    if (el) {
      // insert after
      el.parentNode.insertBefore(menu, el.nextSibling);
      on($("#ghd-menu"), "click", () => {
        openPanel();
      });
    }

    on(document, "keypress keydown", event => {
      clearTimeout(timer);
      // use "g+o" to open up ghd options panel
      const openKeys = keyboardOpen.split("+"),
        toggleKeys = keyboardToggle.split("+"),
        key = event.key.toLowerCase(),
        panelVisible = $("#ghd-settings").classList.contains("in");

      // press escape to close the panel
      if (key === "escape" && panelVisible) {
        closePanel();
        return;
      }
      // use event.which from keypress for shortcuts
      // prevent opening panel while typing "go" in comments
      if (event.type === "keydown" || /(input|textarea)/i.test(document.activeElement.nodeName)) {
        return;
      }
      if (lastKey === openKeys[0] && key === openKeys[1]) {
        if (panelVisible) {
          closePanel();
        } else {
          openPanel();
        }
      }
      if (lastKey === toggleKeys[0] && key === toggleKeys[1]) {
        toggleStyle();
      }
      lastKey = key;
      timer = setTimeout(() => {
        lastKey = null;
      }, keyboardDelay);

      // add shortcut to help menu
      if (key === "?") {
        // table doesn't exist until user presses "?"
        setTimeout(() => {
          buildShortcut();
        }, 300);
      }
    });

    // add ghd-settings panel bindings
    on($$("#ghd-settings, #ghd-settings-close"), "click keyup", event => {
      // press escape to close settings
      if (event.type === "keyup" && event.which !== 27) {
        return;
      }
      closePanel();
    });

    on(panel, "click", event => {
      event.stopPropagation();
    });

    on($(".ghd-reset", panel), "click", async event => {
      event.preventDefault();
      isUpdating = true;
      // pass true to reset values
      await setStoredValues(true);
      // add reset values back to data
      await getStoredValues();
      // add reset values to panel
      updatePanel();
      // update style
      updateStyle();
    });

    on($$("input[type='text']", panel), "focus", function() {
      // select all text when focused
      this.select();
    });

    on($$("select, input", panel), "change", () => {
      if (!isUpdating) {
        updateStyle();
      }
    });

    on($(".ghd-update", panel), "click", async event => {
      event.preventDefault();
      await forceUpdate();
    });

    on($(".ghd-textarea-toggle", panel), "click", function(event) {
      event.preventDefault();
      let hidden, el;
      this.classList.remove("selected");
      el = next(this, ".ghd-paste-area-content");
      if (el) {
        hidden = el.style.display === "none";
        el.style.display = hidden ? "" : "none";
        if (el.style.display !== "none") {
          el.classList.add("selected");
          el = $("textarea", el);
          el.focus();
          el.select();
        }
      }
      return false;
    });

    on($(".ghd-paste-area-content", panel), "paste", async event => {
      const toggle = $(".ghd-textarea-toggle", panel),
        textarea = event.target;
      setTimeout(async () => {
        textarea.parentNode.style.display = "none";
        toggle.classList.remove("selected");
        testing = true;
        await forceUpdate(textarea.value);
      }, 200);
    });

    // Toggles
    on($("body"), "click", event => {
      const target = event.target;
      if (data.enableCodeWrap && target.classList.contains("ghd-wrap-toggle")) {
        // **** CODE WRAP TOGGLE ****
        event.stopPropagation();
        toggleCodeWrap(target);
      } else if (data.enableMonospace && target.classList.contains("ghd-monospace")) {
        // **** MONOSPACE FONT TOGGLE ****
        event.stopPropagation();
        toggleMonospace(target);
        return false;
      } else if (data.modeDiffToggle !== "0" && target.classList.contains("ghd-file-toggle")) {
        // **** CODE DIFF COLLAPSE TOGGLE ****
        event.stopPropagation();
        toggleFile(event);
      }
    });

    // style color picker
    picker = new jscolor($(".ghd-color", panel));
    picker.zIndex = 65536;
    picker.hash = true;
    picker.backgroundColor = "#333";
    picker.padding = 0;
    picker.borderWidth = 0;
    picker.borderColor = "#444";
    picker.onFineChange = () => {
      swatch.style.backgroundColor = `#${picker}`;
    };
  }

  function openPanel() {
    // Don't show options panel on page that's missing main styles (e.g. help)
    if ($(".modal-backdrop")) {
      $(".modal-backdrop").click();
    }
    updatePanel();
    $("#ghd-settings").classList.add("in");
  }

  function closePanel(flag) {
    $("#ghd-settings").classList.remove("in");
    picker.hide();

    if (flag === "forced") {
      // forced update; partial re-initialization
      init();
    } else {
      // apply changes when the panel is closed
      updateStyle();
    }
  }

  function toggleStyle() {
    const isEnabled = !data.enable;
    data.enable = isEnabled;
    $("#ghd-settings-inner .ghd-enable").checked = isEnabled;
    // add processedCss back into style (emptied when disabled)
    if (isEnabled) {
      // data.processedCss is empty when ghd is disabled on init
      if (!data.processedCss) {
        processStyle();
      } else {
        addSavedStyle();
      }
    }
    $style.disabled = !isEnabled;
  }

  async function init() {
    if (!document.head) {
      return;
    }

    document.head.parentNode.insertBefore($style, document.head.nextSibling);
    await getStoredValues(true);

    $style.disabled = !data.enable;
    data.lastgithub = data.themeGH;
    data.lastcodemirror = data.themeCM;
    data.lastjupyter = data.themeJP;
    data.lastCW = data.enableCodeWrap;
    data.lastMS = data.enableMonospace;
    data.lastDT = data.modeDiffToggle;

    if (!data.processedCss) {
      fetchAndApplyStyle();
    } else {
      // only load package.json once a day, or after a forced update
      if ((new Date().getTime() > data.date + delay) || data.version === 0) {
        // get package.json from GitHub-Dark & compare versions
        // load new script if a newer one is available
        checkVersion();
      } else {
        addSavedStyle();
      }
    }
    isInitialized = false;
  }

  // add style at document-start
  await init();

  async function buildOnLoad() {
    if (isInitialized === "pending") {
      // init after DOM loaded on .atom pages
      await init();
    }
    // add panel even if you're not logged in - open panel using keyboard
    // shortcut just not on githubusercontent pages (no settings panel needed)
    if (!window.location.host.includes("githubusercontent.com")) {
      buildSettings();
      // add event binding on document ready
      bindEvents();

      on(document, "ghmo:container", updateToggles);
      on(document, "ghmo:comments", updateToggles);
      on(document, "ghmo:diff", updateToggles);
      on(document, "ghmo:preview", updateToggles);
    }

    isInitialized = true;
  }

  if (document.readyState === "loading") {
    on(document, "DOMContentLoaded", buildOnLoad);
  } else {
    buildOnLoad();
  }

  /* utility functions */
  function isBool(name) {
    const val = data[name];
    return typeof val === "boolean" ? val : defaults[name];
  }

  function $(str, el) {
    return (el || document).querySelector(str);
  }

  function $$(str, el) {
    return [...(el || document).querySelectorAll(str)];
  }

  function next(el, selector) {
    while ((el = el.nextElementSibling)) {
      if (el && el.matches(selector)) {
        return el;
      }
    }
    return null;
  }

  function make(obj) {
    let key;
    const el = document.createElement(obj.el);

    if (obj.cl4ss) { el.className = obj.cl4ss }
    if (obj.html) { el.innerHTML = obj.html }
    if (obj.attr) {
      for (key of Object.keys(obj.attr)) {
        el.setAttribute(key, obj.attr[key]);
      }
    }
    if (obj.appendTo) {
      $(obj.appendTo).appendChild(el);
    }
    return el;
  }

  function removeAll(selector) {
    isUpdating = true;
    $$(selector).forEach(el => {
      el.parentNode.removeChild(el);
    });
    isUpdating = false;
  }

  function on(els, name, callback) {
    els = Array.isArray(els) ? els : [els];
    const events = name.split(/\s+/);
    els.forEach(el => {
      events.forEach(ev => {
        el.addEventListener(ev, callback);
      });
    });
  }

  function toggleClass(els, cl4ss, flag) {
    els = Array.isArray(els) ? els : [els];
    els.forEach(el => {
      if (el) {
        if (typeof flag === "undefined") {
          flag = !el.classList.contains(cl4ss);
        }
        el.classList.toggle(cl4ss, flag);
      }
    });
  }

  // Add GM options
  // await GM.registerMenuCommand("GitHub Dark Script debug logging", async () => {
  //   let val = prompt(
  //     "Toggle GitHub Dark Script debug log (true/false):",
  //     "" + debug
  //   );
  //   if (val) {
  //     debug = /^t/.test(val);
  //     await GM.setValue("debug", debug);
  //   }
  // });
})();
