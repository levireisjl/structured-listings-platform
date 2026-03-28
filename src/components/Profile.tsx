import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Profile, UserRole } from "../types";
import { User as UserIcon, Shield, Briefcase, ShoppingCart, Save, Camera } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface ProfileProps {
  user: any;
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

export default function UserProfile({ user, profile, setProfile }: ProfileProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    role: profile?.role || "buyer" as UserRole,
  });

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const profileRef = doc(db, "profiles", user.uid);
      await updateDoc(profileRef, formData);
      setProfile({ ...profile!, ...formData });
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setLoading(false);
  };

  const roles: { id: UserRole; label: string; icon: any; desc: string }[] = [
    { id: "buyer", label: "Buyer", icon: ShoppingCart, desc: "Looking to acquire businesses or assets." },
    { id: "seller", label: "Seller", icon: Briefcase, desc: "Looking to sell my business or asset." },
    { id: "broker", label: "Broker", icon: Shield, desc: "Representing clients in transactions." },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Header / Cover */}
        <div className="h-32 bg-slate-900 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white bg-slate-100 shadow-lg relative group">
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${profile?.full_name}`} alt="" referrerPolicy="no-referrer" />
              {editing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={20} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{profile?.full_name}</h1>
              <p className="text-slate-500 capitalize">{profile?.role}</p>
            </div>
            <button 
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={loading}
              className={cn(
                "px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2",
                editing 
                  ? "bg-slate-900 text-white hover:bg-slate-800" 
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900"
              )}
            >
              {editing ? <><Save size={18} /> Save Changes</> : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Full Name</label>
                {editing ? (
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                ) : (
                  <p className="text-slate-600">{profile?.full_name || "Not set"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Bio</label>
                {editing ? (
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[120px]"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                ) : (
                  <p className="text-slate-600">{profile?.bio || "No bio provided."}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-4">Account Role</label>
                <div className="space-y-3">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      disabled={!editing}
                      onClick={() => setFormData({...formData, role: role.id})}
                      className={cn(
                        "w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3",
                        formData.role === role.id 
                          ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" 
                          : "border-slate-200 hover:border-slate-300",
                        !editing && "opacity-80 cursor-default"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        formData.role === role.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        <role.icon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{role.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{role.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats / Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-1">
          <div className="text-2xl font-bold text-slate-900">0</div>
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Listings</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-1">
          <div className="text-2xl font-bold text-slate-900">0</div>
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Messages Sent</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-1">
          <div className="text-2xl font-bold text-slate-900">2026</div>
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Member Since</div>
        </div>
      </div>
    </div>
  );
}
