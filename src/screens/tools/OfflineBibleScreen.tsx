import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  Copy,
  Check,
  FilePlus,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Verse {
  verse: number;
  text: string;
}

const SAMPLE_CHAPTERS: Record<string, Verse[]> = {
  'Genesis 1': [
    { verse: 1, text: 'In the beginning God created the heaven and the earth.' },
    { verse: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
    { verse: 3, text: 'And God said, Let there be light: and there was light.' },
    { verse: 4, text: 'And God saw the light, that it was good: and God divided the light from the darkness.' },
    { verse: 5, text: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.' },
  ],
  'Psalms 23': [
    { verse: 1, text: 'The LORD is my shepherd; I shall not want.' },
    { verse: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
    { verse: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.' },
    { verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
    { verse: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
    { verse: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' },
  ],
  'John 1': [
    { verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
    { verse: 2, text: 'The same was in the beginning with God.' },
    { verse: 3, text: 'All things were made by him; and without him was not any thing made that was made.' },
    { verse: 4, text: 'In him was life; and the life was the light of men.' },
    { verse: 5, text: 'And the light shineth in darkness; and the darkness comprehended it not.' },
  ],
  'Romans 8': [
    { verse: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
    { verse: 31, text: 'What shall we then say to these things? If God be for us, who can be against us?' },
    { verse: 38, text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,' },
    { verse: 39, text: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.' },
  ],
};

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  'Psalms', 'Proverbs', 'Ecclesiastes', 'Isaiah', 'Jeremiah', 'Daniel',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
  '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', 'Revelation'
];

export const OfflineBibleScreen: React.FC = () => {
  const { addNote, showToast, activeProjectId } = useApp();
  const [selectedBook, setSelectedBook] = useState('Psalms');
  const [selectedChapter, setSelectedChapter] = useState(23);
  const [searchQuery, setSearchQuery] = useState('');
  const [translation, setTranslation] = useState<'KJV' | 'WEB'>('KJV');

  const chapterKey = `${selectedBook} ${selectedChapter}`;
  const verses = SAMPLE_CHAPTERS[chapterKey] || [
    { verse: 1, text: `Offline text for ${chapterKey} is indexed in the knowledge pack storage.` },
    { verse: 2, text: 'The quick indexing layer allows search without network connectivity.' },
  ];

  const handleCopyVerse = (v: Verse) => {
    const text = `"${v.text}" — ${selectedBook} ${selectedChapter}:${v.verse} (${translation})`;
    navigator.clipboard.writeText(text);
    showToast('Verse copied to clipboard');
  };

  const handleSaveToNotes = (v: Verse) => {
    const title = `${selectedBook} ${selectedChapter}:${v.verse} (${translation})`;
    const content = `> ${v.text}\n\n*Extracted from Offline Scripture Library*`;
    addNote(title, content, activeProjectId, ['scripture', selectedBook.toLowerCase()], 'bible');
    showToast('Saved to Knowledge Notes');
  };

  return (
    <div id="offline-bible-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Offline Scripture Library</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Indexed offline biblical canon, concordance lookup, and direct note extractions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={translation}
              onChange={(e) => setTranslation(e.target.value as any)}
              className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
            >
              <option value="KJV">King James Version (KJV)</option>
              <option value="WEB">World English Bible (WEB)</option>
            </select>
          </div>
        </div>

        {/* Navigation Selector Bar */}
        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedBook}
              onChange={(e) => {
                setSelectedBook(e.target.value);
                setSelectedChapter(1);
              }}
              className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
            >
              {BIBLE_BOOKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedChapter((c) => Math.max(1, c - 1))}
                className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-xs text-white">
                Ch. {selectedChapter}
              </span>
              <button
                type="button"
                onClick={() => setSelectedChapter((c) => c + 1)}
                className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick chapter links */}
          <div className="flex items-center gap-1.5 text-xs">
            {['Genesis 1', 'Psalms 23', 'John 1', 'Romans 8'].map((preset) => {
              const [b, c] = preset.split(' ');
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSelectedBook(b);
                    setSelectedChapter(parseInt(c, 10));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    selectedBook === b && selectedChapter === parseInt(c, 10)
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* Verses Reading Container */}
        <div className="p-6 rounded-3xl bg-neutral-900/30 border border-neutral-800/80 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h2 className="text-base font-bold text-white font-serif">
              {selectedBook} {selectedChapter} ({translation})
            </h2>
            <span className="text-xs text-neutral-500">{verses.length} verses</span>
          </div>

          <div className="space-y-3 font-serif leading-relaxed text-sm text-neutral-200">
            {verses.map((v) => (
              <div
                key={v.verse}
                id={`verse-${v.verse}`}
                className="group p-3 rounded-xl hover:bg-neutral-900/60 transition-colors flex items-start gap-3"
              >
                <span className="font-sans text-xs font-bold text-teal-400 shrink-0 select-none mt-0.5 w-6 text-right">
                  {v.verse}
                </span>
                <p className="flex-1 leading-relaxed text-neutral-200">{v.text}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 font-sans">
                  <button
                    type="button"
                    title="Copy Verse"
                    onClick={() => handleCopyVerse(v)}
                    className="p-1 rounded text-neutral-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Save to Knowledge Notes"
                    onClick={() => handleSaveToNotes(v)}
                    className="p-1 rounded text-neutral-400 hover:text-teal-400"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
