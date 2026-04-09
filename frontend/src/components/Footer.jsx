import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/15 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-lg font-black text-slate-900">VLX VIT</span>
          <p className="font-sans text-xs uppercase tracking-widest text-slate-500">© 2026 VLX VIT Vellore. Built for Students.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link to="/privacy" className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-primary hover:underline underline-offset-4 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-primary hover:underline underline-offset-4 transition-colors">Terms of Service</Link>
          <Link to="/campus-safety" className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-primary hover:underline underline-offset-4 transition-colors">Campus Safety</Link>
          <Link to="/support" className="font-sans text-xs uppercase tracking-widest text-slate-500 hover:text-primary hover:underline underline-offset-4 transition-colors">Support</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
