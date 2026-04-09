import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CreateListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: ''
  });
  
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      setError('You can only upload a maximum of 5 images.');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Generate object URLs for previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);

    const updatedPreviews = [...imagePreviews];
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (images.length === 0) {
      setError('Please upload at least one image.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('location', formData.location);
      
      // Append each file with the key 'images'
      images.forEach((image) => {
        data.append('images', image);
      });

      await api.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing. Make sure Cloudinary keys are configured in backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-6 max-w-5xl mx-auto w-full">
      {/* Editorial Header Section */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">New Listing</span>
            <h1 className="text-5xl font-extrabold tracking-tight text-on-background leading-tight">Create your <br/><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">listing.</span></h1>
          </div>
          <div className="hidden md:block w-1/3 pb-2">
            <p className="text-on-surface-variant text-sm leading-relaxed">Join 5,000+ VITians trading books, electronics, and essentials safely within the campus ecosystem.</p>
          </div>
        </div>
      </header>
      
      {/* Listing Wizard Stepper */}
      <div className="mb-10 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
          <span className="text-sm font-semibold text-primary">Media</span>
        </div>
        <div className="h-[1px] w-12 bg-outline-variant/30"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
          <span className="text-sm font-semibold text-primary">Details</span>
        </div>
        <div className="h-[1px] w-12 bg-outline-variant/30"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">3</div>
          <span className="text-sm font-semibold text-primary">Location</span>
        </div>
      </div>
      
      {/* Form Container */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Wizard Steps */}
        <div className="lg:col-span-8 space-y-12">
          
          {error && (
            <div className="p-4 bg-error-container/30 text-error rounded-xl font-bold border border-error/10">
              {error}
            </div>
          )}

          {/* Step 1: Media (Active) */}
          <section className="bg-surface-container-low p-8 rounded-xl ring-1 ring-outline-variant/15">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">image</span>
                Product Media
              </h2>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{images.length} / 5 Images</span>
            </div>
            
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
            />

            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-outline-variant/40 rounded-xl p-12 flex flex-col items-center justify-center bg-surface-container-lowest hover:bg-white transition-colors cursor-pointer group mb-6"
            >
              <div className="w-16 h-16 rounded-full bg-primary-fixed-dim flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
              </div>
              <p className="text-lg font-bold text-on-background">Click to select images</p>
              <p className="text-on-surface-variant text-sm mt-1">Cloudinary secure upload • Max 5MB per file</p>
            </div>

            {/* Thumbnail Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-4">
                {imagePreviews.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-outline-variant/30 group">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          {/* Step 2: Details */}
          <section className="bg-surface-container-low/50 p-8 rounded-xl transition-opacity">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined border-b-2 border-transparent">description</span>
              Listing Details
            </h2>
            <div className="space-y-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Title</label>
                <input 
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-high border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                  placeholder="What are you selling?" 
                  type="text"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Description</label>
                <textarea 
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full bg-surface-container-high border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none" 
                  placeholder="Describe the condition, age, reasons for selling..." 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Category</label>
                  <select 
                    required
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-high border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all appearance-none outline-none"
                  >
                    <option value="" disabled>Select Category</option>
                    <option value="books">Books & Academics</option>
                    <option value="electronics">Electronics</option>
                    <option value="cycles">Cycles & Transport</option>
                    <option value="club_merchandise">Club Merchandise</option>
                    <option value="gym_equipments">Gym Equipments</option>
                    <option value="clothing">Clothing</option>
                    <option value="miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Condition</label>
                  <select 
                    required
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-high border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all appearance-none outline-none"
                  >
                    <option value="" disabled>Select Condition</option>
                    <option value="new">Brand New</option>
                    <option value="like_new">Like New (Barely used)</option>
                    <option value="good">Good (Normal wear)</option>
                    <option value="fair">Fair (Noticeable wear)</option>
                    <option value="poor">Poor (Damaged but working)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Price</label>
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₹</span>
                  <input 
                    required
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-high border-none rounded-xl p-4 pl-8 focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                    placeholder="0.00" 
                    type="number"
                  />
                </div>
              </div>
            </div>
          </section>
          
          {/* Step 3: Location */}
          <section className="bg-surface-container-low/50 p-8 rounded-xl transition-opacity">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined">location_on</span>
              Pickup Point
            </h2>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Select VIT Hostel / Block</label>
              <select 
                required
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-surface-container-high border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
              >
                <option value="" disabled>Choose a meeting spot...</option>
                <option value="MH">Men's Hostel (MH) - A to T Blocks</option>
                <option value="LH">Ladies Hostel (LH) - A to G Blocks</option>
                <option value="Foodys">Foodys / Main Canteen</option>
                <option value="SJT">TT / SJT Academics</option>
                <option value="Main_Gate">Main Gate / Food Street</option>
              </select>
            </div>
          </section>
          
          <div className="flex justify-between items-center pt-6">
            <Link to="/dashboard" className="text-primary font-bold hover:underline">Cancel Draft</Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-br from-primary to-primary-container text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 group hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>Uploading Images...</>
              ) : (
                <>
                  Publish Listing
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Right Side: Guidelines / Info */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-highest/30 p-8 rounded-xl">
            <h3 className="text-lg font-bold mb-4">Seller Safety Tips</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                <p className="text-sm text-on-surface-variant leading-tight">Only meet buyers in <b>well-lit campus areas</b> like hostal entrances or Foodys.</p>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-xl">payments</span>
                <p className="text-sm text-on-surface-variant leading-tight">Verify UPI payments before handing over the item.</p>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-xl">chat_bubble</span>
                <p className="text-sm text-on-surface-variant leading-tight">Keep communication within the VLX app for safety records.</p>
              </li>
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-primary-container h-48 flex items-end p-6">
            <img alt="VIT Campus Illustration" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLnLXKXvCalLkUjwlD5sNT_I_sEF_S9qdoAd9ZxpFVlqxm65AKRdM2ZTQ1wnTIunbRjPd9YlPRKwCdtHtRqDv2rKMAXXlNSe8qXR8SK1pBvyw8uZqEWAfuIrwvqQsZCL7FU9h5gz8j4e5PuPWsI1iJgF1WFi3fANJEedNPc-VoAcqOs5Y9GZRsCa-8wx4TJbiKmAHA7UndicXB05bIJemwhQFXX96Fsv6wTll_RGlzuv96jT852WgAlUfyX2UAGG3cteFFZYA3-Q"/>
            <div>
              <h4 className="text-white font-bold text-lg relative z-10">Selling a Cycle?</h4>
              <p className="text-primary-fixed-dim text-xs relative z-10">Include the block number where it's parked for easier viewing.</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default CreateListing;
