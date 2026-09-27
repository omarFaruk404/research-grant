"use client";
import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND } from "lexical";
import { ListNode, ListItemNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

// --- 1. Toolbar Component ---
function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const format = (command, payload) => {
    editor.dispatchCommand(command, payload);
  };

  return (
    <div className="bg-light border-bottom p-2 d-flex gap-2 rounded-top-3">
      {/* Bold */}
      <button type="button" className="btn btn-sm btn-outline-secondary border-0 fw-bold" onClick={() => format(FORMAT_TEXT_COMMAND, "bold")}>B</button>
      {/* Italic */}
      <button type="button" className="btn btn-sm btn-outline-secondary border-0 fst-italic" onClick={() => format(FORMAT_TEXT_COMMAND, "italic")}>I</button>
      {/* Underline */}
      <button type="button" className="btn btn-sm btn-outline-secondary border-0 text-decoration-underline" onClick={() => format(FORMAT_TEXT_COMMAND, "underline")}>U</button>
      
      <div className="vr mx-1"></div>
      
      {/* Lists */}
      <button type="button" className="btn btn-sm btn-outline-secondary border-0" onClick={() => format(INSERT_UNORDERED_LIST_COMMAND, undefined)}>
        <i className="bi bi-list-ul"></i>
      </button>
      <button type="button" className="btn btn-sm btn-outline-secondary border-0" onClick={() => format(INSERT_ORDERED_LIST_COMMAND, undefined)}>
        <i className="bi bi-list-ol"></i>
      </button>
    </div>
  );
}

// --- 2. Initial State Loader (HTML -> Nodes) ---
function LoadInitialHtml({ initialHtml }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!initialHtml) return;

    editor.update(() => {
      // Avoid re-populating if editor is not empty (simple check)
      const currentContent = $getRoot().getTextContent();
      if (currentContent) return;

      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      $getRoot().clear(); // Clear default paragraph
      $getRoot().select();
      $insertNodes(nodes);
    });
  }, [editor, initialHtml]);

  return null;
}

// --- 3. Main Editor Component ---
export default function LexicalEditor({ value, onChange, readOnly, placeholder }) {
  // Configuration
  const initialConfig = {
    namespace: "MyReviewEditor",
    editable: !readOnly,
    theme: {
      paragraph: "mb-2", // Bootstrap class for spacing
      text: {
        bold: "fw-bold",
        italic: "fst-italic",
        underline: "text-decoration-underline",
      },
    },
    nodes: [ListNode, ListItemNode], // Register List Nodes
    onError: (error) => console.error(error),
  };

  // Handle Change: Nodes -> HTML
  const handleChange = (editorState, editor) => {
    editorState.read(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      if (onChange) onChange(htmlString);
    });
  };

  if (readOnly) {
    return (
      <div 
        className="p-3 bg-light border rounded-3 text-secondary"
        dangerouslySetInnerHTML={{ __html: value }} 
        style={{ minHeight: '100px' }}
      />
    );
  }

  return (
    <div className="border rounded-3 bg-white shadow-sm">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="position-relative">
          <RichTextPlugin
            contentEditable={<ContentEditable className="p-3" style={{ minHeight: "150px", outline: "none" }} />}
            placeholder={<div className="text-muted position-absolute top-0 start-0 p-3 pointer-events-none">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <OnChangePlugin onChange={handleChange} />
          
          {/* Custom Plugin to load initial HTML value */}
          <LoadInitialHtml initialHtml={value} />
        </div>
      </LexicalComposer>
    </div>
  );
}