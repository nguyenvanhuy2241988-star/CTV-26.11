
import React from 'react';
import Button from './ui/Button';
import { MapPin, ArrowRight, Plane, Factory, ShieldCheck, Video, Truck, Warehouse, CheckCircle2 } from 'lucide-react';

const Journey: React.FC = () => {
  const scrollToForm = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Real Factory Images - Updated with new links
  const FACTORY_IMAGES = {
    main: "https://lh3.googleusercontent.com/d/1xakvAvBt-2mb0ggJ_9IHoSLlzv9N8VBn", // Ảnh nhà máy mới
    production: "https://lh3.googleusercontent.com/d/1oEzT0ZrvlO776-fZPYu6LUo4AR9BKPZh", // Ảnh dây chuyền mới
    raw: "https://lh3.googleusercontent.com/d/1UscUs0gj7chRaOKkZjOoiepUU_3Od45G",
    slice: "https://lh3.googleusercontent.com/d/17lz_7kc-G64zYl7SUAWd0bA1qQCXa6ou",
    packing: "https://lh3.googleusercontent.com/d/1YMdKDVSBT7my4JOQW0NJdL0KeUweAJF-",
  };

  return (
    <section id="journey" className="mb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Visual Area: Factory Collage */}
        <div className="flex flex-col gap-4">
            
            {/* Main Card - Factory Stats */}
            <div className="relative rounded-[32px] overflow-hidden h-[280px] sm:h-[340px] shadow-soft group bg-gray-900">
                <img 
                    src={FACTORY_IMAGES.main} 
                    alt="Nhà máy CVT"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center animate-float shadow-lg">
                    <Factory className="text-white" size={20} />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider mb-3 border border-green-400 shadow-lg">
                        <CheckCircle2 size={12} /> Nhà máy 5 Triệu USD
                    </span>
                    <h3 className="text-2xl font-bold mb-4 leading-tight">Quy mô sản xuất hàng đầu</h3>
                    
                    {/* Factory Stats Grid */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 border-t border-white/20 pt-4">
                        <div>
                            <div className="text-lg font-black text-green-400">14.000 m²</div>
                            <div className="text-[10px] text-gray-300 uppercase font-bold tracking-wide">Diện tích</div>
                        </div>
                        <div>
                            <div className="text-lg font-black text-orange-400">16 Dây chuyền</div>
                            <div className="text-[10px] text-gray-300 uppercase font-bold tracking-wide">Sản xuất</div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-lg font-black text-blue-400">2.000 Tấn</div>
                            <div className="text-[10px] text-gray-300 uppercase font-bold tracking-wide">Kho lạnh bảo quản</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub Images - Clean Grid */}
            <div className="grid grid-cols-4 gap-2">
                {[FACTORY_IMAGES.production, FACTORY_IMAGES.raw, FACTORY_IMAGES.slice, FACTORY_IMAGES.packing].map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100 border border-gray-100 cursor-pointer shadow-sm">
                        <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                        {idx === 0 && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                                <Video size={20} className="text-white drop-shadow-md" fill="currentColor" />
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Steps List - Detailed Process */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-card border border-[#e2e8f0e6] flex flex-col justify-center">
          <h3 className="text-xl md:text-2xl font-bold mb-8 text-text-main leading-tight">
            Quy trình kiểm soát 3 bước <br/>
            <span className="text-green-600 text-lg md:text-xl font-normal">Từ Nhà Máy Trung Quốc đến Đại Lý Việt Nam</span>
          </h3>
          
          <div className="space-y-8 relative mb-8">
            {/* Connecting Line */}
            <div className="absolute left-[19px] top-4 bottom-8 w-[2px] bg-gray-100 -z-10"></div>

            {/* Step 1 */}
            <div className="flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-md bg-purple-100 text-purple-600 z-10 group-hover:scale-110 transition-transform">
                    <Factory size={18} />
                </div>
                <div className="pt-1">
                    <div className="text-base font-bold text-gray-900 uppercase tracking-tight">Sản xuất & đóng gói (TQ)</div>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc pl-4 marker:text-gray-300">
                        <li>Công nghệ <strong>VF chiên chân không</strong> nhiệt độ thấp.</li>
                        <li>Đóng gói hoàn thiện tại nhà máy, bảo quản nhiệt độ thường.</li>
                        <li>Đầy đủ CO, CQ, tiêu chuẩn kiểm nghiệm & mã truy xuất.</li>
                    </ul>
                </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start group">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-md bg-blue-100 text-blue-600 z-10 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={18} />
                </div>
                <div className="pt-1">
                    <div className="text-base font-bold text-gray-900 uppercase tracking-tight">Nhập khẩu & Kiểm định (VN)</div>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc pl-4 marker:text-gray-300">
                        <li>CVT nhập khẩu <strong>chính ngạch</strong>, đầy đủ thủ tục hải quan.</li>
                        <li>Kiểm định chất lượng, công bố & dán tem phụ đúng quy định.</li>
                        <li>Lưu kho bảo quản tiêu chuẩn, đảm bảo chất lượng ổn định.</li>
                    </ul>
                </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start group">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-md bg-green-100 text-green-600 z-10 group-hover:scale-110 transition-transform">
                    <Truck size={18} />
                </div>
                <div className="pt-1">
                    <div className="text-base font-bold text-gray-900 uppercase tracking-tight">Phân phối nhanh (1–4 ngày)</div>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc pl-4 marker:text-gray-300">
                        <li>Xuất hàng từ kho VN đến đại lý trong <strong>1–4 ngày</strong>.</li>
                        <li>Cung cấp đủ: Hóa đơn VAT, hồ sơ pháp lý, hình ảnh.</li>
                        <li>Quy trình giao nhận rõ ràng, dễ theo dõi.</li>
                    </ul>
                </div>
            </div>
          </div>

          <div className="mt-auto">
            <Button variant="outline" onClick={scrollToForm} className="w-full sm:w-auto group border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700">
              Nhận hồ sơ năng lực & pháp lý <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;
