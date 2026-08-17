import { useState, useRef, useCallback } from 'react';

export const useOutgoingFormEditor = () => {
    const editorRef = useRef<any>(null);
    const editorReadyRef = useRef(false);
    const editorFocusedRef = useRef(false);
    const editorContentRequestRef = useRef<((html: string) => void) | null>(null);

    const [isEditorFocused, setIsEditorFocused] = useState(false);
    const [editorCommand, setEditorCommand] = useState('');
    const [showFormatMenu, setShowFormatMenu] = useState(false);
    const [showColorMenu, setShowColorMenu] = useState(false);
    const [activeFormat, setActiveFormat] = useState<'Paragraph' | 'H1' | 'H2'>('Paragraph');
    const [editorContent, setEditorContent] = useState('');
    const [editorContentVersion, setEditorContentVersion] = useState(0);
    const editorContentRef = useRef('');

    const sendEditorCommand = useCallback((command: string) => {
        setEditorCommand(`${command}|${Date.now()}`);
    }, []);

    const toggleFormat = useCallback((format: 'Paragraph' | 'H1' | 'H2') => {
        setActiveFormat(format);
        const block = format === 'Paragraph' ? 'P' : format;
        sendEditorCommand(`formatBlock:${block}`);
        setShowFormatMenu(false);
    }, [sendEditorCommand]);

    const chooseColor = useCallback((color: string) => {
        sendEditorCommand(`foreColor:${color}`);
        setShowColorMenu(false);
    }, [sendEditorCommand]);

    const commitEditorContent = useCallback((html: string, syncState = false) => {
        const nextHtml = html || '';
        editorContentRef.current = nextHtml;
        if (syncState) {
            setEditorContent(nextHtml);
        }
    }, []);

    const setEditorContentForLoad = useCallback((html: string) => {
        commitEditorContent(html, true);
        setEditorContentVersion(prev => prev + 1);
    }, [commitEditorContent]);

    const handleEditorContentChange = useCallback((html: string) => {
        commitEditorContent(html);
    }, [commitEditorContent]);

    const requestEditorContent = useCallback(() => {
        if (!editorRef.current || !editorReadyRef.current) {
            return Promise.resolve(editorContentRef.current || editorContent);
        }

        return new Promise<string>(resolve => {
            const timeout = setTimeout(() => {
                editorContentRequestRef.current = null;
                resolve(editorContentRef.current || editorContent);
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
    }, [commitEditorContent, editorContent]);

    return {
        editorRef,
        editorReadyRef,
        editorFocusedRef,
        editorContentRequestRef,
        isEditorFocused,
        setIsEditorFocused,
        editorCommand,
        setEditorCommand,
        showFormatMenu,
        setShowFormatMenu,
        showColorMenu,
        setShowColorMenu,
        activeFormat,
        setActiveFormat,
        editorContent,
        setEditorContent,
        editorContentVersion,
        setEditorContentVersion,
        editorContentRef,
        sendEditorCommand,
        toggleFormat,
        chooseColor,
        commitEditorContent,
        setEditorContentForLoad,
        handleEditorContentChange,
        requestEditorContent,
    };
};
