// ==UserScript==
// @name         GitHub Dark Script
// @version      0.5.1
// @description  Adds an options panel for the GitHub Dark userstyle
// @namespace    https://github.com/StylishThemes
// @include      /https?://((gist|guides|help|raw|status|developer)\.)?github\.com((?!generated_pages\/preview).)*$/
// @include      /render\.githubusercontent\.com/
// @include      /raw\.githubusercontent\.com/
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require      https://cdn.rawgit.com/EastDesire/jscolor/master/jscolor.min.js
// @updateURL    https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-dark-script.user.js
// @downloadURL  https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-dark-script.user.js
// ==/UserScript==
/* global jQuery, GM_addStyle, GM_getValue, GM_setValue, GM_xmlhttpRequest, jscolor */
/* eslint-disable indent, quotes */
(function($) {
  'use strict';

  var ghd = {

    // delay until package.json allowed to load
    delay : 8.64e7, // 24 hours in milliseconds

    // include a "?debug" anywhere in the browser URL to enable debugging
    debug : /\?debug/.test(window.location.href),

    // gh-pages url prefix for theme url
    root : 'https://stylishthemes.github.io/GitHub-Dark/',

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

    wrapIcon : '<div class="ghd-wrap-toggle tooltipped tooltipped-n" aria-label="Toggle code wrap"><svg xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="0 0 768 768"><path d="M544.5 352.5q52.5 0 90 37.5t37.5 90-37.5 90-90 37.5H480V672l-96-96 96-96v64.5h72q25.5 0 45-19.5t19.5-45-19.5-45-45-19.5H127.5v-63h417zm96-192v63h-513v-63h513zm-513 447v-63h192v63h-192z"/></svg></div>',

    // extract style & theme name
    regex: /\/\*! [^\*]+ \*\//,

    updatePanel : function() {
      var color,
        data = this.data,
        $panel = $('#ghd-options-inner');

      // update this.themes so the saved theme isn't reloaded
      if (data.theme) {
        this.themes[data.theme] = data.themeCss;
      } else {
        data.theme = 'Twilight';
      }
      $panel.find('.ghd-enable').prop('checked', data.enable);
      $panel.find('.ghd-wrap').prop('checked', data.wrap);
      $panel.find('.ghd-theme').val(data.theme);
      $panel.find('.ghd-font').val(data.font || 'Menlo');
      $panel.find('.ghd-image').val(data.image || '');
      $panel.find('.ghd-type').val(data.type || 'tiled');
      $panel.find('.ghd-attach').val(data.attach || 'scroll');
      $panel.find('.ghd-tab').val(data.tab || 4);

      color = data.color || '#4183C4';
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
    },

    getStoredValues : function(reset) {
      var $panel = $('#ghd-options-inner'),

      data = this.data = {
        attach  : (reset ? '' : GM_getValue('attach', ''))  || 'scroll',
        color   : (reset ? '' : GM_getValue('color', ''))   || '#4183C4',
        date    : (reset ? '' : GM_getValue('date', ''))    || 0,
        enable  : (reset ? '' : GM_getValue('enable', ''))  || true,
        font    : (reset ? '' : GM_getValue('font', ''))    || 'Menlo',
        image   : (reset ? '' : GM_getValue('image', ''))   || 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkAgMAAAANjH3HAAAACVBMVEUaGhohISElJSUh9lebAAAB20lEQVRIx4XWuZXDMAwE0C0SAQtggIIYoAAEU+aKOHhYojTrYP2+QfOW/5QIJOih/q8HwF/pb3EX+UPIveYcQGgEHiu9hI+ihEc5Jz5KBIlRRRaJ1JtoSAl5Hw96hLB1/up1tnIXOck5jZQy+3iU2hAOKSH1JvwxHsp+5TLF5MOl1/MQXsVs1miXc+KDbYydyMeUgpPQreZ7fWidbNhkXNJSeAhc6qHmHD8AYovunYyEACWEbyIhNeB9fRrH3hFi0bGPLuEW7xCNaohw1vAlS805nfsrTspclB/hVdoqusg53eH7FWot+wjYpOViX8KbFFKTwlnzvj65P9H/vD0/hibYBGhPwlPO8TmxRsaxsNnrUmUXpNhirlJMPr6Hqq9k5Xn/8iYQHYIuQsWFC6Z87IOxLxHphSY4SpuiU87xJnJr5axfeRd+lnMExXpEWPpuZ1v7qZdNBOjiHzDREHX5fs5Zz9p6X0vVKbKKchlSl5rv+3p//FJ/PYvoKryI8vs+2G9lzRmnEKkh+BU8yDk515jDj/HAswu7CCz6U/Mxb/PnC9N41ndpU4hUU7JGk/C9PmP/M2xZYdvBW2PObyf1IUiIzoHmHW9yTncliYs9A9tVNppdShfgQaTLMf+j3X723tLeHgAAAABJRU5ErkJggg==")',
        tab     : (reset ? '' : GM_getValue('tab', ''))     || 4,
        theme   : (reset ? '' : GM_getValue('theme', ''))   || 'Twilight',
        type    : (reset ? '' : GM_getValue('type', ''))    || 'tiled',
        version : (reset ? '' : GM_getValue('version', '')) || 0,
        wrap    : (reset ? '' : GM_getValue('wrap', ''))    || true,

        rawCss       : GM_getValue('rawCss', ''),
        themeCss     : GM_getValue('themeCss', ''),
        processedCss : GM_getValue('processedCss', '')
      };

      // no panel on init
      if ($panel.length) {
        $panel.find('.ghd-enable')[0].checked = data.enable;
        $panel.find('.ghd-wrap')[0].checked = data.wrap;

        this.updatePanel();
      }

      if (reset) {
        this.setStoredValues();
      }

      if (this.debug) {
        console.log((reset ? 'Reset' : 'Retrieved') + ' stored values', this.data);
      }
    },

    setStoredValues : function() {
      var data = this.data;

      GM_setValue('attach', data.attach);
      GM_setValue('color', data.color);
      GM_setValue('date', data.date);
      GM_setValue('enable', data.enable);
      GM_setValue('font', data.font);
      GM_setValue('image', data.image);
      GM_setValue('tab', data.tab);
      GM_setValue('theme', data.theme);
      GM_setValue('type', data.type);
      GM_setValue('version', data.version);
      GM_setValue('wrap', data.wrap);

      GM_setValue('rawCss', data.rawCss);
      GM_setValue('themeCss', data.themeCss);
      GM_setValue('processedCss', ghd.$style.text());

      if (this.debug) {
        console.log('Saving current values', data);
      }
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
      if (this.debug) {
        console.log('Converted version "' + val + '" to "' + str + '" for easy comparison');
      }
      return val ? str : val;
    },

    checkVersion : function() {
      if (this.debug) {
        console.log('Loading package.json');
      }
      GM_xmlhttpRequest({
        method : 'GET',
        url : 'https://stylishthemes.github.io/GitHub-Dark/package.json',
        onload : function(response) {
          // store package JSON
          ghd.data.package = $.parseJSON(response.responseText);
          var version = ghd.convertVersion(ghd.data.package.version);
          // if new available, load it & parse
          if (version > ghd.data.version) {
            ghd.data.version = version;
            // save last loaded date, so package.json is only loaded once a day
            ghd.data.date = new Date().getTime();
            if (ghd.debug) {
              console.log('Loading github-dark.css');
            }
            // apply style
            GM_xmlhttpRequest({
              method : 'GET',
              url : ghd.root + 'github-dark.css',
              onload : function(response) {
                ghd.data.rawCss = response.responseText;
                ghd.applyStyle(ghd.processStyle());
                ghd.getTheme();
              }
            });
          } else {
            ghd.addSavedStyle();
          }
        }
      });
    },

    addSavedStyle : function() {
      if (this.debug) {
        console.log('Adding previously saved style');
      }
      // apply already processed css to prevent FOUC
      this.$style.text(this.data.processedCss);
    },

    // load syntax highlighting theme, if necessary
    getTheme : function() {
      if (!this.data.enable) {
        if (this.debug) {
          console.log('Disabled: stop theme processing');
        }
        return;
      }
      var name = this.data.theme || 'Twilight';
      // test if this.themes contains the url (.min.css), or the actual css
      if (/\.min\.css$/.test(this.themes[name])) {
        if (this.debug) {
          console.log('Loading "' + name + '" theme', ghd.root + ghd.themes[name]);
        }
        GM_xmlhttpRequest({
          method : 'GET',
          url : ghd.root + ghd.themes[name],
          onload : function(response) {
            ghd.themes[name] = response.responseText;
            ghd.data.themeCss = response.responseText;
            ghd.processTheme();
          }
        });
      } else {
        ghd.data.themeCss = ghd.themes[name];
        ghd.processTheme();
      }
    },

    /*
    this.data = {
      attach  : 'scroll',
      color   : '#4183C4',
      date    : 1450159200000, // last loaded package.json
      enable  : true,
      font    : 'Menlo',
      image   : 'url()',
      tab     : 4,
      theme   : 'Tomorrow Night',
      type    : 'tiled',
      version : '001014032', // v1.14.32 = last stored GitHub-Dark version
      wrap    : true, // code: wrap long lines

      rawCss       : '@-moz-document regexp("^...', // github-dark.css (unprocessed)
      themeCss     : '/*! Tomorrow Night * /.ace_editor,.highlight{...', // theme/{name}.min.css
      processedCss : '' // css saved directly from this.$style
    }
    */
    processStyle : function() {
      var data = this.data,
        css = data.rawCss || '',
        url = /^url/.test(data.image || '') ? data.image :
          (data.image === 'none' ? 'none' : 'url("' + data.image + '")');
      if (!data.enable) {
        if (this.debug) {
          console.log('Disabled: stop processing');
        }
        return;
      }
      if (this.debug) {
        console.log('Processing set styles');
      }
      css = css
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
        // remove default syntax
        .replace(/\s+\/\* grunt build - remove to end of file(.*(\n|\r))+\}$/m, '');

      return css;
    },

    // this.data.themeCss should be populated with user selected theme
    // called asynchronously from processStyle()
    processTheme : function() {
      if (this.debug) {
        console.log('Adding syntax theme to css');
      }
      var css = this.$style.text() || '';
      // look for /*[[syntax-theme]]*/ label, if it doesn't exist, reprocess raw css
      if (!/syntax-theme/.test(css)) {
        if (this.debug) {
          console.log('Need to process raw style before applying theme');
        }
        this.applyStyle(this.processStyle());
        css = this.$style.text() || '';
      }
      // add syntax highlighting theme
      css = css.replace('/*[[syntax-theme]]*/', this.data.themeCss || '');

      if (this.debug) {
        console.log('Applying "' + this.data.theme + '" theme', '"' +
          (this.data.themeCss || '').match(this.regex) + '"');
      }

      this.$style.text(css);
      this.setStoredValues();
    },

    applyStyle : function(css) {
      if (this.debug) {
        console.log('Applying style', '"' + (css || '').match(this.regex) + '"');
      }
      // add to style
      this.$style.text(css || '');
      this.setStoredValues();
    },

    updateStyle : function() {
      var $panel = $('#ghd-options-inner'),
      data = this.data;

      data.attach = $panel.find('.ghd-attach').val();
      data.color  = $panel.find('.ghd-color').val();
      data.enable = $panel.find('.ghd-enable').is(':checked');
      data.font   = $panel.find('.ghd-font').val();
      data.image  = $panel.find('.ghd-image').val();
      data.tab    = $panel.find('.ghd-tab').val();
      data.theme  = $panel.find('.ghd-theme').val();
      data.type   = $panel.find('.ghd-type').val();
      data.wrap   = $panel.find('.ghd-wrap').is(':checked');

      if (this.debug) {
        console.log('updating user settings', data);
      }

      this.$style.prop('disabled', !data.enable);
      $('body')
        .toggleClass('ghd-disabled', !data.enable)
        .toggleClass('nowrap', !data.wrap);

      this.applyStyle(this.processStyle());
      this.getTheme();
    },

    // user can force GitHub-dark update
    forceUpdate : function() {
      // clear saved date
      GM_setValue('version', 0);
      document.location.reload();
    },

    buildOptions : function() {
      if (this.debug) {
        console.log('Adding options panel & GitHub Dark link to profile dropdown');
      }
      // Script-specific CSS
      GM_addStyle([
        '#ghd-menu:hover { cursor:pointer }',
        '#ghd-options { position:fixed; z-index: 65535; top:0; bottom:0; left:0; right:0; opacity:0; visibility:hidden; }',
        '#ghd-options.in { opacity:1; visibility:visible; background:rgba(0,0,0,.5); }',
        '#ghd-options-inner { position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); width:25rem; box-shadow: 0 .5rem 1rem #111; color:#c0c0c0 }',
        '#ghd-options label { margin-left:.5rem; position:relative; top:-1px }',
        '#ghd-options-close { height: 1rem; width: 1rem; fill: #666; float:right; cursor:pointer }',
        '#ghd-options-close:hover { fill: #ccc }',
        '#ghd-options .ghd-right { float: right; }',
        '#ghd-options p { line-height: 25px; }',
        '#ghd-swatch { width:25px; height:25px; display:inline-block; margin:3px 10px; border-radius:4px; }',
        '#ghd-options .checkbox input { margin-top: .35em }',

        // code wrap toggle: https://gist.github.com/silverwind/6c1701f56e62204cc42b
        // icons next to a pre
        '.ghd-wrap-toggle { position:absolute; right:1.4em; margin-top:.2em; -moz-user-select:none; -webkit-user-select:none; cursor:pointer; z-index:1000; }',
        // icons inside a wrapper immediatly around a pre
        '.highlight > .ghd-wrap-toggle { right:.5em; top:.5em; margin-top:0; }',
        '.ghd-wrap-toggle:hover svg { fill:#8b0000; }', // wrap disabled (red)
        '.ghd-wrap-toggle svg { height:1.25em; width:1.25em; fill:rgba(255,255,255,.4); }',
        // 'body:not(.nowrap) .ghd-wrap-toggle svg { fill:rgba(255,255,255,.8) }',
        'body:not(.nowrap) .ghd-wrap-toggle:hover svg { fill:#006400; }', // wrap enabled (green)
        '.blob-wrapper, .markdown-body > pre, .markdown-body > .highlight { position:relative; }',
        // hide wrap icon when style disabled
        'body.ghd-disabled .ghd-wrap-toggle { display: none; }'
     ].join(''));

      var themes = '<select class="ghd-theme ghd-right">';
      $.each(this.themes, function(opt) {
        themes += '<option value="' + opt + '">' + opt + '</option>';
      });

      // Options overlay markup
      $('body').append([
        '<div id="ghd-options">',
          '<div id="ghd-options-inner" class="boxed-group">',
            '<h3>GitHub-Dark Options',
            '<svg id="ghd-options-close" xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="160 160 608 608"><path d="M686.2 286.8L507.7 465.3l178.5 178.5-45 45-178.5-178.5-178.5 178.5-45-45 178.5-178.5-178.5-178.5 45-45 178.5 178.5 178.5-178.5z"/></svg>',
            '</h3>',
            '<div class="boxed-group-inner">',
              '<form>',
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
                  '<a href="https://github.com/StylishThemes/GitHub-Dark/wiki/Image" class="tooltipped tooltipped-n" aria-label="Click to learn about GitHub\'s Content Security&#10;Policy and how to add a custom image"><sup>?</sup></a>',
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
                  '<a href="http://www.cssfontstack.com/" class="tooltipped tooltipped-n" aria-label="Add a system installed font name;&#10;this script will not load external fonts!"><sup>?</sup></a>',
                '</p>',
                '<p>',
                  '<label>Tab Size:</label> <input class="ghd-tab ghd-right" type="number" min="1" max="10">',
                '</p>',
                '<p class="checkbox">',
                 '<label>Wrap<input class="ghd-wrap ghd-right" type="checkbox"></label>',
                '</p>',
                '<p>',
                  '<a href="#" class="ghd-apply btn btn-sm tooltipped tooltipped-n" aria-label="Click to apply these options to the page">Apply Changes</a>&nbsp;',
                  '<a href="#" class="ghd-reset btn btn-sm btn-danger tooltipped tooltipped-n" aria-label="Reset to defaults;&#10;there is no undo!">Reset</a>&nbsp;&nbsp;',
                  '<a href="#" class="ghd-update ghd-right btn btn-sm tooltipped tooltipped-n tooltipped-multiline" aria-label="Update style if the newest release is not loading; the page will reload!">Force Update</a>',
                '</p>',
              '</form>',
            '</div>',
          '</div>',
        '</div>',
     ].join(''));

      // add wrap code icons
      $('.blob-wrapper, .markdown-body > .highlight').prepend(this.wrapIcon);
      $('.markdown-body > pre')
        .before(this.wrapIcon)
        .parent().css('position', 'relative');
    },

    bindEvents : function() {
      var $panel = $('#ghd-options-inner'),
        $swatch = $panel.find('#ghd-swatch');

      // finish initialization
      $('#ghd-options-inner .ghd-enable')[0].checked = this.data.enable;
      $('body')
        .toggleClass('ghd-disabled', !this.data.enable)
        .toggleClass('nowrap', this.data.wrap);

      // Create our menu entry
      var menu = $('<a id="ghd-menu" class="dropdown-item">GitHub Dark Settings</a>');
      $('.header .dropdown-item[href="/settings/profile"], .header .dropdown-item[data-ga-click*="go to profile"]')
        // gists only have the "go to profile" item; GitHub has both
        .filter(':last')
        .after(menu);

      $('#ghd-menu').on('click', function() {
        $('.modal-backdrop').click();
        ghd.updatePanel();
        $('#ghd-options').addClass('in');
      });

      // add bindings
      $('#ghd-options, #ghd-options-close').on('click keyup', function(e) {
        // press escape to close options
        if (e.type === 'keyup' && e.which !== 27) {
          return;
        }
        $('#ghd-options').removeClass('in');
        ghd.picker.hide();
      });

      $panel.on('click', function(e) {
        e.stopPropagation();
      });

      $panel.find('.ghd-apply').on('click', function() {
        ghd.updateStyle();
        return false;
      });

      $panel.find('.ghd-reset').on('click', function() {
        // pass true to reset values
        ghd.getStoredValues(true);
        ghd.updateStyle();
        return false;
      });

      $panel.find('input[type="text"]').on('focus', function() {
        // select all text when focused
        this.select();
      });

      $panel.find('.ghd-update').on('click', function() {
        ghd.forceUpdate();
        return false;
      });

      $('.ghd-wrap-toggle').on('click', function() {
        ghd.data.wrap = !ghd.data.wrap;
        $('body').toggleClass('nowrap', !ghd.data.wrap);
        ghd.setStoredValues();
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

      // update panel & options
      this.getStoredValues();
    },

    init : function() {
      if (this.debug) {
        console.log('GitHub-Dark script initializing!');
      }

      // add style tag to head
      ghd.$style = $('<style class="ghd-style">').appendTo('head');

      this.getStoredValues();

      this.$style.prop('disabled', !this.data.enable);

      // only load package.json once a day
      if (new Date().getTime() > this.data.date + this.delay) {
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
    // apply script if option dropdown exists
    if ($('.header .dropdown-item[href="/settings/profile"], .header .dropdown-item[data-ga-click*="go to profile"]').length) {
      ghd.buildOptions();
      // add event binding on document ready
      ghd.bindEvents();
    }
  });
})(jQuery.noConflict(true));
