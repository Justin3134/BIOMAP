import { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Save, Download, FileText } from 'lucide-react';

interface RichNotesEditorProps {
  value: string;
  onChange: (value: string) => void;
  projectTitle?: string;
}

const RichNotesEditor = ({ value, onChange, projectTitle }: RichNotesEditorProps) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        setIsSaving(true);
        // Simulate save (in real app, this would call backend)
        setTimeout(() => {
          setLastSaved(new Date());
          setIsSaving(false);
        }, 300);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [value]);

  // Export as HTML
  const handleExport = () => {
    const blob = new Blob([value], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle || 'notes'}-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Rich text editor modules (Google Docs-style toolbar)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <h1 className="font-serif text-xl font-semibold text-foreground">Research Notes</h1>
            <p className="text-xs text-muted-foreground">
              {isSaving ? (
                <span className="text-amber-500">Saving...</span>
              ) : lastSaved ? (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              ) : (
                <span>Start typing to auto-save</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-5xl mx-auto px-6 py-6">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder="Start writing your research notes... 

You can:
• Format text with bold, italic, underline
• Create headings and lists
• Add links and images
• Insert code blocks
• And much more!"
            className="h-[calc(100%-60px)] bg-card rounded-lg"
            style={{
              height: 'calc(100% - 60px)',
            }}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="px-6 py-3 border-t border-border bg-card/50">
        <div className="max-w-5xl mx-auto flex items-center gap-6 text-xs text-muted-foreground">
          <span>💡 <strong>Tip:</strong> Use Cmd/Ctrl + B for bold, Cmd/Ctrl + I for italic</span>
          <span>📝 Auto-saves every second</span>
          <span>📤 Export to HTML for sharing</span>
        </div>
      </div>

      {/* Custom Quill Styles */}
      <style>{`
        .ql-container {
          font-family: inherit;
          font-size: 15px;
          line-height: 1.6;
        }
        
        .ql-editor {
          min-height: 400px;
          padding: 24px;
          background: hsl(var(--card));
          color: hsl(var(--foreground));
        }
        
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        
        .ql-toolbar {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 8px 8px 0 0;
          padding: 12px;
        }
        
        .ql-container {
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 0 0 8px 8px;
        }
        
        .ql-toolbar button {
          color: hsl(var(--foreground));
        }
        
        .ql-toolbar button:hover {
          color: hsl(var(--primary));
        }
        
        .ql-toolbar button.ql-active {
          color: hsl(var(--primary));
        }
        
        .ql-stroke {
          stroke: hsl(var(--foreground)) !important;
        }
        
        .ql-fill {
          fill: hsl(var(--foreground)) !important;
        }
        
        .ql-picker-label {
          color: hsl(var(--foreground)) !important;
        }
        
        .ql-editor h1 {
          font-size: 2em;
          font-weight: 700;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        .ql-editor h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        .ql-editor h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        .ql-editor blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 16px;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
        }
        
        .ql-editor code {
          background: hsl(var(--secondary));
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
        
        .ql-editor pre {
          background: hsl(var(--secondary));
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
        }
        
        .ql-editor a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        
        .ql-editor ul, .ql-editor ol {
          padding-left: 1.5em;
        }
        
        .ql-editor li {
          margin-bottom: 0.25em;
        }
      `}</style>
    </div>
  );
};

export default RichNotesEditor;
