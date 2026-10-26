"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import {
  Send,
  Search,
  MessageCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  ImagePlus,
  X,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import Image from "next/image";

function formatTime(date: string | Date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return `Yesterday ${format(d, "h:mm a")}`;
  return format(d, "MMM d, h:mm a");
}

function ChatUI() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const search = useSearchParams();
  const [convos, setConvos] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(search.get("c"));
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileList, setShowMobileList] = useState(!search.get("c"));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const myId = (session?.user as any)?.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/chat");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session) {
      api
        .get<any[]>("/api/conversations")
        .then(setConvos)
        .catch(() => {});
    }
  }, [status, session]);

  useEffect(() => {
    if (!activeId) return;
    const load = () =>
      api
        .get<any[]>(`/api/messages?conversationId=${activeId}`)
        .then((msgs) => {
          setMessages(msgs);
          api
            .post("/api/messages/read", { conversationId: activeId })
            .catch(() => {});
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeId) inputRef.current?.focus();
  }, [activeId]);

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("Under 5MB only");
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if ((!text.trim() && !imageFile) || !activeId || sending) return;
    setSending(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("files", imageFile);
        const { urls } = await api.post<{ urls: string[] }>("/api/upload", fd);
        imageUrl = urls[0];
        setUploading(false);
      }
      await api.post("/api/messages", {
        conversationId: activeId,
        text: text.trim(),
        imageUrl,
      });
      setText("");
      clearImage();
      const msgs = await api.get<any[]>(
        `/api/messages?conversationId=${activeId}`,
      );
      setMessages(msgs);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
      setUploading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="text-center py-16 text-gray-500">Loading chat...</div>
    );
  }

  const activeConvo = convos.find((c) => c._id === activeId);
  const activeOther = activeConvo?.participants?.find(
    (p: any) => p._id !== myId,
  );
  const filteredConvos = convos.filter((c) => {
    if (!searchQuery) return true;
    const other = c.participants?.find((p: any) => p._id !== myId);
    return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const grouped: { date: string; messages: any[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = new Date(msg.createdAt).toDateString();
    const last = grouped[grouped.length - 1];
    if (last && last.date === dateStr) last.messages.push(msg);
    else grouped.push({ date: dateStr, messages: [msg] });
  });

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 h-full">
        <aside
          className={`md:col-span-1 border-r border-gray-100 flex flex-col ${showMobileList ? "flex" : "hidden md:flex"}`}
        >
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-lg mb-3">Messages</h2>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConvos.map((c) => {
              const other = c.participants?.find((p: any) => p._id !== myId);
              const active = activeId === c._id;
              const unread = c.messages?.filter(
                (m: any) => m.sender !== myId && !m.read,
              ).length;
              return (
                <button
                  key={c._id}
                  onClick={() => {
                    setActiveId(c._id);
                    setShowMobileList(false);
                  }}
                  className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 ${active ? "bg-brand-50 border-l-4 border-l-brand-600" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {other?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm truncate ${active ? "font-bold text-brand-700" : "font-semibold"}`}
                        >
                          {other?.name}
                        </p>
                        {unread > 0 && (
                          <span className="bg-brand-600 text-white text-xs rounded-full px-1.5">
                            {unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {c.property?.title || "General"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {!filteredConvos.length && (
              <div className="p-6 text-center">
                <MessageCircle
                  size={40}
                  className="text-gray-300 mx-auto mb-2"
                />
                <p className="text-sm text-gray-500">No chats</p>
              </div>
            )}
          </div>
        </aside>

        <section
          className={`md:col-span-2 flex flex-col h-full bg-gray-50 ${showMobileList ? "hidden md:flex" : "flex"}`}
        >
          {activeId && activeOther ? (
            <>
              <div className="bg-white border-b border-gray-100 p-3 flex items-center gap-3">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold">
                  {activeOther?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{activeOther?.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {activeConvo?.property?.title || "General"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {grouped.map((group, gi) => (
                  <div key={gi}>
                    <div className="flex items-center justify-center my-3">
                      <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full">
                        {isToday(new Date(group.date))
                          ? "Today"
                          : isYesterday(new Date(group.date))
                            ? "Yesterday"
                            : format(new Date(group.date), "MMM d, yyyy")}
                      </span>
                    </div>
                    {group.messages.map((m: any) => {
                      const isMe = m.sender?._id === myId || m.sender === myId;
                      return (
                        <div
                          key={m._id}
                          className={`flex mb-1 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl overflow-hidden ${isMe ? "bg-brand-600 text-white rounded-br-md" : "bg-white text-gray-900 border border-gray-100 rounded-bl-md"}`}
                          >
                            {m.imageUrl && (
                              <div className="relative w-64 h-48">
                                <Image
                                  src={m.imageUrl}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="256px"
                                />
                              </div>
                            )}
                            {m.text && (
                              <p className="text-sm whitespace-pre-wrap break-words px-3.5 py-2">
                                {m.text}
                              </p>
                            )}
                            <div
                              className={`flex items-center gap-1 px-3.5 pb-1.5 ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              <span
                                className={`text-[10px] ${isMe ? "text-brand-100" : "text-gray-400"}`}
                              >
                                {formatTime(m.createdAt)}
                              </span>
                              {isMe &&
                                (m.read ? (
                                  <CheckCheck
                                    size={12}
                                    className="text-brand-100"
                                  />
                                ) : (
                                  <Check size={12} className="text-brand-300" />
                                ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                {!messages.length && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <MessageCircle size={48} className="text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">
                      Say hi to {activeOther?.name}
                    </p>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {imagePreview && (
                <div className="bg-white border-t border-gray-100 p-2 flex items-center gap-2">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-500 flex-1">Ready to send</p>
                  <button
                    onClick={clearImage}
                    className="p-1.5 rounded-full bg-gray-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <form
                onSubmit={send}
                className="bg-white border-t border-gray-100 p-3 flex gap-2 items-center"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={pickImage}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100"
                  disabled={sending}
                >
                  <ImagePlus size={20} />
                </button>
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="input flex-1 py-2.5"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={(!text.trim() && !imageFile) || sending}
                  className="btn btn-primary w-10 h-10 p-0 rounded-full"
                >
                  {uploading ? "◌" : <Send size={18} />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <MessageCircle size={40} className="text-brand-400 mb-3" />
              <h3 className="text-lg font-bold mb-1">Select a conversation</h3>
              <p className="text-sm text-gray-500">
                Choose a chat from the list.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16 text-gray-500">Loading...</div>
      }
    >
      <ChatUI />
    </Suspense>
  );
}
