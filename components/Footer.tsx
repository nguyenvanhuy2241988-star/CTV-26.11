
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 text-xs text-text-muted">
      <div className="max-w-[1120px] mx-auto px-5 flex flex-wrap justify-between items-center gap-3">
        <div>
          © 2025 Công ty TNHH LYHU – Đơn vị nhập khẩu & phân phối độc quyền Snack Khoai Môn CVT tại Việt Nam.
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-green-dark transition-colors">Điều khoản</a>
          <a href="#" className="hover:text-green-dark transition-colors">Chính sách bảo mật</a>
          <span className="opacity-50">CVT Việt Nam</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
