import React, { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

function normalizeWhatsapp(input) {
  if (!input) return '';
  const trimmed = String(input).trim();
  if (!trimmed) return '';
  // keep + and digits only
  const cleaned = trimmed.replace(/[^\d+]/g, '');
  return cleaned;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const initial = useMemo(() => {
    return {
      name: user?.name || '',
      year: user?.year || '',
      whatsappNumber: user?.whatsappNumber || '',
    };
  }, [user]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const onChange = (e) => {
    setSaved(false);
    setError('');
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        year: form.year.trim(),
        whatsappNumber: normalizeWhatsapp(form.whatsappNumber),
      };
      const res = await api.put('/auth/me', payload);
      setUser(res.data.data);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="pt-28 pb-20 px-6 max-w-3xl mx-auto w-full">
      <div className="flex items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-primary font-extrabold uppercase tracking-[0.2em] text-xs mb-2">Profile</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Your details</h1>
          <p className="text-on-surface-variant font-semibold mt-2">
            Add your WhatsApp number so buyers can contact you faster.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="bg-surface-container text-primary px-5 py-2.5 rounded-xl font-extrabold hover:bg-primary hover:text-white transition-colors"
        >
          Back
        </button>
      </div>

      <form onSubmit={onSubmit} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-xl shadow-on-surface/5 p-6 md:p-8">
        {error && (
          <div className="mb-5 p-4 bg-error-container/30 text-error rounded-xl font-bold border border-error/10">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-5 p-4 bg-tertiary-fixed/30 text-tertiary rounded-xl font-bold border border-tertiary/10">
            Saved.
          </div>
        )}

        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant ml-1">Full name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full h-12 rounded-xl bg-surface-container-high border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-semibold px-4"
              placeholder="Your name"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant ml-1">Year (optional)</label>
            <input
              name="year"
              value={form.year}
              onChange={onChange}
              className="w-full h-12 rounded-xl bg-surface-container-high border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-semibold px-4"
              placeholder="e.g., 1st year • 2025 • 21BCE"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant ml-1">
              WhatsApp number (recommended)
            </label>
            <input
              name="whatsappNumber"
              value={form.whatsappNumber}
              onChange={onChange}
              className="w-full h-12 rounded-xl bg-surface-container-high border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-semibold px-4"
              placeholder="+91XXXXXXXXXX"
            />
            <p className="text-[11px] font-semibold text-on-surface-variant">
              Use international format (recommended). Example: <span className="font-extrabold">+919876543210</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white hover:shadow-lg hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            {saving ? 'Saving…' : 'Save profile'}
            <span className="material-symbols-outlined text-xl">save</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

