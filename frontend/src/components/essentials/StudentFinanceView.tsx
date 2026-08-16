import { useState } from 'react';
import { Plus } from 'lucide-react';
import { StudentBudget } from '../../types';
import { api } from '../../api/client';

interface StudentFinanceViewProps {
  budget: StudentBudget;
  userId: number;
  onRefresh: () => void;
}

export const StudentFinanceView: React.FC<StudentFinanceViewProps> = ({
  budget,
  userId,
  onRefresh,
}) => {
  const [showLogForm, setShowLogForm] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('food');
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    setLoading(true);
    try {
      await api.logExpense(userId, title, Number(amount), category);
      setTitle('');
      setAmount('');
      setShowLogForm(false);
      onRefresh();
    } catch (err) {
      console.error("Log expense failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const spentPct = Math.min(100, Math.round((budget.spent_so_far / budget.total_allowance) * 100));

  return (
    <div className="space-y-5">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Monthly Allowance
          </span>
          <p className="text-2xl font-black text-white mt-1">₹{budget.total_allowance}</p>
          <div className="mt-3 h-2 bg-navy-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                spentPct > 80 ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            ₹{budget.spent_so_far} spent ({spentPct}%)
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Remaining Balance
          </span>
          <p className="text-2xl font-black text-emerald-400 mt-1">₹{budget.remaining_balance}</p>
          <p className="text-xs text-slate-400 mt-2">Buffer for month-end expenses</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            Safe Daily Spend
          </span>
          <p className="text-2xl font-black text-white mt-1">₹{budget.daily_safe_spend}<span className="text-xs font-normal text-slate-400">/day</span></p>
          <p className="text-xs text-slate-300 mt-2">Spend under this to finish month positive</p>
        </div>
      </div>

      {/* Action Strip & Add Modal/Form */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white">Recent Student Expenses</h4>
        <button
          type="button"
          onClick={() => setShowLogForm(!showLogForm)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Log Expense</span>
        </button>
      </div>

      {showLogForm && (
        <form onSubmit={handleAddExpense} className="bg-navy-950 border border-slate-700 rounded-2xl p-4 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (e.g. Mess bill, Photocopy, Books)"
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (₹)"
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="food">Food & Mess</option>
              <option value="books_academics">Books & Study Materials</option>
              <option value="rent_hostel">Hostel & Rent</option>
              <option value="travel">Travel & Metro</option>
              <option value="entertainment">Social / Refresh</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setShowLogForm(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
            >
              {loading ? 'Logging...' : 'Save UPI Expense'}
            </button>
          </div>
        </form>
      )}

      {/* Expenses Table/List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden shadow-md">
        {budget.recent_expenses.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No expenses logged yet this month.</p>
        ) : (
          budget.recent_expenses.map((exp) => (
            <div key={exp.id} className="p-3.5 sm:px-5 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">{exp.title}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">{exp.category} • {exp.expense_date}</span>
              </div>
              <span className="font-extrabold text-sm text-slate-200 font-mono">
                -₹{exp.amount}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
