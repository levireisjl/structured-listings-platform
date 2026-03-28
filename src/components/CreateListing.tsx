import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Profile } from "../types";
import { ChevronLeft, Upload, DollarSign, MapPin, Tag, Info } from "lucide-react";
import { motion } from "motion/react";

interface CreateListingProps {
  user: any;
  profile: Profile | null;
}

export default function CreateListing({ user, profile }: CreateListingProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    revenue_range: "$100k - $500k",
    category: "SaaS",
    images: [] as string[],
    documents: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "listings"), {
        ...formData,
        price: Number(formData.price),
        seller_id: user.uid,
        is_active: true,
        created_at: new Date().toISOString(),
      });
      navigate("/");
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Failed to create listing. Check console for details.");
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back</span>
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create a Listing</h1>
          <p className="text-slate-500">Provide structured details about your business or asset.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Listing Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Profitable B2B SaaS in Fintech"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Description</label>
                <textarea 
                  required
                  placeholder="Describe the opportunity, key metrics, and reason for sale..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[160px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <DollarSign size={16} /> Asking Price
                </label>
                <input 
                  required
                  type="number" 
                  placeholder="50000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <MapPin size={16} /> Location
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Remote, USA, London"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Tag size={16} /> Category
                </label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="SaaS">SaaS</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Service">Service</option>
                  <option value="Real Estate">Real Estate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Info size={16} /> Revenue Range
                </label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={formData.revenue_range}
                  onChange={(e) => setFormData({...formData, revenue_range: e.target.value})}
                >
                  <option value="$0 - $100k">$0 - $100k</option>
                  <option value="$100k - $500k">$100k - $500k</option>
                  <option value="$500k - $1M">$500k - $1M</option>
                  <option value="$1M+">$1M+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Upload size={16} /> Media & Documents
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-2 hover:border-slate-400 transition-colors cursor-pointer">
                  <Upload className="mx-auto text-slate-400" />
                  <div className="text-sm font-bold text-slate-900">Upload Images</div>
                  <div className="text-xs text-slate-400">PNG, JPG up to 10MB</div>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-2 hover:border-slate-400 transition-colors cursor-pointer">
                  <Upload className="mx-auto text-slate-400" />
                  <div className="text-sm font-bold text-slate-900">Upload Documents</div>
                  <div className="text-xs text-slate-400">PDF, DOCX for due diligence</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4 italic">* For this MVP, media uploads are simulated. Real integration with Supabase Storage can be added.</p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex gap-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
