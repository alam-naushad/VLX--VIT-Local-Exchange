import React, { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showOTP, setShowOTP] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegisterCall = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.endsWith('@vitstudent.ac.in')) {
      setError('Please use your @vitstudent.ac.in email');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      setShowOTP(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    // Auto-backspace
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPVerify = async () => {
    const otp = otpValues.join('');
    if (otp.length < 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify', { email, otp });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setError('');
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 -right-20 w-[32rem] h-[32rem] bg-secondary/10 rounded-full blur-3xl -z-10"></div>
      
      {/* Hero Section */}
      <section className="w-full max-w-7xl px-6 py-12 md:py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold tracking-widest uppercase">
            Official Student Network
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-background leading-[1.1]">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Marketplace</span> for VITians.
          </h1>
          <p className="text-lg text-on-surface-variant max-w-md font-medium leading-relaxed">
            Buy, sell, and trade with verified peers from your campus. Safe, fast, and exclusively for the VIT Vellore community.
          </p>

          {/* Verification Guard Component */}
          <form onSubmit={handleRegisterCall} className="w-full max-w-md p-6 bg-surface-container-lowest rounded-3xl shadow-xl shadow-on-surface/5 border border-outline-variant/10">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-on-surface-variant tracking-wide uppercase">Institutional Verification</label>
              
              {error && !showOTP && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-2 font-medium">
                  {error}
                </div>
              )}

              <div className="relative group">
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 pl-4 pr-12 rounded-xl bg-surface-container-high border-none focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-400 font-medium" 
                  placeholder="Full Name" 
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">person</span>
              </div>

              <div className="relative group">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-4 pr-12 rounded-xl bg-surface-container-high border-none focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-400 font-medium" 
                  placeholder="student.name2024@vitstudent.ac.in" 
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary">verified_user</span>
              </div>

              <div className="relative group">
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-4 pr-12 rounded-xl bg-surface-container-high border-none focus:ring-2 focus:ring-primary transition-all placeholder:text-slate-400 font-medium" 
                  placeholder="Create Password" 
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
              </div>
              
              <div className="flex items-start gap-2 p-3 rounded-lg bg-error-container/30 text-error text-xs font-medium border border-error/10">
                <span className="material-symbols-outlined text-sm">info</span>
                Currently exclusive to VIT Vellore. Use your @vitstudent.ac.in email.
              </div>
              
              <button 
                type="submit"
                disabled={!email || !name || !password || loading}
                className={`w-full h-14 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  email && name && password ? 'bg-gradient-to-r from-primary to-primary-container text-white cursor-pointer hover:shadow-lg hover:scale-[1.02]' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                }`}
              >
                {loading ? 'Sending OTP...' : 'Get Verification Code'}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </div>
            <div className="mt-6 text-center text-sm font-medium text-on-surface-variant">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Login here.</Link>
            </div>
          </form>
        </div>

        {/* Bento Grid Visual Component */}
        <div className="hidden lg:grid grid-cols-2 gap-4 h-[500px]">
          <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between group overflow-hidden relative">
            <img alt="Tech Deals" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ_5WuTb6ER0fAmqurCsigfnDGM57UIylkt_VWkevAufdzX1QSk_6Ow0qzqXTv1qunigfTlYJ6-LsffFC6Xd4wlodOGBPaSh8mmjRldHFp5Rjn1NER4iUJandKEaS0etQHXjVB1Wsu8aCeNWVR4dbqbflHwW6m6gF1liz4lNr0kH-xGWdDD9blZXZiNxkoTGN-AKP9_wvYrmmIFLVrWAP-9pSnW7WGE110pdvpcFrzttS4bNfQqIbdrmdbHdLCLRJrUUliKPZbkQ"/>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-primary mb-2">laptop_mac</span>
              <h3 className="text-xl font-bold">Tech Deals</h3>
            </div>
            <p className="text-xs font-medium text-on-surface-variant relative z-10">Upgraded gadgets from fellow seniors.</p>
          </div>
          <div className="bg-primary rounded-3xl p-6 text-white flex flex-col justify-between items-start">
            <span className="text-4xl font-extrabold">2.4k+</span>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Active Listings</h3>
              <p className="text-xs text-on-primary-container font-medium">Updated 5 minutes ago</p>
            </div>
          </div>
          <div className="col-span-2 bg-secondary/10 border border-secondary/20 rounded-3xl p-8 flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-secondary">Campus Trusted</h3>
              <p className="text-sm text-on-surface-variant font-medium">All users are verified through institutional credentials.</p>
            </div>
            <div className="flex -space-x-4">
              <img alt="User" className="w-12 h-12 rounded-full border-4 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtSfz6oMt3tfKXXmOoww5j5FqsbHKa1CJalFYUSt87rmTgy-boQxdIuj6Vuoa_Cyxi8SPQhWULHw0FQWma_uzuwpAm5xldKNbsKvMevXagjaD1JDWzODsoZeS4lbN0zUOWrnc0NpyMIzEZqmpA0DWnBnBuk0oXVVo7BENuGNOZ81LmyKhbebkveAodc7KYmFh-DzdY7MN0_xBQIJunfHBD5NsRlZonuPky-RhESAlrVvZ5MFQDHMMHs4MSIbJq_q7z74PX7VW-Yw"/>
              <img alt="User" className="w-12 h-12 rounded-full border-4 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLEsDqlo0Y6yt2Wl236h4SmC46VHHA0U-VFE3BAi_ZX0eBd-a61n8_4ShhXh2PODq0PDmMpjB6WXrKPmxERHoP3MqN_zp9pi9kufK9p3DJrkZ6bLdnOzla1GMsSfVGRTjv0jar9gCkiE7CO3gmNerhPVIwMK0QOiyXLzfKRkiZPcOdsPYXGgHcN3JGbgMBhVhswB1kzZK1gCQDqVPCxS70eaYC4TQCu_zsdBB_JuN1uQcfmRtbRsNIzRxxU9pCcQ6Cns7STgwh_Q"/>
              <img alt="User" className="w-12 h-12 rounded-full border-4 border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqq1x8URRFA-DCXUr_rUQMZK28e943Wtl8VnVvUW0tNmBDsqJzrpitKTM0sIQSWqwv1dRMiUvM9U0GEEOnjDPCucsSjjGH5B3WAdNphoMOBMOgGRv-Zpydh5jS-gDBlNYC0QOBMnJ5ZkwHJH4Dxfkmz4VWFCdxOKf7EL-34O7e-btf8n-oiNatKxcXul8oN9uk_6u6nfjJn2Z7CfTgDH0cN7YAwbhbP4t92G1SV4ZfafmrQzg6vfcJK3d_woH01efx17O231cHAg"/>
            </div>
          </div>
        </div>
      </section>

      {/* OTP Overlay */}
      {showOTP && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-on-background/40 backdrop-blur-md">
          <div className="w-full max-w-lg bg-surface/90 glass-nav p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/40 text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
              </div>
              <h2 className="text-3xl font-extrabold text-on-background mb-2">Check your inbox</h2>
              <p className="text-on-surface-variant font-medium">We sent a 6-digit code to <span className="text-primary">{email}</span></p>
            </div>
            
            {error && showOTP && (
              <div className="mb-4 text-error font-medium">{error}</div>
            )}
            
            {/* OTP Input Field */}
            <div className="flex justify-center gap-2 md:gap-3 mb-10">
              {otpValues.map((value, i) => (
                <input 
                  key={i}
                  ref={(el) => otpRefs.current[i] = el}
                  value={value}
                  onChange={(e) => handleOTPChange(i, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(i, e)}
                  maxLength="1" 
                  type="text" 
                  className="w-10 h-14 md:w-16 md:h-20 text-center text-2xl md:text-3xl font-bold rounded-2xl bg-surface-container-high border-none focus:ring-4 focus:ring-primary/20 transition-all text-on-background outline-none" 
                />
              ))}
            </div>
            <div className="space-y-6">
              <button 
                onClick={handleOTPVerify}
                disabled={loading} 
                className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-on-surface-variant">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-primary font-bold hover:underline inline-flex items-center gap-1 disabled:opacity-60"
                >
                  {resending ? 'Resending…' : 'Resend Code'}
                </button>
              </div>
            </div>
            <button onClick={() => {setShowOTP(false); setOtpValues(['','','','','','']); setError('');}} className="mt-8 text-on-surface-variant font-semibold text-sm hover:text-on-background flex items-center justify-center gap-2 mx-auto">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
