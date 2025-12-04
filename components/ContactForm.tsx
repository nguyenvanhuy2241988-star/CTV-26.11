
import React, { useState } from 'react';
import Button from './ui/Button';
import { Send, CheckCircle2, FileText, Download, AlertCircle, Users, Zap } from 'lucide-react';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    province: '',
    type: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://formsubmit.co/ajax/nguyenvanhuy2241988@gmail.com", {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            _subject: "🚀 KHÁCH TẢI BÁO GIÁ GẤP - CVT",
            "Họ tên": formData.fullName,
            "SĐT": formData.phone,
            "Khu vực": formData.province || "Không nhập",
            "Loại hình": formData.type || "Không nhập",
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormData({ fullName: '', phone: '', province: '', type: '' });
        setTimeout(() => setIsSuccess(false), 8000);
      } else {
        alert("Có lỗi kết nối, vui lòng thử lại.");
      }
    } catch (error) {
      alert("Lỗi mạng. Vui lòng kiểm tra lại đường truyền.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-8 lg:gap-12 items-start mb-16 scroll-mt-24">
      
      {/* Left Visual */}
      <div className="pt-0 lg:pt-4 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 text-red-600 font-bold mb-3 uppercase tracking-wider text-[10px] md:text-xs bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-pulse">
            <AlertCircle size={14} />
            <span>Ưu đãi kết thúc trong hôm nay</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-text-main leading-tight uppercase">
          TẢI BÁO GIÁ SỈ <br/>
          <span className="text-[#FF6600]">NHẬP HÀNG NGAY</span>
        </h2>
        <p className="text-text-muted mb-6 md:mb-8 text-sm md:text-base leading-relaxed">
            Để lại thông tin để nhận Bảng Giá Sỉ & Chính sách "Mua 10 Tặng 1" qua Zalo ngay lập tức.
        </p>

        <div className="bg-orange-50 rounded-2xl p-5 md:p-6 border border-orange-200 relative overflow-hidden text-left">
             <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-200 rounded-full opacity-50 blur-xl"></div>
             <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2 text-sm md:text-base">
                <FileText size={18} /> Bạn sẽ nhận được:
             </h4>
             <ul className="space-y-2 text-sm text-gray-700 mb-4">
                 <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5"/> <span>Bảng giá sỉ theo từng mức số lượng</span></li>
                 <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5"/> <span>Catalog hình ảnh & thông số sản phẩm</span></li>
                 <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5"/> <span>Tư vấn nhập hàng 1:1 theo khu vực và nhu cầu của bạn.</span></li>
             </ul>
             <div className="text-sm font-bold text-red-600 pt-3 border-t border-orange-200">
                Hotline Ưu Tiên: 0969.069.798
             </div>
        </div>
      </div>

      {/* Right Form - SIMPLIFIED & OPTIMIZED */}
      <div className="bg-white rounded-3xl p-5 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF6600] text-white text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border-2 border-white whitespace-nowrap z-20">
            Chỉ mất 30 giây để điền
        </div>

        {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-2xl border border-green-100 animate-in fade-in zoom-in">
                <CheckCircle2 size={48} className="text-green-600 mb-4" />
                <h4 className="text-xl font-bold text-green-800 mb-2">Đăng ký thành công!</h4>
                <p className="text-gray-600 text-sm">Bộ phận kinh doanh sẽ gửi báo giá qua Zalo SĐT bạn vừa nhập trong 5 phút nữa.</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-3">
            
            {/* Name & Phone - The most important fields */}
            <div className="space-y-4">
                <div>
                    <input 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        required 
                        placeholder="Họ và tên của bạn *" 
                        className="w-full rounded-lg border border-gray-300 px-4 py-3.5 text-base focus:border-[#FF6600] focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-gray-50 focus:bg-white placeholder:text-gray-400" 
                        style={{ fontSize: '16px' }}
                    />
                </div>
                <div>
                    <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        required 
                        placeholder="Số điện thoại (Zalo) *" 
                        className="w-full rounded-lg border border-gray-300 px-4 py-3.5 text-base focus:border-[#FF6600] focus:ring-2 focus:ring-orange-100 outline-none transition-all bg-gray-50 focus:bg-white placeholder:text-gray-400" 
                        style={{ fontSize: '16px' }}
                    />
                </div>
            </div>
            
            {/* Optional Fields - Smaller/Less prominent */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <input 
                        type="text" 
                        name="province" 
                        value={formData.province} 
                        onChange={handleChange} 
                        placeholder="Khu vực (Tùy chọn)" 
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#FF6600] outline-none transition-all"
                    />
                </div>
                <div>
                    <select 
                        name="type" 
                        value={formData.type} 
                        onChange={handleChange} 
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#FF6600] outline-none transition-all bg-white text-gray-600"
                    >
                        <option value="">Mô hình (Tùy chọn)</option>
                        <option value="Đại lý / NPP">Nhà Phân Phối</option>
                        <option value="Tạp hóa / Minimart">Tạp hóa / Minimart</option>
                        <option value="Cafe / F&B">Cafe / F&B</option>
                    </select>
                </div>
            </div>

            <Button type="submit" variant="super-cta" disabled={isSubmitting} className="w-full justify-center py-4 text-base uppercase font-extrabold tracking-wide mt-2">
                {isSubmitting ? 'Đang xử lý...' : <><Download size={20} /> TẢI BÁO GIÁ NGAY</>}
            </Button>
            
            {/* Trust Note */}
            <div className="flex items-center justify-center gap-2 mt-2">
                 <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Zap size={10} fill="currentColor" className="text-yellow-500" />
                    Cam kết bảo mật thông tin 100%
                 </p>
            </div>
            </form>
        )}
      </div>
    </section>
  );
};

export default ContactForm;
