"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useId, useRef } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import EditorjsList from "@editorjs/list";
import Quote from "@editorjs/quote";
import Delimiter from "@editorjs/delimiter";
import CheckList from "@editorjs/checklist";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import ImageTool from "@editorjs/image";
import { uploadFile } from "../../lib/service/functions/upload.service";

export interface BlockEditorHandle {
  save: () => Promise<OutputData>;
}

interface BlockEditorProps {
  initialData?: OutputData;
  placeholder?: string;
  uploadFolder?: string;
  className?: string;
}

const EMPTY_DATA: OutputData = { blocks: [] };

const BlockEditor = forwardRef<BlockEditorHandle, BlockEditorProps>(
  ({ initialData, placeholder = "Start writing your article...", uploadFolder = "blogs", className = "" }, ref) => {
    const generatedId = useId().replace(/[:]/g, "-");
    const holderId = `hitha-block-editor-${generatedId}`;
    const editorRef = useRef<EditorJS | null>(null);
    // Serializes construct/destroy across React Strict Mode's dev-only double effect
    // invocation, so a phantom instance is never actually constructed into the shared
    // holder (Editor.js's destroy() clears the whole holder's innerHTML, which would
    // otherwise wipe out a second instance rendered before the first one's async
    // destroy resolves).
    const lifecycleRef = useRef<Promise<void>>(Promise.resolve());

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (!editorRef.current) {
          return EMPTY_DATA;
        }
        return editorRef.current.save();
      },
    }));

    useEffect(() => {
      let isCurrent = true;

      lifecycleRef.current = lifecycleRef.current.then(() => {
        if (!isCurrent) {
          return;
        }

        const editor = new EditorJS({
          holder: holderId,
          placeholder,
          data: initialData && initialData.blocks?.length ? initialData : EMPTY_DATA,
          autofocus: false,
          tools: {
            header: {
              class: Header as any,
              inlineToolbar: true,
              config: { placeholder: "Heading", levels: [2, 3, 4], defaultLevel: 2 },
            },
            list: {
              class: EditorjsList as any,
              inlineToolbar: true,
            },
            quote: {
              class: Quote as any,
              inlineToolbar: true,
            },
            checklist: {
              class: CheckList as any,
              inlineToolbar: true,
            },
            delimiter: Delimiter as any,
            marker: Marker as any,
            inlineCode: InlineCode as any,
            image: {
              class: ImageTool as any,
              config: {
                uploader: {
                  uploadByFile: async (file: File) => {
                    const res = await uploadFile(file, uploadFolder);
                    if (!res.success || !res.data) {
                      throw new Error(res.message || "Failed to upload image");
                    }
                    return { success: 1, file: { url: res.data } };
                  },
                },
              },
            },
          },
        });

        editorRef.current = editor;
        return editor.isReady;
      });

      return () => {
        isCurrent = false;
        lifecycleRef.current = lifecycleRef.current
          .then(() => {
            const instance = editorRef.current;
            editorRef.current = null;
            return instance?.destroy();
          })
          .catch(() => {
            /* nothing to clean up, or the instance never finished initializing */
          });
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [holderId]);

    return <div id={holderId} className={`hitha-block-editor ${className}`} />;
  }
);

BlockEditor.displayName = "BlockEditor";

export default BlockEditor;
