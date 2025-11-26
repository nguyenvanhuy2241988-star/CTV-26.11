
import React, { useState, useEffect } from 'react';
import { User, MapPin, CheckCircle } from 'lucide-react';

const FomoToast: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [info, setInfo] = useState({ name: '', location: '', role: '' });

  const names = ['Nguyễn Văn A.', 'Trần Thị B.', 'Lê Hoàng N.', 'Phạm Minh T.', 'Hoàng Văn K.', 'Đỗ Thị H.'];
  const locations = ['Hà Nội', 'TP. HCM', 'Đồng Nai', 'Hải Phòng', 'Đà Nẵng', 'Bình Dương', 'Cần Thơ'];
  const roles = ['Đại lý Khởi Nghiệp', 'NPP Cấp 1', 'Đại lý Độc quyền', 'Điểm bán lẻ'];

  useEffect(() => {
    // Initial delay
    const initialTimeout = setTimeout(() => {
      triggerNotification();
    }, 3000);

    const interval = setInterval(() => {
      triggerNotification();
    }, 12000); // Show every 12 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const triggerNotification = () => {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomLoc = locations[Math.floor(Math.random() * locations.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    
    setInfo({ name: randomName, location: randomLoc, role: randomRole });
    setVisible(true);

    // Hide after 4 seconds
    setTimeout(() => {
      setVisible(false);
    }, 4000);
  };

  return (
    <div 
      className={`fixed bottom-24 md:bottom-4 left-4 z-40 transition-all duration-700 transform ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-sm p-3 pr-5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-green/20 flex items-center gap-3 max-w-[320px]">
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-glow">
          <User size={20} />
        </div>
        <div>
          <div className="text-xs text-text-muted flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             Vừa đăng ký
          </div>
          <div className="text-sm font-bold text-text-main leading-tight">
            {info.name} <span className="font-normal">từ</span> {info.location}
          </div>
          <div className="text-[11px] text-green-dark font-semibold flex items-center gap-1 mt-0.5">
            <CheckCircle size={10} /> Đăng ký {info.role}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FomoToast;
