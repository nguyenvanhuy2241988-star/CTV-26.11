
import React from 'react';
import { Quote, Star, Users, Package, Map, BadgeCheck } from 'lucide-react';
import SectionHeading from './ui/SectionHeading';

const Testimonials: React.FC = () => {
  const reviews = [
    { 
      quote: "Vị trứng muối ăn lạ, giòn nhưng không quá mặn. Khách bên mình mua thử lần đầu rồi quay lại mua thêm rất nhiều. Hàng đi nhanh hơn mình nghĩ, nhập về 1 tuần đã hết veo.", 
      author: "Chị Hoàng Hà", 
      role: "Chủ Minimart",
      location: "Thanh Xuân, Hà Nội",
      img: "https://ui-avatars.com/api/?name=Hoang+Ha&background=ec4899&color=fff&size=128",
      verified: true
    },
    { 
      quote: "Mình tìm nguồn hàng snack cao cấp để bổ sung vào menu quán Cafe. Snack CVT bao bì đẹp, vị Truffle rất sang, khách khen ngon. Lợi nhuận bán lẻ tốt hơn các loại snack thông thường.", 
      author: "Anh Tuấn", 
      role: "Chủ Chuỗi Cafe",
      location: "Quận 1, TP.HCM",
      img: "https://ui-avatars.com/api/?name=Anh+Tuan&background=3b82f6&color=fff&size=128",
      verified: true
    },
    { 
      quote: "Làm quà Tết hay đóng giỏ quà rất hợp vì gói to đẹp, sang trọng. Mình nhập thử 50 thùng dịp Tết vừa rồi bán rất chạy. Giấy tờ nhập khẩu đầy đủ nên yên tâm.", 
      author: "Chị Mai Phương", 
      role: "NPP Quà Tặng Doanh Nghiệp",
      location: "Hải Châu, Đà Nẵng",
      img: "https://ui-avatars.com/api/?name=Mai+Phuong&background=f97316&color=fff&size=128",
      verified: true
    }
  ];

  return (
    <section className="relative pt-12 pb-16 bg-gradient-to-b from-gray-50 to-white">
      
      {/* 1. Stats Section - REAL NUMBERS - Floating overlap from previous section */}
      <div className="max-w-[1120px] mx-auto px-4 sm:px-5">
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-6 md:p-8 mb-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center transform md:-translate-y-24 relative z-20">
            <div className="flex flex-col items-center gap-1 group">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-full mb-1 group-hover:scale-110 transition-transform"><Users size={24} /></div>
              <div className="text-2xl md:text-3xl font-black text-gray-900">50+</div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Chuỗi siêu thị</div>
            </div>
            <div className="flex flex-col items-center gap-1 group">
              <div className="bg-green-50 text-green-600 p-3 rounded-full mb-1 group-hover:scale-110 transition-transform"><Package size={24} /></div>
              <div className="text-2xl md:text-3xl font-black text-gray-900">10 Triệu+</div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Gói bán ra/Năm</div>
            </div>
            <div className="flex flex-col items-center gap-1 group">
              <div className="bg-orange-50 text-orange-600 p-3 rounded-full mb-1 group-hover:scale-110 transition-transform"><Map size={24} /></div>
              <div className="text-2xl md:text-3xl font-black text-gray-900">34</div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tỉnh thành phủ sóng</div>
            </div>
            <div className="flex flex-col items-center gap-1 group">
              <div className="bg-yellow-50 text-yellow-600 p-3 rounded-full mb-1 group-hover:scale-110 transition-transform"><Star size={24} /></div>
              <div className="text-2xl md:text-3xl font-black text-gray-900">98%</div>
              <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Khách hàng hài lòng</div>
            </div>
        </div>

        {/* Disclaimer Note */}
        <div className="text-center transform md:-translate-y-20 relative z-10 mb-12 md:mb-4">
            <p className="text-[10px] md:text-xs text-gray-400 italic">
                *Số liệu ghi nhận tại thị trường Trung Quốc
            </p>
        </div>

        {/* 2. Reviews Section */}
        <div className="relative mt-[-20px]">
          <SectionHeading 
            title="Đối Tác Nói Gì Về Chúng Tôi?" 
            description="Lắng nghe chia sẻ từ những người kinh doanh thực chiến đã thành công với sản phẩm CVT." 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {reviews.map((item, idx) => (
              <div key={idx} className="flex flex-col bg-white rounded-2xl p-6 md:p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 relative group">
                  
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-8 text-gray-100 group-hover:text-green-50 transition-colors">
                    <Quote size={60} fill="currentColor" />
                  </div>

                  {/* Rating */}
                  <div className="flex text-yellow-400 mb-4 relative z-10">
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  
                  {/* Content */}
                  <blockquote className="text-gray-700 text-base md:text-[15px] leading-relaxed mb-6 italic relative z-10 font-medium">
                    "{item.quote}"
                  </blockquote>
                  
                  <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-4 relative z-10">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full border-2 border-green-100 p-0.5 overflow-hidden">
                         <img src={item.img} alt={item.author} className="w-full h-full rounded-full object-cover" />
                      </div>
                      {item.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white" title="Đại lý đã xác thực">
                           <BadgeCheck size={12} fill="currentColor" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="font-bold text-gray-900 text-base flex items-center gap-1">
                        {item.author}
                      </div>
                      <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-0.5">
                        {item.role}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Map size={10} /> {item.location}
                      </div>
                    </div>
                  </div>
              </div>
            ))}
          </div>
          
          {/* Trust Badge below reviews */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-xs font-medium text-gray-500">
               <BadgeCheck size={16} className="text-green-600" />
               <span>Thông tin đánh giá được xác thực bởi CVT Việt Nam</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
