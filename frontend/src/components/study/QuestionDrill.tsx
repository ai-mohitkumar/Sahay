import { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import { Question, QuestionAttemptResult, DrillSummary } from '../../types';
import { api } from '../../api/client';
import { AskAIPanel } from './AskAIPanel';

interface QuestionDrillProps {
  userId: number;
  topicName: string;
  topicId: number;
  questions: Question[];
  onFinish: () => void;
}

export const QuestionDrill: React.FC<QuestionDrillProps> = ({
  userId,
  topicName,
  topicId,
  questions,
  onFinish,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [attemptResult, setAttemptResult] = useState<QuestionAttemptResult | null>(null);
  const [timerSecs, setTimerSecs] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [showAITutor, setShowAITutor] = useState<boolean>(false);
  const [drillFinished, setDrillFinished] = useState<boolean>(false);
  const [drillSummary, setDrillSummary] = useState<DrillSummary | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSecs((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.submitQuestionAttempt(userId, currentQ.id, selectedAnswer, timerSecs);
      setAttemptResult(res);
      if (res.is_correct) {
        setCorrectCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Submit attempt failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer('');
      setAttemptResult(null);
      setShowAITutor(false);
    } else {
      // Finish Drill & Generate Post-Mortem
      try {
        const totalCorrect = correctCount + (attemptResult?.is_correct ? 1 : 0);
        const summary = await api.finishPracticeDrill(questions.length, totalCorrect, timerSecs, topicName);
        setDrillSummary(summary);
        setDrillFinished(true);
      } catch (err) {
        setDrillFinished(true);
      }
    }
  };

  const formattedTime = `${Math.floor(timerSecs / 60)}:${(timerSecs % 60).toString().padStart(2, '0')}`;

  if (drillFinished) {
    return (
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Drill Complete: {topicName}</h3>
            <p className="text-xs text-slate-400">Post-Mortem & Mastery Summary</p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-navy-950 p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Accuracy</span>
            <p className="text-2xl font-black text-white mt-1">{drillSummary?.accuracy_pct || 100}%</p>
          </div>
          <div className="bg-navy-950 p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Readiness Boost</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">+{drillSummary?.readiness_gain_pct || 2.4}%</p>
          </div>
          <div className="bg-navy-950 p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Time Spent</span>
            <p className="text-2xl font-black text-indigo-300 mt-1">{drillSummary?.time_spent_mins || 2.5}m</p>
          </div>
        </div>

        {/* AI Debrief */}
        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Post-Mortem Debrief</span>
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed">
            "{drillSummary?.post_mortem_debrief}"
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onFinish}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all"
          >
            Back to Topic Map
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {currentQ.year_tag || 'PYQ Practice'}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white mt-1">{topicName}</h4>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 font-mono text-xs text-slate-300 bg-navy-950 px-2.5 py-1 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formattedTime}</span>
          </div>

          <span className="text-xs font-bold text-slate-400">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
      </div>

      {/* Question Body */}
      <div className="space-y-4">
        <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
          {currentQ.question_text}
        </p>

        {/* Options */}
        {currentQ.options && currentQ.options.length > 0 ? (
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              return (
                <div
                  key={idx}
                  onClick={() => !attemptResult && setSelectedAnswer(opt)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 shadow'
                      : 'bg-navy-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs sm:text-sm text-slate-200 font-medium">{opt}</span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      isSelected ? 'border-indigo-500 bg-indigo-600' : 'border-slate-700'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={selectedAnswer}
              disabled={!!attemptResult}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Enter numerical/short answer..."
              className="w-full bg-navy-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Attempt Result Banner */}
      {attemptResult && (
        <div
          className={`p-4 rounded-2xl border space-y-2 animate-fadeIn ${
            attemptResult.is_correct
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-sm">
              {attemptResult.is_correct ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
              <span>{attemptResult.ai_quick_feedback}</span>
            </div>

            <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-slate-900/80">
              Readiness: {attemptResult.subject_readiness_delta >= 0 ? '+' : ''}{attemptResult.subject_readiness_delta}%
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/60">
            <strong>Explanation:</strong> {attemptResult.explanation}
          </p>
        </div>
      )}

      {/* Action Strip */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setShowAITutor(!showAITutor)}
          className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-500/30 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Socratic AI Doubt Tutor</span>
        </button>

        {!attemptResult ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer || submitting}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Checking...' : 'Submit Answer'}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95"
          >
            <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Drill Debrief'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Socratic Assistant Panel */}
      {showAITutor && (
        <AskAIPanel
          userId={userId}
          questionText={currentQ.question_text}
          topicId={topicId}
          userAttempt={selectedAnswer}
          onClose={() => setShowAITutor(false)}
        />
      )}
    </div>
  );
};
