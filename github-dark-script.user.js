// ==UserScript==
// @name         GitHub Dark Script
// @version      1.0.5-beta
// @description  GitHub Dark in userscript form, with a settings panel
// @namespace    https://github.com/StylishThemes
// @include      /https?://((gist|guides|help|raw|status|developer)\.)?github\.com((?!generated_pages\/preview).)*$/
// @include      /render\.githubusercontent\.com/
// @include      /raw\.githubusercontent\.com/
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @require      https://greasyfork.org/scripts/15563-jscolor/code/jscolor.js?version=97027
// @updateURL    https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-dark-script.user.js
// @downloadURL  https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-dark-script.user.js
// ==/UserScript==
/* global jQuery, GM_addStyle, GM_getValue, GM_setValue, GM_xmlhttpRequest, jscolor */
/* eslint-disable indent, quotes */
(function($) {
  'use strict';

  var ghd = {

    version : '1.0.5-beta',

    // delay until package.json allowed to load
    delay : 8.64e7, // 24 hours in milliseconds

    // Keyboard shortcut to open ghd panel (only a two key combo coded)
    keyboardOpen : 'g+0',
    keyboardToggle : 'g+-',
    // keyboard shortcut delay from first to second letter
    keyboardDelay : 1000,

    // base urls to fetch style and package.json
    root : 'https://raw.githubusercontent.com/StylishThemes/GitHub-Dark/master/',

    defaults : {
      attach : 'scroll',
      color  : '#4183C4',
      enable : true,
      font   : 'Menlo',
      image  : 'url("data:image/png;base64,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")',
      tab    : 4,
      theme  : 'Twilight',
      type   : 'tiled',
      wrap   : false
    },

    // url gets replaced by css when loaded
    themes : {
      'Ambiance' : 'themes/ambiance.min.css',
      'Chaos' : 'themes/chaos.min.css',
      'Clouds Midnight' : 'themes/clouds-midnight.min.css',
      'Cobalt' : 'themes/cobalt.min.css',
      'Idle Fingers' : 'themes/idle-fingers.min.css',
      'Kr Theme' : 'themes/kr-theme.min.css',
      'Merbivore' : 'themes/merbivore.min.css',
      'Merbivore Soft' : 'themes/merbivore-soft.min.css',
      'Mono Industrial' : 'themes/mono-industrial.min.css',
      'Mono Industrial Clear' : 'themes/mono-industrial-clear.min.css',
      'Monokai' : 'themes/monokai.min.css',
      'Pastel on Dark' : 'themes/pastel-on-dark.min.css',
      'Solarized Dark' : 'themes/solarized-dark.min.css',
      'Terminal' : 'themes/terminal.min.css',
      'Tomorrow Night' : 'themes/tomorrow-night.min.css',
      'Tomorrow Night Blue' : 'themes/tomorrow-night-blue.min.css',
      'Tomorrow Night Bright' : 'themes/tomorrow-night-bright.min.css',
      'Tomorrow Night Eigthies' : 'themes/tomorrow-night-eighties.min.css',
      'Twilight' : 'themes/twilight.min.css',
      'Vibrant Ink' : 'themes/vibrant-ink.min.css'
    },

    type : {
      'tiled' : 'background-repeat: repeat !important; background-size: auto !important; background-position: left top !important;',
      'fit'   : 'background-repeat: no-repeat !important; background-size: cover !important; background-position: center top !important;'
    },

    wrapCss : {
      'wrapped' : 'white-space: pre-wrap !important; word-break: break-all !important; display: block !important;',
      'unwrap'  : 'white-space: pre !important; word-break: normal !important; display: block !important;'
    },

    wrapCodeCss : [
      '/* GitHub: Enable wrapping of long code lines */',
      '  .blob-code-inner,',
      '  .markdown-body pre > code,',
      '  .markdown-body .highlight > pre {',
      '    white-space: pre-wrap !important;',
      '    word-break: break-all !important;',
      '    display: block !important;',
      '  }',
      '  td.blob-code-inner {',
      '    display: table-cell !important;',
      '  }'
    ].join('\n'),

    wrapIcon : '<div class="ghd-wrap-toggle tooltipped tooltipped-w" aria-label="Toggle code wrap"><svg xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="0 0 768 768"><path d="M544.5 352.5q52.5 0 90 37.5t37.5 90-37.5 90-90 37.5H480V672l-96-96 96-96v64.5h72q25.5 0 45-19.5t19.5-45-19.5-45-45-19.5H127.5v-63h417zm96-192v63h-513v-63h513zm-513 447v-63h192v63h-192z"/></svg></div>',

    // extract style & theme name
    regex: /\/\*! [^\*]+ \*\//,

    updatePanel : function() {
      // prevent multiple change events from processing
      this.isUpdating = true;

      var color,
        data = this.data,
        defaults = this.defaults,
        $panel = $('#ghd-settings-inner');

      $panel.find('.ghd-attach').val(data.attach || defaults.attach);
      $panel.find('.ghd-font').val(data.font || defaults.font);
      $panel.find('.ghd-image').val(data.image || defaults.image);
      $panel.find('.ghd-tab').val(data.tab || defaults.tab);
      $panel.find('.ghd-theme').val(data.theme || defaults.theme);
      $panel.find('.ghd-type').val(data.type || defaults.type);

      $panel.find('.ghd-enable').prop('checked', typeof data.enable === 'boolean' ? data.enable : defaults.enable);
      $panel.find('.ghd-wrap').prop('checked', typeof data.wrap === 'boolean' ? data.wrap : defaults.wrap);

      color = data.color || defaults.color;
      $panel.find('.ghd-color').val(color);
      // update swatch color & color picker value
      $panel.find('#ghd-swatch').css('background-color', color);

      if (this.picker) {
        this.picker.fromString(color);
      }
      this.$style.prop('disabled', !data.enable);
      $('body')
        .toggleClass('ghd-disabled', !data.enable)
        .toggleClass('nowrap', !data.wrap);

      this.isUpdating = false;
    },

    /*
    this.data = {
      attach  : 'scroll',
      color   : '#4183C4',
      enable  : true,
      font    : 'Menlo',
      image   : 'url()',
      tab     : 4,
      theme   : 'Tomorrow Night',
      type    : 'tiled',
      wrap    : true, // code: wrap long lines

      date    : 1450159200000, // last loaded package.json
      version : '001014032', // v1.14.32 = last stored GitHub-Dark version

      rawCss       : '@-moz-document regexp("^...', // github-dark.css (unprocessed css)
      themeCss     : '/*! Tomorrow Night * /.ace_editor,.highlight{...', // theme/{name}.min.css
      processedCss : '' // css saved directly from this.$style
    }
    */
    getStoredValues : function() {
      var defaults = this.defaults;

      this.data = {
        attach  : GM_getValue('attach', defaults.attach),
        color   : GM_getValue('color', defaults.color),
        enable  : GM_getValue('enable', defaults.enable),
        font    : GM_getValue('font', defaults.font),
        image   : GM_getValue('image', defaults.image),
        tab     : GM_getValue('tab', defaults.tab),
        theme   : GM_getValue('theme', defaults.theme),
        type    : GM_getValue('type', defaults.type),
        wrap    : GM_getValue('wrap', defaults.wrap),

        date    : GM_getValue('date', 0),
        version : GM_getValue('version', 0),

        rawCss       : GM_getValue('rawCss', ''),
        themeCss     : GM_getValue('themeCss', ''),
        processedCss : GM_getValue('processedCss', '')
      };

      debug('Retrieved stored values', this.data);
    },

    setStoredValues : function(reset) {
      var data = this.data,
        defaults = this.defaults;

      GM_setValue('attach', reset ? defaults.attach : data.attach);
      GM_setValue('color',  reset ? defaults.color  : data.color);
      GM_setValue('enable', reset ? defaults.enable : data.enable);
      GM_setValue('font',   reset ? defaults.font   : data.font);
      GM_setValue('image',  reset ? defaults.image  : data.image);
      GM_setValue('tab',    reset ? defaults.tab    : data.tab);
      GM_setValue('theme',  reset ? defaults.theme  : data.theme);
      GM_setValue('type',   reset ? defaults.type   : data.type);
      GM_setValue('wrap',   reset ? defaults.wrap   : data.wrap);

      GM_setValue('date',    reset ? 0 : data.date);
      GM_setValue('version', reset ? 0 : data.version);

      GM_setValue('rawCss', data.rawCss);
      GM_setValue('themeCss', data.themeCss);
      GM_setValue('processedCss', ghd.$style.text());

      debug((reset ? 'Resetting' : 'Saving') + ' current values', data);
    },

    // convert version "1.2.3" into "001002003" for easier comparison
    convertVersion : function(val) {
      var index,
      parts = val ? val.split('.') : '',
      str = '',
      len = parts.length;
      for (index = 0; index < len; index++) {
        str += ('000' + parts[index]).slice(-3);
      }
      debug('Converted version "' + val + '" to "' + str + '" for easy comparison');
      return val ? str : val;
    },

    checkVersion : function() {
      debug('Fetching package.json');
      GM_xmlhttpRequest({
        method : 'GET',
        url : ghd.root + 'package.json',
        onload : function(response) {
          // store package JSON (not accessed anywhere else, but just in case)
          ghd.data.package = JSON.parse(response.responseText);

          // save last loaded date, so package.json is only loaded once a day
          ghd.data.date = new Date().getTime();
          GM_setValue('date', ghd.data.date);

          var version = ghd.convertVersion(ghd.data.package.version);
          // if new available, load it & parse
          if (version > ghd.data.version) {
            if (ghd.data.version !== 0) {
              debug('Updating from', ghd.data.version, 'to', version);
            }
            ghd.data.version = version;
            GM_setValue('version', ghd.data.version);
            ghd.fetchAndApplyStyle();
          } else {
            ghd.addSavedStyle();
          }
        }
      });
    },

    fetchAndApplyStyle : function() {
      debug('Fetching github-dark.css');
      GM_xmlhttpRequest({
        method : 'GET',
        url : ghd.root + 'github-dark.css',
        onload : function(response) {
          ghd.data.rawCss = response.responseText;
          ghd.applyStyle(ghd.processStyle());
          ghd.getTheme();
        }
      });
    },

    addSavedStyle : function() {
      debug('Adding previously saved style');
      // apply already processed css to prevent FOUC
      this.$style.text(this.data.processedCss);
    },

    // load syntax highlighting theme, if necessary
    getTheme : function() {
      if (!this.data.enable) {
        debug('Disabled: stop theme processing');
        return;
      }
      var name = this.data.theme || 'Twilight';
      // test if this.themes contains the url (.min.css), or the actual css
      if (/\.min\.css$/.test(this.themes[name])) {
        var themeUrl = ghd.root + ghd.themes[name];
        debug('Loading "' + name + '" theme', themeUrl);
        GM_xmlhttpRequest({
          method : 'GET',
          url : themeUrl,
          onload : function(response) {
            var theme = response.responseText;
            if (theme) {
              ghd.themes[name] = theme;
              ghd.data.themeCss = theme;
              ghd.processTheme();
            } else {
              debug('Failed to load theme file', '"' + theme + '"');
            }
          }
        });
      } else {
        ghd.data.themeCss = ghd.themes[name];
        ghd.processTheme();
      }
    },

    processStyle : function() {
      var data = this.data,
        url = /^url/.test(data.image || '') ? data.image :
          (data.image === 'none' ? 'none' : 'url("' + data.image + '")');
      if (!data.enable) {
        debug('Disabled: stop processing');
        return;
      }
      debug('Processing set styles');
      return (data.rawCss || '')
        // remove moz-document wrapper
        .replace(/@-moz-document regexp\((.*)\) \{(\n|\r)+/, '')
        // replace background image; if no 'url' at start, then use 'none'
        .replace(/\/\*\[\[bg-choice\]\]\*\/ url\(.*\)/, url)
        // Add tiled or fit window size css
        .replace('/*[[bg-options]]*/', this.type[data.type || 'tiled'])
        // set scroll or fixed background image
        .replace('/*[[bg-attachment]]*/ fixed', data.attach || 'scroll')
        // replace base-color
        .replace(/\/\*\[\[base-color\]\]\*\/ #\w{3,6}/g, data.color || '#4183C4')
        // add font choice
        .replace('/*[[font-choice]]*/', data.font || 'Menlo')
        // add tab size
        .replace(/\/\*\[\[tab-size\]\]\*\/ \d+/g, data.tab || 4)
        // code wrap css
        .replace('/*[[code-wrap]]*/', data.wrap ? ghd.wrapCodeCss : '')
        // remove default syntax
        .replace(/\s+\/\* grunt build - remove to end of file(.*(\n|\r))+\}$/m, '')
        // reset checkboxes - see https://github.com/StylishThemes/GitHub-Dark/issues/275
        .replace(/select, input, textarea/, 'select, input:not([type="checkbox"]), textarea');
    },

    // this.data.themeCss should be populated with user selected theme
    // called asynchronously from processStyle()
    processTheme : function() {
      debug('Adding syntax theme to css');
      var css = this.$style.text() || '';
      // look for /*[[syntax-theme]]*/ label, if it doesn't exist, reprocess raw css
      if (!/syntax-theme/.test(css)) {
        debug('Need to process raw style before applying theme');
        this.applyStyle(this.processStyle());
        css = this.$style.text() || '';
      }
      // add syntax highlighting theme
      css = css.replace('/*[[syntax-theme]]*/', this.data.themeCss || '');

      debug('Applying "' + this.data.theme + '" theme', '"' +
        (this.data.themeCss || '').match(this.regex) + '"');

      this.$style.text(css);
      this.setStoredValues();
      this.isUpdating = false;
    },

    applyStyle : function(css) {
      debug('Applying style', '"' + (css || '').match(this.regex) + '"');
      // add to style
      this.$style.text(css || '');
      this.setStoredValues();
    },

    updateStyle : function() {
      this.isUpdating = true;
      var $panel = $('#ghd-settings-inner'),
      data = this.data;

      data.attach = $panel.find('.ghd-attach').val();
      // get hex value directly
      data.color = this.picker.toHEXString();
      data.enable = $panel.find('.ghd-enable').is(':checked');
      data.font   = $panel.find('.ghd-font').val();
      data.image  = $panel.find('.ghd-image').val();
      data.tab    = $panel.find('.ghd-tab').val();
      data.theme  = $panel.find('.ghd-theme').val();
      data.type   = $panel.find('.ghd-type').val();
      data.wrap   = $panel.find('.ghd-wrap').is(':checked');

      debug('Updating user settings', data);

      this.$style.prop('disabled', !data.enable);
      $('body')
        .toggleClass('ghd-disabled', !data.enable)
        .toggleClass('nowrap', !data.wrap);

      this.applyStyle(this.processStyle());
      this.getTheme();
      this.isUpdating = false;
    },

    // user can force GitHub-dark update
    forceUpdate : function() {
      // clear saved date
      GM_setValue('version', 0);
      document.location.reload();
    },

    buildSettings : function() {
      debug('Adding settings panel & GitHub Dark link to profile dropdown');
      // Script-specific CSS
      GM_addStyle([
        '#ghd-menu:hover { cursor:pointer }',
        '#ghd-settings { position:fixed; z-index: 65535; top:0; bottom:0; left:0; right:0; opacity:0; visibility:hidden; }',
        '#ghd-settings.in { opacity:1; visibility:visible; background:rgba(0,0,0,.5); }',
        '#ghd-settings-inner { position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); width:25rem; box-shadow: 0 .5rem 1rem #111; color:#c0c0c0 }',
        '#ghd-settings label { margin-left:.5rem; position:relative; top:-1px }',
        '#ghd-settings-close { height: 1rem; width: 1rem; fill: #666; float:right; cursor:pointer }',
        '#ghd-settings-close:hover { fill: #ccc }',
        '#ghd-settings .ghd-right { float: right; }',
        '#ghd-settings p { line-height: 25px; }',
        '#ghd-swatch { width:25px; height:25px; display:inline-block; margin:3px 10px; border-radius:4px; }',
        '#ghd-settings .checkbox input { margin-top: .35em }',
        '#ghd-settings input[type="checkbox"] { width: 16px !important; height: 16px !important; border-radius: 3px !important; }',
        '#ghd-settings .boxed-group-inner { padding: 0; }',
        '#ghd-settings .ghd-footer { padding: 10px; border-top: #555 solid 1px; }',
        '#ghd-settings .ghd-settings-wrapper { max-height: 60vh; overflow-y:auto; padding: 1px 10px; }',
        '#ghd-settings .ghd-tab { width: 5em; }',
        '#ghd-settings .ghd-info { vertical-align: middle; }',

        // code wrap toggle: https://gist.github.com/silverwind/6c1701f56e62204cc42b
        // icons next to a pre
        '.ghd-wrap-toggle { position:absolute; right:1.4em; margin-top:.2em; -moz-user-select:none; -webkit-user-select:none; cursor:pointer; z-index:20; }',
        // file & diff code tables
        '.ghd-wrap-table td.blob-code-inner { white-space: pre-wrap !important; word-break: break-all !important; }',
        '.ghd-unwrap-table td.blob-code-inner { white-space: pre !important; word-break: normal !important; }',
        // icons inside a wrapper immediatly around a pre
        '.highlight > .ghd-wrap-toggle { right:.5em; top:.5em; margin-top:0; }',
        // icons for non-syntax highlighted code blocks; see https://github.com/gjtorikian/html-proofer/blob/master/README.md
        '.markdown-body:not(.comment-body) .ghd-wrap-toggle:not(:first-child) { right: 3.4em; }',
        '.ghd-wrap-toggle svg { height:1.25em; width:1.25em; fill:rgba(110,110,110,.4); }',
        '.ghd-wrap-toggle.unwrap:hover svg, .ghd-wrap-toggle:hover svg { fill:#8b0000; }', // wrap disabled (red)
        'body:not(.nowrap) .ghd-wrap-toggle:not(.unwrap):hover svg, .ghd-wrap-toggle.wrapped:hover svg { fill:#006400; }', // wrap enabled (green)
        '.blob-wrapper, .markdown-body pre, .markdown-body .highlight { position:relative; }',
        // hide wrap icon when style disabled
        'body.ghd-disabled .ghd-wrap-toggle { display: none; }'
      ].join(''));

      var version = [],
        themes = '<select class="ghd-theme ghd-right">';
      $.each(this.themes, function(opt) {
        themes += '<option value="' + opt + '">' + opt + '</option>';
      });
      $.each(this.data.version.match(/\d{3}/g), function(i, v) {
        version.push(parseInt(v, 10));
      });

      // Settings panel markup
      $('body').append([
        '<div id="ghd-settings">',
          '<div id="ghd-settings-inner" class="boxed-group">',
            '<h3>GitHub-Dark Settings',
            '<svg id="ghd-settings-close" xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="160 160 608 608"><path d="M686.2 286.8L507.7 465.3l178.5 178.5-45 45-178.5-178.5-178.5 178.5-45-45 178.5-178.5-178.5-178.5 45-45 178.5 178.5 178.5-178.5z"/></svg>',
            '</h3>',
            '<div class="boxed-group-inner">',
              '<form>',
                '<div class="ghd-settings-wrapper">',
                  '<p class="checkbox">',
                    '<label>Enable GitHub-Dark<input class="ghd-enable ghd-right" type="checkbox"></label>',
                  '</p>',
                  '<p>',
                    '<label>Color:</label> <input class="ghd-color ghd-right" type="text" value="#4183C4">',
                    '<span id="ghd-swatch" class="ghd-right"></span>',
                  '</p>',
                  '<h4>Background</h4>',
                  '<p>',
                    '<label>Image:</label> <input class="ghd-image ghd-right" type="text">',
                    '<a href="https://github.com/StylishThemes/GitHub-Dark/wiki/Image" class="tooltipped tooltipped-e" aria-label="Click to learn about GitHub\'s Content Security&#10;Policy and how to add a custom image"><sup>?</sup></a>',
                  '</p>',
                  '<p>',
                    '<label>Image type:</label>',
                    '<select class="ghd-type ghd-right">',
                      '<option value="tiled">Tiled</option>',
                      '<option value="fit">Fit window</option>',
                    '</select>',
                  '</p>',
                  '<p>',
                    '<label>Image attachment:</label>',
                    '<select class="ghd-attach ghd-right">',
                      '<option value="scroll">Scroll</option>',
                      '<option value="fixed">Fixed</option>',
                    '</select>',
                  '</p>',
                  '<h4>Code</h4>',
                  '<p><label>Theme:</label> ' + themes + '</select></p>',
                  '<p>',
                    '<label>Font Name:</label> <input class="ghd-font ghd-right" type="text">',
                    '<a href="http://www.cssfontstack.com/" class="tooltipped tooltipped-e" aria-label="Add a system installed (monospaced) font name;&#10;this script will not load external fonts!"><sup>?</sup></a>',
                  '</p>',
                  '<p>',
                    '<label>Tab Size:</label> <input class="ghd-tab ghd-right" type="text">',
                  '</p>',
                  '<p class="checkbox">',
                   '<label>Wrap<input class="ghd-wrap ghd-right" type="checkbox"></label>',
                  '</p>',
                '</div>',
                '<div class="ghd-footer">',
                  '<a href="#" class="ghd-update btn btn-sm tooltipped tooltipped-n tooltipped-multiline" aria-label="Update style if the newest release is not loading; the page will reload!">Force Update Style</a>&nbsp;',
                  '<a href="#" class="ghd-reset btn btn-sm btn-danger tooltipped tooltipped-n" aria-label="Reset to defaults;&#10;there is no undo!">Reset All Settings</a>',
                  '<span class="ghd-right tooltipped tooltipped-n" aria-label="Script v' + this.version + '&#10;CSS v' + version.join('.') + '">',
                    '<svg class="ghd-info" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">',
                      '<path fill="#444" d="M12,9c0.82,0,1.5-0.68,1.5-1.5S12.82,6,12,6s-1.5,0.68-1.5,1.5S11.18,9,12,9z M12,1.5 C6.211,1.5,1.5,6.211,1.5,12S6.211,22.5,12,22.5S22.5,17.789,22.5,12S17.789,1.5,12,1.5z M12,19.5c-4.148,0-7.5-3.352-7.5-7.5 S7.852,4.5,12,4.5s7.5,3.352,7.5,7.5S16.148,19.5,12,19.5z M13.5,12c0-0.75-0.75-1.5-1.5-1.5s-0.75,0-1.5,0S9,11.25,9,12h1.5 c0,0,0,3.75,0,4.5S11.25,18,12,18s0.75,0,1.5,0s1.5-0.75,1.5-1.5h-1.5C13.5,16.5,13.5,12.75,13.5,12z"/>',
                    '</svg>',
                  '</span>',
                '</div>',
              '</form>',
            '</div>',
          '</div>',
        '</div>',
      ].join(''));

      ghd.buildCodeWrap();
    },

    buildCodeWrap : function() {
      // mutation events happen quick, so we still add an update flag
      this.isUpdating = true;
      // add wrap code icons
      $('.blob-wrapper').prepend(this.wrapIcon);
      $('.markdown-body pre').before(this.wrapIcon);
      this.isUpdating = false;
    },

    // add keyboard shortcut to help menu (press "?")
    buildShortcut : function() {
      var openPanel = this.keyboardOpen.split('+'),
        toggleStyle = this.keyboardToggle.split('+');
      if (!$('.ghd-shortcut').length) {
        $('.keyboard-mappings:eq(0) tbody:eq(0)').append([
          '<tr class="ghd-shortcut">',
            '<td class="keys">',
              '<kbd>' + openPanel[0] + '</kbd> <kbd>' + openPanel[1] + '</kbd>',
            '</td>',
            '<td>GitHub-Dark: open settings</td>',
          '</tr>',
          '<tr class="ghd-shortcut">',
            '<td class="keys">',
              '<kbd>' + toggleStyle[0] + '</kbd> <kbd>' + toggleStyle[1] + '</kbd>',
            '</td>',
            '<td>GitHub-Dark: toggle style</td>',
          '</tr>'
        ].join(''));
      }
    },

    bindEvents : function() {
      var menu, lastKey,
        $panel = $('#ghd-settings-inner'),
        $swatch = $panel.find('#ghd-swatch');

      // finish initialization
      $('#ghd-settings-inner .ghd-enable')[0].checked = this.data.enable;
      $('body').toggleClass('ghd-disabled', !this.data.enable);

      // Create our menu entry
      menu = $('<a id="ghd-menu" class="dropdown-item">GitHub Dark Settings</a>');
      $('.header .dropdown-item[href="/settings/profile"], .header .dropdown-item[data-ga-click*="go to profile"]')
        // gists only have the "go to profile" item; GitHub has both
        .filter(':last')
        .after(menu);

      $('#ghd-menu').on('click', function() {
        ghd.openPanel();
      });

      // not sure what GitHub uses, so rolling our own
      $(document).on('keypress keydown', function(e) {
        clearTimeout(ghd.timer);
        // use "g+o" to open up ghd options panel
        var openPanel = ghd.keyboardOpen.split('+'),
          toggleStyle = ghd.keyboardToggle.split('+'),
          key = String.fromCharCode(e.which).toLowerCase(),
          panelVisible = $('#ghd-settings').hasClass('in');

        // press escape to close the panel
        if (e.which === 27 && panelVisible) {
          ghd.closePanel();
          return;
        }
        // use e.which from keypress for shortcuts
        // prevent opening panel while typing "go" in comments
        if (e.type === 'keydown' || /(input|textarea)/i.test(document.activeElement.nodeName)) {
          return;
        }
        if (lastKey === openPanel[0] && key === openPanel[1]) {
          if (panelVisible) {
            ghd.closePanel();
          } else {
            ghd.openPanel();
          }
        }
        if (lastKey === toggleStyle[0] && key === toggleStyle[1]) {
          ghd.toggleStyle();
        }
        lastKey = key;
        ghd.timer = setTimeout(function() {
          lastKey = null;
        }, ghd.keyboardDelay);

        // add shortcut to help menu
        if (key === '?') {
          // table doesn't exist until user presses "?"
          setTimeout(function() {
            ghd.buildShortcut();
          }, 300);
        }
      });

      // add bindings
      $('#ghd-settings, #ghd-settings-close').on('click keyup', function(e) {
        // press escape to close settings
        if (e.type === 'keyup' && e.which !== 27) {
          return;
        }
        ghd.closePanel();
      });

      $panel.on('click', function(e) {
        e.stopPropagation();
      });

      $panel.find('.ghd-reset').on('click', function() {
        ghd.isUpdating = true;
        // pass true to reset values
        ghd.setStoredValues(true);
        // add reset values back to this.data
        ghd.getStoredValues();
        // add reset values to panel
        ghd.updatePanel();
        // update style
        ghd.updateStyle();
        return false;
      });

      $panel.find('input[type="text"]').on('focus', function() {
        // select all text when focused
        this.select();
      });

      $panel.find('select, input').on('change', function() {
        if (!ghd.isUpdating) {
          ghd.updateStyle();
        }
      });

      $panel.find('.ghd-update').on('click', function() {
        ghd.forceUpdate();
        return false;
      });

      $('body').on('click', '.ghd-wrap-toggle', function() {
        var css,
          overallWrap = ghd.data.wrap,
          $this = $(this),
          $code = $this.next('code, pre, .highlight');
        if ($code.find('code').length) {
          $code = $code.find('code');
        }
        // code with line numbers
        if ($code[0].nodeName === 'TABLE') {
          if ($code[0].className.indexOf('ghd-') < 0) {
            css = !overallWrap;
          } else {
            css = $code.hasClass('ghd-unwrap-table');
          }
          $code
            .toggleClass('ghd-wrap-table', css)
            .toggleClass('ghd-unwrap-table', !css);
          $this
            .toggleClass('wrapped', css)
            .toggleClass('unwrap', !css);
        } else {
          css = $code.attr('style') || '';
          if (css === '') {
            css = ghd.wrapCss[overallWrap ? 'unwrap' : 'wrapped'];
          } else {
            css = ghd.wrapCss[css === ghd.wrapCss.wrapped ? 'unwrap' : 'wrapped'];
          }
          $code.attr('style', css);
          $this
            .toggleClass('wrapped', css === ghd.wrapCss.wrapped)
            .toggleClass('unwrap', css === ghd.wrapCss.unwrap);
        }
      });

      this.picker = new jscolor($panel.find('.ghd-color')[0]);
      this.picker.zIndex = 65536;
      this.picker.hash = true;
      this.picker.backgroundColor = '#333';
      this.picker.padding = 0;
      this.picker.borderWidth = 0;
      this.picker.borderColor = '#444';
      this.picker.onFineChange = function() {
        $swatch[0].style.backgroundColor = '#' + ghd.picker;
      };
    },

    openPanel : function() {
      $('.modal-backdrop').click();
      ghd.updatePanel();
      $('#ghd-settings').addClass('in');
    },

    closePanel : function() {
      $('#ghd-settings').removeClass('in');
      ghd.picker.hide();

      // apply changes when the panel is closed
      ghd.updateStyle();
    },

    toggleStyle : function() {
      var isEnabled = !this.data.enable;
      this.data.enable = isEnabled;
      $('#ghd-settings-inner .ghd-enable').prop('checked', isEnabled);
      // add processedCss back into style (emptied when disabled)
      if (isEnabled) {
        this.addSavedStyle();
      }
      this.$style.prop('disabled', !isEnabled);
    },

    init : function() {
      debug('GitHub-Dark Script initializing!');

      // add style tag to head
      ghd.$style = $('<style class="ghd-style">').appendTo('head');

      this.getStoredValues();
      // save stored theme stored themes
      if (this.data.themeCss) {
        this.themes[this.data.theme] = this.data.themeCss;
      }

      this.$style.prop('disabled', !this.data.enable);

      // only load package.json once a day, or after a forced update
      if ((new Date().getTime() > this.data.date + this.delay) || this.data.version === 0) {
        // get package.json from GitHub-Dark & compare versions
        // load new script if a newer one is available
        this.checkVersion();
      } else {
        this.addSavedStyle();
      }
    }
  };

  // add style at document-start
  ghd.init();

  $(function() {
    // add panel even if you're not logged in - open panel using keyboard shortcut
    ghd.buildSettings();
    // add event binding on document ready
    ghd.bindEvents();

    var targets = document.querySelectorAll('#js-repo-pjax-container, #js-pjax-container, .js-contribution-activity');

    Array.prototype.forEach.call(targets, function(target) {
      new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          // preform checks before adding code wrap to minimize function calls
          if (!(ghd.isUpdating || document.querySelectorAll('.ghd-wrap-toggle').length) && mutation.target === target) {
            ghd.buildCodeWrap();
          }
        });
      }).observe(target, {
        childList: true,
        subtree: true
      });
    });
  });

  // include a "?debug" anywhere in the browser URL to enable debugging
  function debug() {
    if (/\?debug/.test(window.location.href)) {
      console.log.apply(console, arguments);
    }
  }
})(jQuery.noConflict(true));
