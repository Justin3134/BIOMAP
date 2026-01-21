import { useEffect, useRef, useState, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Save, Download, FileText, Upload, Printer, Share2, 
  FileDown, Copy, CheckCircle, Clock, BookOpen 
} from 'lucide-react';

// Register custom fonts for the editor
const Font = Quill.import('formats/font');
Font.whitelist = ['serif', 'monospace', 'sans-serif', 'arial', 'georgia', 'times-new-roman'];
Quill.register(Font, true);

interface AdvancedNotesEditorProps {
  value: string;
  onChange: (value: string) => void;
  projectTitle?: string;
}

const AdvancedNotesEditor = ({ value, onChange, projectTitle }: AdvancedNotesEditorProps) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
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

  // Update word and character count
  useEffect(() => {
    const text = value.replace(/<[^>]*>/g, ''); // Strip HTML tags
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  }, [value]);

  // Export as HTML
  const handleExportHTML = () => {
    const blob = new Blob([value], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle || 'research-notes'}-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as plain text
  const handleExportText = () => {
    const text = value.replace(/<[^>]*>/g, ''); // Strip HTML tags
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle || 'research-notes'}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as Markdown
  const handleExportMarkdown = () => {
    // Simple HTML to Markdown conversion
    let markdown = value
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle || 'research-notes'}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const text = value.replace(/<[^>]*>/g, '');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${projectTitle || 'Research Notes'}</title>
            <style>
              body { font-family: Georgia, serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; }
              h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
              p { margin-bottom: 1em; }
              blockquote { border-left: 4px solid #ddd; padding-left: 16px; margin-left: 0; font-style: italic; }
              code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
              pre { background: #f4f4f4; padding: 16px; border-radius: 8px; overflow-x: auto; }
            </style>
          </head>
          <body>${value}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Enhanced toolbar with research-focused features - use useMemo to prevent recreation
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': ['serif', 'monospace', 'sans-serif', 'arial', 'georgia', 'times-new-roman'] }],
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
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const formats = useMemo(() => [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ], []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Font styles for Quill editor */}
      <style>{`
        .ql-font-serif { font-family: Georgia, serif; }
        .ql-font-monospace { font-family: 'Courier New', monospace; }
        .ql-font-sans-serif { font-family: Arial, sans-serif; }
        .ql-font-arial { font-family: Arial, Helvetica, sans-serif; }
        .ql-font-georgia { font-family: Georgia, serif; }
        .ql-font-times-new-roman { font-family: 'Times New Roman', Times, serif; }
      `}</style>
      
      {/* Enhanced Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <div>
            <h1 className="font-serif text-xl font-semibold text-foreground">Research Manuscript</h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
              {isSaving ? (
                <span className="text-amber-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              ) : lastSaved ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              ) : (
                <span>Start writing to auto-save</span>
              )}
              <span>•</span>
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} characters</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm font-medium"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <div className="relative group">
            <button
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={handleExportHTML}
                className="w-full text-left px-4 py-2 hover:bg-secondary text-sm flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Export as HTML
              </button>
              <button
                onClick={handleExportText}
                className="w-full text-left px-4 py-2 hover:bg-secondary text-sm flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export as Text
              </button>
              <button
                onClick={handleExportMarkdown}
                className="w-full text-left px-4 py-2 hover:bg-secondary text-sm flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Export as Markdown
              </button>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm font-medium"
            title="Print"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-6xl mx-auto px-8 py-6">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder="Start writing your research manuscript...

Suggested Structure:
• Abstract
• Introduction
• Literature Review
• Methodology
• Results
• Discussion
• Conclusion
• References

Tip: Use headings (Ctrl/Cmd + Alt + 1-6) to structure your document"
            className="h-[calc(100%-80px)] bg-card rounded-lg advanced-editor"
            style={{
              height: 'calc(100% - 80px)',
            }}
          />
        </div>
      </div>

      {/* Enhanced Footer with Research Tips */}
      <div className="px-6 py-3 border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{Math.ceil(wordCount / 250)} min read</span>
          </div>
        </div>
      </div>

      {/* Enhanced Quill Styles */}
      <style>{`
        .advanced-editor .ql-container {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 16px;
          line-height: 1.8;
        }
        
        .advanced-editor .ql-editor {
          min-height: 500px;
          padding: 40px 60px;
          background: hsl(var(--card));
          color: hsl(var(--foreground));
        }
        
        .advanced-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
          left: 60px;
          right: 60px;
        }
        
        .advanced-editor .ql-toolbar {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 8px 8px 0 0;
          padding: 12px 16px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .advanced-editor .ql-container {
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 0 0 8px 8px;
        }
        
        .advanced-editor .ql-toolbar button {
          color: hsl(var(--foreground));
        }
        
        .advanced-editor .ql-toolbar button:hover {
          color: hsl(var(--primary));
          background: hsl(var(--secondary));
        }
        
        .advanced-editor .ql-toolbar button.ql-active {
          color: hsl(var(--primary));
          background: hsl(var(--secondary));
        }
        
        .advanced-editor .ql-stroke {
          stroke: hsl(var(--foreground)) !important;
        }
        
        .advanced-editor .ql-fill {
          fill: hsl(var(--foreground)) !important;
        }
        
        .advanced-editor .ql-picker-label {
          color: hsl(var(--foreground)) !important;
        }
        
        .advanced-editor .ql-editor h1 {
          font-size: 2.5em;
          font-weight: 700;
          margin-top: 1em;
          margin-bottom: 0.5em;
          line-height: 1.2;
        }
        
        .advanced-editor .ql-editor h2 {
          font-size: 2em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
          line-height: 1.3;
        }
        
        .advanced-editor .ql-editor h3 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 0.8em;
          margin-bottom: 0.4em;
          line-height: 1.4;
        }
        
        .advanced-editor .ql-editor h4 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 0.6em;
          margin-bottom: 0.3em;
        }
        
        .advanced-editor .ql-editor p {
          margin-bottom: 1.2em;
        }
        
        .advanced-editor .ql-editor blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 20px;
          margin-left: 0;
          margin-right: 0;
          margin-bottom: 1.5em;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        
        .advanced-editor .ql-editor code {
          background: hsl(var(--secondary));
          padding: 3px 8px;
          border-radius: 4px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.9em;
        }
        
        .advanced-editor .ql-editor pre {
          background: hsl(var(--secondary));
          padding: 20px;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 1.5em;
        }
        
        .advanced-editor .ql-editor a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        
        .advanced-editor .ql-editor ul, .advanced-editor .ql-editor ol {
          padding-left: 2em;
          margin-bottom: 1.2em;
        }
        
        .advanced-editor .ql-editor li {
          margin-bottom: 0.5em;
        }

        .advanced-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1.5em auto;
          border-radius: 8px;
        }

        /* Selection styling */
        .advanced-editor .ql-editor ::selection {
          background: hsl(var(--primary) / 0.3);
        }

        /* Focus state */
        .advanced-editor .ql-container.ql-snow {
          border-color: hsl(var(--border));
        }

        .advanced-editor:focus-within .ql-container.ql-snow {
          border-color: hsl(var(--primary));
        }
      `}</style>
    </div>
  );
};

export default AdvancedNotesEditor;
