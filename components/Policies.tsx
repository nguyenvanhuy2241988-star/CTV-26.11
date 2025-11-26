
import React from 'react';
import SectionHeading from './ui/SectionHeading';
import Button from './ui/Button';
import { Check, Crown, Shield, Zap, Gift, Truck, Megaphone, Clock } from 'lucide-react';

const Policies: React.FC = () => {
  const scrollToForm = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="policies" className="mb-24">
      <SectionHeading
        title="Chính Sách Hợp Tác"
        description="Cơ chế minh bạch, không áp doanh số tháng đầu. Nhập hàng là có lãi."
      />

      {/* CLARIFICATION BANNER */}
      <div className="max-w-[900px] mx-auto bg-red-50 border border-red-200 rounded-xl p-3 md:p-4 mb-8 flex items-center gap-3 animate-pulse-glow shadow-sm">
          <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
              <Megaphone size={20} />
          </div>
          <p className="text-sm md:text-base text-red-800 font-medium">
              <strong>🔥 HOT:</strong> Ưu đãi <span className="font-black text-red-600">MUA 10 TẶNG 1</span> áp dụng cho <strong>Đơn hàng đầu tiên</strong> của <strong>TẤT CẢ</strong> các cấp đại lý (Bạc, Vàng & VIP)!
          </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-start">
        
        {/* SILVER */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all mt-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <Shield size={16} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Đại Lý Bạc</h3>
                    <div className="text-xs text-gray-500">Vốn 3 - 5 triệu</div>
                </div>
            </div>
            {/* Gift Note */}
            <div className="bg-red-50 rounded-lg p-2 mb-4 text-xs font-bold text-red-600 flex items-center gap-1.5">
                 <Gift size={12} /> Đơn đầu: Mua 10 Tặng 1
            </div>
            <div className="space-y-3 mb-6">
                <p className="text-sm flex items-center gap-2 text-gray-600"><Check size={14} className="text-green-500"/> Chiết khấu <strong>25%</strong></p>
                <p className="text-sm flex items-center gap-2 text-gray-600"><Check size={14} className="text-green-500"/> Hỗ trợ hình ảnh, bài đăng</p>
                <p className="text-sm flex items-center gap-2 text-gray-600"><Check size={14} className="text-green-500"/> Đổi trả lỗi NSX</p>
            </div>
            <Button variant="outline" onClick={scrollToForm} size="sm" className="w-full border-gray-200">Đăng ký ngay</Button>
        </div>

        {/* GOLD (Featured) */}
        <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] rounded-2xl p-8 shadow-2xl shadow-blue-900/20 text-white border border-gray-700 relative transform md:-translate-y-2 z-10">
            <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wide">
                Phổ biến nhất
            </div>
            
            <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black shadow-lg">
                    <Crown size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-extrabold text-white">NPP Vàng</h3>
                    <div className="text-xs text-gray-400">Vốn từ 20 triệu</div>
                </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                    <Gift className="text-yellow-400" size={18} />
                    <span className="font-bold text-yellow-400 text-sm">ƯU ĐÃI ĐẶC BIỆT</span>
                </div>
                <div className="text-2xl font-black text-white mb-1">MUA 10 TẶNG 1</div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={10} className="text-yellow-500" /> Ưu đãi sắp kết thúc
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <p className="text-sm flex items-center gap-3 text-gray-200"><Check size={16} className="text-green-400"/> Chiết khấu <strong>Lên tới 40%</strong></p>
                <p className="text-sm flex items-center gap-3 text-gray-200"><Check size={16} className="text-green-400"/> <strong>Độc quyền</strong> khu vực bán</p>
                <p className="text-sm flex items-center gap-3 text-gray-200"><Truck size={16} className="text-green-400"/> <strong>Freeship</strong> toàn quốc</p>
            </div>

            <Button variant="super-cta" onClick={scrollToForm} className="w-full font-bold py-4">
                NHẬP HÀNG NGAY
            </Button>
            <p className="text-center text-[10px] text-gray-400 mt-2 italic">
               *Ưu tiên xử lý hồ sơ NPP Vàng trước
            </p>
        </div>

        {/* VIP */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all mt-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <Zap size={16} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Tổng Thầu</h3>
                    <div className="text-xs text-gray-500">Cam kết doanh số</div>
                </div>
            </div>
            {/* Gift Note */}
             <div className="bg-red-50 rounded-lg p-2 mb-4 text-xs font-bold text-red-600 flex items-center gap-1.5">
                 <Gift size={12} /> Đơn đầu: Mua 10 Tặng 1
            </div>
            <div className="space-y-3 mb-6">
                <p className="text-sm flex items-center gap-2 text-gray-600"><Check size={14} className="text-green-500"/> Chiết khấu <strong>VVIP</strong></p>
                <p className="text-sm flex items-center gap-2 text-gray-600"><Check size={14} className="text-green-500"/> Thưởng quý/năm</p>
                <p className="text-sm flex items-center gap-2 text-gray-600"><Check size={14} className="text-green-500"/> Hỗ trợ Sale thị trường</p>
            </div>
            <Button variant="outline" onClick={scrollToForm} size="sm" className="w-full border-gray-200">Liên hệ riêng</Button>
        </div>
      </div>
    </section>
  );
};

export default Policies;
