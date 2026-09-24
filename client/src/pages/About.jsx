import { FiAward, FiHeart, FiSmile, FiShield, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-[#003725] text-[#FAF7F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Hero Banner */}
        <div className="text-center space-y-6">
          <span className="bg-[#E3BA63]/15 text-[#E3BA63] px-4 py-1.5 rounded-full border border-[#E3BA63]/30 text-xs font-bold uppercase tracking-widest">
            Our Story & Craftsmanship
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#FAF7F0] tracking-tight leading-tight">
            Crafting Unforgettable <br />
            <span className="text-[#E3BA63]">Moments & Celebrations</span>
          </h1>
          <p className="text-[#FAF7F0] max-w-3xl mx-auto text-base sm:text-xl leading-relaxed">
            Welcome to <span className="text-[#E3BA63] font-bold">NK Party</span>, where luxury meets celebration. We curate premium party decor, high-end celebration supplies, and bespoke event packages designed to turn every milestone into a timeless memory.
          </p>
        </div>

        {/* Brand Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#011E15] border border-[#E3BA63]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-[#E3BA63]/60 transition-all">
            <div className="w-14 h-14 bg-[#E3BA63]/10 border border-[#E3BA63]/30 rounded-2xl flex items-center justify-center text-[#E3BA63] mb-6 text-2xl">
              <FiHeart />
            </div>
            <h2 className="text-2xl font-bold text-[#FAF7F0] mb-4">Our Mission</h2>
            <p className="text-[#FAF7F0] leading-relaxed text-base">
              To bring unparalleled elegance, joy, and luxury to every event. From intimate family gatherings to grand wedding galas, we deliver curated decor items that elevate your space with flawless aesthetics.
            </p>
          </div>

          <div className="bg-[#011E15] border border-[#E3BA63]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-[#E3BA63]/60 transition-all">
            <div className="w-14 h-14 bg-[#E3BA63]/10 border border-[#E3BA63]/30 rounded-2xl flex items-center justify-center text-[#E3BA63] mb-6 text-2xl">
              <FiAward />
            </div>
            <h2 className="text-2xl font-bold text-[#FAF7F0] mb-4">Uncompromising Quality</h2>
            <p className="text-[#FAF7F0] leading-relaxed text-base">
              Every balloon arc, table accent, and lighting piece in our collection is handpicked for its superior build and visual flair. We don't just sell decor; we design experience.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="bg-[#011E15] border border-[#E3BA63]/30 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-[#E3BA63] text-center mb-10">
            Why Choose NK Party?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-black/40 border border-[#E3BA63]/30 rounded-2xl flex items-center justify-center text-[#E3BA63] text-xl">
                <FiShield />
              </div>
              <h3 className="font-bold text-[#FAF7F0] text-lg">Premium Guarantee</h3>
              <p className="text-[#FAF7F0] text-sm">100% genuine and durable celebration supplies checked for quality.</p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-black/40 border border-[#E3BA63]/30 rounded-2xl flex items-center justify-center text-[#E3BA63] text-xl">
                <FiTruck />
              </div>
              <h3 className="font-bold text-[#FAF7F0] text-lg">Express Delivery</h3>
              <p className="text-[#FAF7F0] text-sm">Fast, safe dispatch to make sure your party prep never hits a delay.</p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-black/40 border border-[#E3BA63]/30 rounded-2xl flex items-center justify-center text-[#E3BA63] text-xl">
                <FiSmile />
              </div>
              <h3 className="font-bold text-[#FAF7F0] text-lg">Customer Joy</h3>
              <p className="text-[#FAF7F0] text-sm">Thousands of delighted hosts and unforgettable party setups created.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#011E15] via-[#002b1d] to-[#011E15] border border-[#E3BA63]/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-[#FAF7F0]">Ready to Plan Your Next Grand Event?</h2>
          <p className="text-[#FAF7F0] max-w-xl mx-auto">
            Explore our curated catalog of luxury themes, balloons, banners, and table settings.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#E3BA63] hover:bg-[#cda24d] text-[#011E15] font-extrabold px-8 py-4 rounded-2xl transition-all shadow-xl text-lg"
          >
            <FiShoppingBag /> Explore Collections
          </Link>
        </div>

      </div>
    </div>
  );
}

