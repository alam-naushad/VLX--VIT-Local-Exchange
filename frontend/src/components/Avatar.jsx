import React, { useMemo, useState } from 'react';

function getInitials(name) {
  const n = String(name || '').trim();
  if (!n) return '?';
  const parts = n.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return (first + last).toUpperCase() || '?';
}

function isUsableImage(src) {
  if (!src) return false;
  const s = String(src).trim();
  if (!s) return false;
  // Treat the backend default placeholder as "no image"
  if (s === 'default.jpg' || s.endsWith('/default.jpg')) return false;
  return true;
}

const Avatar = ({ src, name, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => getInitials(name), [name]);
  const showImage = isUsableImage(src) && !failed;

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/15 via-secondary/10 to-tertiary/10 ${className}`}
      aria-label={name ? `${name} avatar` : 'User avatar'}
    >
      {showImage ? (
        <img
          alt={name || 'User'}
          className="w-full h-full object-cover"
          src={src}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-primary/80 text-3xl">person</span>
          <span className="text-primary font-extrabold text-sm tracking-wide">{initials}</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;

