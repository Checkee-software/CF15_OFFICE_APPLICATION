export const editorHTML = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: Arial, sans-serif;
      height: 100%;
    }

    body {
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }

    #editor {
      min-height: 100%;
      padding: 12px 12px 96px;
      font-size: 14px;
      color: #222;
      outline: none;
      line-height: 1.6;
      background: #fff;
      box-sizing: border-box;
      caret-color: #1E88E5;
      overflow-wrap: anywhere;
      scroll-padding-bottom: 96px;
    }

    #editor:empty:before {
      content: "Nhập nội dung văn bản...";
      color: #A0A0A0;
    }

    p {
      margin: 0 0 8px;
    }

    h1 {
      font-size: 22px;
      margin: 0 0 10px;
    }

    h2 {
      font-size: 18px;
      margin: 0 0 10px;
    }
  </style>
</head>

<body>
  <div id="editor" contenteditable="true"></div>

  <script>
    document.execCommand('styleWithCSS', false, true);
    var editor = document.getElementById('editor');

    function postToNative(payload){
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }

    function postContent(){
      postToNative({
        type: 'content',
        html: editor.innerHTML
      });
    }

    var isComposing = false;

    function scrollByOffset(offset){
      if(!offset) return;
      try {
        window.scrollBy({ top: offset, behavior: 'smooth' });
      } catch(e) {
        window.scrollBy(0, offset);
      }
    }

    function ensureCaretVisible(){
      requestAnimationFrame(function(){
        var selection = window.getSelection && window.getSelection();
        if(!selection || selection.rangeCount === 0) return;

        var range = selection.getRangeAt(0).cloneRange();
        range.collapse(false);

        var rect = range.getBoundingClientRect();
        var rects = range.getClientRects();
        if((!rect || rect.height === 0) && rects.length > 0){
          rect = rects[rects.length - 1];
        }

        if(!rect) return;

        var viewportHeight = (window.visualViewport && window.visualViewport.height) || window.innerHeight || document.documentElement.clientHeight;
        var bottomLimit = viewportHeight - 72;
        var topLimit = 16;

        if(rect.bottom > bottomLimit){
          scrollByOffset(rect.bottom - bottomLimit + 24);
          return;
        }

        if(rect.top < topLimit){
          scrollByOffset(rect.top - topLimit - 16);
        }
      });
    }

    window.__ensureCaretVisible = ensureCaretVisible;

    window.__apply = function(raw){
      if(!raw) return;

      var command = raw.split('|')[0];

      if(command === 'ensureCaretVisible'){
        ensureCaretVisible();
        return;
      }

      editor.focus();

      if(command === 'bold'){
        document.execCommand('bold');
        ensureCaretVisible();
        return;
      }

      if(command === 'italic'){
        document.execCommand('italic');
        ensureCaretVisible();
        return;
      }

      if(command === 'undo'){
        document.execCommand('undo');
        ensureCaretVisible();
        return;
      }

      if(command === 'redo'){
        document.execCommand('redo');
        ensureCaretVisible();
        return;
      }

      if(command.indexOf('foreColor:') === 0){
        document.execCommand('foreColor', false, command.split(':')[1]);
        ensureCaretVisible();
        return;
      }

      if(command.indexOf('formatBlock:') === 0){
        document.execCommand('formatBlock', false, command.split(':')[1]);
        ensureCaretVisible();
        return;
      }

      postContent();
    };

    window.__setContent = function(html){
      editor.innerHTML = html || '';
      postContent();
      ensureCaretVisible();
    };

    editor.addEventListener('input', function(){
      if(isComposing){
        return;
      }
      postContent();
      ensureCaretVisible();
    });

    editor.addEventListener('compositionstart', function(){
      isComposing = true;
    });

    editor.addEventListener('compositionend', function(){
      isComposing = false;
      postContent();
      setTimeout(ensureCaretVisible, 80);
    });

    editor.addEventListener('focus', function(){
      postToNative({ type: 'focus' });
      setTimeout(ensureCaretVisible, 80);
    });

    editor.addEventListener('blur', function(){
      postContent();
      postToNative({ type: 'blur' });
    });

    editor.addEventListener('keyup', ensureCaretVisible);
    editor.addEventListener('mouseup', ensureCaretVisible);
    document.addEventListener('selectionchange', function(){
      if(document.activeElement === editor){
        ensureCaretVisible();
      }
    });

    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', function(){
        if(document.activeElement === editor){
          setTimeout(ensureCaretVisible, 80);
        }
      });
    }
  </script>
</body>
</html>
`;
