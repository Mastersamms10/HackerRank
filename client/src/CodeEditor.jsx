import React, { useState, useRef, useEffect } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-c";
import "prismjs/themes/prism-tomorrow.css";
import "./styles/codeEditor.css";

const languages = ["javascript", "java", "c", "python"];

function CodeEditor({ initialCode, onCodeChange, onLanguageChange }) {
 const [code, setCode] = useState(initialCode || "");
 const [lang, setLang] = useState("c");


  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    onCodeChange(code);
  }, [code]);

  useEffect(() => {
    onLanguageChange(lang);
  }, [lang]);
 // const [code, setCode] = useState("");
 // const [lang, setLang] = useState("javascript");
  const [theme, setTheme] = useState("dark");
  const scrollRef = useRef(null);
  

  const highlight = (code) => {
    const grammar = Prism.languages[lang] || Prism.languages.javascript;
    return Prism.highlight(code, grammar, lang);
  };

  // Auto-scroll to bottom when code changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [code]);

  
  return (
    <div className="editor-panel">
      <select onChange={(e) => setLang(e.target.value)} value={lang}>
        {languages.map((l) => <option key={l}>{l}</option>)}
      </select>

      <div className="code" ref={scrollRef}>
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={highlight}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
            backgroundColor: theme === "light" ? "#f5f5f5" : "#2d2d2d",
            color: theme === "light" ? "#000" : "#fff",
            borderRadius: "4px",
            outline: "none",
            lineHeight: "1.6",
            minHeight: "250px"
          }}
          textareaProps={{
            spellCheck: false
            
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditor;
