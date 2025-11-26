
import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap } from 'lucide-react';

const FomoBar: React.FC = () => {
  // Set timer to 2 hours, 14 mins for urgency
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 14, s: 59 });
  const [progress, setProgress] = useState(100);

  const scrollToForm = () => {
    const form = document.getElementById('contact');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Timer Logic
  useEffect(() => {
    const totalSecondsStart = 2 * 3600 + 14 * 60 + 59;
    let currentSeconds = totalSecondsStart;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else {
          s = 59;
          if (m > 0) m--;
          else {
            m = 59;
            if (h > 0) h--;
          }
        }
        return { h, m, s };
      });

      // Calculate progress bar width (simulated drain)
      currentSeconds--;
      const percent = (currentSeconds / totalSecondsStart) * 100;
      setProgress(Math.max(0, percent));

    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  return (
    <div className="sticky top-0 z-[100] bg-[#b91c1c] text-white shadow-[0_4px_20px_rgba(185,28,28,0.5)] border-b-2 border-yellow-500 overflow-hidden">
      {/* Warning Stripes Texture */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}></div>
      
      {/* Progress Bar at bottom */}
      <div className="absolute bottom-0 left-0 h-1 bg-yellow-400 transition-all duration-1000 linear z-20" style={{ width: `${progress}%` }}></div>

      <div className="max-w-[1120px] mx-auto px-3 py-2 sm:py-3 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          
          {/* LEFT: The Big Offer */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start text-center sm:text-left">
            <div className="hidden sm:flex w-10 h-10 bg-yellow-400 text-red-700 rounded-full items-center justify-center shrink-0 animate-pulse shadow-lg border-2 border-white">
               <Zap size={24} fill="currentColor" />
            </div>
            
            <div className="leading-tight">
               <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-yellow-200 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                  Ưu đãi Nhập Sỉ Hôm Nay
               </div>
               <div className="text-sm sm:text-lg font-bold">
                  Mua 10 Tặng 1 <span className="mx-1 text-yellow-300/50">|</span> Tặng <span className="text-yellow-300 font-extrabold drop-shadow-md">BỘ MẪU THỬ</span>
               </div>
            </div>
          </div>

          {/* RIGHT: Big Timer + CTA */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-3 bg-black/20 sm:bg-transparent p-1.5 rounded-lg sm:p-0">
             
             {/* Digital Clock Box */}
             <div className="flex items-center gap-1 sm:gap-2">
                <div className="text-[10px] sm:text-xs font-bold uppercase text-white/80 w-12 leading-none text-right hidden lg:block">
                    Kết thúc<br/>sau:
                </div>
                <div className="flex gap-1 text-center">
                    <div className="bg-[#1a0505] border border-red-500/50 rounded px-1.5 sm:px-2 py-1 min-w-[36px] sm:min-w-[44px]">
                        <div className="text-lg sm:text-2xl font-mono font-bold text-red-500 leading-none">{formatTime(timeLeft.h)}</div>
                        <div className="text-[8px] sm:text-[9px] text-gray-400 uppercase">Giờ</div>
                    </div>
                    <div className="text-red-300 font-bold text-xl pt-1">:</div>
                    <div className="bg-[#1a0505] border border-red-500/50 rounded px-1.5 sm:px-2 py-1 min-w-[36px] sm:min-w-[44px]">
                        <div className="text-lg sm:text-2xl font-mono font-bold text-red-500 leading-none">{formatTime(timeLeft.m)}</div>
                        <div className="text-[8px] sm:text-[9px] text-gray-400 uppercase">Phút</div>
                    </div>
                    <div className="text-red-300 font-bold text-xl pt-1">:</div>
                    <div className="bg-[#1a0505] border border-red-500/50 rounded px-1.5 sm:px-2 py-1 min-w-[36px] sm:min-w-[44px]">
                        <div className="text-lg sm:text-2xl font-mono font-bold text-white animate-pulse leading-none">{formatTime(timeLeft.s)}</div>
                        <div className="text-[8px] sm:text-[9px] text-gray-400 uppercase">Giây</div>
                    </div>
                </div>
             </div>

             {/* Flash Button - Stronger, Specific Call to Action */}
             <button 
               onClick={scrollToForm} 
               className="flex-1 sm:flex-none bg-yellow-400 hover:bg-white text-red-900 text-[10px] sm:text-sm font-black px-2 sm:px-6 py-2.5 rounded shadow-[0_0_15px_rgba(250,204,21,0.6)] hover:scale-105 active:scale-95 transition-all animate-shake whitespace-nowrap uppercase tracking-wide border-b-4 border-yellow-600 hover:border-gray-300"
             >
               NHẬN ƯU ĐÃI NGAY <ArrowRight size={16} className="inline ml-1" />
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FomoBar;
