import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { EditorView } from '@codemirror/view'
import { githubLight } from '@uiw/codemirror-theme-github'

interface Props {
  value: string
  onChange: (value: string) => void
}

/** Editor HTML com realce de sintaxe e linhas numeradas (CodeMirror). */
export default function FlowStepHtmlEditor({ value, onChange }: Props) {
  return (
    <div className="flow-step-html-editor">
      <CodeMirror
        value={value}
        height="100%"
        theme={githubLight}
        extensions={[html(), EditorView.lineWrapping]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: false,
          dropCursor: true,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          searchKeymap: false,
          lintKeymap: false,
          highlightSelectionMatches: false,
        }}
        indentWithTab
        onChange={onChange}
        spellCheck={false}
      />
    </div>
  )
}
