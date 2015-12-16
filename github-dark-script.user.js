// ==UserScript==
// @name         GitHub Dark Script
// @version      0.2.0
// @description  Adds an options panel for the GitHub Dark userstyle
// @namespace    https://github.com/StylishThemes
// @include      /https?://((gist|guides|help|raw|status|developer)\.)?github\.com((?!generated_pages\/preview).)*$/
// @include      /render\.githubusercontent\.com/
// @include      /raw\.githubusercontent\.com/
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require      https://cdn.rawgit.com/EastDesire/jscolor/master/jscolor.min.js
// @updateURL    https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-dark-script.user.js
// @downloadURL  https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-dark-script.user.js
// ==/UserScript==
/* global jQuery, GM_addStyle */
/* eslint-disable indent, quotes */
(function($) {
  "use strict";

  // Skip script if no option dropdown exists
  if ( !$( '.header .dropdown-item[href="/settings/profile"]' ).length ) { return; }

  var ghd = {

    debug : window.location.search === '?debug',

    // delay until package.json allowed to load
    delay : 8.64e7, // 24 hours in milliseconds

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

    updatePanel : function() {
      var data = this.data.stored,
        $panel = $( '#ghd-options-inner' );

      // update this.themes so the saved theme isn't reloaded
      this.themes[ data.theme ] = data.themeCss;

      $panel.find( '.ghd-enable' ).prop( 'checked', data.enabled || true );
      $panel.find( '.ghd-theme' ).val( data.theme || 'Twilight' );
      $panel.find( '.ghd-color' ).val( data.color || '#4183C4' );
      $panel.find( '.ghd-font' ).val( data.font || 'Menlo' );
      $panel.find( '.ghd-image' ).val( data.image || '' );
      $panel.find( '.ghd-type' ).val( data.type || 'tiled' );
      $panel.find( '.ghd-attach' ).val( data.attach || 'scroll' );
      $panel.find( '.ghd-tab' ).val( data.tab || 4 );
    },

    getStoredValues : function() {
      // get values from localstorage & save to this.data
      this.data.stored = $.parseJSON( window.localStorage.GitHubDark || 'null' ) || { date : 0, version : 0 };
      this.updatePanel();

      if ( this.debug ) {
        console.log( 'Retrieved stored values', this.data );
      }
    },

    setStoredValues : function() {
      // save values to local storage - assume localstorage is available
      window.localStorage.GitHubDark = JSON.stringify( this.data.stored || {} );
    },

    // convert version "1.2.3" into "001002003" for easier comparison
    convertVersion : function( val ) {
      var index,
      parts = val ? val.split( '.' ) : '',
      str = '',
      len = parts.length;
      for ( index = 0; index < len; index++ ) {
        str += ( '000' + parts[ index ] ).slice( -3 );
      }
      if ( this.debug ) {
        console.log( 'converted version "' + val + '" to "' + str + '" for easy comparison' );
      }
      return val ? str : val;
    },

    checkVersion : function() {
      if ( this.debug ) {
        console.log( 'loading package.json' );
      }
      GM_xmlhttpRequest({
        method : 'GET',
        url : 'https://stylishthemes.github.io/GitHub-Dark/package.json',
        onload : function( response ) {
          // store package JSON
          ghd.data.package = $.parseJSON ( response.responseText );
          var version = ghd.convertVersion( ghd.data.package.version );
          // if new available, load it & parse
          if ( version > ghd.data.stored.version ) {
            ghd.data.stored.version = version;
            // save last loaded date, so package.json is only loaded once a day
            ghd.data.stored.date = new Date().getTime();
            ghd.getGHDCss();
          } else {
            if ( ghd.debug ) {
              console.log( 'Using style saved to storage' );
            }
            // use stored style
            ghd.processStyle();
          }
        }
      });
    },

    getGHDCss : function() {
      if ( this.debug ) {
        console.log( 'Loading GitHub-Dark.css' );
      }
      GM_xmlhttpRequest({
        method : 'GET',
        url : 'https://stylishthemes.github.io/GitHub-Dark/github-dark.css',
        onload : function ( response ) {
          ghd.data.stored.rawCss = response.responseText;
          ghd.processStyle();
          ghd.getTheme();
        }
      });
    },

    // load syntax highlighting theme, if necessary
    getTheme : function() {
      var name = this.data.stored.theme;
      // test if this.themes contains the url (.min.css), or the actual css
      if ( /\.min\.css$/.test( this.themes[ name ] ) ) {
        if ( this.debug ) {
          console.log( 'Loading "' + name + '" theme' );
        }
        GM_xmlhttpRequest({
          method : 'GET',
          url : ghd.root + ghd.themes[ name ],
          onload : function ( response ) {
            ghd.themes[ name ] = response.responseText;
            ghd.data.stored.themeCss = response.responseText;
            ghd.processTheme();
          }
        });
      } else {
        ghd.data.stored.themeCss = ghd.themes[ name ];
        ghd.processTheme();
      }
    },

    /*
    this.data.stored = {
      enable  : true,
      date    : 1450159200000, // last loaded package.json
      version : '001014032',   // v1.14.32 = last stored GitHub-Dark version
      theme   : 'Tomorrow Night',
      themeCss: '/*! Tomorrow Night * /.ace_editor,.highlight{...', // theme/{name}.min.css
      rawCss  : '@-moz-document regexp("^...',  // github-dark.css (unprocessed)
      color   : '#4183C4',
      font    : 'Menlo',
      image   : 'url()',
      type    : 'tiled',
      attach  : 'scroll',
      tab     : 4
    }
    */
    processStyle : function() {
      var data = this.data.stored,
        css = data.rawCss || '',
        url = /^url/.test( data.image || '' ) ? data.image :
          ( data.image === 'none' ? 'none' : 'url("' + data.image + '")' );
      if ( this.debug ) {
        console.log( 'Processing set styles' );
      }
      css = css
        // remove moz-document wrapper
        .replace( /@-moz-document regexp\((.*)\) \{(\n|\r)+/, '' )
        // replace background image; if no 'url' at start, then use 'none'
        .replace( /\/\*\[\[bg-choice\]\]\*\/ url\(.*\)/, url )
        // Add tiled or fit window size css
        .replace( '/*[[bg-options]]*/', this.type[ data.type || 'tiled' ] )
        // set scroll or fixed background image
        .replace( '/*[[bg-attachment]]*/ fixed', data.attach || 'scroll' )
        // replace base-color
        .replace( /\/\*\[\[base-color\]\]\*\/ #\w{3,6}/g, data.color || '#4183C4' )
        // add font choice
        .replace( '/*[[font-choice]]*/', data.font || 'Menlo' )
        // add tab size
        .replace( /\/\*\[\[tab-size\]\]\*\/ \d+/g, data.tab || 4 )
        // remove default syntax
        .replace( /\s+\/\* grunt build - remove to end of file(.*(\n|\r))+\}$/m, '' );
      this.applyStyle( css );
    },

    // this.data.stored.themeCSS should be populated with user selected theme
    // called asynchronously from processStyle()
    processTheme : function() {
      if ( this.debug ) {
        console.log( 'Adding syntax theme to css' );
      }
      var css = this.$style.html() || '';
      // look for /*[[syntax-theme]]*/ label, if it doesn't exist, reprocess raw css
      if ( !/syntax-theme/.test( css ) ) {
        if ( this.debug ) {
          console.log( 'Need to process raw style before applying theme' );
        }
        this.processStyle();
        css = this.$style.html() || '';
      }
      // add syntax highlighting theme
      css = css.replace( '/*[[syntax-theme]]*/', this.data.stored.themeCSS || '' );

      if ( this.debug ) {
        console.log( 'Applying "' + this.data.stored.theme + '" theme', '"' +
          ( this.data.stored.themeCSS || '' ).substring( 0, 30 ) + '"' );
      }

      this.$style.html( css );
    },


    applyStyle : function( css ) {
      if ( this.debug ) {
        console.log( 'Applying style', '"' + ( css || '' ).substring( 0, 50 ) + '"' );
      }
      // add to style
      this.$style.html( css || '' );
      // save style to localstorage from this.data.savedStyle
      this.setStoredValues();
    },

    updateStyle : function() {
      var $panel = $( '#ghd-options-inner' ),
      data = this.data.stored;

      data.enable = $panel.find( '.ghd-enable' ).is( ':checked' );
      data.theme  = $panel.find( '.ghd-theme' ).val();
      data.color  = $panel.find( '.ghd-color' ).val();
      data.font   = $panel.find( '.ghd-font' ).val();
      data.image  = $panel.find( '.ghd-image' ).val();
      data.type   = $panel.find( '.ghd-type' ).val();
      data.attach = $panel.find( '.ghd-attach' ).val();
      data.tab    = $panel.find( '.ghd-tab' ).val();

      if ( this.debug ) {
        console.log( 'updating user settings', data );
      }

      this.$style.prop( 'disabled', !data.enable );

      this.processStyle();
      this.getTheme();
    },

    // user can force GitHub-dark update
    forceUpdate : function() {
      this.data.stored.version = 0;
      this.data.stored.date = 0;
      this.setStoredValues();
      document.location.reload();
    },

    buildOptions : function() {
      if ( this.debug ) {
        console.log( 'Adding options panel & GitHub Dark link to profile dropdown' );
      }
      // Script-specific CSS
      GM_addStyle([
        '#ghd-menu:hover {cursor:pointer}',
        '#ghd-options {position:fixed; z-index: 65535; top:0; bottom:0; left:0; right:0; opacity:0; visibility:hidden;}',
        '#ghd-options.in {opacity:1; visibility:visible; background:rgba(0,0,0,.5);}',
        '#ghd-options-inner {position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); width:25rem; box-shadow: 0 .5rem 1rem #111; color:#c0c0c0}',
        '#ghd-options label {margin-left:.5rem; position:relative; top:-1px }',
        '#ghd-options-close {height: 1rem; width: 1rem; fill: #666; float:right; cursor:pointer}',
        '#ghd-options-close:hover {fill: #ccc}',
        '#ghd-options .ghd-right { float: right; }',
        '#ghd-options p { line-height: 30px; }'
      ].join( '' ) );

      var $panel,
        themes = '<select class="ghd-theme ghd-right">';
      $.each( this.themes, function( opt ) {
        themes += '<option value="' + opt + '">' + opt + '</option>';
      });

      // Options overlay markup
      $( 'body' ).append([
        '<div id="ghd-options">',
          '<div id="ghd-options-inner" class="boxed-group">',
            '<h3>GitHub-Dark Options',
            '<svg id="ghd-options-close" xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="160 160 608 608"><path d="M686.2 286.8L507.7 465.3l178.5 178.5-45 45-178.5-178.5-178.5 178.5-45-45 178.5-178.5-178.5-178.5 45-45 178.5 178.5 178.5-178.5z"/></svg>',
            '</h3>',
            '<div class="boxed-group-inner">',
              '<form>',
                '<p class="checkbox">',
                 '<input class="ghd-enable" type="checkbox"><label>Enable GitHub-Dark</label>',
                '</p>',
                '<p><label>Theme:</label> ' + themes + '</select></p>',
                '<p>',
                  '<label>Color:</label> <input class="jscolor ghd-color ghd-right" type="text" value="#4183C4">',
                '</p>',
                '<p>',
                  '<label>Background image:</label> <input class="ghd-image ghd-right" type="text">',
                '</p>',
                '<p>',
                  '<label>Background image type:</label>',
                  '<select class="ghd-type ghd-right">',
                    '<option value="tiled">Tiled</option>',
                    '<option value="fit">Fit window size</option>',
                  '</select>',
                '</p>',
                '<p>',
                  '<label>Background image attachment:</label>',
                  '<select class="ghd-attach ghd-right">',
                    '<option value="scroll">Scroll</option>',
                    '<option value="fixed">Fixed</option>',
                  '</select>',
                '</p>',
                '<p>',
                  '<label>Tab:</label> <input class="ghd-tab ghd-right" type="number" min="1" max="10">',
                '</p>',
                '<p>',
                  '<label>Code Font:</label> <input class="ghd-font ghd-right" type="text">',
                '</p>',
                '<p>',
                  '<a href="#" class="ghd-apply btn btn-sm tooltipped tooltipped-n" aria-label="Click to apply the above options to the page">Apply Changes</a>',
                  '<a href="#" class="ghd-update btn btn-sm tooltipped tooltipped-n tooltipped-multiline" aria-label="Update style if the newest release is not loading; the page will reload!">Force Update</a> ',
                '</p>',
              '</form>',
            '</div>',
          '</div>',
        '</div>',
      ].join( '' ) );

      // place for the stylesheet to be added
      this.$style = $( '<style class="ghd-style">' ).appendTo( 'body' );

      $( '#ghd-options, #ghd-options-close' ).on( 'click', function() {
        $( '#ghd-options' ).removeClass( 'in' );
      });

      $panel = $( '#ghd-options-inner' ).on( 'click', function( e ) {
        e.stopPropagation();
      });

      $panel.find( '.ghd-apply' ).on( 'click', function() {
        ghd.updateStyle();
      });

      $panel.find( '.ghd-update' ).on( 'click', function() {
        ghd.forceUpdate();
      });

      // Create our menu entry
      var menu = $( '<a id="ghd-menu" class="dropdown-item">GitHub Dark Settings</a>' );
      $( '.header .dropdown-item[href="/settings/profile"]' ).after( menu );

      $( '#ghd-menu' ).on( 'click', function() {
        $( '.modal-backdrop' ).click();
        ghd.updatePanel();
        $( '#ghd-options' ).addClass( 'in' );
      });

    },

    init : function() {
      if ( this.debug ) {
        console.log( 'GitHub-Dark script initializing!' );
      }
      this.data = {};

      this.buildOptions();

      // load values from local storage
      this.getStoredValues();

      this.$style.prop( 'disabled', !this.data.stored.enable );
      $( '#ghd-options-inner .ghd-enable' )[0].checked = this.data.stored.enable;

      // only load package.json once a day
      if ( new Date().getTime() > this.data.stored.date + this.delay ) {
        // get package.json from GitHub-Dark & compare versions
        // load new script if a newer one is available
        this.checkVersion();
      } else {
        this.processStyle();
      }

    }

  };

  ghd.init();

})(jQuery.noConflict(true));
