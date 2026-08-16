import React, { useState, useEffect } from 'react';
import { Mail, Sparkles, Send, Clock, ShieldCheck } from 'lucide-react';
import { EmailPreference, EmailLog, TestEmailSendResponse } from '../../types';
import { api } from '../../api/client';

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [prefs, setPrefs] = useState<EmailPreference | null>(null);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [sendingType, setSendingType] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestEmailSendResponse | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [customRecipient, setCustomRecipient] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [prefData, logData] = await Promise.all([
        api.getEmailPreferences(userId),
        api.getEmailLogs(userId),
      ]);
      setPrefs(prefData);
      setLogs(logData);
    } catch (err) {
      console.error('Failed to load email settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, userId]);

  const handleToggle = async (key: keyof EmailPreference, val: any) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: val };
    setPrefs(updated);
    setSaving(true);
    try {
      await api.updateEmailPreferences(userId, { [key]: val });
    } catch (err) {
      console.error('Failed to update email pref:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async (type: string) => {
    setSendingType(type);
    setTestResult(null);
    try {
      const res = await api.testSendEmail(userId, type, customRecipient || undefined);
      setTestResult(res);
      setShowPreviewModal(true);
      // Reload logs
      const updatedLogs = await api.getEmailLogs(userId);
      setLogs(updatedLogs);
    } catch (err) {
      console.error('Failed to test send email:', err);
    } finally {
      setSendingType(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl text-white relative space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Email Delivery & Reports Engine</h3>
              <p className="text-xs text-slate-400">Scheduled outbound reports delivered even when the app is closed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Email Delivery Preferences */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Scheduled Outbound Dispatches
              </label>
              {saving && <span className="text-[11px] text-purple-400 font-mono animate-pulse">Saving...</span>}
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading delivery preferences...</div>
            ) : prefs ? (
              <div className="space-y-2.5">
                {/* Weekly Report Toggle */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>🧬 Weekly "State of You" Coach Report</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        HIGH RETENTION
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Dispatched Sundays at 20:00. Styled like the Cross-Domain Synthesizer card with friction analysis.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.weekly_report}
                    onChange={(e) => handleToggle('weekly_report', e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                {/* Daily Digest Toggle */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">☀️ Daily 24h Flow Digest</div>
                    <p className="text-[11px] text-slate-400">
                      Dispatched every morning at wake time. Outlines today's scheduled blocks & cognitive peak windows.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.daily_digest}
                    onChange={(e) => handleToggle('daily_digest', e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                {/* Deadline Alerts */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">📅 Exam & Opportunity Deadlines</div>
                    <p className="text-[11px] text-slate-400">
                      Critical registration deadlines, admit cards, and application cut-offs.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.deadline_alerts}
                    onChange={(e) => handleToggle('deadline_alerts', e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                {/* Send Time Picker */}
                <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Preferred Morning Digest Time:</span>
                  </div>
                  <select
                    value={prefs.send_time}
                    onChange={(e) => handleToggle('send_time', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white font-mono"
                  >
                    <option value="06:00">06:00 AM</option>
                    <option value="06:30">06:30 AM</option>
                    <option value="07:00">07:00 AM</option>
                    <option value="08:00">08:00 AM</option>
                  </select>
                </div>
              </div>
            ) : null}
          </div>

          {/* Test Send & Live HTML Preview Actions */}
          <div className="p-4 bg-gradient-to-br from-purple-950/30 via-slate-950 to-indigo-950/30 border border-purple-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Instant Test Send & HTML Preview</span>
              </label>
              <span className="text-[11px] text-slate-400">Transactional Delivery Engine</span>
            </div>

            {/* Custom Recipient input */}
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Optional test recipient email (e.g. you@gmail.com)"
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                disabled={!!sendingType}
                onClick={() => handleTestSend('weekly_report')}
                className="py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>{sendingType === 'weekly_report' ? 'Dispatching...' : '🧬 Weekly Report'}</span>
              </button>

              <button
                disabled={!!sendingType}
                onClick={() => handleTestSend('daily_digest')}
                className="py-2 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>{sendingType === 'daily_digest' ? 'Dispatching...' : '☀️ Daily Digest'}</span>
              </button>

              <button
                disabled={!!sendingType}
                onClick={() => handleTestSend('auth_otp')}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{sendingType === 'auth_otp' ? 'Dispatching...' : '🔐 Auth OTP'}</span>
              </button>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Recent Dispatches Audit Trail
            </label>

            {logs.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                No emails dispatched yet. Click above to send a test preview!
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {logs.slice(0, 5).map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      setTestResult({
                        status: l.status,
                        message: `Dispatched to ${l.recipient}`,
                        email_type: l.email_type,
                        recipient: l.recipient,
                        subject: l.subject,
                        html_preview: l.html_body,
                        sent_at: l.created_at,
                      });
                      setShowPreviewModal(true);
                    }}
                    className="p-2.5 bg-slate-950/60 hover:bg-slate-800/40 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-slate-200 truncate">{l.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                      <span className="text-emerald-400 font-bold uppercase">{l.status}</span>
                      <span className="text-slate-500">👁️ View</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>

      {/* Live HTML Email Preview Modal */}
      {showPreviewModal && testResult && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl max-w-2xl w-full p-5 shadow-2xl text-white space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    Dispatched ({testResult.email_type})
                  </span>
                  <span className="text-xs text-slate-400 font-mono">To: {testResult.recipient}</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">{testResult.subject}</h4>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-white text-base font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Embedded Live HTML Preview Container */}
            <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-[#030712] p-1">
              <iframe
                title="Email Preview"
                srcDoc={testResult.html_preview}
                className="w-full h-[460px] rounded-xl border-0"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
