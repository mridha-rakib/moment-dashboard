import React, { useCallback, useEffect, useRef, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  List, 
  Type, 
  Edit3, 
  Trash2, 
  FileText 
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const DynamicLegalEditor = ({ 
  type, 
  title, 
  subtitle, 
  content, 
  setContent, 
  editingText, 
  setEditingText,
  isSaving,
  lastModifiedText
}) => {
  const editorRef = useRef(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const getReadableText = (value) => value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  const getEditorHtml = () => (editorRef.current?.innerHTML === '<br>' ? '' : editorRef.current?.innerHTML || '');
  const hasEditorContent = getReadableText(editingText).length > 0;

  const syncEditorText = () => {
    setEditingText(getEditorHtml());
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const runEditorCommand = (command, value = null) => {
    focusEditor();
    document.execCommand(command, false, value);
    syncEditorText();
  };

  const handleParagraphChange = (event) => {
    runEditorCommand('formatBlock', event.target.value);
    event.target.value = 'P';
  };

  const handleLink = () => {
    focusEditor();

    const url = window.prompt('Enter link URL');

    if (!url) {
      return;
    }

    runEditorCommand('createLink', url);
  };

  const getLatestItem = useCallback(
    (items) => [...items].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)).at(-1) || null,
    []
  );

  const setEditorItem = useCallback((item) => {
    setEditingItemId(item?.id || null);
    setEditingText(item?.body || '');

    if (editorRef.current) {
      editorRef.current.innerHTML = item?.body || '';
    }
  }, [setEditingText]);

  useEffect(() => {
    const activeItem = content.find((item) => item.id === editingItemId) || getLatestItem(content);
    setEditorItem(activeItem);
  }, [content, editingItemId, getLatestItem, setEditorItem, type]);

  const handleSave = async () => {
    const currentEditorHtml = getEditorHtml();
    setEditingText(currentEditorHtml);

    if (!getReadableText(currentEditorHtml)) return;

    const nextContent = editingItemId
      ? content.map((item) => (item.id === editingItemId ? { ...item, body: currentEditorHtml } : item))
      : [
          ...content,
          {
            id: `draft-${Date.now()}`,
            title: `${content.length + 1}. New Clause`,
            body: currentEditorHtml,
            sortOrder: content.length,
          },
        ];

    const savedDocument = await setContent(nextContent);

    if (savedDocument) {
      const savedItem = savedDocument.clauses.find((item) => item.id === editingItemId) || getLatestItem(savedDocument.clauses);
      setEditorItem(savedItem);
    }
  };

  const handleDelete = async (id) => {
    const savedDocument = await setContent(content.filter(item => item.id !== id));

    if (savedDocument && editingItemId === id) {
      setEditingText('');
      setEditingItemId(null);
    }
  };

  const handleCancel = () => {
    const currentItem = content.find((item) => item.id === editingItemId) || getLatestItem(content);
    setEditorItem(currentItem);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A4B] dark:text-white transition-colors">{title}</h2>
          <p className="text-sm text-gray-400 font-medium">{subtitle}</p>
        </div>
        <p className="text-[11px] text-gray-300 font-bold uppercase tracking-widest mt-2">{lastModifiedText}</p>
      </div>


      <div className="bg-white dark:bg-[#1E1E2D] rounded-[32px] p-2 shadow-sm border border-gray-50 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex items-center gap-4">
          <select onChange={handleParagraphChange} defaultValue="P" className="bg-[#F8F9FD] dark:bg-[#2D2D3F] border-none text-xs font-bold text-gray-400 rounded-lg px-3 py-1.5 outline-none cursor-pointer transition-colors">
            <option value="P">Paragraph</option>
            <option value="H2">Heading</option>
            <option value="H3">Subheading</option>
          </select>
          <div className="h-6 w-[1px] bg-gray-100 dark:bg-gray-800 mx-2" />
          <div className="flex gap-4 text-gray-400">
            <button type="button" onMouseDown={(event) => {
              event.preventDefault();
              runEditorCommand('bold');
            }} className="cursor-pointer hover:text-[#4B4B8A] dark:hover:text-white transition-colors">
              <Bold size={16} />
            </button>
            <button type="button" onMouseDown={(event) => {
              event.preventDefault();
              runEditorCommand('italic');
            }} className="cursor-pointer hover:text-[#4B4B8A] dark:hover:text-white transition-colors">
              <Italic size={16} />
            </button>
            <button type="button" onMouseDown={(event) => {
              event.preventDefault();
              handleLink();
            }} className="cursor-pointer hover:text-[#4B4B8A] dark:hover:text-white transition-colors">
              <LinkIcon size={16} />
            </button>
            <button type="button" onMouseDown={(event) => {
              event.preventDefault();
              runEditorCommand('insertUnorderedList');
            }} className="cursor-pointer hover:text-[#4B4B8A] dark:hover:text-white transition-colors">
              <List size={16} />
            </button>
            <button type="button" onMouseDown={(event) => {
              event.preventDefault();
              runEditorCommand('formatBlock', 'H3');
            }} className="cursor-pointer hover:text-[#4B4B8A] dark:hover:text-white transition-colors">
              <Type size={16} />
            </button>
          </div>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Type here..."
          onInput={syncEditorText}
          className="w-full h-80 p-8 text-sm text-[#1A1A4B] dark:text-white bg-transparent font-medium outline-none resize-none placeholder-gray-300 overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none"
        />

        <div className="p-6 flex justify-end gap-4 bg-gray-50/30 dark:bg-[#13131F]/30">
          <button onClick={handleCancel} className="px-8 py-2.5 bg-white dark:bg-[#1E1E2D] border border-gray-100 dark:border-gray-800 text-gray-400 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all">Cancel</button>
            <button 
            onClick={handleSave}
            disabled={!hasEditorContent || isSaving}
            className="inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-[#4B4B8A] dark:bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-[#3B3B7A] dark:hover:bg-indigo-700 transition-all shadow-lg shadow-[#4B4B8A]/20 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Spinner className="size-4 text-white" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>


      <div className="relative py-10 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800"></div></div>
        <span className="relative bg-[#F8F9FD] dark:bg-[#13131F] px-6 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] transition-colors">Display on landing page</span>
      </div>


      <div className="space-y-6">
        {content.map((item) => (
          <div key={item.id} className="bg-white dark:bg-[#1E1E2D] rounded-[32px] p-10 shadow-sm border border-gray-50 dark:border-gray-800 relative group animate-in slide-in-from-bottom-4 duration-500 transition-colors">
            <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={() => {
                setEditingItemId(item.id);
                setEditingText(item.body);
              }} className="p-2.5 bg-[#4B4B8A]/10 dark:bg-indigo-600/10 text-[#4B4B8A] dark:text-indigo-400 rounded-xl hover:bg-[#4B4B8A] dark:hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <Edit3 size={18} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-red-50 dark:bg-red-900/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                <Trash2 size={18} />
              </button>
            </div>
            <div className="max-w-[800px] space-y-4">
              <h3 className="text-xl font-bold text-[#1A1A4B] dark:text-white transition-colors">{item.title}</h3>
              <div className="text-sm text-gray-400 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: item.body }} />
            </div>
          </div>
        ))}

        {content.length === 0 && (
          <div className="bg-white dark:bg-[#1E1E2D] rounded-[32px] p-20 text-center border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
            <FileText size={48} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
            <p className="text-gray-400 font-bold">No clauses published yet.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default DynamicLegalEditor;
