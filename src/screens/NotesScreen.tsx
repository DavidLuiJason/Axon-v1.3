import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit3,
  Copy,
  Check,
  Tag,
  FolderOpen,
  Sparkles,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NoteCategory, NoteItem } from '../types';

const CATEGORIES: Array<{ id: NoteCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All Notes' },
  { id: 'general', label: 'General' },
  { id: 'extract', label: 'Extracts' },
  { id: 'code', label: 'Code Snippets' },
  { id: 'prompt', label: 'Prompts' },
  { id: 'spec', label: 'Specs' },
  { id: 'bible', label: 'Scripture' },
  { id: 'extracted_chat', label: 'Chat Logs' },
];

export const NotesScreen: React.FC = () => {
  const {
    notes,
    addNote,
    updateNote,
    togglePinNote,
    deleteNote,
    activeProjectId,
    requestConfirmation,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'all'>('all');
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<NoteCategory>('general');
  const [editTags, setEditTags] = useState('');

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || n.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const handleStartCreate = () => {
    setSelectedNote(null);
    setEditTitle('');
    setEditContent('');
    setEditCategory('general');
    setEditTags('');
    setIsEditing(true);
  };

  const handleStartEdit = (note: NoteItem) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category);
    setEditTags(note.tags.join(', '));
    setIsEditing(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      showToast('Title is required');
      return;
    }

    const tagList = editTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (selectedNote) {
      updateNote(selectedNote.id, {
        title: editTitle,
        content: editContent,
        category: editCategory,
        tags: tagList,
      });
      showToast('Note updated');
    } else {
      const created = addNote(
        editTitle,
        editContent,
        activeProjectId,
        tagList,
        editCategory
      );
      setSelectedNote(created);
      showToast('Note created');
    }
    setIsEditing(false);
  };

  const handleDeleteNote = (note: NoteItem) => {
    requestConfirmation({
      title: 'Delete Note',
      message: `Are you sure you want to permanently delete "${note.title}"?`,
      danger: true,
      confirmLabel: 'Delete Note',
      onConfirm: () => {
        deleteNote(note.id);
        if (selectedNote?.id === note.id) {
          setSelectedNote(null);
          setIsEditing(false);
        }
        showToast('Note deleted');
      },
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  };

  return (
    <div id="notes-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Knowledge & Notes</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Project memory, context snippets, conversation extractions, and offline reference notebooks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="new-note-button"
              type="button"
              onClick={handleStartCreate}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, tags, or content..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-neutral-400 hover:text-white bg-neutral-900/40 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Modal / Inline Form */}
        {isEditing && (
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-750 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-sm font-semibold text-white">
                {selectedNote ? 'Edit Note' : 'Create New Note'}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Memory Architecture Spec"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as NoteCategory)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="general">General</option>
                    <option value="extract">Extract</option>
                    <option value="code">Code</option>
                    <option value="prompt">Prompt</option>
                    <option value="spec">Specification</option>
                    <option value="bible">Scripture</option>
                    <option value="extracted_chat">Chat Log</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="architecture, spec, offline"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Content (Markdown supported)</label>
                <textarea
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Type note content here..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500 resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes Grid */}
        <div className="space-y-4">
          {/* Pinned section */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Pin className="w-3.5 h-3.5" />
                <span>Pinned Notes ({pinnedNotes.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pinnedNotes.map((note) => renderNoteCard(note))}
              </div>
            </div>
          )}

          {/* Regular notes */}
          <div className="space-y-3">
            {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
              <div className="text-xs font-semibold text-neutral-400">Other Notes</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unpinnedNotes.map((note) => renderNoteCard(note))}
            </div>
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-12 text-neutral-500 text-xs">
              No notes found. Create your first note above or extract insights directly from AXON Chat.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderNoteCard(note: NoteItem) {
    return (
      <div
        key={note.id}
        id={`note-card-${note.id}`}
        className="p-4 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900/70 border border-neutral-800/80 transition-all flex flex-col justify-between space-y-3"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-white line-clamp-1">{note.title}</h3>
            <button
              type="button"
              onClick={() => togglePinNote(note.id)}
              className={`p-1 rounded-md transition-colors ${
                note.isPinned ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-neutral-400 font-mono whitespace-pre-wrap line-clamp-4 leading-relaxed bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-850">
            {note.content}
          </p>
        </div>

        <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="capitalize px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]">
              {note.category}
            </span>
            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Copy content"
              onClick={() => handleCopy(note.content)}
              className="p-1 rounded hover:text-white"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Edit"
              onClick={() => handleStartEdit(note)}
              className="p-1 rounded hover:text-white"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Delete"
              onClick={() => handleDeleteNote(note)}
              className="p-1 rounded hover:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
};
