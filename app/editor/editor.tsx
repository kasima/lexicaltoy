'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import React, { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import type { EditorState } from 'lexical';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { ListNode, ListItemNode, $createListNode, $createListItemNode } from '@lexical/list';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { UNORDERED_LIST } from '@lexical/markdown';
import { LinkNode } from '@lexical/link'
import { CustomTabIndentationPlugin } from '../plugins/CustomTabIndentationPlugin';
import DraggableBlockPlugin from '../plugins/DraggableBlockPlugin';
import { useDebouncedCallback } from 'use-debounce';
import { updatePage } from '../lib/actions';
import MoveItemsPlugin from '../plugins/MoveItemsPlugin';
import { theme } from './editor-theme';
import { FloatingMenuPlugin } from '../plugins/FloatingMenuPlugin';
import { CAN_USE_DOM } from '../lib/dom-helpers';

function OnChangePlugin({ onChange }: { onChange: (editorState: EditorState) => void }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            onChange(editorState);
        });
    }, [editor, onChange]);
    return null;
}

function onError(error: Error) {
    console.error(error);
}

function Editor({initialPageContent, pageId, userId}: {initialPageContent: string, pageId: string, userId: string}) {
    
    const initialConfig = {
        editorState: initialPageContent,
        namespace: 'MyEditor',
        theme,
        nodes: [LinkNode, ListNode, ListItemNode],
        onError
    }

    const [floatingAnchorElem, setFloatingAnchorElem] =
        useState<HTMLDivElement | null>(null);

    const [isSmallWidthViewport, setIsSmallWidthViewport] =
        useState<boolean>(false);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };
        
    const [editorState, setEditorState] = useState<any>(null);

    const storePage = useDebouncedCallback((outline) => {
        console.log(`Storing page`);
        updatePage(pageId, outline, userId);
      }, 500);

    function onChange(editorState: EditorState) {
        if (!editorState) return;
        const editorStateJSONString = JSON.stringify(editorState);
        storePage(editorStateJSONString);
    }

    useEffect(() => {
        const updateViewPortWidth = () => {
          const isNextSmallWidthViewport =
            CAN_USE_DOM && window.matchMedia('(max-width: 768px)').matches;
    
          if (isNextSmallWidthViewport !== isSmallWidthViewport) {
            setIsSmallWidthViewport(isNextSmallWidthViewport);
          }
        };
        updateViewPortWidth();
        window.addEventListener('resize', updateViewPortWidth);
    
        return () => {
          window.removeEventListener('resize', updateViewPortWidth);
        };
      }, [isSmallWidthViewport]);
    
    return (
        <LexicalComposer initialConfig={initialConfig}>
            <AutoFocusPlugin />
            <RichTextPlugin
                contentEditable={
                    <div ref={onRef} className="relative">
                        <ContentEditable className='w-full outline-none' />
                    </div>
                }
                // absolute positioning is the Lexical team's official recommendation for placeholders
                placeholder={<div className='absolute top-10 left-10'>Start typing here...</div>} 
                ErrorBoundary={LexicalErrorBoundary}
            />
            <ListPlugin />
            <OnChangePlugin onChange={onChange} />
            <MarkdownShortcutPlugin transformers={[UNORDERED_LIST]} />
            <CustomTabIndentationPlugin />
            <MoveItemsPlugin />
            {floatingAnchorElem && !isSmallWidthViewport && (
                <>
                    <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                </>
            )}
            {floatingAnchorElem && isSmallWidthViewport && (
                <>
                    <FloatingMenuPlugin anchorElem={floatingAnchorElem} /> 
                </>
            )}
        </LexicalComposer>
    )
}

export default Editor;