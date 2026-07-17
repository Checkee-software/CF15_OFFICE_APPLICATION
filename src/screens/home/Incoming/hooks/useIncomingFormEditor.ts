import { useState, useRef, useEffect, useCallback } from 'react';
import { Keyboard, Platform, InteractionManager } from 'react-native';

export const useIncomingFormEditor = (showForm: boolean, editingId: string | null, formMode: string) => {
  const editorRef = useRef<any>(null);
  const formScrollRef = useRef<any>(null);
  const editorContentRef = useRef('');
  const editorReadyRef = useRef(false);
  const editorFocusedRef = useRef(false);
  const editorContentRequestRef = useRef<((html: string) => void) | null>(null);

  const [editorContent, setEditorContent] = useState('');
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [shouldMountEditor, setShouldMountEditor] = useState(false);
  const [activeFormat, setActiveFormat] = useState<'Paragraph' | 'H1' | 'H2'>('Paragraph');
  const [editorCommand, setEditorCommand] = useState('');
  const [initialEditorHtml, setInitialEditorHtml] = useState<string | null>(null);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);

  const scrollFormToEditor = useCallback((delay = 0) => {
    const scrollToEditor = () => {
      formScrollRef.current?.scrollToEnd?.(true);
      editorRef.current?.injectJavaScript('window.__ensureCaretVisible && window.__ensureCaretVisible();true;');
    };

    if (delay > 0) {
      setTimeout(scrollToEditor, delay);
      return;
    }

    requestAnimationFrame(scrollToEditor);
  }, []);

  const clearEditorFocus = useCallback(() => {
    if (!editorFocusedRef.current) return;
    editorFocusedRef.current = false;
    setIsEditorFocused(false);
    editorRef.current?.injectJavaScript(
      'document.activeElement && document.activeElement.blur && document.activeElement.blur();true;',
    );
  }, []);

  const commitEditorContent = useCallback((html: string, syncState = true) => {
    const nextHtml = html || '';
    editorContentRef.current = nextHtml;
    if (syncState) {
      setEditorContent(nextHtml);
    }
  }, []);

  const requestEditorContent = useCallback(() => {
    if (!editorRef.current) {
      return Promise.resolve(editorContentRef.current);
    }

    return new Promise<string>(resolve => {
      const timeout = setTimeout(() => {
        editorContentRequestRef.current = null;
        resolve(editorContentRef.current);
      }, 400);

      editorContentRequestRef.current = (html: string) => {
        clearTimeout(timeout);
        editorContentRequestRef.current = null;
        commitEditorContent(html);
        resolve(html || '');
      };

      editorRef.current.injectJavaScript(
        'window.__postContent && window.__postContent("request");true;',
      );
    });
  }, [commitEditorContent]);

  const sendEditorCommand = useCallback((command: string) => {
    setEditorCommand(`${command}|${Date.now()}`);
  }, []);

  const toggleFormat = useCallback((format: 'Paragraph' | 'H1' | 'H2') => {
    setActiveFormat(format);
    const block = format === 'Paragraph' ? 'P' : format;
    sendEditorCommand(`formatBlock:${block}`);
  }, [sendEditorCommand]);

  const chooseColor = useCallback((color: string) => {
    sendEditorCommand(`foreColor:${color}`);
  }, [sendEditorCommand]);

  useEffect(() => {
    if (!showForm) return undefined;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      if (editorFocusedRef.current) {
        scrollFormToEditor(Platform.OS === 'ios' ? 120 : 220);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
      clearEditorFocus();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [clearEditorFocus, scrollFormToEditor, showForm]);

  useEffect(() => {
    if (!showForm) {
      setShouldMountEditor(false);
      editorReadyRef.current = false;
      return undefined;
    }

    setShouldMountEditor(false);
    editorReadyRef.current = false;
    const task = InteractionManager.runAfterInteractions(() => {
      setShouldMountEditor(true);
    });

    return () => {
      task.cancel?.();
    };
  }, [editingId, formMode, showForm]);

  const resetEditor = useCallback(() => {
    commitEditorContent('');
    setInitialEditorHtml('');
    editorReadyRef.current = false;
    editorFocusedRef.current = false;
    editorContentRequestRef.current = null;
    setIsEditorFocused(false);
    setIsKeyboardVisible(false);
    setActiveFormat('Paragraph');
    setShowFormatMenu(false);
    setShowColorMenu(false);
  }, [commitEditorContent]);

  return {
    editorRef,
    formScrollRef,
    editorContentRef,
    editorReadyRef,
    editorFocusedRef,
    editorContentRequestRef,
    editorContent,
    setEditorContent,
    isEditorFocused,
    setIsEditorFocused,
    isKeyboardVisible,
    setIsKeyboardVisible,
    shouldMountEditor,
    setShouldMountEditor,
    activeFormat,
    setActiveFormat,
    editorCommand,
    setEditorCommand,
    initialEditorHtml,
    setInitialEditorHtml,
    scrollFormToEditor,
    clearEditorFocus,
    commitEditorContent,
    requestEditorContent,
    sendEditorCommand,
    toggleFormat,
    chooseColor,
    resetEditor,
    showFormatMenu,
    setShowFormatMenu,
    showColorMenu,
    setShowColorMenu,
  };
};
