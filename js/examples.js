$(function () {
  init();
});

var examples = {
  'Audio': ['music'],
  'Graphics': ['sprite_camera_button', 'debug'],
  'Physics': ['physics'],
  'Games': ['pong']
};

var init = function () {
  // for every file in every category, create a button to load up the code
  for (var category in examples) {
    // create title for category
    var title = document.createElement('h3');
    title.innerHTML = category;
    $('#example-list').append(title);

    // create buttons for category
    var files = examples[category];
    for (var i = 0, j = files.length; i < j; i++) {
      var btn = document.createElement('button');
      btn.innerHTML = files[i];
      btn.fileName = files[i];
      btn.onclick = function () {
        loadScript(this.fileName);
      }
      $('#example-list').append(btn);
    }
  }
  $('.container').css('margin-left', $('#example-list').width());

  var editor = window.editor = ace.edit("code");
  editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/javascript");

  $('#run').on('click', function () {
    $('canvas').remove();
    eval(editor.getValue());
  });
  $('#hide').on('click', function(e) {
    if($(this).text() == 'hide code'){
      $(this).text('show code')
    }
    else{
      $(this).text('hide code')
    }
    $('#code').toggle(300);
  });
}

var loadScript = function (name) {
  $.ajax({
    url: "./examples/" + name,
    success: function (data) {
      editor.setValue(data);
      editor.gotoLine(0);
      editor.scrollToLine(0);
      editor.focus();
    }
  });
}
