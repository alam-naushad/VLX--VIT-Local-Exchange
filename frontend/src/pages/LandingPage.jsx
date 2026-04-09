import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function ListingCard({ product }) {
  const cover = product?.images?.[0];
  return (
    <Link
      to={`/product/${product._id}`}
      className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden card-hover"
    >
      <div className="relative h-44 overflow-hidden bg-surface-container-high">
        {cover ? (
          <img
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
            alt={product.title}
            src={cover}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant">image</span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <p className="text-primary font-extrabold text-sm">₹{product.price}</p>
        </div>
        {product.status && (
          <div className="absolute top-4 right-4 bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">{product.status}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-on-surface text-lg font-extrabold mb-1 line-clamp-1">{product.title}</h3>
        <div className="flex items-center gap-2 text-on-surface-variant mb-3">
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          <span className="text-sm font-semibold">{product.location || 'Campus'}</span>
        </div>
        <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2">{product.description}</p>
      </div>
    </Link>
  );
}

const LandingPage = () => {
  const marketplaceRef = useRef(null);
  const categoriesRef = useRef(null);
  const heroCardRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicStats, setPublicStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [heroTilt, setHeroTilt] = useState({ rx: 0, ry: 0, hx: 50, hy: 50 });
  const [revealCount, setRevealCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/products', { params: { status: 'available', limit: 12 } });
        if (!alive) return;
        setItems(res.data?.data || []);
      } catch (e) {
        if (!alive) return;
        setError(e.response?.data?.message || 'Failed to load marketplace listings');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const loadMeta = async () => {
      try {
        const [statsRes, categoryRes] = await Promise.all([
          api.get('/public/stats'),
          api.get('/products/category-stats'),
        ]);
        if (!alive) return;
        setPublicStats(statsRes.data?.data || null);
        setCategoryStats(categoryRes.data?.data || []);
      } catch {
        if (!alive) return;
        setPublicStats(null);
        setCategoryStats([]);
      }
    };
    loadMeta();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const el = heroCardRef.current;
    if (!el) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let raf = null;
    const maxDeg = 9;

    const updateFromEvent = (clientX, clientY) => {
      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width; // 0..1
      const y = (clientY - rect.top) / rect.height; // 0..1
      const ry = (x - 0.5) * (maxDeg * 2); // left/right
      const rx = -((y - 0.5) * (maxDeg * 2)); // up/down
      setHeroTilt({
        rx: Math.max(-maxDeg, Math.min(maxDeg, rx)),
        ry: Math.max(-maxDeg, Math.min(maxDeg, ry)),
        hx: Math.max(0, Math.min(100, x * 100)),
        hy: Math.max(0, Math.min(100, y * 100)),
      });
    };

    const onMove = (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => updateFromEvent(e.clientX, e.clientY));
    };
    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setHeroTilt({ rx: 0, ry: 0, hx: 50, hy: 50 }));
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const words = ['Your', 'Campus.', 'Your', 'Marketplace.'];

    if (reduceMotion) {
      setRevealCount(words.length);
      return;
    }

    setRevealCount(0);
    let cancelled = false;
    let i = 0;

    const tick = () => {
      if (cancelled) return;
      i += 1;
      setRevealCount(i);
      if (i < words.length) {
        setTimeout(tick, 220); // slower, word-by-word
      }
    };

    const start = setTimeout(tick, 320);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, []);

  const handleBrowseMarketplace = () => {
    marketplaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollCategories = (dir) => {
    const el = categoriesRef.current;
    if (!el) return;
    const amount = Math.max(320, Math.floor(el.clientWidth * 0.95));
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  const categoryConfig = [
    { key: 'electronics', label: 'Electronics', icon: 'devices' },
    { key: 'books', label: 'Books & Notes', icon: 'menu_book' },
    { key: 'cycles', label: 'Cycles', icon: 'pedal_bike' },
    { key: 'club_merchandise', label: 'Club Merchandise', icon: 'storefront' },
    { key: 'gym_equipments', label: 'Gym Equipments', icon: 'fitness_center' },
    { key: 'clothing', label: 'Clothing', icon: 'checkroom' },
    { key: 'miscellaneous', label: 'Miscellaneous', icon: 'category' },
  ];

  const categoryMap = new Map(categoryStats.map((c) => [c.category, c]));

  return (
    <div className="w-full">
      <main>
        <section className="relative px-6 lg:px-20 py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 z-[-1] opacity-40">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]"></div>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
            <div className="flex-1 text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                VIT Vellore Exclusive
              </div>
              <h1 className="text-on-background text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
                <span
                  className={`inline-block transition-all duration-500 ease-out ${
                    revealCount >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                >
                  Your
                </span>{' '}
                <span
                  className={`inline-block transition-all duration-500 ease-out ${
                    revealCount >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                >
                  Campus.
                </span>
                <br />
                <span
                  className={`inline-block transition-all duration-500 ease-out ${
                    revealCount >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                >
                  Your
                </span>{' '}
                <span
                  className={`inline-block text-primary transition-all duration-500 ease-out ${
                    revealCount >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                >
                  Marketplace.
                </span>
              </h1>
              <p className="text-on-surface-variant text-lg lg:text-xl max-w-xl leading-relaxed">
                A safe, exclusive ecosystem for buying and selling within VIT Vellore. Join the community of students trading on campus.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleBrowseMarketplace}
                  className="primary-gradient flex items-center justify-center rounded-xl h-14 px-8 text-white text-base font-bold tracking-wide shadow-xl shadow-primary/30"
                >
                  Browse Marketplace
                </button>
                <Link
                  className="flex items-center justify-center rounded-xl h-14 px-8 bg-surface-container-low border border-outline-variant/30 text-on-surface text-base font-bold tracking-wide hover:bg-surface-container-high transition-colors"
                  to="/create-listing"
                >
                  Start Selling
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-8">
                <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant/20 px-4 py-3 rounded-2xl">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">verified</span>
                  </div>
                  <div>
                    <p className="text-on-surface text-sm font-extrabold leading-tight">
                      {typeof publicStats?.verifiedUsers === 'number' ? publicStats.verifiedUsers.toLocaleString() : '—'} verified students
                    </p>
                    <p className="text-on-surface-variant text-xs font-semibold leading-tight">
                      {typeof publicStats?.availableListings === 'number'
                        ? `${publicStats.availableListings.toLocaleString()} available listings right now`
                        : 'Live counts update automatically'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 relative">
              <div
                ref={heroCardRef}
                className="relative w-full aspect-square rounded-[2rem] overflow-hidden shadow-2xl rotate-2 card-hover will-change-transform"
                style={{
                  transform: `perspective(1100px) rotate(${2}deg) rotateX(${heroTilt.rx}deg) rotateY(${heroTilt.ry}deg) translateZ(0)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <img
                  alt="Campus marketplace"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG1h3gD6iwyGavxTqrr96q1Kvf4cJQRQJoEGNfpm6iiKfadJIwY4XndJo4vll1vcQn223cjI3RjkU-5rjbBf-lE2NHxxqIDUcu5S9NIutAJFfP6HuZmidnf3cM-nk7Jk0x84RWYQH5lmPEiDXg-B7ea8R3aGwH-DAjcF3v8NFbRY8ER70tsd6NRvnL5JJxgHMT7SapFJbctikwSy3SaJi2fdYDuNDavGuWhvRjBcv4D4L7cQn5RN847tLm3UFLdCDFj2J5SoXS5Q"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(600px circle at ${heroTilt.hx}% ${heroTilt.hy}%, rgba(255,255,255,0.22), transparent 50%)`,
                    mixBlendMode: 'soft-light',
                  }}
                />
                <div className="absolute bottom-6 left-6 right-6 glass-nav p-4 rounded-2xl border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-primary uppercase">CAMPUS SAFE</p>
                      <p className="text-lg font-bold text-white">Verified Student User</p>
                    </div>
                    <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-2xl font-bold">verified</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -left-6 size-32 bg-secondary/20 rounded-3xl blur-2xl z-[-1]"></div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-20 px-6 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-on-background text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">Why Choose VLX?</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">
                Designed specifically for the VIT community with safety and convenience in mind.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 card-hover transition-all duration-300">
                <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">mail</span>
                </div>
                <h3 className="text-on-surface text-xl font-bold mb-3">VIT Email Only</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Strict verification ensures only verified VIT students can access the platform, keeping the community secure.
                </p>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 card-hover transition-all duration-300">
                <div className="size-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">handshake</span>
                </div>
                <h3 className="text-on-surface text-xl font-bold mb-3">Hand-to-Hand Meetups</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Skip the shipping. Trade safely at familiar campus spots like Foodys, the Central Library, or Gate 1.
                </p>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 card-hover transition-all duration-300">
                <div className="size-14 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">payments</span>
                </div>
                <h3 className="text-on-surface text-xl font-bold mb-3">Zero Commission</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  We don't take a cut. Keep 100% of your earnings. No hidden fees, no middleman, just student-to-student.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-on-background text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">Featured Categories</h2>
                <p className="text-on-surface-variant">Find exactly what you need for your campus life.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="hidden lg:flex items-center justify-center size-11 rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface"
                  onClick={() => scrollCategories(-1)}
                  aria-label="Scroll categories left"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button
                  type="button"
                  className="hidden lg:flex items-center justify-center size-11 rounded-xl border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface"
                  onClick={() => scrollCategories(1)}
                  aria-label="Scroll categories right"
                >
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
            <div
              ref={categoriesRef}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-6 px-6 lg:mx-0 lg:px-0"
            >
              {categoryConfig.map((cfg) => {
                const stat = categoryMap.get(cfg.key);
                const cover = stat?.coverImage || null;
                const count = typeof stat?.count === 'number' ? stat.count : 0;
                return (
                  <div
                    key={cfg.key}
                    className="group relative h-80 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg shadow-primary/5 card-hover snap-start shrink-0 w-[85%] sm:w-[48%] lg:w-[calc((100%-18px*3)/4)]"
                    role="button"
                    tabIndex={0}
                    onClick={handleBrowseMarketplace}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleBrowseMarketplace();
                    }}
                  >
                    {cover ? (
                      <img
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={`${cfg.label} category`}
                        src={cover}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/25 via-secondary/15 to-tertiary/15 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/90 text-7xl">{cfg.icon}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8">
                      <h3 className="text-white text-2xl font-bold mb-1">{cfg.label}</h3>
                      <p className="text-white/80 font-medium">{count.toLocaleString()} active listings</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Marketplace listings (real data) */}
        <section ref={marketplaceRef} id="marketplace" className="py-20 px-6 lg:px-20 scroll-mt-28">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-on-background text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">Marketplace</h2>
                <p className="text-on-surface-variant">Live listings from verified students.</p>
              </div>
              <Link to="/" className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
                View all <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-error-container/30 text-error rounded-2xl font-bold border border-error/10">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-surface-container-low p-12 rounded-[2rem] border border-outline-variant/20 text-center">
                <h3 className="text-on-background text-2xl font-extrabold mb-2">No listings yet</h3>
                <p className="text-on-surface-variant mb-6">Be the first to post an item for your campus community.</p>
                <Link
                  to="/create-listing"
                  className="primary-gradient inline-flex items-center justify-center rounded-xl h-12 px-8 text-white text-sm font-bold tracking-wide shadow-xl shadow-primary/30"
                >
                  Post your first listing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((p) => (
                  <ListingCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-20 px-6 lg:px-20 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-on-background text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">How It Works</h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">Start trading in three simple steps. Designed for the fast-paced VIT life.</p>
            </div>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-0"></div>
              <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-xs group">
                <div className="size-20 rounded-full primary-gradient flex items-center justify-center text-white shadow-xl shadow-primary/30 text-3xl font-extrabold transition-transform group-hover:scale-110">1</div>
                <h3 className="text-on-surface text-xl font-bold">List</h3>
                <p className="text-on-surface-variant text-sm">Snap a photo and post your item in seconds. It's free and instant.</p>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-xs group">
                <div className="size-20 rounded-full primary-gradient flex items-center justify-center text-white shadow-xl shadow-primary/30 text-3xl font-extrabold transition-transform group-hover:scale-110">2</div>
                <h3 className="text-on-surface text-xl font-bold">Chat</h3>
                <p className="text-on-surface-variant text-sm">Negotiate price and details directly with buyers via our secure chat.</p>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-xs group">
                <div className="size-20 rounded-full primary-gradient flex items-center justify-center text-white shadow-xl shadow-primary/30 text-3xl font-extrabold transition-transform group-hover:scale-110">3</div>
                <h3 className="text-on-surface text-xl font-bold">Meetup</h3>
                <p className="text-on-surface-variant text-sm">Meet at a campus spot, verify the item, and complete the exchange.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-20">
          <div className="max-w-7xl mx-auto bg-primary-container rounded-[3rem] p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-24 -mb-24"></div>
            <div className="flex-1 space-y-6">
              <h2 className="text-white text-3xl lg:text-4xl font-extrabold tracking-tight">Campus Safety First</h2>
              <p className="text-primary-fixed leading-relaxed text-lg">
                Safety is our top priority. We recommend meeting in well-lit, public areas within the campus where there's always activity.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                  <span className="material-symbols-outlined text-white">location_on</span>
                  <span className="text-white font-semibold">Central Library</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                  <span className="material-symbols-outlined text-white">restaurant</span>
                  <span className="text-white font-semibold">Foodys / Canteen</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                  <span className="material-symbols-outlined text-white">meeting_room</span>
                  <span className="text-white font-semibold">Main Gate Plaza</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors cursor-default">
                  <span className="material-symbols-outlined text-white">visibility</span>
                  <span className="text-white font-semibold">Daylight Hours</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="rounded-3xl overflow-hidden border-8 border-white/10 shadow-2xl card-hover">
                <img className="w-full h-full object-cover" alt="Library" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf0LK_u7N4QIKAKybNbMdO_rGqjEFIivwZ-oftv38p3QsZvSXU9vhSTIhL6pTyGR7mWKrM3csCnbVRfTzs5A9ORQqHEkqSx-hdF2lPppQsONup8y6-XJDMzhoVoPGvgdq0rHYjEtIwRlxVgPvdbneGKNyRZ8ZOR4oZ7tIP7b0HbjQcjm8w45wPVzLlNWqPiDOQ0dLq6i1Lnb6N87C-nb1rrNPDweLIZxu51D7Qsf3ylK0Lu_pchelb8Va4EEo33RY4Zb2SucPAHA" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 lg:px-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-on-background text-4xl lg:text-6xl font-extrabold tracking-tight">
              Ready to join {typeof publicStats?.verifiedUsers === 'number' ? publicStats.verifiedUsers.toLocaleString() : 'verified'} students?
            </h2>
            <p className="text-on-surface-variant text-lg lg:text-xl">
              Join the exclusive student marketplace. Buy smarter, sell faster, and stay safe within the campus walls.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link className="primary-gradient w-full sm:w-auto flex items-center justify-center rounded-2xl h-16 px-10 text-white text-lg font-bold tracking-wide shadow-2xl shadow-primary/40" to="/register">
                Create Your Account
              </Link>
              <Link className="w-full sm:w-auto flex items-center justify-center rounded-2xl h-16 px-10 bg-surface-container-high text-on-surface text-lg font-bold tracking-wide hover:bg-surface-container-highest transition-colors" to="/learn-more">
                Learn More
              </Link>
            </div>
            <p className="text-on-surface-variant text-sm font-medium">Use your @vitstudent.ac.in email to sign up.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;

