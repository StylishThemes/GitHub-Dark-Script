// ==UserScript==
// @name         GitHub Dark Script
// @version      0.2.0
// @description  Adds an options panel for the GitHub Dark userstyle
// @namespace    https://github.com/StylishThemes
// @include      /^https?://github\.com/
// @grant        GM_addStyle
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @updateURL    https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-dark-script.user.js
// @downloadURL  https://raw.githubusercontent.com/StylishThemes/GitHub-Dark-Script/master/github-dark-script.user.js
// ==/UserScript==
/* global jQuery, GM_addStyle */
/* eslint-disable indent, quotes */
(function($) {
  "use strict";

  // Skip script if no option dropdown exists
  if (!$(".header .dropdown-item[href='/settings/profile']").length) return;

  // Script-specific CSS
  GM_addStyle([
    "#ghd-menu:hover {cursor:pointer}",
    "#ghd-options {position:fixed; z-index: 65535; top:0; bottom:0; left:0; right:0; opacity:0; visibility:hidden;}",
    "#ghd-options.in {opacity:1; visibility:visible;}",
    "#ghd-options-inner {position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); width:20rem; box-shadow: 0 .5rem 1rem #111; color:#c0c0c0}",
    "#ghd-options label {margin-left:.5rem; position:relative; top:-1px }",
    "#ghd-options-close {height: 1rem; width: 1rem; fill: #666; float:right; cursor:pointer}",
    "#ghd-options-close:hover {fill: #ccc}",
  ].join(""));

  // Options overlay markup
  $("body").append([
    '<div id="ghd-options">',
      '<div id="ghd-options-inner" class="boxed-group">',
        '<h3>GitHub-Dark Options',
          '<svg id="ghd-options-close" xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="160 160 608 608"><path d="M686.2 286.8L507.7 465.3l178.5 178.5-45 45-178.5-178.5-178.5 178.5-45-45 178.5-178.5-178.5-178.5 45-45 178.5 178.5 178.5-178.5z"/></svg>',
        '</h3>',
        '<div class="boxed-group-inner">',
          '<form>',
            '<p class="checkbox">',
              '<input name="opt1" type="checkbox"><label>Test Option #1</label>',
            '</p>',
            '<p class="checkbox">',
              '<input name="opt2" type="checkbox"><label>Test Option #2</label>',
            '</p>',
            '<p class="checkbox">',
              '<input name="opt3" type="checkbox"><label>Test Option #3</label>',
            '</p>',
          '</form>',
        '</div>',
      '</div>',
    '</div>',
  ].join(""));
  $("#ghd-options, #ghd-options-close").on("click", function() {
    $("#ghd-options").removeClass("in");
  });
  $("#ghd-options-inner").on("click", function(e) {
    e.stopPropagation();
  });

  // Create our menu entry
  var menu = $('<a id="ghd-menu" class="dropdown-item">GitHub Dark Settings</a>');
  $(".header .dropdown-item[href='/settings/profile']").after(menu);
  $("#ghd-menu").on("click", function() {
    $(".modal-backdrop").click();
    $("#ghd-options").addClass("in");
  });
})(jQuery.noConflict(true));
