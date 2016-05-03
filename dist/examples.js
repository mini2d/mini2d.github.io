'use strict';

$(function () {
  init();
});

var examples = {
  'Audio': ['music'],
  'Graphics': ['sprite_camera_button', 'debug'],
  'Physics': ['physics_bounce', 'physics_acceleration', 'physics_collision_movable', 'physics_collision_movable_immovable'],
  'Games': ['pong', 'breakout']
};

var init = function init() {
  // for every file in every category, create a button to load up the code
  for (var category in examples) {

    // create collumn for category
    var col = document.createElement('div');
    col.className += "col";

    // create title for category
    var title = document.createElement('h3');
    title.innerHTML = category;
    $(col).append(title);

    // create buttons for category
    var files = examples[category];
    for (var i = 0, j = files.length; i < j; i++) {
      var btn = document.createElement('button');
      btn.innerHTML = files[i];
      btn.fileName = files[i];
      btn.onclick = function () {
        loadScript(this.fileName);
      };
      $(col).append(btn);
    }
    $('#example-list').append(col);
  }

  var editor = window.editor = ace.edit("code");
  editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/javascript");

  $('#run').on('click', function () {
    $('canvas').remove();
    eval(editor.getValue());
  });
  $('#hide').on('click', function (e) {
    if ($(undefined).text() == 'hide code') {
      $(undefined).text('show code');
    } else {
      $(undefined).text('hide code');
    }
    $('#code').toggle(300);
  });
};

var loadScript = function loadScript(name) {
  $.ajax({
    url: "./examples/" + name,
    success: function success(data) {
      editor.setValue(data);
      editor.gotoLine(0);
      editor.scrollToLine(0);
      editor.focus();
    }
  });
};
