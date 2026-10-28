"use client";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { format, isToday, isYesterday } from "date-fns";
import { api } from "@/lib/api-client";
import {
  Send,
  Search,
  MessageCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  ImagePlus,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const POLL_MS = 3000;

function formatTime(d: string | Date) {
  const date = new Date(d);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return `Yesterday ${format(date, "h:mm a")}`;
  return format(date, "MMM d, h:mm a");
}

function ChatUI() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [convos, setConvos] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(
    searchParams.get("c"),
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileList, setShowMobileList] = useState(!searchParams.get("c"));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [sendingFailed, setSendingFailed] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMsgCountRef = useRef(0);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const myId = (session?.user as any)?.id;

  /* ─── Auth guard ─── */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/chat");
    }
  }, [status, router]);

  /* ─── Load conversations ─── */
  const loadConvos = useCallback(async () => {
    try {
      const data = await api.get<any[]>("/api/conversations");
      setConvos(data || []);
    } catch (e: any) {
      console.error("[loadConvos]", e);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") loadConvos();
  }, [status, loadConvos]);

  /* ─── Refresh convo list every 8s ─── */
  useEffect(() => {
    if (status !== "authenticated") return;
    const timer = setInterval(loadConvos, 8000);
    return () => clearInterval(timer);
  }, [status, loadConvos]);

  /* ─── Load messages for active conversation ─── */
  const loadMessages = useCallback(
    async (silent = false) => {
      if (!activeId) return;
      if (!silent) setLoadingMessages(true);
      try {
        const msgs = await api.get<any[]>(
          `/api/messages?conversationId=${activeId}`,
        );
        setMessages((prev) => {
          // Only update if message count or content changed
          if (
            prev.length === msgs.length &&
            prev[prev.length - 1]?._id === msgs[msgs.length - 1]?._id
          ) {
            return prev;
          }
          return msgs;
        });
        setMsgError(null);

        // Mark read if there are unread incoming
        const hasUnread = msgs.some(
          (m: any) => (m.sender?._id || m.sender) !== myId && !m.read,
        );
        if (hasUnread) {
          api
            .post("/api/messages/read", { conversationId: activeId })
            .catch(() => {});
        }
      } catch (e: any) {
        if (!silent) setMsgError(e.message);
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [activeId, myId],
  );

  /* ─── Reset messages when switching conversation ─── */
  useEffect(() => {
    setMessages([]);
    setMsgError(null);
    lastMsgCountRef.current = 0;
    if (activeId) loadMessages(false);
  }, [activeId, loadMessages]);

  /* ─── Polling ─── */
  useEffect(() => {
    if (!activeId) return;

    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(() => {
      loadMessages(true);
    }, POLL_MS);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [activeId, loadMessages]);

  /* ─── Auto-scroll (only on new message count) ─── */
  useEffect(() => {
    if (messages.length > lastMsgCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      lastMsgCountRef.current = messages.length;
    }
  }, [messages.length]);

  /* ─── Focus input ─── */
  useEffect(() => {
    if (activeId) inputRef.current?.focus();
  }, [activeId]);

  /* ─── Image picker ─── */
  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    if (!f.type.startsWith("image/")) return toast.error("Only images allowed");
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /* ─── Send message (with optimistic UI) ─── */
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if ((!text.trim() && !imageFile) || !activeId || sending) return;

    setSending(true);
    setSendingFailed(false);

    // Optimistic insert
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: any = {
      _id: tempId,
      sender: { _id: myId, name: session?.user?.name },
      text: text.trim(),
      imageUrl: imagePreview,
      createdAt: new Date(),
      read: false,
      _optimistic: true,
    };

    const savedText = text;
    const savedImage = imageFile;
    const savedPreview = imagePreview;

    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");
    clearImage();

    try {
      let imageUrl: string | undefined;
      if (savedImage) {
        setUploading(true);
        const fd = new FormData();
        fd.append("files", savedImage);
        const { urls } = await api.post<{ urls: string[] }>("/api/upload", fd);
        imageUrl = urls[0];
      }

      await api.post("/api/messages", {
        conversationId: activeId,
        text: savedText.trim(),
        imageUrl,
      });

      // Force full reload (replaces optimistic)
      lastMsgCountRef.current = 0;
      await loadMessages(true);
      loadConvos();
    } catch (err: any) {
      // Remove optimistic message
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      // Restore text/image so user can retry
      setText(savedText);
      if (savedPreview) {
        setImagePreview(savedPreview);
        setImageFile(savedImage);
      }
      setSendingFailed(true);
      toast.error(err.message || "Failed to send");
    } finally {
      setSending(false);
      setUploading(false);
    }
  }

  /* ─── Loading state ─── */
  if (status === "loading") {
    return (
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  const activeConvo = convos.find((c) => c._id === activeId);
  const activeOther = activeConvo?.participants?.find(
    (p: any) => (p._id || p) !== myId,
  );
  const filteredConvos = convos.filter((c) => {
    if (!searchQuery) return true;
    const other = c.participants?.find((p: any) => (p._id || p) !== myId);
    return (
      other?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.property?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  /* ─── Group by date ─── */
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
        {/* ═══ Sidebar ═══ */}
        <aside
          className={`md:col-span-1 border-r border-gray-100 flex flex-col bg-white ${
            showMobileList ? "flex" : "hidden md:flex"
          }`}
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
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConvos.length === 0 && (
              <div className="p-6 text-center">
                <MessageCircle
                  size={40}
                  className="text-gray-300 mx-auto mb-2"
                />
                <p className="text-sm text-gray-500">
                  {searchQuery
                    ? "No chats match your search"
                    : "No conversations yet"}
                </p>
              </div>
            )}

            {filteredConvos.map((c) => {
              const other = c.participants?.find(
                (p: any) => (p._id || p) !== myId,
              );
              const active = activeId === c._id;
              const preview =
                c.lastMessage?.imageUrl && !c.lastMessage?.text
                  ? "📷 Photo"
                  : c.lastMessage?.text || "No messages yet";

              return (
                <button
                  key={c._id}
                  onClick={() => {
                    setActiveId(c._id);
                    setShowMobileList(false);
                  }}
                  className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    active ? "bg-brand-50 border-l-4 border-l-brand-600" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {other?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm truncate ${
                            active
                              ? "font-bold text-brand-700"
                              : "font-semibold text-gray-900"
                          }`}
                        >
                          {other?.name || "User"}
                        </p>
                        {c.unread > 0 && (
                          <span className="bg-brand-600 text-white text-xs rounded-full px-1.5 min-w-[18px] text-center flex-shrink-0">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {preview}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ═══ Chat area ═══ */}
        <section
          className={`md:col-span-2 flex flex-col h-full bg-gray-50 ${
            showMobileList ? "hidden md:flex" : "flex"
          }`}
        >
          {activeId && activeOther ? (
            <>
              {/* Header */}
              <div className="bg-white border-b border-gray-100 p-3 flex items-center gap-3">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold">
                  {activeOther?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {activeOther?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {activeConvo?.property?.title || "General inquiry"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {loadingMessages && messages.length === 0 && (
                  <div className="flex justify-center py-8">
                    <Loader2
                      className="animate-spin text-brand-600"
                      size={24}
                    />
                  </div>
                )}

                {msgError && messages.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle
                      size={32}
                      className="text-danger-400 mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-600 mb-2">{msgError}</p>
                    <button
                      onClick={() => loadMessages(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      <RefreshCw size={14} /> Retry
                    </button>
                  </div>
                )}

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
                      const senderId = m.sender?._id || m.sender;
                      const isMe = senderId === myId;
                      const isOptimistic = m._optimistic;

                      return (
                        <div
                          key={m._id}
                          className={`flex mb-1 ${isMe ? "justify-end" : "justify-start"} ${
                            isOptimistic ? "opacity-70" : ""
                          }`}
                        >
                          <div
                            className={`max-w-[75%] md:max-w-[65%] rounded-2xl overflow-hidden ${
                              isMe
                                ? "bg-brand-600 text-white rounded-br-md"
                                : "bg-white text-gray-900 border border-gray-100 rounded-bl-md"
                            }`}
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
                              className={`flex items-center gap-1 px-3.5 pb-1.5 ${
                                isMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span
                                className={`text-[10px] ${
                                  isMe ? "text-brand-100" : "text-gray-400"
                                }`}
                              >
                                {isOptimistic
                                  ? "Sending..."
                                  : formatTime(m.createdAt)}
                              </span>
                              {isMe &&
                                !isOptimistic &&
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

                {messages.length === 0 && !loadingMessages && !msgError && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <MessageCircle size={48} className="text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">
                      Start the conversation with {activeOther?.name}
                    </p>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Image preview */}
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
                    className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Send failed banner */}
              {sendingFailed && (
                <div className="bg-danger-50 border-t border-danger-200 px-4 py-2 flex items-center gap-2 text-xs text-danger-700">
                  <AlertCircle size={14} />
                  <span className="flex-1">
                    Message failed to send. Click to retry.
                  </span>
                  <button
                    onClick={send}
                    className="text-danger-600 font-semibold hover:underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Input */}
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
                  className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 flex-shrink-0"
                  disabled={sending || uploading}
                  title="Attach image"
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
                  maxLength={2000}
                />
                <button
                  type="submit"
                  disabled={(!text.trim() && !imageFile) || sending}
                  className="btn btn-primary w-10 h-10 p-0 rounded-full flex-shrink-0 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                <MessageCircle size={40} className="text-brand-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Select a conversation
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Choose a chat from the list or contact an owner from any
                property page.
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
        <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex items-center justify-center">
          <Loader2 className="animate-spin text-brand-600" size={32} />
        </div>
      }
    >
      <ChatUI />
    </Suspense>
  );
}
