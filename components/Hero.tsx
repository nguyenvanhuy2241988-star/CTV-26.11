
import React from 'react';
import Button from './ui/Button';
import { CheckCircle, Zap, Box, ShieldCheck, Award, Gift, Star, UserPlus, Clock } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollToForm = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const PRODUCT_IMAGES = {
    packBack: "https://lh3.googleusercontent.com/d/1kRCrrZbE_7vFWO7QGVYUTINzEBLvE2OX",
    packFront: "https://lh3.googleusercontent.com/d/1g-nryBiY2wWteKuz3NwRGcAEOD9d765h",
  };

  // Avatar placeholders for Social Proof
  const AVATARS = [
    "https://ui-avatars.com/api/?name=Linh+Dan&background=fecaca&color=7f1d1d",
    "https://ui-avatars.com/api/?name=Minh+Tuan&background=bbf7d0&color=14532d",
    "https://ui-avatars.com/api/?name=Hoang+Ha&background=fed7aa&color=7c2d12",
    "https://ui-avatars.com/api/?name=Khanh+Vy&background=e9d5ff&color=581c87"
  ];

  return (
    <section id="home" className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_1.2fr] gap-6 lg:gap-12 items-center mb-12 md:mb-32 pt-2 lg:pt-10">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-green-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-orange-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Left Content */}
      <div className="relative z-10 order-2 lg:order-1 flex flex-col justify-center">
        {/* Top Tag - Timeless & Benefit Driven */}
        <div className="inline-flex self-start items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest bg-red-600 text-white px-3 py-1.5 rounded-full mb-4 md:mb-6 shadow-lg animate-pulse ring-2 ring-red-200">
          <Award size={12} fill="currentColor" />
          CƠ HỘI KINH DOANH VỐN THẤP & LỢI NHUẬN CAO
        </div>

        {/* Headline - Optimized Short & Punchy */}
        <div className="flex flex-col mb-4 md:mb-6 select-none relative group cursor-default">
            <h1 className="font-black tracking-tighter flex flex-col items-start w-full">
                
                {/* Line 1 */}
                <span className="block text-[24px] sm:text-[32px] md:text-[40px] lg:text-[48px] leading-[1.1] text-gray-900 uppercase drop-shadow-sm">
                    TĂNG DOANH THU VƯỢT TRỘI
                </span>
                
                {/* Line 2 - Premium Emerald Gradient */}
                <span className="block text-[24px] sm:text-[32px] md:text-[40px] lg:text-[48px] leading-[1.1] uppercase drop-shadow-md text-transparent bg-clip-text bg-gradient-to-br from-[#005c30] via-[#00a862] to-[#005c30] filter brightness-110 mt-1">
                    CÙNG SNACK KHOAI MÔN CVT
                </span>
            </h1>
        </div>
        
        {/* Sub-headline - Clear Value Proposition */}
        <p className="text-[15px] md:text-[18px] font-bold text-gray-600 mb-6 max-w-lg leading-relaxed">
           <span className="text-red-600">Vốn chỉ từ 3 Triệu</span>. Lợi nhuận tới 40%.<br/>
           Hỗ trợ Marketing & Vận chuyển miễn phí.
        </p>
        
        {/* Benefits Box */}
        <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl p-4 md:p-5 mb-6 md:mb-8 shadow-card hover:shadow-lg transition-all duration-300">
            <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-800 font-medium text-[13px] md:text-[14px]">
                    <div className="mt-0.5 p-0.5 bg-green-100 rounded-full text-green-600"><CheckCircle size={14} fill="#e6f7ef" /></div>
                    <span>Hàng nhập khẩu chính ngạch - Giấy tờ đầy đủ</span>
                </li>
                <li className="flex items-start gap-3 text-gray-800 font-medium text-[13px] md:text-[14px]">
                    <div className="mt-0.5 p-0.5 bg-green-100 rounded-full text-green-600"><CheckCircle size={14} fill="#e6f7ef" /></div>
                    <span>Sản phẩm Hot Trend - Dễ bán, quay vòng vốn nhanh</span>
                </li>
            </ul>
        </div>

        {/* CTA Button - USING SUPER CTA (Orange) for Consistency */}
        <div className="flex flex-col gap-3 mb-6 relative z-20 group/btn">
          <Button 
            variant="super-cta" 
            size="lg" 
            onClick={scrollToForm} 
            className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-5"
          >
             <div className="flex flex-col items-center leading-none gap-1">
                 <span className="text-[14px] sm:text-[16px] font-black uppercase tracking-wide flex items-center gap-2 text-center text-white drop-shadow-md">
                    NHẬN BẢNG GIÁ & ƯU ĐÃI
                    <Zap size={20} fill="currentColor" className="text-yellow-200 animate-pulse" /> 
                 </span>
             </div>
          </Button>
          
          {/* Urgency Text - Clarified for "New Distributors" */}
          <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-red-600 pl-1 animate-pulse">
             <UserPlus size={14} />
             <span>Chỉ còn <span className="bg-red-100 px-1 rounded text-red-700 border border-red-200">9 suất</span> ưu đãi Đại lý mới (Mua 10 Tặng 1)</span>
          </div>
        </div>

        {/* SOCIAL PROOF - Specific & Credible */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8 pl-1">
             <div className="flex items-center -space-x-3">
                {AVATARS.map((src, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-100" title="Đại lý mới">
                        <img src={src} alt="Đại lý" className="w-full h-full object-cover" />
                    </div>
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-white bg-green-50 flex items-center justify-center text-[10px] font-bold text-green-700 shadow-sm">
                    +12
                </div>
             </div>
             
             <div className="flex flex-col">
                <div className="flex items-center gap-1">
                    <div className="flex text-yellow-400">
                        {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                    <span className="text-xs font-bold text-gray-800">5.0/5.0</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Từ <strong>100++ Đại lý</strong> trên toàn quốc</p>
             </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 pt-5 border-t border-gray-200/80">
            <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-2 text-center md:text-left h-full">
                <div className="p-2 bg-gray-50 rounded-lg text-green-600 shrink-0"><Box size={18} /></div>
                <span className="text-[10px] md:text-xs font-bold text-gray-700 uppercase leading-tight">Kho hàng<br className="md:hidden" /> Hà Nội</span>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-2 text-center md:text-left h-full">
                <div className="p-2 bg-gray-50 rounded-lg text-green-600 shrink-0"><ShieldCheck size={18} /></div>
                <span className="text-[10px] md:text-xs font-bold text-gray-700 uppercase leading-tight">Pháp lý<br className="md:hidden" /> Minh bạch</span>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-2 text-center md:text-left h-full">
                <div className="p-2 bg-gray-50 rounded-lg text-green-600 shrink-0"><Award size={18} /></div>
                <span className="text-[10px] md:text-xs font-bold text-gray-700 uppercase leading-tight">Đại lý<br className="md:hidden" /> Toàn quốc</span>
            </div>
        </div>
      </div>

      {/* Right Visual Area */}
      <div className="relative h-[420px] sm:h-[500px] md:h-[650px] w-full flex items-center justify-center order-1 lg:order-2 mt-0 lg:mt-0 select-none">
        
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-radial from-orange-200/40 via-green-100/30 to-transparent blur-3xl -z-10"></div>
        
        {/* Back Image */}
        <div className="absolute top-[20px] right-[0px] w-[60%] md:top-[-20px] md:right-[-20px] md:w-[75%] max-w-[420px] z-10 animate-float pointer-events-none opacity-90 md:opacity-100">
             <img 
                src={PRODUCT_IMAGES.packBack} 
                alt="Snack Trứng Muối" 
                className="w-full h-auto drop-shadow-xl filter brightness-[0.9] blur-[0.5px] md:blur-0 rotate-[15deg]" 
                referrerPolicy="no-referrer" 
             />
        </div>

        {/* Front Image */}
        <div className="absolute bottom-[80px] left-10 w-[70%] md:bottom-[40px] md:left-[-30px] md:w-[80%] max-w-[500px] z-20 animate-float-delayed group transition-all duration-500">
             <img 
                src={PRODUCT_IMAGES.packFront} 
                alt="Snack Khoai Môn CVT" 
                className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] md:drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)] -rotate-[5deg] group-hover:rotate-0 group-hover:scale-105 transition-transform duration-700 cursor-pointer" 
                referrerPolicy="no-referrer" 
             />
             
             {/* Best Seller Badge */}
             <div className="absolute top-[-5%] right-[-5%] z-30 pointer-events-none scale-[0.6] md:scale-90 origin-bottom-left">
                <div className="relative w-[120px] h-[120px] md:w-[140px] md:h-[140px] flex items-center justify-center">
                    <div className="absolute inset-0 w-full h-full rounded-full border-[3px] border-red-500 border-dashed animate-[spin_10s_linear_infinite] opacity-60"></div>
                    <div className="relative w-[85%] h-[85%] bg-gradient-to-br from-red-600 via-red-500 to-red-700 rounded-full shadow-[0_10px_20px_rgba(185,28,28,0.5)] flex items-center justify-center border-2 border-white animate-pulse-glow">
                        <div className="text-center text-white transform -rotate-12">
                            <div className="text-[11px] font-bold uppercase tracking-widest text-yellow-300 mb-0.5">Top 1</div>
                            <div className="text-[20px] md:text-[26px] font-black uppercase leading-none drop-shadow-md">BEST<br/>SELLER</div>
                        </div>
                    </div>
                </div>
             </div>
        </div>

        {/* PROMOTION CARD - CLARIFIED "MỌI ĐƠN HÀNG ĐẦU TIÊN" */}
        <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0 md:bottom-[60px] z-50 w-auto">
             <div 
                className="relative group cursor-pointer hover:scale-105 transition-transform duration-300" 
                onClick={scrollToForm}
             >
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_10px_30px_-5px_rgba(220,38,38,0.3)] border border-red-100 p-3 pr-5 min-w-[240px] md:min-w-[280px] ring-2 ring-white/60 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white shadow-md shrink-0 animate-bounce-slight">
                        <Gift size={24} fill="currentColor" className="text-yellow-300" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-0.5">
                            Dành cho mọi đại lý mới
                        </div>
                        <div className="text-2xl font-black text-gray-900 leading-none tracking-tight">
                            MUA 10 <span className="text-red-600">TẶNG 1</span>
                        </div>
                        <div className="text-[9px] font-semibold text-gray-500 mt-1 italic flex items-center gap-1">
                             <Clock size={8} className="text-red-500" /> Ưu đãi có hạn
                        </div>
                    </div>
                </div>
             </div>
        </div>
        
      </div>
    </section>
  );
};

export default Hero;
