
import React from 'react';
import { Phone, Download, Zap } from 'lucide-react';

const MobileStickyBtn: React.FC = () => {
  const scrollToForm = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const HOTLINE = "0969.069.798";

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-[40] md:hidden flex flex-col safe-area-pb">
      
      {/* Promo Badge - Floating on top */}
      <div className="bg-yellow-100 text-red-700 text-[11px] font-bold text-center py-1.5 border-b border-yellow-200 flex items-center justify-center gap-1 animate-pulse">
         <Zap size={12} fill="currentColor" />
         Ưu đãi vốn nhập hàng: <span className="text-black">Mua 10 Tặng 1</span>
      </div>

      <div className="flex gap-3 p-3 pt-2">
        <a 
            href={`tel:${HOTLINE.replace(/\./g, '')}`}
            className="flex flex-col items-center justify-center w-[70px] h-[44px] bg-gray-100 text-gray-700 rounded-lg active:bg-gray-200 transition-colors"
        >
            <Phone size={20} />
            <span className="text-[10px] font-bold mt-0.5">Gọi ngay</span>
        </a>
        
        <div className="flex-1">
            <button 
            onClick={scrollToForm}
            className="w-full h-[44px] bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/50 active:scale-[0.98] transition-all uppercase tracking-wide"
            >
            <Download size={18} /> NHẬN BẢNG GIÁ & ƯU ĐÃI
            </button>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyBtn;
