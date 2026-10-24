"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api-client";

function ChatUI() {
  const { data: session } = useSession();
  const search = useSearchParams();
  const [convos, setConvos] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(search.get("c"));
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const myId = (session?.user as any)?.id;

  useEffect(() => {
    if (!session) return;
    api
      .get<any[]>("/api/conversations")
      .then(setConvos)
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    if (!activeId) return;
    const load = () =>
      api
        .get<any[]>(`/api/messages?conversationId=${activeId}`)
        .then(setMessages)
        .catch(() => {});
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    try {
      await api.post("/api/messages", { conversationId: activeId, text });
      setText("");
      const msgs = await api.get<any[]>(
        `/api/messages?conversationId=${activeId}`,
      );
      setMessages(msgs);
    } catch {}
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[75vh]">
      <aside className="bg-white rounded shadow overflow-y-auto md:col-span-1">
        {convos.map((c) => {
          const other = c.participants.find((p: any) => p._id !== myId);
          return (
            <button
              key={c._id}
              onClick={() => setActiveId(c._id)}
              className={`w-full text-left p-3 border-b hover:bg-gray-100 ${activeId === c._id ? "bg-blue-50" : ""}`}
            >
              <p className="font-semibold text-sm">{other?.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">
                {c.property?.title || "General"}
              </p>
            </button>
          );
        })}
        {!convos.length && (
          <p className="p-3 text-gray-500 text-sm">No conversations yet.</p>
        )}
      </aside>
      <section className="md:col-span-2 bg-white rounded shadow flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {messages.map((m: any) => (
            <div
              key={m._id}
              className={`max-w-[70%] p-2 rounded ${m.sender._id === myId ? "ml-auto bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              {m.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} className="p-3 border-t flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border p-2 rounded"
            disabled={!activeId}
          />
          <button
            disabled={!activeId}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<p>Loading chat...</p>}>
      <ChatUI />
    </Suspense>
  );
}
