import React, { useState, useEffect } from 'react';
import { Upload, Check, Sparkles, BookOpen, Receipt, Award } from 'lucide-react';
import { DocumentParseResponse } from '../../types';
import { api } from '../../api/client';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onIngested?: (message: string) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  userId,
  onIngested,
}) => {
  const [docType, setDocType] = useState<string>('auto');
  const [rawText, setRawText] = useState<string>('');
  const [parsing, setParsing] = useState<boolean>(false);
  const [ingesting, setIngesting] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<DocumentParseResponse | null>(null);
  const [templates, setTemplates] = useState<{ admit_card: string; fee_receipt: string; syllabus: string } | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getDocumentSampleTemplates()
        .then(setTemplates)
        .catch((err) => console.error('Failed to load templates:', err));
    }
  }, [isOpen]);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setParsing(true);
    setParseResult(null);
    setSuccessNotice(null);
    try {
      const res = await api.parseDocument(userId, rawText, docType);
      setParseResult(res);
    } catch (err) {
      console.error('Parse error:', err);
    } finally {
      setParsing(false);
    }
  };

  const handleApplyTemplate = (typeKey: 'admit_card' | 'fee_receipt' | 'syllabus') => {
    if (!templates) return;
    setDocType(typeKey);
    setRawText(templates[typeKey]);
  };

  const handleIngest = async () => {
    if (!parseResult) return;
    setIngesting(true);
    try {
      let payload: Record<string, any> = {};
      if (parseResult.doc_type === 'admit_card' && parseResult.admit_card) {
        payload = parseResult.admit_card;
      } else if (parseResult.doc_type === 'fee_receipt' && parseResult.fee_receipt) {
        payload = parseResult.fee_receipt;
      } else if (parseResult.doc_type === 'syllabus' && parseResult.syllabus) {
        payload = parseResult.syllabus;
      }

      const res = await api.ingestDocument(userId, parseResult.doc_type, payload);
      setSuccessNotice(res.message);
      if (onIngested) onIngested(res.message);
      setTimeout(() => {
        onClose();
        setSuccessNotice(null);
        setParseResult(null);
        setRawText('');
      }, 1800);
    } catch (err) {
      console.error('Ingest error:', err);
    } finally {
      setIngesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl text-white relative space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Smart Document & Receipt Capture</h3>
              <p className="text-xs text-slate-400">Extract exam dates, syllabus tasks, and fee expenses automatically</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Success Banner */}
          {successNotice && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-4 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 animate-in zoom-in-95 duration-200">
              <span className="text-lg">✅</span>
              <span>{successNotice}</span>
            </div>
          )}

          {/* Quick Presets / Templates */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              1-Click Sample Templates for Testing:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleApplyTemplate('admit_card')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs transition flex items-center gap-2 group"
              >
                <Award className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-white group-hover:text-purple-300">GATE Admit Card</div>
                  <div className="text-[10px] text-slate-500">Target Date & Center</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate('fee_receipt')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs transition flex items-center gap-2 group"
              >
                <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-white group-hover:text-emerald-300">Fee Receipt</div>
                  <div className="text-[10px] text-slate-500">Auto-log ₹ Expense</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate('syllabus')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs transition flex items-center gap-2 group"
              >
                <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-white group-hover:text-blue-300">Course Syllabus</div>
                  <div className="text-[10px] text-slate-500">Auto-create Tasks</div>
                </div>
              </button>
            </div>
          </div>

          {/* Raw Text / Ingestion Zone */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Document Content / Text:
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Paste OCR or WhatsApp text</span>
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste text from admit cards, fee receipts, or syllabus sheets here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={parsing || !rawText.trim()}
              onClick={handleParse}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-extrabold transition flex items-center gap-1.5 disabled:opacity-50 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{parsing ? 'Extracting Entities...' : 'Run AI Extraction'}</span>
            </button>
          </div>

          {/* Extraction Preview Result */}
          {parseResult && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Detected: {parseResult.doc_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">
                    Confidence: {parseResult.admit_card?.confidence_pct || parseResult.fee_receipt?.confidence_pct || parseResult.syllabus?.confidence_pct || 90}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-medium">{parseResult.summary}</p>

              {/* Admit card detail card */}
              {parseResult.admit_card && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="text-slate-400">Target Exam: <strong className="text-white">{parseResult.admit_card.exam_name}</strong></div>
                  <div className="text-slate-400">Exam Date: <strong className="text-indigo-300 font-mono">{parseResult.admit_card.target_date}</strong></div>
                  <div className="text-slate-400">Registration / Roll: <strong className="text-white font-mono">{parseResult.admit_card.registration_number}</strong></div>
                  <div className="text-slate-400">Center: <strong className="text-white">{parseResult.admit_card.center_city}</strong></div>
                </div>
              )}

              {/* Fee receipt detail card */}
              {parseResult.fee_receipt && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="text-slate-400">Expense Title: <strong className="text-white">{parseResult.fee_receipt.title}</strong></div>
                  <div className="text-slate-400">Amount: <strong className="text-emerald-400 font-mono text-sm">₹{parseResult.fee_receipt.amount.toLocaleString()}</strong></div>
                  <div className="text-slate-400">Category: <strong className="text-white">{parseResult.fee_receipt.category}</strong></div>
                  <div className="text-slate-400">Ref: <strong className="text-slate-300 font-mono">{parseResult.fee_receipt.transaction_id}</strong></div>
                </div>
              )}

              {/* Syllabus detail card */}
              {parseResult.syllabus && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="text-slate-400">Subject: <strong className="text-white">{parseResult.syllabus.subject_name}</strong> ({parseResult.syllabus.total_estimated_hours}h total)</div>
                  <div className="space-y-1">
                    {parseResult.syllabus.modules.map((m, idx) => (
                      <div key={idx} className="p-1.5 bg-slate-950/70 rounded-lg flex items-center justify-between text-[11px]">
                        <span className="text-slate-200">• {m.title}</span>
                        <span className="text-indigo-400 font-mono font-bold">{m.estimated_hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={ingesting}
                  onClick={handleIngest}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{ingesting ? 'Committing...' : 'Confirm & Ingest into Sahay'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
