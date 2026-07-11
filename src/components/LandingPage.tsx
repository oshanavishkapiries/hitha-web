import React from 'react';
import { ShieldCheck, Award, CreditCard, Globe, Lock } from 'lucide-react';
import { navigateTo } from '../utils/navigation';
import SearchHeroBar from './SearchHeroBar';

export default function LandingPage() {
  return (
    <div className="bg-cream min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-visible bg-gradient-to-b from-ink to-forest text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Background Image and Abstract Shapes with clipping container */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1600&auto=format&fit=crop"
            alt="Serene Forest Sun Rays Sanctuary"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top opacity-20 mix-blend-luminosity"
            style={{
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0) 90%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0) 90%)',
            }}
          />
          {/* Subtle background abstract shapes clipped within container */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-mint rounded-full filter blur-[120px] opacity-10" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sprout rounded-full filter blur-[100px] opacity-10" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Heading (Poppins ~46px) */}
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-[46px] leading-[1.15] text-white tracking-tight mb-6">
            ඔබේ පෞද්ගලිකත්වය රකිමින්,<br className="hidden sm:inline" />
            හිතට සැනසීමක්. <span className="text-mint font-semibold">හිත (Hitha)</span>
          </h1>

          {/* Subheading (Inter) */}
          <p className="font-sans text-base sm:text-lg text-sprout/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            A safe, 100% anonymous digital mental health sanctuary. Consult accredited Sri Lankan specialists in Sinhala, Tamil, or English without exposing your personal identity.
          </p>
        </div>

        {/* Custom Dark Responsive Search Hero Bar */}
        <SearchHeroBar />
      </section>

      {/* Supporting Section: Trust highlights */}
      <section className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-sans font-bold text-moss tracking-wider uppercase">Safe, Guided, Dignified Care</span>
          <h2 className="font-display font-bold text-3xl text-forest mt-1.5 tracking-tight">
            Designed to preserve absolute confidentiality
          </h2>
          <p className="text-sm sm:text-base text-ink-soft max-w-xl mx-auto mt-3">
            In Sri Lanka, seeking therapy should be a source of strength, not social hesitation. We dismantle the stigma.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-sprout/20 border border-sprout/40 rounded-card p-6 shadow-resting hover:shadow-elevated transition-all duration-300">
            <div className="w-12 h-12 bg-sprout/40 rounded-[14px] flex items-center justify-center mb-5 text-forest">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg text-forest mb-2">100% Anonymous</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              No full names, email addresses, or phone verification required. Access therapy completely behind a secured alias.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-sprout/20 border border-sprout/40 rounded-card p-6 shadow-resting hover:shadow-elevated transition-all duration-300">
            <div className="w-12 h-12 bg-sprout/40 rounded-[14px] flex items-center justify-center mb-5 text-forest">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg text-forest mb-2">Certified Specialists</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              We exclusively list practitioners registered with the Sri Lanka Medical Council (SLMC) or clinical organizations.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-sprout/20 border border-sprout/40 rounded-card p-6 shadow-resting hover:shadow-elevated transition-all duration-300">
            <div className="w-12 h-12 bg-sprout/40 rounded-[14px] flex items-center justify-center mb-5 text-forest">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg text-forest mb-2">Secure Escrow</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Session payments are held in secure escrow. Funds are only transferred to your doctor after successful completion.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-sprout/20 border border-sprout/40 rounded-card p-6 shadow-resting hover:shadow-elevated transition-all duration-300">
            <div className="w-12 h-12 bg-sprout/40 rounded-[14px] flex items-center justify-center mb-5 text-forest">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg text-forest mb-2">Trilingual Support</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Counseling is available across Sinhala, Tamil, and English. Speak your heart without translation barriers.
            </p>
          </div>
        </div>

        {/* Reassuring Banner */}
        <div className="mt-16 bg-white border border-hairline rounded-card p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-resting">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 bg-sprout/30 px-2.5 py-1 rounded-full text-xs font-sans font-medium text-forest">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>We value your mental peace</span>
            </div>
            <h3 className="font-display font-semibold text-xl text-forest">Feeling overwhelmed or need someone to talk to?</h3>
            <p className="text-xs text-ink-soft max-w-xl">
              There is no need to carry the weight alone. Filter doctors, view available slots, and securely reserve your conversation token.
            </p>
          </div>
          <div>
            <button
              onClick={() => navigateTo('/search')}
              className="bg-forest hover:bg-forest/90 text-white font-sans font-semibold text-sm px-6 py-3.5 rounded-full transition-all duration-300 shadow-resting"
              id="landing-cta-btn"
            >
              Browse All Doctors
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
