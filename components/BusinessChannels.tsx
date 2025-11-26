
import React, { useState } from 'react';
import SectionHeading from './ui/SectionHeading';
import Button from './ui/Button';
import { Store, Coffee, Film, Gift, Calculator, CheckCircle2, Download, TrendingUp, Wallet, Clock } from 'lucide-react';

const BusinessChannels: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<'starter' | 'shop' | 'npp'>('shop');

  const scenarios = {
    starter: {
      id: 'starter',
      name: 'Đại Lý Khởi Nghiệp',
      von: '3.000.000 đ',
      loinhuan: '750.000 đ',
      phantram: '25%',
      desc: 'Phù hợp để test thị trường hoặc các Shop nhỏ nhập thử.',
      color: 'bg-gray-600'
    },
    shop: {
      id: 'shop',
      name: 'Tạp Hóa / Cafe',
      von: '10.000.000 đ',
      loinhuan: '3.500.000 đ',
      phantram: '35%',
      desc: 'Dành cho Minimart, Quán Cafe, Rạp phim, Căng tin.',
      color: 'bg-green-600'
    },
    npp: {
      id: 'npp',
      name: 'Nhà Phân Phối',
      von: '50.000.000 đ',
      loinhuan: '20.000.000 đ+',
      phantram: '40%++',
      desc: 'Phân phối độc quyền khu vực, đổ buôn cấp tỉnh.',
      color: 'bg-yellow-600'
    }
  };

  const current = scenarios[activeScenario];

  const channels = [
    { 
        icon: <Store size={20} />, 
        title: 'Minimart', 
        image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80'
    },
    { 
        icon: <Gift size={20} />, 
        title: 'Quà tặng', 
        image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80'
    },
    { 
        icon: <Coffee size={20} />, 
        title: 'Cafe / F&B', 
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'
    },
    { 
        icon: <Film size={20} />, 
        title: 'Rạp phim', 
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'
    },
  ];

  const scrollToForm = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="business" className="mb-24">
      <SectionHeading
        title="Kênh Bán & Lợi Nhuận"
        description="Sản phẩm phù hợp trưng bày tại nhiều mô hình kinh doanh khác nhau."
      />
      
      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
        {channels.map((item, idx) => (
          <div key={idx} className="group relative h-[140px] md:h-[200px] rounded-2xl overflow-hidden shadow-card cursor-pointer">
            <div className="absolute inset-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all"></div>
            </div>
            <div className="absolute bottom-0 left-0 p-3 md:p-4 text-white w-full">
                <div className="flex items-center gap-2 mb-1">
                   <div className="p-1.5 bg-white/20 backdrop-blur rounded-lg scale-90 md:scale-100 origin-left">{item.icon}</div>
                   <h3 className="font-bold text-xs md:text-base">{item.title}</h3>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calculator - Optimized for Mobile (Compact) */}
      <div className="bg-[#0f172a] rounded-xl md:rounded-[24px] p-3 md:p-8 shadow-2xl text-white relative overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-4 md:gap-8 items-start relative z-10">
            
            {/* Left: Intro */}
            <div className="space-y-1 md:space-y-4 px-1">
                <div className="inline-flex items-center gap-2 text-green-400 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-green-900/30 px-3 py-1 rounded-full">
                  <Calculator size={14} /> Công cụ tính toán
                </div>
                <div>
                    <h3 className="font-bold text-lg md:text-3xl leading-tight mb-1 md:mb-2">
                        Ước Tính Lợi Nhuận
                    </h3>
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                        Nhập số lượng để xem chiết khấu & lợi nhuận ngay lập tức.
                    </p>
                </div>
                <div className="hidden lg:block">
                     <Button onClick={scrollToForm} variant="shimmer" size="sm" className="w-full sm:w-auto">
                        <Download size={16} /> Tải bảng giá chi tiết
                    </Button>
                     <p className="text-[10px] text-green-400 mt-2 flex items-center gap-1">
                        <Clock size={10} /> Giá nhập ưu đãi số lượng có hạn
                    </p>
                </div>
            </div>

            {/* Right: Interactive Panel */}
            <div className="bg-white/5 backdrop-blur rounded-lg md:rounded-2xl p-2 md:p-6 border border-white/10">
                {/* Tabs - Mobile horizontal scroll */}
                <div className="flex bg-black/40 rounded md:rounded-xl p-1 md:p-1.5 mb-2 md:mb-6 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                    {(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((key) => (
                        <button
                            key={key}
                            onClick={() => setActiveScenario(key)}
                            className={`flex-1 py-1.5 md:py-2 px-2 md:px-3 text-[10px] sm:text-sm font-bold rounded md:rounded-lg whitespace-nowrap transition-all flex-shrink-0 snap-start border ${
                                activeScenario === key 
                                ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/50' 
                                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {scenarios[key].name}
                        </button>
                    ))}
                </div>

                {/* Calculation Result Grid - Compact Mobile */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-2 md:mb-5">
                    {/* Vốn Box */}
                    <div className="bg-slate-800/50 rounded md:rounded-xl p-2 md:p-4 border border-slate-700 flex flex-col justify-between group hover:border-slate-600 transition-colors">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] md:text-xs font-bold uppercase mb-1 md:mb-2">
                            <Wallet size={12} className="md:w-[14px] md:h-[14px]" /> Vốn Nhập
                        </div>
                        <div className="text-sm md:text-2xl font-bold text-white tracking-tight truncate">{current.von}</div>
                        <div className="h-0.5 md:h-1 w-full bg-slate-700 mt-2 md:mt-3 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-400 w-full opacity-50"></div>
                        </div>
                    </div>

                    {/* Lợi Nhuận Box */}
                    <div className="bg-gradient-to-br from-green-900/80 to-green-800/80 rounded md:rounded-xl p-2 md:p-4 border border-green-500/30 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-green-900/20">
                         {/* Shine effect */}
                         <div className="absolute top-0 right-0 -mr-4 -mt-4 w-12 h-12 md:w-20 md:h-20 bg-green-400/20 blur-xl md:blur-2xl rounded-full"></div>
                         
                         <div className="flex flex-col md:flex-row md:items-center justify-between text-green-200 text-[10px] md:text-xs font-bold uppercase mb-1 md:mb-2 relative z-10 gap-1">
                            <div className="flex items-center gap-1.5"><TrendingUp size={12} className="md:w-[14px] md:h-[14px]" /> Lợi nhuận</div>
                            <span className="bg-green-500 text-white px-1 md:px-1.5 py-0.5 rounded text-[8px] md:text-[9px] w-fit">+{current.phantram}</span>
                        </div>
                        <div className="text-base md:text-3xl font-black text-green-400 tracking-tight relative z-10 truncate">{current.loinhuan}</div>
                         <div className="h-0.5 md:h-1 w-full bg-green-900/50 mt-2 md:mt-3 rounded-full overflow-hidden relative z-10">
                            <div className="h-full bg-green-400 w-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
                
                {/* Note */}
                <div className="bg-blue-900/20 p-2 md:p-3 rounded md:rounded-lg border border-blue-500/10 flex gap-2 md:gap-3 items-start">
                     <CheckCircle2 className="text-blue-400 shrink-0 mt-0.5" size={12} />
                     <p className="text-[10px] md:text-sm text-blue-100 leading-relaxed opacity-90">{current.desc}</p>
                </div>

                {/* Mobile Button - Shown only on small screens */}
                <div className="mt-3 lg:hidden">
                    <Button onClick={scrollToForm} variant="shimmer" size="sm" className="w-full justify-center text-xs py-2 h-[36px]">
                        <Download size={14} /> Tải bảng giá chi tiết
                    </Button>
                </div>
            </div>

          </div>
      </div>
    </section>
  );
};

export default BusinessChannels;
