
import React from 'react';

const TrustedPartners: React.FC = () => {
  // Logo placeholder using text styling for demo purposes (in real app use actual SVGs/Images)
  const partners = [
    { name: "Bách Hoá Xanh", type: "Chuỗi siêu thị" },
    { name: "Circle K", type: "Cửa hàng tiện lợi" },
    { name: "GS25", type: "Cửa hàng tiện lợi" },
    { name: "Aeon Mall", type: "Trung tâm thương mại" },
    { name: "Kenh14", type: "Truyền thông" },
    { name: "Fuji Mart", type: "Siêu thị Nhật Bản" }
  ];

  return (
    <section className="py-6 border-b border-gray-100 bg-white">
      <div className="max-w-[1120px] mx-auto px-5">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Đối tác phân phối & Truyền thông tin cậy
        </p>
        
        {/* Mobile: Horizontal Scroll, Desktop: Grid */}
        <div className="flex overflow-x-auto gap-8 md:gap-12 md:justify-center items-center pb-2 md:pb-0 no-scrollbar mask-gradient-x">
          {partners.map((p, i) => (
            <div key={i} className="flex-shrink-0 flex items-center gap-2 group opacity-50 hover:opacity-100 transition-opacity cursor-default grayscale hover:grayscale-0">
               {/* Simulated Logo Box */}
               <div className="h-8 md:h-10 px-4 bg-gray-100 rounded border border-gray-200 flex items-center justify-center font-black text-gray-500 text-sm md:text-lg whitespace-nowrap group-hover:bg-white group-hover:shadow-sm group-hover:text-gray-800 transition-all">
                  {p.name}
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedPartners;
