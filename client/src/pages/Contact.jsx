import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageSquare } from 'react-icons/fi';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="bg-[#AC666D]/15 text-[#AC666D] px-4 py-1.5 rounded-full border border-[#AC666D]/30 text-xs font-bold uppercase tracking-widest">
            Get In Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
            Contact <span className="text-[#AC666D]">Customer Support</span>
          </h1>
          <p className="text-gray-800 max-w-2xl mx-auto text-base sm:text-lg">
            Have questions about an order, customized requirements, or general inquiries? We are here to ensure your experience is seamless and luxurious.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="bg-white border border-[#AC666D]/30 rounded-3xl p-6 shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-[#AC666D] pb-3 border-b border-[#AC666D]/20 flex items-center gap-2">
                <FiMessageSquare /> Quick Contact Info
              </h2>

              <div className="flex items-start gap-4">
                <div className="bg-[#AC666D]/10 p-3 rounded-2xl border border-[#AC666D]/30 text-[#AC666D] shrink-0">
                  <FiMail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-800 font-semibold uppercase tracking-wider">Email Us</p>
                  <a href="mailto:support@nkparty.com" className="text-gray-800 font-bold hover:text-[#AC666D] transition-colors">
                    support@nkparty.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#AC666D]/10 p-3 rounded-2xl border border-[#AC666D]/30 text-[#AC666D] shrink-0">
                  <FiPhone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-800 font-semibold uppercase tracking-wider">Call Us</p>
                  <a href="tel:+919999988888" className="text-gray-800 font-bold hover:text-[#AC666D] transition-colors">
                    +91 99999 88888
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#AC666D]/10 p-3 rounded-2xl border border-[#AC666D]/30 text-[#AC666D] shrink-0">
                  <FiMapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-800 font-semibold uppercase tracking-wider">Headquarters</p>
                  <p className="text-gray-800 font-medium leading-snug">
                    123 Party Street, Celebration City, India
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick Connect Card */}
            <div className="bg-white border border-[#25D366]/40 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-[#25D366] flex items-center gap-2">
                💬 Instant WhatsApp Support
              </h3>
              <p className="text-sm text-gray-800">
                Need immediate response regarding an urgent order? Chat directly with our customer concierge.
              </p>
              <a
                href="https://wa.me/919999988888?text=Hi%2C%20I%20have%20an%20inquiry%20regarding%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex justify-center items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-2xl transition-colors shadow-lg"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Send Message Form */}
          <div className="lg:col-span-2 bg-white border border-[#AC666D]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              Send Us a Message
            </h2>

            {submitted && (
              <div className="bg-[#AC666D]/15 border border-[#AC666D] text-[#AC666D] p-4 rounded-2xl mb-6 text-center font-bold">
                Thank you for contacting us! We will get back to you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-[#AC666D]/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#AC666D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-[#AC666D]/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#AC666D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Order Inquiry / Feedback"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white border border-[#AC666D]/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#AC666D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe your inquiry in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white border border-[#AC666D]/20 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#AC666D] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#AC666D] hover:bg-[#96555b] text-white font-extrabold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 text-base tracking-wide"
              >
                <FiSend /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

