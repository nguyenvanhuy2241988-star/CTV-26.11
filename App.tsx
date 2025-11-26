
import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import ProductShowcase from './components/ProductShowcase';
import BusinessChannels from './components/BusinessChannels';
import Journey from './components/Journey';
import Testimonials from './components/Testimonials';
import Policies from './components/Policies';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import FomoToast from './components/FomoToast';
import MobileStickyBtn from './components/MobileStickyBtn';
import ChatBot from './components/ChatBot';
import FomoBar from './components/FomoBar';
import TrustedPartners from './components/TrustedPartners';

const App: React.FC = () => {
  return (
    <div className="font-sans text-text-main bg-bg-main antialiased selection:bg-green-light selection:text-white">
      <FomoBar />
      <Navbar />
      <main className="max-w-full overflow-x-hidden">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-5 pt-0 pb-20">
            <Hero />
        </div>
        
        {/* Full width section for partners */}
        <TrustedPartners />

        <div className="max-w-[1120px] mx-auto px-4 sm:px-5 py-10">
            <ProductShowcase />
            <Benefits />
            <BusinessChannels />
            <Journey />
            <div className="mb-24">
                <Testimonials />
            </div>
            <Policies />
            <ContactForm />
        </div>
      </main>
      <Footer />
      <FomoToast />
      <ChatBot />
      <MobileStickyBtn />
    </div>
  );
};

export default App;
