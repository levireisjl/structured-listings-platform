import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Listing, Profile } from "../types";
import { MapPin, DollarSign, Calendar, FileText, MessageCircle, ChevronLeft, Share2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface ListingDetailProps {
  user: any;
  profile: Profile | null;
}

export default function ListingDetail({ user, profile }: ListingDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "listings", id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const listingData = { id: docSnap.id, ...docSnap.data() } as Listing;
        setListing(listingData);
        
        // Fetch seller profile
        const sellerRef = doc(db, "profiles", listingData.seller_id);
        const sellerSnap = await getDoc(sellerRef);
        if (sellerSnap.exists()) {
          setSeller(sellerSnap.data() as Profile);
        }
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!user || !listing || !message.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        sender_id: user.uid,
        receiver_id: listing.seller_id,
        listing_id: listing.id,
        content: message,
        is_read: false,
        created_at: new Date().toISOString()
      });
      setMessage("");
      alert("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setSending(false);
  };

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-96 bg-slate-200 rounded-3xl" />
    <div className="h-64 bg-slate-200 rounded-3xl" />
  </div>;

  if (!listing) return <div className="text-center py-24">Listing not found.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft size={20} />
        <span>Back to directory</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="aspect-video bg-slate-100">
              <img 
                src={listing.images[0] || `https://picsum.photos/seed/${listing.id}/1200/675`} 
                alt={listing.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {listing.images.length > 1 && (
              <div className="p-4 flex gap-4 overflow-x-auto">
                {listing.images.map((img, i) => (
                  <div key={i} className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Details */}
          <section className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{listing.title}</h1>
                <div className="flex items-center gap-4 text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={16} /> {listing.location}</span>
                  <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(listing.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">${listing.price.toLocaleString()}</div>
                <div className="text-sm text-slate-500 uppercase tracking-wider font-bold">{listing.category}</div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-xs text-slate-400 uppercase font-bold">Revenue Range</div>
                <div className="font-medium text-slate-900">{listing.revenue_range}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-400 uppercase font-bold">Status</div>
                <div className="flex items-center gap-1.5 font-medium text-emerald-600">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Description</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {listing.documents.length > 0 && (
              <div className="space-y-4 pt-4">
                <h2 className="text-xl font-bold text-slate-900">Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.documents.map((doc, i) => (
                    <a 
                      key={i} 
                      href={doc} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">Document {i + 1}</div>
                        <div className="text-xs text-slate-400">PDF / DOCX</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar / Actions */}
        <aside className="space-y-6">
          {/* Seller Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={seller?.avatar_url || `https://ui-avatars.com/api/?name=${seller?.full_name}`} alt="" referrerPolicy="no-referrer" />
              </div>
              <div>
                <div className="font-bold text-slate-900">{seller?.full_name || "Private Seller"}</div>
                <div className="text-sm text-slate-500 capitalize">{seller?.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck size={14} />
              Verified Professional
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-4">
              <div className="text-sm font-bold text-slate-900">Contact Seller</div>
              <textarea 
                placeholder="Write your message..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[120px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button 
                onClick={handleSendMessage}
                disabled={sending || !user}
                className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MessageCircle size={20} />
                {sending ? "Sending..." : "Send Message"}
              </button>
              {!user && <p className="text-xs text-center text-slate-400">Please sign in to contact the seller.</p>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4">
            <button className="flex-1 bg-white border border-slate-200 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <Share2 size={18} />
              Share
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
