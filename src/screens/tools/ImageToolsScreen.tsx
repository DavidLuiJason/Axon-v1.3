import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Download,
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatBytes } from '../../lib/storageManifest';

export const ImageToolsScreen: React.FC = () => {
  const { showToast } = useApp();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileName, setFileName] = useState<string>('image.png');

  // Resize controls
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/webp');
  const [quality, setQuality] = useState(0.85);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSize(file.size);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImageSrc(dataUrl);
        const img = new Image();
        img.onload = () => {
          setOriginalWidth(img.width);
          setOriginalHeight(img.height);
          setTargetWidth(img.width);
          setTargetHeight(img.height);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
      showToast(`Loaded "${file.name}"`);
    }
  };

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockRatio && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setTargetHeight(Math.round(w * ratio));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockRatio && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setTargetWidth(Math.round(h * ratio));
    }
  };

  const handleDownloadProcessed = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth || img.width;
      canvas.height = targetHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              const ext = exportFormat.split('/')[1];
              a.download = `optimized_${targetWidth}x${targetHeight}.${ext}`;
              a.click();
              URL.revokeObjectURL(url);
              showToast('Optimized image downloaded');
            }
          },
          exportFormat,
          quality
        );
      }
    };
    img.src = imageSrc;
  };

  return (
    <div id="image-tools-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Image Processor & Optimizer</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Deterministic client-side resizing, format transcoding, aspect ratios, and compression.
            </p>
          </div>

          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors">
            <Upload className="w-4 h-4" />
            <span>Select Image</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Image Preview Canvas */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col items-center justify-center min-h-[260px]">
          {imageSrc ? (
            <div className="space-y-3 text-center">
              <img
                src={imageSrc}
                alt="Source preview"
                className="max-h-72 max-w-full rounded-xl object-contain shadow-md mx-auto border border-neutral-800"
              />
              <div className="flex items-center justify-center gap-3 text-xs text-neutral-400">
                <span>Original: {originalWidth} × {originalHeight} px</span>
                <span>•</span>
                <span>Size: {formatBytes(fileSize)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 space-y-2">
              <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-500">Upload an image to resize, transcode, or compress offline.</p>
            </div>
          )}
        </div>

        {/* Controls Grid */}
        {imageSrc && (
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
            <h2 className="text-sm font-semibold text-white">Dimension & Transcode Settings</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Width */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400">Width (px)</label>
                <input
                  type="number"
                  value={targetWidth}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-xs text-white"
                />
              </div>

              {/* Height */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-400">Height (px)</label>
                  <button
                    type="button"
                    onClick={() => setLockRatio(!lockRatio)}
                    className="text-neutral-400 hover:text-white"
                    title={lockRatio ? 'Ratio locked' : 'Ratio unlocked'}
                  >
                    {lockRatio ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input
                  type="number"
                  value={targetHeight}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-xs text-white"
                />
              </div>

              {/* Format */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-400">Output Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                >
                  <option value="image/webp">WebP (High Efficiency)</option>
                  <option value="image/jpeg">JPEG (Universal)</option>
                  <option value="image/png">PNG (Lossless)</option>
                </select>
              </div>

              {/* Quality */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Quality</span>
                  <span>{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-neutral-800 rounded-lg mt-2"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={handleDownloadProcessed}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Optimized Image</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
