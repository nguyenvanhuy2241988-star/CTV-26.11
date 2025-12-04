
import React from 'react';
import { MapPin } from 'lucide-react';

const TrustedPartners: React.FC = () => {
  const locations = [
    "Hà Nội", 
    "Hải Phòng", 
    "Nghệ An", 
    "Đà Nẵng", 
    "Tp Hồ Chí Minh", 
    "Bình Dương"
  ];

  return (
    <section className="py-6 border-b border-gray-100 bg-white">
      <div className="max-w-[1120px] mx-auto px-5">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
          Sản phẩm đã có mặt tại tỉnh thành
        </p>
        
        {/* Mobile: Horizontal Scroll, Desktop: Centered */}
        <div className="flex overflow-x-auto gap-3 md:gap-4 md:justify-center items-center pb-2 md:pb-0 no-scrollbar mask-gradient-x">
          {locations.map((loc, i) => (
            <div key={i} className="flex-shrink-0 group">
               {/* Location Pill */}
               <div className="h-8 md:h-10 px-4 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm md:text-base whitespace-nowrap group-hover:bg-green-50 group-hover:text-green-700 group-hover:border-green-200 transition-all cursor-default shadow-sm">
                  <MapPin size={14} className="mr-1.5 opacity-50 group-hover:opacity-100 group-hover:text-green-600" /> 
                  {loc}
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedPartners;
