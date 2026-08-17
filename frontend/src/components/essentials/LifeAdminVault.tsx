import React, { useState } from 'react';
import { FileText, CheckCircle2, Shield, Check, Upload } from 'lucide-react';
import { StudentDocument, StudentRoutine } from '../../types';
import { api } from '../../api/client';
import { DocumentUploadModal } from './DocumentUploadModal';

interface LifeAdminVaultProps {
  documents: StudentDocument[];
  routines: StudentRoutine[];
  userId: number;
  onRefresh: () => void;
}

export const LifeAdminVault: React.FC<LifeAdminVaultProps> = ({
  documents,
  routines,
  userId,
  onRefresh,
}) => {
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  const handleToggleRoutine = async (id: number) => {
    try {
      await api.toggleRoutine(id, userId);
      onRefresh();
    } catch (err) {
      console.error("Toggle routine error:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Document Vault */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">Document Vault & Ingestion</h4>
              <p className="text-[11px] text-slate-400">Admit cards, fee receipts, syllabus sheets</p>
            </div>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload & Extract</span>
          </button>
        </div>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-navy-950 text-slate-400 border border-slate-800">
                    {doc.doc_type}
                  </span>
                  <h5 className="text-xs sm:text-sm font-bold text-white mt-1">{doc.title}</h5>
                </div>

                {doc.days_until_event !== null && (
                  <span
                    className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full shrink-0 ${
                      doc.is_urgent
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {doc.days_until_event}d remaining
                  </span>
                )}
              </div>

              {doc.download_url_or_ref && (
                <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span>{doc.download_url_or_ref}</span>
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Daily Routine Checklist */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Daily Life Essentials</h4>
            <p className="text-[11px] text-slate-400">Hostel, laundry, nutrition & logistics</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden shadow-md">
          {routines.map((routine) => (
            <div
              key={routine.id}
              onClick={() => handleToggleRoutine(routine.id)}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                    routine.is_completed_today
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : 'border-slate-700'
                  }`}
                >
                  {routine.is_completed_today && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span
                    className={`text-xs font-semibold block transition-all ${
                      routine.is_completed_today ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {routine.item_title}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {routine.category} • {routine.frequency}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inbound Document & Receipt Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        userId={userId}
        onIngested={() => onRefresh()}
      />
    </div>
  );
};
