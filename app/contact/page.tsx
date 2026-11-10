"use client";
import { useEffect, useState } from "react";
import { Mail, MessageCircle, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";

interface SupportSettings {
  supportEmail?: string;
  supportPhone?: string;
}

export default function ContactPage() {
  const [support, setSupport] = useState<SupportSettings>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const supportPhoneDigits = support.supportPhone?.replace(/\D/g, "") || "";
  const whatsappNumber =
    supportPhoneDigits.length === 10
      ? `91${supportPhoneDigits}`
      : supportPhoneDigits.startsWith("91") && supportPhoneDigits.length === 12
        ? supportPhoneDigits
        : "";

  useEffect(() => {
    api
      .get<{ settings?: SupportSettings }>("/api/plans")
      .then((data) => setSupport(data.settings || {}))
      .catch((error) => console.error("[Contact settings]", error));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.message.length < 10) return toast.error("Message too short");
    setSending(true);
    try {
      await api.post("/api/contact", form);
      toast.success(
        "Message sent! We will get back to you as soon as possible.",
      );
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send message.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <MessageCircle size={32} className="text-brand-600" />
        </div>
        <h1 className="text-4xl font-bold mb-3">Contact the Management Team</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Owner ya tenant account, property verification, KYC, payment, ya kisi
          bhi problem ke liye Management Team ko yahan message bhejein.
        </p>
      </div>

      {(whatsappNumber || support.supportEmail) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 hover:border-success-300 hover:shadow-card-hover transition-all group text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <MessageCircle size={24} />
              </div>
              <p className="font-bold mb-1">WhatsApp</p>
              <p className="text-sm text-brand-600 font-semibold mt-2">
                {support.supportPhone}
              </p>
            </a>
          )}
          {support.supportEmail && (
            <a
              href={`mailto:${support.supportEmail}`}
              className="card p-5 hover:border-brand-300 hover:shadow-card-hover transition-all group text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-400/20 text-accent-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent-500 group-hover:text-white transition-colors">
                <Mail size={24} />
              </div>
              <p className="font-bold mb-1">Email</p>
              <p className="text-sm text-brand-600 font-semibold mt-2 break-all">
                {support.supportEmail}
              </p>
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <form
            id="contact-form"
            onSubmit={submit}
            className="card p-6 md:p-8 space-y-4"
          >
            <h2 className="text-xl font-bold">Send a message to our Management Team</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">
                  Your Name <span className="text-danger-500">*</span>
                </label>
                <input
                  required
                  className="input"
                  placeholder="Ram Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">
                  Email <span className="text-danger-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">Phone (optional)</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="9876543210"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                />
              </div>
              <div>
                <label className="label">Subject</label>
                <select
                  className="input"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                >
                  <option value="">Select topic</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Report a Problem">Report a Problem</option>
                  <option value="Report Fake Listing">
                    Report Fake Listing
                  </option>
                  <option value="Property Listing Help">
                    Property Listing Help
                  </option>
                  <option value="Account Help">Account Help</option>
                  <option value="KYC Verification">KYC Verification</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Feedback">Feedback / Suggestion</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">
                Message <span className="text-danger-500">*</span>
              </label>
              <textarea
                required
                rows={6}
                className="input"
                placeholder="Aap kya kehna chahte hain?"
                maxLength={1000}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.message.length}/1000
              </p>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn btn-primary btn-lg w-full disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send size={18} /> Send Message
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6 bg-brand-50 border-brand-200">
            <h3 className="font-bold mb-2 text-brand-700">Quick Help</h3>
            <p className="text-sm text-gray-600 mb-3">
              Common questions ke answers yahan milenge:
            </p>
            <a
              href="/faq"
              className="text-sm text-brand-600 font-semibold hover:underline"
            >
              View FAQ →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
