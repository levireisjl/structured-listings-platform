import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Message, Profile } from "../types";
import { Send, User as UserIcon, Search, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface ChatProps {
  user: any;
}

export default function Chat({ user }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState<{ id: string; lastMessage: string; otherUser: Profile }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listen for messages where user is sender or receiver
    const q = query(
      collection(db, "messages"),
      where("receiver_id", "==", user.uid),
      orderBy("created_at", "desc")
    );

    const q2 = query(
      collection(db, "messages"),
      where("sender_id", "==", user.uid),
      orderBy("created_at", "desc")
    );

    const unsub1 = onSnapshot(q, (snapshot) => {
      processMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
      processMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const processMessages = async (newMsgs: Message[]) => {
    setMessages(prev => {
      const combined = [...prev, ...newMsgs];
      // Deduplicate
      const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
      return unique.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

    // Group into chats
    const chatGroups = new Map<string, Message>();
    newMsgs.forEach(m => {
      const otherId = m.sender_id === user.uid ? m.receiver_id : m.sender_id;
      if (!chatGroups.has(otherId) || new Date(m.created_at) > new Date(chatGroups.get(otherId)!.created_at)) {
        chatGroups.set(otherId, m);
      }
    });

    const chatList = await Promise.all(Array.from(chatGroups.entries()).map(async ([otherId, lastMsg]) => {
      const profileSnap = await getDoc(doc(db, "profiles", otherId));
      return {
        id: otherId,
        lastMessage: lastMsg.content,
        otherUser: profileSnap.data() as Profile
      };
    }));

    setChats(chatList);
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        sender_id: user.uid,
        receiver_id: activeChat,
        content: newMessage,
        is_read: false,
        created_at: new Date().toISOString(),
        listing_id: "" // Optional
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const activeMessages = messages.filter(m => 
    (m.sender_id === user.uid && m.receiver_id === activeChat) ||
    (m.sender_id === activeChat && m.receiver_id === user.uid)
  );

  return (
    <div className="h-[calc(100vh-12rem)] bg-white border border-slate-200 rounded-3xl overflow-hidden flex">
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search chats..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.length > 0 ? (
            chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  "w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left",
                  activeChat === chat.id && "bg-slate-50"
                )}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={chat.otherUser?.avatar_url || `https://ui-avatars.com/api/?name=${chat.otherUser?.full_name}`} alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{chat.otherUser?.full_name}</div>
                  <div className="text-xs text-slate-500 truncate">{chat.lastMessage}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">No conversations yet.</div>
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col bg-slate-50/50">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100">
                <img src={chats.find(c => c.id === activeChat)?.otherUser?.avatar_url} alt="" />
              </div>
              <div className="font-bold text-slate-900">
                {chats.find(c => c.id === activeChat)?.otherUser?.full_name}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeMessages.map(m => (
                <div 
                  key={m.id}
                  className={cn(
                    "flex flex-col max-w-[70%]",
                    m.sender_id === user.uid ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm",
                    m.sender_id === user.uid 
                      ? "bg-slate-900 text-white rounded-tr-none" 
                      : "bg-white border border-slate-200 text-slate-900 rounded-tl-none"
                  )}>
                    {m.content}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center">
              <MessageCircle size={32} className="text-slate-200" />
            </div>
            <p className="text-sm">Select a conversation to start messaging</p>
          </div>
        )}
      </main>
    </div>
  );
}
