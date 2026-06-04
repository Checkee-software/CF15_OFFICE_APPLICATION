import React, { useEffect, useMemo } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';
import styles from '../../styles';

type EditorFormat = 'Paragraph' | 'H1' | 'H2';

type WebEditorProps = {
  editorRef: React.MutableRefObject<any>;
  editorReadyRef: React.MutableRefObject<boolean>;
  editorFocusedRef: React.MutableRefObject<boolean>;
  editorContentRef: React.MutableRefObject<string>;
  editorContentRequestRef: React.MutableRefObject<((html: string) => void) | null>;
  shouldMountEditor: boolean;
  isEditorFocused: boolean;
  initialEditorHtml: string | null;
  editorCommand: string;
  activeFormat: EditorFormat;
  showFormatMenu: boolean;
  showColorMenu: boolean;
  setInitialEditorHtml: React.Dispatch<React.SetStateAction<string | null>>;
  setIsEditorFocused: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFormatMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setShowColorMenu: React.Dispatch<React.SetStateAction<boolean>>;
  sendEditorCommand: (command: string) => void;
  toggleFormat: (format: EditorFormat) => void;
  chooseColor: (color: string) => void;
  commitEditorContent: (html: string, syncState?: boolean) => void;
  scrollFormToEditor: (delay?: number) => void;
};

const EDITOR_HTML = "\n<!doctype html>\n<html>\n<head>\n  <meta charset=\"utf-8\"/>\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0\"/>\n  <style>\n    html, body { margin: 0; padding: 0; background: #ffffff; font-family: Arial, sans-serif; height: 100%; }\n    body { overflow-y: auto; -webkit-overflow-scrolling: touch; scroll-behavior: smooth; }\n    #editor { min-height: 100%; padding: 12px 12px 96px; font-size: 14px; color: #222; outline: none; line-height: 1.6; background: #fff; box-sizing: border-box; caret-color: #1E88E5; overflow-wrap: anywhere; scroll-padding-bottom: 96px; }\n    #editor:empty:before { content: \"Nhập nội dung văn bản...\"; color: #A0A0A0; }\n    p { margin: 0 0 8px; } h1 { font-size: 22px; margin: 0 0 10px; } h2 { font-size: 18px; margin: 0 0 10px; }\n  </style>\n</head>\n<body>\n  <div id=\"editor\" contenteditable=\"true\"></div>\n  <script>\n    document.execCommand('styleWithCSS', false, true);\n    var editor = document.getElementById('editor');\n    function postToNative(payload){\n      window.ReactNativeWebView.postMessage(JSON.stringify(payload));\n    }\n    function postContent(reason){\n      postToNative({ type: 'content', html: editor.innerHTML, reason: reason || 'manual' });\n    }\n    function scrollByOffset(offset){\n      if(!offset) return;\n      try {\n        window.scrollBy({ top: offset, behavior: 'smooth' });\n      } catch(e) {\n        window.scrollBy(0, offset);\n      }\n    }\n    function ensureCaretVisible(){\n      requestAnimationFrame(function(){\n        var selection = window.getSelection && window.getSelection();\n        if(!selection || selection.rangeCount === 0) return;\n        var range = selection.getRangeAt(0).cloneRange();\n        range.collapse(false);\n        var rect = range.getBoundingClientRect();\n        var rects = range.getClientRects();\n        if((!rect || rect.height === 0) && rects.length > 0){\n          rect = rects[rects.length - 1];\n        }\n        if(!rect) return;\n        var viewportHeight = (window.visualViewport && window.visualViewport.height) || window.innerHeight || document.documentElement.clientHeight;\n        var bottomLimit = viewportHeight - 72;\n        var topLimit = 16;\n        if(rect.bottom > bottomLimit){\n          scrollByOffset(rect.bottom - bottomLimit + 24);\n          return;\n        }\n        if(rect.top < topLimit){\n          scrollByOffset(rect.top - topLimit - 16);\n        }\n      });\n    }\n    window.__ensureCaretVisible = ensureCaretVisible;\n    window.__postContent = postContent;\n    window.__apply = function(raw){\n      if(!raw) return;\n      var command = raw.split('|')[0];\n      editor.focus();\n      if(command === 'bold'){ document.execCommand('bold'); ensureCaretVisible(); return; }\n      if(command === 'italic'){ document.execCommand('italic'); ensureCaretVisible(); return; }\n      if(command === 'undo'){ document.execCommand('undo'); ensureCaretVisible(); return; }\n      if(command === 'redo'){ document.execCommand('redo'); ensureCaretVisible(); return; }\n      if(command.indexOf('foreColor:') === 0){ document.execCommand('foreColor', false, command.split(':')[1]); ensureCaretVisible(); return; }\n      if(command.indexOf('formatBlock:') === 0){ document.execCommand('formatBlock', false, command.split(':')[1]); ensureCaretVisible(); return; }\n      postContent('command');\n    };\n    window.__setContent = function(html){\n      editor.innerHTML = html || '';\n      postContent('setContent');\n      ensureCaretVisible();\n    };\n    editor.addEventListener('input', function(){\n      ensureCaretVisible();\n    });\n    editor.addEventListener('focus', function(){\n      postToNative({ type: 'focus' });\n      setTimeout(ensureCaretVisible, 80);\n    });\n    editor.addEventListener('blur', function(){\n      postContent('blur');\n      postToNative({ type: 'blur' });\n    });\n    editor.addEventListener('keyup', ensureCaretVisible);\n    editor.addEventListener('mouseup', ensureCaretVisible);\n    document.addEventListener('selectionchange', function(){\n      if(document.activeElement === editor){\n        ensureCaretVisible();\n      }\n    });\n    if(window.visualViewport){\n      window.visualViewport.addEventListener('resize', function(){\n        if(document.activeElement === editor){\n          setTimeout(ensureCaretVisible, 80);\n        }\n      });\n    }\n  </script>\n</body>\n</html>\n";

const WebEditor = React.memo(({
  editorRef,
  editorReadyRef,
  editorFocusedRef,
  editorContentRef,
  editorContentRequestRef,
  shouldMountEditor,
  isEditorFocused,
  initialEditorHtml,
  editorCommand,
  activeFormat,
  showFormatMenu,
  showColorMenu,
  setInitialEditorHtml,
  setIsEditorFocused,
  setShowFormatMenu,
  setShowColorMenu,
  sendEditorCommand,
  toggleFormat,
  chooseColor,
  commitEditorContent,
  scrollFormToEditor,
}: WebEditorProps) => {
  const editorSource = useMemo(() => ({ html: EDITOR_HTML }), []);

  useEffect(() => {
    if (!editorCommand || !editorRef.current) return;
    editorRef.current.injectJavaScript(`window.__apply(${JSON.stringify(editorCommand)});true;`);
  }, [editorCommand, editorRef]);

  useEffect(() => {
    if (initialEditorHtml === null || !editorReadyRef.current || !editorRef.current) return;
    editorRef.current.injectJavaScript(`window.__setContent(${JSON.stringify(initialEditorHtml)});true;`);
    setInitialEditorHtml(null);
  }, [editorReadyRef, editorRef, initialEditorHtml, setInitialEditorHtml]);

  return (
    <View style={styles.editorContainer}>
      <View style={styles.editorToolbar}>
        <TouchableOpacity style={styles.toolbarIconBtn} onPress={() => sendEditorCommand('undo')}>
          <MaterialCommunityIcons name="undo-variant" size={18} color="#3D495A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarIconBtn} onPress={() => sendEditorCommand('redo')}>
          <MaterialCommunityIcons name="redo-variant" size={18} color="#3D495A" />
        </TouchableOpacity>

        <View style={styles.toolbarDivider} />

        <TouchableOpacity
          style={styles.toolbarDropdown}
          onPress={() => {
            setShowColorMenu(false);
            setShowFormatMenu(!showFormatMenu);
          }}>
          <Text style={styles.toolbarDropdownText}>{activeFormat}</Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color="#7C8797" />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity onPress={() => sendEditorCommand('bold')}>
          <Text style={styles.toolbarStrong}>B</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => sendEditorCommand('italic')}>
          <Text style={styles.toolbarItalic}>I</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarAButton}
          onPress={() => {
            setShowFormatMenu(false);
            setShowColorMenu(!showColorMenu);
          }}>
          <Text style={styles.toolbarUnderline}>A</Text>
          <MaterialCommunityIcons name="chevron-down" size={14} color="#7C8797" />
        </TouchableOpacity>
      </View>

      {showFormatMenu && (
        <View style={styles.menuBox}>
          <TouchableOpacity style={styles.menuItem} onPress={() => toggleFormat('Paragraph')}>
            <Text style={styles.menuText}>Paragraph</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => toggleFormat('H1')}>
            <Text style={styles.menuText}>Heading 1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => toggleFormat('H2')}>
            <Text style={styles.menuText}>Heading 2</Text>
          </TouchableOpacity>
        </View>
      )}

      {showColorMenu && (
        <View style={styles.colorMenu}>
          {['#111827', '#374151', '#6B7280', '#1E88E5', '#1976D2', '#0EA5E9', '#43A047', '#22C55E', '#84CC16', '#F59E0B', '#F4511E', '#DC2626', '#D81B60', '#8E24AA', '#7C3AED'].map(color => (
            <TouchableOpacity key={color} style={[styles.colorDot, { backgroundColor: color }]} onPress={() => chooseColor(color)} />
          ))}
        </View>
      )}

      <View style={styles.editorBody}>
        {shouldMountEditor ? (
          <WebView
            ref={editorRef}
            originWhitelist={['*']}
            source={editorSource}
            javaScriptEnabled
            scrollEnabled={isEditorFocused}
            nestedScrollEnabled
            onLoadEnd={() => {
              editorReadyRef.current = true;
              if (initialEditorHtml === null || !editorRef.current) return;
              editorRef.current.injectJavaScript(`window.__setContent(${JSON.stringify(initialEditorHtml)});true;`);
              setInitialEditorHtml(null);
            }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'content') {
                  const html = data.html || '';
                  editorContentRef.current = html;
                  if (data.reason !== 'input') {
                    commitEditorContent(html);
                  }
                  if (data.reason === 'request' && editorContentRequestRef.current) {
                    editorContentRequestRef.current(html);
                  }
                  return;
                }
                if (data.type === 'focus') {
                  editorFocusedRef.current = true;
                  setIsEditorFocused(true);
                  scrollFormToEditor(Platform.OS === 'ios' ? 80 : 140);
                  return;
                }
                if (data.type === 'blur') {
                  editorFocusedRef.current = false;
                  setIsEditorFocused(false);
                }
              } catch (e) {
              }
            }}
            style={styles.webview}
          />
        ) : (
          <View style={styles.editorWarmup} />
        )}
      </View>
    </View>
  );
});

WebEditor.displayName = 'WebEditor';

export default WebEditor;
