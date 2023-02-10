import MonacoEditor, {EditorDidMount} from '@monaco-editor/react';
import prettier from 'prettier';
import parser from "prettier/parser-babel";
import codeShift from 'jscodeshift';
import HighLighter from 'monaco-jsx-highlighter'; // Declaration for type def in src/index.d.ts
import React, {useRef} from "react";
import './code-editor.css';
import './syntax.css';

interface CodeEditorProps {
    initialValue: string;

    onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({initialValue, onChange}) => {
    const editorRef = useRef<any>()
    const editorOptions: any = {
        automaticLayout: true,
        folding: false,
        fontSize: 16,
        lineNumbersMinChars: 3,
        minimap: {
            enabled: false
        },
        scrollBeyondLastLine: true,
        showUnused: false,
        wordWrap: 'on'
    };

    const onEditorDidMount: EditorDidMount = (getValue, monacoEditor) => {
        editorRef.current = monacoEditor;
        monacoEditor.onDidChangeModelContent(() => {
            onChange(getValue());
        });

        // Set the tabSize by updating the options with the preferred value.
        // TODO: make this a user option?
        monacoEditor.getModel()?.updateOptions({tabSize: 3});

        const highlighter = new HighLighter(
        // @ts-ignore
          window.monaco,
          codeShift,
          monacoEditor
        );
        highlighter.highLightOnDidChangeModelContent(
            () => {},
            () => {},
            undefined,
            () => {}
        );
    };

    const onFormatClick = () => {
        // Grab the original value.
        const unformatted = editorRef.current.getModel().getValue();
        // Pass it to prettier in order to format it.
        const formatted = prettier.format(unformatted, {
            parser: 'babel',
            plugins: [parser],
            semi: true,
            singleQuote: true
        }).replace(/\n$/, '');  // Not sure I want to remove the last line.
        editorRef.current.setValue(formatted);
    };

    return (
        <div className="editor-wrapper">
            <button className="button button-format is-primary is-small" onClick={onFormatClick}>Format</button>
        <MonacoEditor
        editorDidMount={onEditorDidMount}
        height="500px"
        language="javascript"
        options={editorOptions}
        theme="dark"
        value={initialValue}
    />
        </div>);
};

export default CodeEditor;
