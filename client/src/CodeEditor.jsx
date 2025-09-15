import React, { useState, useRef, useEffect } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-c";
import "prismjs/themes/prism-tomorrow.css";
import "./styles/codeEditor.css";

const languages = ["c", "java", "javascript", "python"];

function CodeEditor({ initialCode, initialLanguage = "c", onCodeChange, onLanguageChange }) {
  const [code, setCode] = useState(initialCode || "");
  const [lang, setLang] = useState(initialLanguage);
  const [theme, setTheme] = useState("dark");
  const scrollRef = useRef(null);

  // Load code when problem changes (but not on lang switch)
  useEffect(() => {
    setCode(initialCode || "");
  }, [initialCode]);

  // Notify parent of code updates
  useEffect(() => {
    onCodeChange(code);
  }, [code]);

  // Notify parent of language updates
  useEffect(() => {
    onLanguageChange(lang);
  }, [lang]);

  const highlight = (code) => {
    let grammar;
    switch (lang) {
      case "c":
        grammar = Prism.languages.c;
        break;
      case "java":
        grammar = Prism.languages.java;
        break;
      case "python":
        grammar = Prism.languages.python;
        break;
      case "javascript":
      default:
        grammar = Prism.languages.javascript;
    }
    return Prism.highlight(code, grammar, lang);
  };

  // Auto-scroll editor
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [code]);

  return (
    <div className="editor-panel">
      <select onChange={(e) => setLang(e.target.value)} value={lang}>
        {languages.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      <div className="code" ref={scrollRef}>
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={highlight}
          padding={10}
          style={{
            fontFamily: '"Fira Code", monospace',
            fontSize: 14,
            backgroundColor: theme === "light" ? "#f5f5f5" : "#373535ff",
            color: theme === "light" ? "#000" : "#fff",
            borderRadius: "4px",
            lineHeight: "1.6",
            minHeight: "250px",
            maxHeight: "800px"
          }}
          textareaProps={{ spellCheck: false }}
        />
      </div>
    </div>
  );
}

export default CodeEditor;
