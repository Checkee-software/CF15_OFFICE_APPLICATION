import React, { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';

type EditorFormat = 'Paragraph' | 'H1' | 'H2';

type WebEditorProps = {
  editorRef: React.MutableRefObject<any>;
  editorReadyRef: React.MutableRefObject<boolean>;
  editorFocusedRef: React.MutableRefObject<boolean>;
  editorContentRef: React.MutableRefObject<string>;
  editorContentRequestRef?: React.MutableRefObject<((html: string) => void) | null>;
  shouldMountEditor?: boolean;
  isEditorFocused: boolean;
  initialEditorHtml?: string | null;
  content?: string;
  contentVersion?: number;
  editorCommand: string;
  activeFormat: EditorFormat;
  showFormatMenu: boolean;
  showColorMenu: boolean;
  setInitialEditorHtml?: React.Dispatch<React.SetStateAction<string | null>>;
  setIsEditorFocused: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFormatMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setShowColorMenu: React.Dispatch<React.SetStateAction<boolean>>;
  sendEditorCommand: (command: string) => void;
  toggleFormat: (format: EditorFormat) => void;
  chooseColor: (color: string) => void;
  commitEditorContent?: (html: string, syncState?: boolean) => void;
  scrollFormToEditor?: (delay?: number) => void;
  onContentChange?: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  containerStyle?: any;
};

const EDITOR_HTML = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #ffffff; font-family: Arial, sans-serif; }
    body { overflow-y: auto; -webkit-overflow-scrolling: touch; }
    #editor {
      min-height: 100%;
      padding: 12px 12px 40px;
      font-size: 14px;
      color: #222;
      outline: none;
      line-height: 1.6;
      background: #fff;
      caret-color: #1E88E5;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    #editor:empty:before { content: "Nhập nội dung văn bản..."; color: #A0A0A0; pointer-events: none; }
    p { margin: 0 0 8px; } h1 { font-size: 22px; margin: 0 0 10px; } h2 { font-size: 18px; margin: 0 0 10px; }
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
    function postContent(reason){
      postToNative({ type: 'content', html: editor.innerHTML, reason: reason || 'manual' });
    }
    var isComposing = false;
    window.__postContent = postContent;
    window.__ensureCaretVisible = function() {
      var sel = window.getSelection();
      if (!sel.rangeCount) return;
      var range = sel.getRangeAt(0);
      var rects = range.getClientRects();
      if (!rects.length) {
        var span = document.createElement("span");
        if (span.getClientRects) {
          span.appendChild(document.createTextNode("\u200b"));
          range.insertNode(span);
          rects = span.getClientRects();
          var spanParent = span.parentNode;
          spanParent.removeChild(span);
          spanParent.normalize();
        }
      }
      if (rects.length) {
        var rect = rects[0];
        var viewportHeight = window.innerHeight;
        var caretTop = rect.top;
        var caretBottom = rect.bottom;
        var threshold = 40;
        if (caretBottom > viewportHeight - threshold) {
          window.scrollBy(0, caretBottom - viewportHeight + threshold);
        } else if (caretTop < threshold) {
          window.scrollBy(0, caretTop - threshold);
        }
      }
    };
    document.addEventListener('selectionchange', function() {
      if (window.__ensureCaretVisible) {
        window.__ensureCaretVisible();
      }
    });
    window.__apply = function(raw){
      if(!raw) return;
      var command = raw.split('|')[0];
      editor.focus();
      if(command === 'bold'){ document.execCommand('bold'); return; }
      if(command === 'italic'){ document.execCommand('italic'); return; }
      if(command === 'undo'){ document.execCommand('undo'); return; }
      if(command === 'redo'){ document.execCommand('redo'); return; }
      if(command.indexOf('foreColor:') === 0){ document.execCommand('foreColor', false, command.split(':')[1]); return; }
      if(command.indexOf('formatBlock:') === 0){ document.execCommand('formatBlock', false, command.split(':')[1]); return; }
      if(command === 'ensureCaretVisible'){ if (window.__ensureCaretVisible) { window.__ensureCaretVisible(); } return; }
      postContent('command');
    };
    window.__setContent = function(html){
      editor.innerHTML = html || '';
      postContent('setContent');
    };
    editor.addEventListener('input', function(){
      if(isComposing) return;
      postContent('input');
    });
    editor.addEventListener('compositionstart', function(){
      isComposing = true;
    });
    editor.addEventListener('compositionend', function(){
      isComposing = false;
      postContent('input');
    });
    editor.addEventListener('focus', function(){
      postToNative({ type: 'focus' });
    });
    editor.addEventListener('blur', function(){
      postContent('blur');
      postToNative({ type: 'blur' });
    });
  </script>
</body>
</html>
`;

const WebEditor = React.memo(({
  editorRef,
  editorReadyRef,
  editorFocusedRef,
  editorContentRef,
  editorContentRequestRef,
  shouldMountEditor = true,
  isEditorFocused,
  initialEditorHtml = null,
  content,
  contentVersion,
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
  onContentChange,
  onFocus,
  onBlur,
  containerStyle,
}: WebEditorProps) => {
  const editorSource = useMemo(() => ({ html: EDITOR_HTML }), []);

  useEffect(() => {
    if (!editorCommand || !editorRef.current) return;
    editorRef.current.injectJavaScript(`window.__apply(${JSON.stringify(editorCommand)});true;`);
  }, [editorCommand, editorRef]);

  // For Incoming (initialEditorHtml flow)
  useEffect(() => {
    if (initialEditorHtml === null || initialEditorHtml === undefined || !editorReadyRef.current || !editorRef.current) return;
    editorRef.current.injectJavaScript(`window.__setContent(${JSON.stringify(initialEditorHtml)});true;`);
    setInitialEditorHtml?.(null);
  }, [editorReadyRef, editorRef, initialEditorHtml, setInitialEditorHtml]);

  // For Outgoing (content + contentVersion flow)
  useEffect(() => {
    if (content === undefined || !editorReadyRef.current || !editorRef.current) return;
    editorRef.current.injectJavaScript(`window.__setContent(${JSON.stringify(content)});true;`);
  }, [contentVersion, editorReadyRef, editorRef]);

  return (
    <View style={[styles.editorContainer, containerStyle]}>
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
          {[
            '#111827', '#374151', '#6B7280', '#1E88E5', '#1976D2', '#0EA5E9', '#43A047', '#22C55E', '#84CC16', '#F59E0B',
            '#F4511E', '#DC2626', '#D81B60', '#8E24AA', '#7C3AED', '#0F766E', '#0891B2', '#334155', '#000000', '#94A3B8',
            '#06B6D4', '#2563EB', '#65A30D', '#EAB308', '#EA580C', '#EF4444', '#EC4899', '#A855F7', '#14B8A6',
          ].map(color => (
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
            scrollEnabled
            nestedScrollEnabled
            keyboardDisplayRequiresUserAction={false}
            onLoadEnd={() => {
              editorReadyRef.current = true;
              if (initialEditorHtml !== null && initialEditorHtml !== undefined && editorRef.current) {
                editorRef.current.injectJavaScript(`window.__setContent(${JSON.stringify(initialEditorHtml)});true;`);
                setInitialEditorHtml?.(null);
              } else if (content !== undefined && editorRef.current) {
                editorRef.current.injectJavaScript(`window.__setContent(${JSON.stringify(content)});true;`);
              }
            }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'content') {
                  const html = data.html || '';
                  editorContentRef.current = html;
                  if (data.reason !== 'input') {
                    commitEditorContent?.(html);
                  }
                  if (data.reason === 'request' && editorContentRequestRef?.current) {
                    editorContentRequestRef.current(html);
                  }
                  onContentChange?.(html);
                  return;
                }
                if (data.type === 'focus') {
                  editorFocusedRef.current = true;
                  setIsEditorFocused(true);
                  scrollFormToEditor?.(Platform.OS === 'ios' ? 120 : 0);
                  onFocus?.();
                  return;
                }
                if (data.type === 'blur') {
                  editorFocusedRef.current = false;
                  setIsEditorFocused(false);
                  onBlur?.();
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

const styles = StyleSheet.create({
  editorContainer: { height: 230, borderRadius: 10, borderWidth: 1, borderColor: '#D3D5DB', backgroundColor: '#FFF', overflow: 'hidden', marginTop: 8, marginBottom: 12 },
  editorToolbar: { height: 42, backgroundColor: '#F8F9FB', borderBottomWidth: 1, borderBottomColor: '#D7DAE0', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, position: 'relative', zIndex: 10 },
  toolbarIconBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  toolbarDivider: { width: 1, height: 24, backgroundColor: '#D7DAE0', marginHorizontal: 8 },
  toolbarDropdown: { height: 28, minWidth: 100, backgroundColor: '#ECEFF3', borderRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  toolbarDropdownText: { fontSize: 14, color: '#3D495A', fontWeight: '500' },
  toolbarStrong: { fontSize: 18, fontWeight: '700', color: '#2E3747' },
  toolbarItalic: { fontSize: 18, fontStyle: 'italic', color: '#2E3747' },
  toolbarAButton: { height: 28, flexDirection: 'row', alignItems: 'center', gap: 2 },
  toolbarUnderline: { fontSize: 18, color: '#2E3747', textDecorationLine: 'underline' },
  menuBox: { position: 'absolute', top: 48, left: 70, width: 150, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D8DCE3', borderRadius: 6, zIndex: 20, elevation: 5 },
  menuItem: { paddingHorizontal: 10, paddingVertical: 8 },
  menuText: { fontSize: 13, color: '#2F3A4A' },
  colorMenu: { position: 'absolute', top: 48, right: 12, width: 132, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D8DCE3', borderRadius: 6, zIndex: 22, elevation: 6, padding: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#CDD2DA' },
  editorBody: { flex: 1, borderTopWidth: 1, borderTopColor: '#D3D5DB', backgroundColor: '#FFF', overflow: 'hidden' },
  editorWarmup: { flex: 1, backgroundColor: '#FFF' },
  webview: { flex: 1, backgroundColor: '#FFF' },
});

export default WebEditor;
