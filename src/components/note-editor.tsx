"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import {
  Eye,
  Edit,
  Save,
  FileUp,
  Loader2,
  FileText,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { formatUpdatedAt } from "../lib/date";
import type { Note } from "../types/note";
import { AppConfig } from "../config/config";

interface NoteEditorProps {
  note: Note;
  onUpdate: (noteId: string, updates: Partial<Note>) => Promise<void>;
}

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [hasChanges, setHasChanges] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
    setHasChanges(false);
    setIsPreview(false);
  }, [note.id, note.content, note.title]);

  useEffect(() => {
    setHasChanges(content !== note.content || title !== note.title);
  }, [content, title, note.content, note.title]);

  const handleSave = async () => {
    await onUpdate(note.id, { content, title });
    setHasChanges(false);
  };

  const runExtraction = async (noteId: string) => {
    setIsProcessing(true);
    try {
      const extractRes = await axios.get(`${AppConfig.baseURL}/note/${noteId}/extract-preview`);

      if (extractRes.data.success) {
        setContent(extractRes.data.data.extracted_text);
        setIsPreview(false);
      }
    } catch (error) {
      console.error("Extraction error:", error);
      alert("AI gagal mengekstrak teks dari dokumen.");
    } finally {
      setIsProcessing(false);
    }
  };

  const runAIExpert = async (noteId: string) => {
    if (isProcessing) return; // Cegah double click

    setIsProcessing(true);
    try {
      const res = await axios.get(`${AppConfig.baseURL}/note/${noteId}/extract-preview-ai`);

      // Sesuaikan res.data.data dengan struktur JSON dari Go Anda
      if (res.data && res.data.data) {
        // Jika di Go Anda fieldnya bernama 'reply', gunakan res.data.data.reply
        const newContent = res.data.data.reply || res.data.data.extracted_text;
        setContent(newContent);
        setIsPreview(true);
      }
    } catch (error) {
      console.error("AI Expert Error:", error);
      alert("Gagal memproses teks dengan AI.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = () => {
    if (note.files && note.files.length > 0) {
      runExtraction(note.id);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("note_id", note.id);

      await axios.post(`${AppConfig.baseURL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await runExtraction(note.id);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal mengunggah file.");
      setIsProcessing(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      if (hasChanges) handleSave();
    }
  };

  const hasExistingFiles = note.files && note.files.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 mr-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-gray-300"
              placeholder="Untitled Note"
            />

            {hasExistingFiles && (
              <div className="flex flex-wrap gap-2 mt-2">
                {note.files.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors px-2 py-1 rounded-md border border-indigo-100 shadow-sm group"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-medium truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.txt"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleActionClick}
              disabled={isProcessing}
              className={`h-8 shadow-sm ${
                hasExistingFiles
                  ? "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  : "text-gray-600 border-gray-300"
              }`}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : hasExistingFiles ? (
                <RefreshCw className="h-4 w-4 mr-2" />
              ) : (
                <FileUp className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? "Processing..." : hasExistingFiles ? "Re-extract AI" : "Extract PDF"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => runAIExpert(note.id)}
              disabled={isProcessing || !hasExistingFiles}
              className={`h-8 shadow-sm ${
                hasExistingFiles
                  ? "border-purple-200 text-purple-600 hover:bg-purple-50"
                  : "text-gray-400 border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
              }`}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? "Processing..." : "AI Expert Refactor"}
            </Button>

            {hasChanges && (
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 shadow-sm h-8"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
              className="text-gray-500 h-8"
            >
              {isPreview ? <Edit className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {isPreview ? "Edit" : "Preview"}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Last updated: {formatUpdatedAt(note.updatedAt)}
          </span>
          {isProcessing && (
            <span className="text-xs text-indigo-500 animate-pulse font-semibold">
              AI is processing your document...
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <div className="h-full overflow-auto p-8 bg-gray-50/50">
            <div className="max-w-3xl mx-auto prose prose-indigo bg-white p-10 shadow-sm border border-gray-200 rounded-xl min-h-full">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col p-6">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start typing your thoughts or upload a PDF to extract notes..."
              className="flex-1 w-full resize-none border-none p-0 focus-visible:ring-0 font-mono text-base leading-relaxed text-gray-700 placeholder:text-gray-300"
              disabled={isProcessing}
            />
          </div>
        )}
      </div>
    </div>
  );
}
