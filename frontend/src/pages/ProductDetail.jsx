import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Avatar from '../components/Avatar';

function toWaMeLink(rawNumber, message) {
  if (!rawNumber) return '';
  const cleaned = String(rawNumber).trim().replace(/[^\d]/g, '');
  if (!cleaned) return '';
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${cleaned}${text}`;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (error) {
        console.error("Error fetching product detail:", error);
        // Could navigate to a 404 page here
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-on-surface-variant mb-8">This listing may have been removed or sold.</p>
        <button onClick={() => navigate(-1)} className="bg-primary text-white px-6 py-2 rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  const isOwner = user && user._id === (product.sellerId?._id || product.sellerId);
  const sellerWhatsapp = product?.sellerId?.whatsappNumber;
  const waLink = toWaMeLink(
    sellerWhatsapp,
    `Hi! I'm interested in your VLX listing: "${product.title}" (₹${product.price}). Is it still available?`
  );

  const handleMarkSold = async () => {
    setActionError('');
    setActionLoading(true);
    try {
      const res = await api.put(`/products/${product._id}`, { status: 'sold' });
      setProduct(res.data.data);
    } catch (e) {
      setActionError(e.response?.data?.message || 'Failed to mark as sold');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async () => {
    const reason = window.prompt('Report this listing. What is the issue?');
    if (!reason) return;
    setActionError('');
    setActionLoading(true);
    try {
      await api.post('/reports', { productId: product._id, reason });
      setActionError('Report submitted. Thanks for helping keep VLX safe.');
    } catch (e) {
      setActionError(e.response?.data?.message || 'Failed to submit report');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-24 px-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8 font-bold">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="hover:text-primary transition-colors cursor-pointer">{product.category}</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="w-full aspect-square md:aspect-[4/3] bg-surface-container-high rounded-[2rem] overflow-hidden border border-outline-variant/10 shadow-sm relative">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[activeImage]} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-outline-variant">image</span>
              </div>
            )}
          </div>
          
          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-start ${
                    activeImage === idx ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/50'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details & Seller Info */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Header Info */}
          <div className="mb-8">
            <div className="flex justify-between items-start gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{product.title}</h1>
              <button className="w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center flex-shrink-0 hover:bg-surface-container-low transition-colors shadow-sm">
                <span className="material-symbols-outlined text-on-surface-variant">favorite</span>
              </button>
            </div>
            <div className="text-4xl font-black text-primary mb-6">₹{product.price}</div>
            
            {/* Quick Meta Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-on-surface-variant">
              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/10">
                <span className="material-symbols-outlined text-[18px]">sell</span>
                {product.condition}
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/10">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {product.location}
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/10">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                {new Date(product.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <hr className="border-outline-variant/20 mb-8" />

          {/* Description Block */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <div className="text-on-surface-variant leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {product.tags.map((tag, idx) => (
                <span key={idx} className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold border border-secondary/20">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Seller Profile Card */}
          <div className="mt-auto bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">Seller Information</h2>
            
            <div className="flex items-center gap-5 mb-8 relative z-10">
              <Avatar
                src={product.sellerId?.profileImage}
                name={product.sellerId?.name}
                className="w-16 h-16 rounded-2xl bg-surface-container-high border-2 border-white shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{product.sellerId?.name || 'Unknown User'}</h3>
                  <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <p className="text-sm font-medium text-on-surface-variant">{product.sellerId?.college || 'VIT Vellore'}</p>
              </div>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-error-container/30 text-error text-sm rounded-xl font-bold border border-error/10 relative z-10">
                {actionError}
              </div>
            )}

            {isOwner ? (
              <div className="space-y-3 relative z-10">
                <Link
                  to="/dashboard"
                  className="w-full bg-surface-container text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">dashboard</span>
                  Back to Dashboard
                </Link>
                {product.status !== 'sold' ? (
                  <button
                    onClick={handleMarkSold}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-br from-secondary to-primary-container text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/15 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100"
                  >
                    <span className="material-symbols-outlined text-[20px]">task_alt</span>
                    {actionLoading ? 'Marking…' : 'Mark as Sold'}
                  </button>
                ) : (
                  <div className="w-full bg-surface-container-high text-on-surface-variant font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-outline-variant/15">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Already Sold
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 relative z-10">
                {waLink ? (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      chat
                    </span>
                    WhatsApp Seller
                  </a>
                ) : (
                  <div className="w-full bg-surface-container-high text-on-surface-variant font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-outline-variant/15">
                    <span className="material-symbols-outlined text-[20px]">info</span>
                    Seller hasn’t added WhatsApp yet
                  </div>
                )}

                <p className="text-xs text-center text-on-surface-variant font-medium">
                  Meet in public campus areas and verify payments before handover.
                </p>
                <button
                  onClick={handleReport}
                  disabled={actionLoading}
                  className="text-xs font-extrabold uppercase tracking-widest text-outline hover:text-error transition-colors"
                >
                  Report this listing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
