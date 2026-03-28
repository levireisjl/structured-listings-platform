import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Listing, Profile } from "../types";
import { Link } from "react-router-dom";
import { Search, MapPin, DollarSign, Filter, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface ListingDirectoryProps {
  user: any;
  profile: Profile | null;
}

export default function ListingDirectory({ user, profile }: ListingDirectoryProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [revenueFilter, setRevenueFilter] = useState("");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "listings"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
    setLoading(false);
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || listing.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesRevenue = !revenueFilter || listing.revenue_range === revenueFilter;
    return matchesSearch && matchesLocation && matchesRevenue;
  });

  return (
    <div className="space-y-8">
      {/* Hero / Search Section */}
      <section className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Find your next <span className="text-slate-400">opportunity.</span>
          </motion.h1>
          <p className="text-slate-400 text-lg mb-8">
            The professional directory for structured business and asset listings.
          </p>

          <div className="flex flex-col md:flex-row gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="flex-1 flex items-center gap-2 px-3 py-2">
              <Search className="text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search listings..." 
                className="bg-transparent border-none focus:ring-0 w-full text-white placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="h-10 w-px bg-white/10 hidden md:block" />
            <div className="flex-1 flex items-center gap-2 px-3 py-2">
              <MapPin className="text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Location..." 
                className="bg-transparent border-none focus:ring-0 w-full text-white placeholder:text-slate-500"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            <button className="bg-white text-slate-900 px-6 py-2 rounded-xl font-bold hover:bg-slate-100 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-800 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
      </section>

      {/* Filters & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Filter size={16} />
              Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Revenue Range</label>
                <select 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={revenueFilter}
                  onChange={(e) => setRevenueFilter(e.target.value)}
                >
                  <option value="">All Ranges</option>
                  <option value="$0 - $100k">$0 - $100k</option>
                  <option value="$100k - $500k">$100k - $500k</option>
                  <option value="$500k - $1M">$500k - $1M</option>
                  <option value="$1M+">$1M+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <div className="space-y-2">
                  {["SaaS", "E-commerce", "Service", "Real Estate"].map(cat => (
                    <label key={cat} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                      <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Listings Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={`/listing/${listing.id}`}
                    className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-900 transition-all hover:shadow-xl hover:shadow-slate-200/50"
                  >
                    <div className="aspect-video relative overflow-hidden bg-slate-100">
                      <img 
                        src={listing.images[0] || `https://picsum.photos/seed/${listing.id}/800/450`} 
                        alt={listing.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-900">
                          {listing.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="font-bold text-lg leading-tight text-slate-900 group-hover:text-slate-900">
                          {listing.title}
                        </h2>
                        <span className="font-bold text-slate-900">
                          ${listing.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {listing.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} />
                          {listing.revenue_range}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-400">
                          Added {new Date(listing.created_at).toLocaleDateString()}
                        </span>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-500">No listings found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
