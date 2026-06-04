import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import AutoHeightWebView from 'react-native-autoheight-webview';
import { editorHTML } from '../components/editorTemplate';
import styles from '../styles';

type TOutgoingEditorProps = {
  content: string;
  contentVersion?: number;
  onContentChange: (html: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  command: string;
  injectCommand?: (cmd: string) => void;
  scrollEnabled?: boolean;
};

export default function OutgoingEditor({
  content,
  contentVersion = 0,
  onContentChange,
  onFocus,
  onBlur,
  command,
  injectCommand,
  scrollEnabled = false,
}: TOutgoingEditorProps) {
  const editorRef = useRef<any>(null);
  const editorReadyRef = useRef(false);
  const currentContentRef = useRef(content || '');
  const latestContentRef = useRef(content || '');
  const source = useMemo(() => ({ html: editorHTML }), []);

  const injectJavaScript = useCallback((script: string) => {
    editorRef.current?.injectJavaScript(script);
  }, []);

  useEffect(() => {
    if (!command || !editorRef.current) { return; }
    injectJavaScript(`window.__apply(${JSON.stringify(command)});true;`);
    injectCommand?.(command);
  }, [command, injectCommand, injectJavaScript]);

  useEffect(() => {
    latestContentRef.current = content || '';
  }, [content]);

  useEffect(() => {
    if (!editorReadyRef.current || !editorRef.current) { return; }
    const nextContent = latestContentRef.current;
    currentContentRef.current = nextContent;
    injectJavaScript(`window.__setContent(${JSON.stringify(nextContent)});true;`);
  }, [contentVersion, injectJavaScript]);

  return (
    <AutoHeightWebView
      ref={editorRef}
      originWhitelist={['*']}
      source={source}
      javaScriptEnabled
      scrollEnabled={scrollEnabled}
      nestedScrollEnabled
      viewportContent={'width=device-width, user-scalable=no'}
      onLoadEnd={() => {
        editorReadyRef.current = true;
        const initialContent = latestContentRef.current;
        currentContentRef.current = initialContent;
        injectJavaScript(`window.__setContent(${JSON.stringify(initialContent)});true;`);
      }}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'content') {
            const html = data.html || '';
            currentContentRef.current = html;
            onContentChange(html);
            return;
          }
          if (data.type === 'focus') {
            onFocus();
            return;
          }
          if (data.type === 'blur') {
            onBlur();
          }
        } catch (e) {
        }
      }}
      style={styles.webview}
    />
  );
}
