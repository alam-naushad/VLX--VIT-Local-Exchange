import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const res = await api.get('/products/my-listings');
        setProducts(res.data.data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyListings();
    }
  }, [user]);

  if (!user) return null; // Protected route will handle redirect

  const soldCount = products.filter((p) => p.status === 'sold').length;
  const activeCount = products.filter((p) => p.status !== 'sold').length;

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
      {/* Profile Header Section */}
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar
              src={user.profileImage}
              name={user.name}
              className="w-24 md:w-32 h-24 md:h-32 rounded-3xl shadow-xl border-4 border-white"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary p-1.5 rounded-xl shadow-lg border-2 border-surface">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{user.name}</h1>
              <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                Verified
              </span>
            </div>
            <p className="text-on-surface-variant font-medium">{user.email}</p>
            {(user.year || user.college) && (
              <p className="text-xs text-on-surface-variant font-bold mt-1">
                {(user.year ? `${user.year} • ` : '')}{user.college || 'VIT Vellore'}
              </p>
            )}
          </div>
        </div>
        
        {/* Action Hub */}
        <div className="flex gap-3 w-full md:w-auto">
          <Link to="/create-listing" className="flex-1 md:flex-none bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Post New Listing
          </Link>
          <Link to="/profile" className="flex-1 md:flex-none bg-surface-container-lowest border border-outline-variant/20 text-primary px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Profile
          </Link>
        </div>
      </section>

      {/* Stats Bar & Quick Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <div className="md:col-span-3 bg-surface-container-low rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-8 border border-outline-variant/10">
          <div className="text-center md:text-left">
            <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-1">Items Sold</div>
            <div className="text-4xl font-extrabold text-primary">{loading ? '-' : soldCount}</div>
          </div>
          <div className="h-px w-full md:h-12 md:w-px bg-outline-variant/30"></div>
          <div className="text-center md:text-left">
            <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-1">Active Listings</div>
            <div className="text-4xl font-extrabold text-secondary">{loading ? '-' : activeCount}</div>
          </div>
          <div className="h-px w-full md:h-12 md:w-px bg-outline-variant/30"></div>
          <div className="text-center md:text-left">
            <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-1">Avg. Rating</div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="text-4xl font-extrabold text-on-surface">{user.rating ? user.rating.toFixed(1) : 'New'}</div>
              <span className="material-symbols-outlined text-outline-variant" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
          </div>
        </div>
        <div className="bg-secondary-container text-on-secondary-container rounded-3xl p-8 flex flex-col justify-center items-center text-center">
          <span className="material-symbols-outlined text-4xl mb-2">wallet</span>
          <div className="text-xs font-bold uppercase tracking-widest opacity-80">Earnings</div>
          <div className="text-2xl font-bold">₹0</div>
        </div>
      </section>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Active Listings (Bento Large) */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-2xl font-bold">Your Active Listings</h2>
            <Link to="/create-listing" className="text-primary font-extrabold text-sm flex items-center gap-1 hover:underline">
              View All <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </Link>
          </div>
          
          {loading ? (
             <div className="flex items-center justify-center p-12 text-on-surface-variant">
               <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
             </div>
          ) : products.length === 0 ? (
            <div className="bg-surface-container-low rounded-[1.5rem] p-12 text-center border-2 border-dashed border-outline-variant/30 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <span className="material-symbols-outlined text-outline">inventory_2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">No listings yet</h3>
              <p className="text-on-surface-variant mb-6 max-w-sm">You haven't listed any items for sale. Declutter your room and make some cash!</p>
              <Link to="/create-listing" className="bg-primary hover:bg-primary-container text-white px-6 py-2 rounded-xl font-bold transition-colors">Create your first listing</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.filter((p) => p.status !== 'sold').map((product) => (
                <div key={product._id} className="bg-surface-container-lowest p-0 rounded-[1.5rem] overflow-hidden hover:scale-[1.02] transition-transform duration-300 group shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-outline-variant/10 flex flex-col h-full">
                  <div className="h-48 overflow-hidden relative">
                    {product.images && product.images.length > 0 ? (
                      <img alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-surface-container-high" src={product.images[0]} />
                    ) : (
                       <div className="w-full h-full bg-surface-container-high flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                         <span className="material-symbols-outlined text-4xl text-outline-variant">image</span>
                       </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">₹{product.price}</div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{product.title}</h3>
                    </div>
                    <p className="text-on-surface-variant text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">location_on</span>
                        <span className="text-xs font-bold text-on-surface-variant">{product.location}</span>
                      </div>
                      <Link to={`/product/${product._id}`} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">Manage <span className="material-symbols-outlined text-[16px]">chevron_right</span></Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications / Activities (Bento Small/Tall) */}
        <div className="md:col-span-4 space-y-6">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-2xl font-bold">Activity</h2>
          </div>
          <div className="bg-surface-container-low rounded-[1.5rem] p-6 h-[calc(100%-48px)] border border-outline-variant/10">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>waving_hand</span>
                </div>
                <div>
                  <p className="text-sm font-bold leading-snug">Welcome to VLX!</p>
                  <p className="text-xs text-on-surface-variant">Your account verification was successful.</p>
                  <span className="text-[10px] uppercase font-bold text-outline tracking-wider mt-1 block">Recently</span>
                </div>
              </div>
              
              {/* Safety Tip Card */}
              <div className="mt-8 p-5 bg-white shadow-sm rounded-2xl border border-outline-variant/10">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <span className="material-symbols-outlined text-sm">gpp_maybe</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Safety Guideline</span>
                </div>
                <p className="text-xs font-medium text-on-surface-variant leading-relaxed">Always meet potential buyers in public areas like the Central Library or Mess during daylight hours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
