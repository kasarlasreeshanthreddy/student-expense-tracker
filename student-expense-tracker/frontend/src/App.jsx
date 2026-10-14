import { useEffect, useMemo, useState } from 'react'
import { Wallet, Plus, Pencil, Trash2, Search, IndianRupee, TrendingUp, CalendarDays, ReceiptText, X } from 'lucide-react'

const API = `${(import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')}/api/expenses`
const categories = ['Food', 'Travel', 'Books', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']
const today = () => new Date().toISOString().slice(0, 10)
const blank = () => ({ title: '', amount: '', category: 'Food', expenseDate: today(), notes: '' })
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value || 0))

export default function App() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(blank())
  const [editingId, setEditingId] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadExpenses() {
    try {
      setError('')
      const response = await fetch(API)
      if (!response.ok) throw new Error('Could not load expenses. Is the backend running?')
      setExpenses(await response.json())
    } catch (e) {
      setError(e.message || 'Cannot connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadExpenses() }, [])

  const filtered = useMemo(() => expenses.filter(e =>
    (categoryFilter === 'All' || e.category === categoryFilter) &&
    `${e.title} ${e.category} ${e.notes || ''}`.toLowerCase().includes(search.toLowerCase())
  ), [expenses, categoryFilter, search])

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const monthTotal = expenses.filter(e => e.expenseDate?.slice(0, 7) === today().slice(0, 7))
    .reduce((sum, e) => sum + Number(e.amount), 0)
  const average = expenses.length ? total / expenses.length : 0

  function startAdd() {
    setEditingId(null); setForm(blank()); setShowForm(true)
  }
  function startEdit(expense) {
    setEditingId(expense.id)
    setForm({ title: expense.title, amount: String(expense.amount), category: expense.category, expenseDate: expense.expenseDate, notes: expense.notes || '' })
    setShowForm(true)
  }
  async function saveExpense(event) {
    event.preventDefault()
    setError('')
    const payload = { ...form, amount: Number(form.amount) }
    try {
      const response = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const body = await response.text()
        throw new Error(body.includes('Amount') ? 'Enter a valid amount greater than ₹0.' : 'Could not save expense. Check the form and backend.')
      }
      setShowForm(false); setForm(blank()); setEditingId(null)
      await loadExpenses()
    } catch (e) { setError(e.message || 'Could not save expense.') }
  }
  async function deleteExpense(id) {
    if (!window.confirm('Delete this expense?')) return
    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete expense.')
      await loadExpenses()
    } catch (e) { setError(e.message) }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Wallet size={23}/></div><div><strong>SpendWise</strong><span>STUDENT EDITION</span></div></div>
      <div className="side-label">WORKSPACE</div>
      <div className="nav-item active"><ReceiptText size={18}/> Expenses</div>
      <div className="sidebar-tip"><div className="tip-icon"><TrendingUp size={18}/></div><strong>Small steps add up.</strong><p>Track every expense to understand where your money goes.</p></div>
      <div className="sidebar-footer"><span className="status-dot"></span> Local database connected through API</div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div><p className="eyebrow">YOUR PERSONAL FINANCE</p><h1>Expense dashboard</h1><p className="subheading">A clearer view of your student spending.</p></div><button className="primary-btn" onClick={startAdd}><Plus size={18}/> Add expense</button></header>

      {error && <div className="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss"><X size={16}/></button></div>}

      <section className="stats-grid">
        <div className="stat-card"><div className="stat-top"><span>Total expenses</span><div className="stat-icon purple"><IndianRupee size={19}/></div></div><h2>{money(total)}</h2><p>Across {expenses.length} recorded {expenses.length === 1 ? 'expense' : 'expenses'}</p></div>
        <div className="stat-card"><div className="stat-top"><span>This month</span><div className="stat-icon green"><CalendarDays size={19}/></div></div><h2>{money(monthTotal)}</h2><p>Spending during the current month</p></div>
        <div className="stat-card"><div className="stat-top"><span>Average expense</span><div className="stat-icon orange"><TrendingUp size={19}/></div></div><h2>{money(average)}</h2><p>Average amount per record</p></div>
      </section>

      <section className="panel">
        <div className="panel-header"><div><h3>Recent expenses</h3><p>Review and manage your transactions.</p></div><span className="count-pill">{filtered.length} records</span></div>
        <div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..." /></div><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} aria-label="Filter by category"><option>All</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="table-wrap"><table><thead><tr><th>EXPENSE</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th className="actions-head">ACTIONS</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="empty-state">Loading expenses...</td></tr> :
             filtered.length === 0 ? <tr><td colSpan="5" className="empty-state"><div className="empty-icon"><ReceiptText size={24}/></div><strong>No expenses found</strong><span>Add an expense or change your search filter.</span></td></tr> :
             filtered.map(e => <tr key={e.id}><td><div className="expense-title">{e.title}</div>{e.notes && <div className="expense-note">{e.notes}</div>}</td><td><span className={`category-badge ${e.category.toLowerCase()}`}>{e.category}</span></td><td className="date-cell">{e.expenseDate}</td><td className="amount-cell">{money(e.amount)}</td><td><div className="row-actions"><button className="icon-btn" title="Edit" onClick={() => startEdit(e)}><Pencil size={16}/></button><button className="icon-btn delete" title="Delete" onClick={() => deleteExpense(e.id)}><Trash2 size={16}/></button></div></td></tr>)}
          </tbody></table></div>
        <div className="panel-footer"><span>Data is stored in your local MySQL database.</span><button className="text-btn" onClick={loadExpenses}>Refresh data ↻</button></div>
      </section>
      <footer className="page-footer">SpendWise · Student Expense Tracker <span>Built with React, Spring Boot & MySQL</span></footer>
    </main>

    {showForm && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
      <form className="expense-modal" onSubmit={saveExpense}>
        <div className="modal-heading"><div><p className="eyebrow">{editingId ? 'UPDATE RECORD' : 'NEW RECORD'}</p><h2>{editingId ? 'Edit expense' : 'Add an expense'}</h2></div><button type="button" className="icon-btn" onClick={() => setShowForm(false)}><X size={19}/></button></div>
        <label>Expense title<input required maxLength="100" placeholder="e.g. Lunch at college" value={form.title} onChange={e => setForm({...form, title: e.target.value})}/></label>
        <div className="form-row"><label>Amount (₹)<input required type="number" min="0.01" step="0.01" placeholder="150.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}/></label><label>Category<select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>{categories.map(c => <option key={c}>{c}</option>)}</select></label></div>
        <label>Date<input required type="date" value={form.expenseDate} onChange={e => setForm({...form, expenseDate: e.target.value})}/></label>
        <label>Notes <span className="optional">(optional)</span><textarea maxLength="500" rows="3" placeholder="Add a short note..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}/></label>
        <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-btn" type="submit">{editingId ? 'Save changes' : 'Save expense'}</button></div>
      </form>
    </div>}
  </div>
}
