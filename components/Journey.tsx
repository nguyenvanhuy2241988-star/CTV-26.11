
import React from 'react';
import Button from './ui/Button';
import { MapPin, ArrowRight, Plane, Factory, ShieldCheck, Video } from 'lucide-react';

const Journey: React.FC = () => {
  const scrollToForm = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Real Factory Images
  const FACTORY_IMAGES = {
    main: "https://lh3.googleusercontent.com/d/1pGY4fVPMa05VKnABvUAhyNP4vELPO6c8", 
    worker: "https://lh3.googleusercontent.com/d/16sPT6vYB5MAWeiZb3NUWfCvB_jAjvX5b",
    raw: "https://lh3.googleusercontent.com/d/1UscUs0gj7chRaOKkZjOoiepUU_3Od45G",
    slice: "https://lh3.googleusercontent.com/d/17lz_7kc-G64zYl7SUAWd0bA1qQCXa6ou",
    packing: "https://lh3.googleusercontent.com/d/1YMdKDVSBT7my4JOQW0NJdL0KeUweAJF-",
  };

  return (
    <section id="journey" className="mb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Visual Area: Factory Collage */}
        <div className="flex flex-col gap-4">
            
            {/* Main Card */}
            <div className="relative rounded-[32px] overflow-hidden h-[260px] sm:h-[300px] shadow-soft group bg-gray-900">
                <img 
                    src={FACTORY_IMAGES.main} 
                    alt="Nhà máy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center animate-float">
                    <Plane className="text-white" size={18} />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-5 text-white">
                    <span className="inline-block px-2.5 py-1 bg-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider mb-2 border border-white/20">
                        Chính ngạch 100%
                    </span>
                    <h3 className="text-xl font-bold mb-3 leading-tight">Nhà máy khép kín hiện đại</h3>
                    <div className="flex gap-6 border-t border-white/20 pt-3">
                        <div>
                            <div className="text-lg font-bold text-green-400">100k</div>
                            <div className="text-[9px] text-gray-300 uppercase">Gói / Ngày</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-orange-400">48h</div>
                            <div className="text-[9px] text-gray-300 uppercase">Vận chuyển</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub Images - Clean Grid */}
            <div className="grid grid-cols-4 gap-2">
                {[FACTORY_IMAGES.raw, FACTORY_IMAGES.slice, FACTORY_IMAGES.packing, FACTORY_IMAGES.worker].map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100 border border-gray-100 cursor-pointer">
                        <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                        {idx === 3 && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                                <Video size={16} className="text-white drop-shadow-md" fill="currentColor" />
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Steps List - Shortened Text */}
        <div className="bg-white rounded-[32px] p-6 shadow-card border border-[#e2e8f0e6] flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-6 text-text-main">Quy trình kiểm soát 3 bước</h3>
          
          <div className="space-y-8 relative mb-8">
            {/* Connecting Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gray-100 -z-10"></div>

            <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm bg-purple-100 text-purple-600 z-10">
                    <Factory size={18} />
                </div>
                <div className="pt-1">
                    <div className="text-base font-bold text-text-main">Chế biến tiêu chuẩn</div>
                    <div className="text-sm text-text-muted mt-1">Công nghệ chiên chân không giữ 98% dưỡng chất tự nhiên.</div>
                </div>
            </div>

            <div className="flex gap-4 items-start">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm bg-blue-100 text-blue-600 z-10">
                    <ShieldCheck size={18} />
                </div>
                <div className="pt-1">
                    <div className="text-base font-bold text-text-main">Pháp lý minh bạch</div>
                    <div className="text-sm text-text-muted mt-1">Đầy đủ CO/CQ, VAT, Tem phụ. Đạt chuẩn VSATTP.</div>
                </div>
            </div>

            <div className="flex gap-4 items-start">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm bg-green-100 text-green-600 z-10">
                    <MapPin size={18} />
                </div>
                <div className="pt-1">
                    <div className="text-base font-bold text-text-main">Phân phối hỏa tốc</div>
                    <div className="text-sm text-text-muted mt-1">Kho Hà Nội sẵn hàng 1000 tấn. Giao toàn quốc 2-4 ngày.</div>
                </div>
            </div>
          </div>

          <div className="mt-auto">
            <Button variant="outline" onClick={scrollToForm} className="w-full sm:w-auto group border-gray-200">
              Nhận hồ sơ pháp lý <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;
