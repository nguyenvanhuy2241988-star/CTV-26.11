
import React from 'react';
import Button from './ui/Button';

const Navbar: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Link ảnh logo trực tiếp từ Google Drive
  const LOGO_URL = "https://lh3.googleusercontent.com/d/15nhC20zE7ulpESkh_WfjWNrr9Hkrff8A";

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-[#ecf0f6] sticky top-[52px] sm:top-[44px] z-40 shadow-sm transition-all duration-300">
      <div className="max-w-[1120px] mx-auto px-4 md:px-5 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer flex-shrink-0" onClick={() => scrollToSection('home')}>
          {/* Logo Image */}
          <img 
            src={LOGO_URL} 
            alt="Logo CVT Việt Nam" 
            className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <div className="font-extrabold text-[15px] md:text-lg tracking-wide leading-none text-text-main">CVT VIỆT NAM</div>
            <div className="text-[10px] md:text-[13px] text-text-muted leading-tight mt-0.5 font-medium">Snack Khoai Môn Nhập Khẩu</div>
          </div>
        </div>

        {/* Simplified Nav - Only CTA focused */}
        <div className="flex items-center gap-3">
          {/* Hidden on very small screens to save space, visible on mobile+ */}
          <div className="hidden sm:block text-right mr-2">
             <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Hotline hỗ trợ</div>
             <div className="text-sm font-bold text-red-600">0969.069.798</div>
          </div>
          <Button onClick={() => scrollToSection('contact')} className="shadow-lg shadow-green-600/20">
            Tải Báo Giá Sỉ
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
