import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const TABS = [
  { id: 'reports', label: 'Reports' },
  { id: 'products', label: 'Listings' },
  { id: 'users', label: 'Users' },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [tab, setTab] = useState('reports');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) navigate('/dashboard', { replace: true });
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    let alive = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [u, p, r] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/products'),
          api.get('/admin/reports'),
        ]);
        if (!alive) return;
        setUsers(u.data.data || []);
        setProducts(p.data.data || []);
        setReports(r.data.data || []);
      } catch (e) {
        if (!alive) return;
        setError(e.response?.data?.message || 'Failed to load admin data');
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [isAdmin]);

  const toggleBan = async (u) => {
    setError('');
    try {
      const res = await api.put(`/admin/users/${u._id}/ban`, { banned: !u.isBanned });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? res.data.data : x)));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update user');
    }
  };

  const deleteListing = async (p) => {
    setError('');
    const ok = window.confirm(`Delete listing "${p.title}"?`);
    if (!ok) return;
    try {
      await api.delete(`/admin/products/${p._id}`);
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete listing');
    }
  };

  const updateReport = async (r, nextStatus) => {
    setError('');
    try {
      const res = await api.put(`/admin/reports/${r._id}`, { status: nextStatus });
      setReports((prev) => prev.map((x) => (x._id === r._id ? res.data.data : x)));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update report');
    }
  };

  if (!user) return null;
  if (!isAdmin) return null;

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-secondary font-extrabold uppercase tracking-[0.2em] text-xs mb-2">Admin</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Moderation dashboard</h1>
          <p className="text-on-surface-variant font-semibold mt-2">Review reports, remove listings, and ban bad actors.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/"
            className="bg-surface-container text-primary px-5 py-2.5 rounded-xl font-extrabold hover:bg-primary hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className="bg-surface-container text-primary px-5 py-2.5 rounded-xl font-extrabold hover:bg-primary hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest border transition-colors ${
              tab === t.id
                ? 'bg-primary text-white border-primary'
                : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container/30 text-error rounded-xl font-bold border border-error/10">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
        </div>
      ) : tab === 'reports' ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Reports</h2>
            <div className="text-sm font-bold text-on-surface-variant">{reports.length} total</div>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {reports.length === 0 ? (
              <div className="p-10 text-center text-on-surface-variant font-semibold">No reports yet.</div>
            ) : (
              reports.map((r) => (
                <div key={r._id} className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-outline-variant">
                        {r.status}
                      </span>
                      <span className="text-xs font-bold text-on-surface-variant">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="font-extrabold truncate">
                      {r.productId?.title || 'Unknown product'}{' '}
                      <span className="text-primary">₹{r.productId?.price}</span>
                    </div>
                    <div className="text-sm text-on-surface-variant font-semibold mt-1">{r.reason}</div>
                    <div className="text-xs text-on-surface-variant font-bold mt-2">
                      Reporter: {r.reporterId?.name} ({r.reporterId?.email})
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={r.productId?._id ? `/product/${r.productId._id}` : '/'}
                      className="px-4 py-2 rounded-xl bg-surface-container text-primary font-extrabold hover:bg-primary hover:text-white transition-colors"
                    >
                      View listing
                    </Link>
                    <button
                      onClick={() => updateReport(r, 'resolved')}
                      className="px-4 py-2 rounded-xl bg-secondary text-white font-extrabold hover:opacity-90 transition-opacity"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => updateReport(r, 'rejected')}
                      className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant font-extrabold hover:opacity-90 transition-opacity"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : tab === 'products' ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Listings</h2>
            <div className="text-sm font-bold text-on-surface-variant">{products.length} total</div>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {products.length === 0 ? (
              <div className="p-10 text-center text-on-surface-variant font-semibold">No listings.</div>
            ) : (
              products.map((p) => (
                <div key={p._id} className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-outline-variant">
                        {p.status}
                      </span>
                      <span className="text-xs font-bold text-on-surface-variant">
                        {new Date(p.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="font-extrabold truncate">
                      {p.title} <span className="text-primary">₹{p.price}</span>
                    </div>
                    <div className="text-xs text-on-surface-variant font-bold mt-2">
                      Seller: {p.sellerId?.name} ({p.sellerId?.email})
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/product/${p._id}`}
                      className="px-4 py-2 rounded-xl bg-surface-container text-primary font-extrabold hover:bg-primary hover:text-white transition-colors"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => deleteListing(p)}
                      className="px-4 py-2 rounded-xl bg-error text-white font-extrabold hover:opacity-90 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Users</h2>
            <div className="text-sm font-bold text-on-surface-variant">{users.length} total</div>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {users.length === 0 ? (
              <div className="p-10 text-center text-on-surface-variant font-semibold">No users.</div>
            ) : (
              users.map((u) => (
                <div key={u._id} className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-outline-variant">
                        {u.role}
                      </span>
                      {u.isBanned && (
                        <span className="text-xs font-extrabold uppercase tracking-widest text-error">
                          banned
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold truncate">{u.name}</div>
                    <div className="text-sm text-on-surface-variant font-semibold truncate">{u.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleBan(u)}
                      className={`px-4 py-2 rounded-xl font-extrabold transition-colors ${
                        u.isBanned
                          ? 'bg-surface-container text-primary hover:bg-primary hover:text-white'
                          : 'bg-error text-white hover:opacity-90'
                      }`}
                    >
                      {u.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

