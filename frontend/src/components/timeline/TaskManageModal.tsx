import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';

interface TaskItem {
  id: number;
  title: string;
  description?: string;
  estimated_duration_mins: number;
  difficulty: string;
  priority: number;
  status: string;
  subject_name?: string;
  subject_color?: string;
}

interface TaskManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onTasksChanged: () => void;
}

export const TaskManageModal: React.FC<TaskManageModalProps> = ({
  isOpen,
  onClose,
  userId,
  onTasksChanged,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Form State for new/edit
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(90);
  const [difficulty, setDifficulty] = useState('medium');
  const [priority, setPriority] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.getTasks(userId);
      setTasks(res);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTasks();
      resetForm();
    }
  }, [isOpen, userId]);

  const resetForm = () => {
    setTitle('');
    setDuration(90);
    setDifficulty('medium');
    setPriority(1);
    setEditingTask(null);
    setIsAdding(false);
    setError(null);
  };

  const handleStartEdit = (t: TaskItem) => {
    setEditingTask(t);
    setTitle(t.title);
    setDuration(t.estimated_duration_mins);
    setDifficulty(t.difficulty);
    setPriority(t.priority);
    setIsAdding(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, {
          title,
          estimated_duration_mins: Number(duration),
          difficulty,
          priority: Number(priority),
        });
      } else {
        await api.createTask({
          user_id: userId,
          title,
          estimated_duration_mins: Number(duration),
          difficulty,
          priority: Number(priority),
        });
      }
      resetForm();
      loadTasks();
      onTasksChanged();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      loadTasks();
      onTasksChanged();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl text-white relative space-y-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Manage Syllabus Tasks</h3>
              <p className="text-xs text-slate-400">Add, edit, or delete items scheduled into your 24h flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Task Form (Add/Edit) */}
        {isAdding ? (
          <form onSubmit={handleSave} className="p-4 bg-slate-950/80 border border-indigo-500/40 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                {editingTask ? 'Edit Task' : 'Add New Focus Task'}
              </h4>
              <button
                type="button"
                onClick={resetForm}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Operating Systems: Deadlock & Banker's Algorithm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                  <option value={90}>90 mins</option>
                  <option value={120}>120 mins</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value={1}>High (P1)</option>
                  <option value={2}>Medium (P2)</option>
                  <option value={3}>Low (P3)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-bold shadow-md transition"
            >
              {editingTask ? 'Save Changes' : '+ Add to Backlog'}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Syllabus Task</span>
          </button>
        )}

        {/* Task List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 animate-pulse">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No tasks in your backlog yet. Click above to add one!</div>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between gap-3 group transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{t.title}</span>
                    {t.status === 'completed' && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded-full">
                        DONE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t.estimated_duration_mins}m
                    </span>
                    <span className="capitalize">{t.difficulty}</span>
                    <span>P{t.priority}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleStartEdit(t)}
                    className="p-1.5 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-slate-800 transition"
                    title="Edit task"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
