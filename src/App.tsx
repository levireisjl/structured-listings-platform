import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, signInWithGoogle } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Profile, UserRole } from "./types";
import ListingDirectory from "./components/ListingDirectory";
import ListingDetail from "./components/ListingDetail";
import CreateListing from "./components/CreateListing";
import Chat from "./components/Chat";
import UserProfile from "./components/Profile";
import { LogIn, User as UserIcon, PlusCircle, MessageSquare, LayoutGrid, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create profile
        const profileRef = doc(db, "profiles", firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as Profile);
        } else {
          // New user, default to buyer
          const newProfile: Profile = {
            id: firebaseUser.uid,
            full_name: firebaseUser.displayName,
            avatar_url: firebaseUser.photoURL,
            role: "buyer",
            bio: "",
            created_at: new Date().toISOString(),
          };
          await setDoc(profileRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                <span className="font-bold text-xl tracking-tight">Listings.</span>
              </Link>

              <div className="flex items-center gap-6">
                <Link to="/" className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-sm font-medium">
                  <LayoutGrid size={18} />
                  <span>Browse</span>
                </Link>
                
                {user ? (
                  <>
                    <Link to="/messages" className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-sm font-medium">
                      <MessageSquare size={18} />
                      <span>Messages</span>
                    </Link>
                    
                    {(profile?.role === "seller" || profile?.role === "broker" || profile?.role === "admin") && (
                      <Link to="/create" className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-sm font-medium">
                        <PlusCircle size={18} />
                        <span>List</span>
                      </Link>
                    )}

                    <div className="h-6 w-px bg-slate-200 mx-2" />

                    <Link to="/profile" className="flex items-center gap-2 group">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 group-hover:border-slate-400 transition-colors">
                        <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="Profile" referrerPolicy="no-referrer" />
                      </div>
                    </Link>
                    
                    <button 
                      onClick={() => auth.signOut()}
                      className="text-slate-400 hover:text-slate-900 transition-colors"
                      title="Sign Out"
                    >
                      <LogOut size={18} />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={signInWithGoogle}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<ListingDirectory user={user} profile={profile} />} />
              <Route path="/listing/:id" element={<ListingDetail user={user} profile={profile} />} />
              <Route path="/create" element={user ? <CreateListing user={user} profile={profile} /> : <Navigate to="/" />} />
              <Route path="/messages" element={user ? <Chat user={user} /> : <Navigate to="/" />} />
              <Route path="/profile" element={user ? <UserProfile user={user} profile={profile} setProfile={setProfile} /> : <Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-500 text-sm">© 2026 Structured Listings Platform. Professional MVP.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
