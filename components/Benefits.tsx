
import React from 'react';
import SectionHeading from './ui/SectionHeading';
import Button from './ui/Button';
import { Star, Cloud, Factory, Gift, ChevronRight, CheckCircle2, Utensils, ThumbsUp } from 'lucide-react';

const Benefits: React.FC = () => {
  const scrollToForm = () => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const benefits = [
    {
      icon: <Star size={20} />,
      title: 'Vị Ngon Dễ Bán',
      points: [
          'Vị Trứng Muối & Truffle độc đáo, ít đối thủ cạnh tranh.',
          'Vừa miệng, không bị mặn gắt, khách ăn là nhớ.',
          'Phù hợp mọi lứa tuổi: Từ trẻ em đến dân văn phòng.'
      ],
      color: 'text-blue-600 bg-blue-50',
      borderColor: 'group-hover:border-blue-200'
    },
    {
      icon: <Cloud size={20} />,
      title: 'Chất Lượng Vượt Trội',
      points: [
          'Giòn tan tự nhiên, không bị cứng, không chai.',
          'Không hôi dầu (Lỗi thường gặp ở các loại snack rẻ tiền).',
          'Giữ trọn 98% hương vị khoai môn tươi.'
      ],
      color: 'text-green-600 bg-green-50',
      borderColor: 'group-hover:border-green-200'
    },
    {
      icon: <Factory size={20} />,
      title: 'Nguồn Hàng Ổn Định',
      points: [
          'Kho sẵn 1000 tấn - Không lo đứt hàng dịp Tết.',
          'Date luôn mới, hạn sử dụng 12 tháng thoải mái tồn kho.',
          'Giao hàng hỏa tốc 2-4 ngày toàn quốc.'
      ],
      color: 'text-purple-600 bg-purple-50',
      borderColor: 'group-hover:border-purple-200'
    },
    {
      icon: <Gift size={20} />,
      title: 'Bao Bì Hút Khách',
      points: [
          'Thiết kế phủ bóng cao cấp, nổi bật trên quầy kệ.',
          'Có túi zip tiện lợi, khách dùng không hết đóng lại được.',
          'Thích hợp làm quà biếu hoặc gói giỏ quà Tết.'
      ],
      color: 'text-orange-600 bg-orange-50',
      borderColor: 'group-hover:border-orange-200'
    },
  ];

  const CLOSE_UP_IMAGE = "https://lh3.googleusercontent.com/d/14Hv9mWPrn6ERrrJmEp7rtSVY0QVOo9kT";

  return (
    <section id="benefits" className="mb-16 md:mb-24 scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* Left: Visual Image Gallery */}
        <div className="relative order-2 lg:order-1 mt-6 lg:mt-0">
           {/* Decorative Blobs */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-green-100 to-orange-100 rounded-full blur-3xl -z-10 opacity-60"></div>
           
           <div className="relative">
              {/* Image 1: Product Close-up */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                    src={CLOSE_UP_IMAGE}
                    alt="Cận cảnh độ giòn xốp snack khoai môn" 
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                />
                
                {/* Floating Social Proof Badge on Image */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-xl p-3 shadow-lg border border-white/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-600 shrink-0">
                             <Utensils size={18} />
                        </div>
                        <div>
                             <div className="flex items-center gap-1">
                                <span className="text-sm font-bold text-gray-900">Thử thách vị giác</span>
                                <div className="flex text-yellow-400">
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                    <Star size={10} fill="currentColor" />
                                </div>
                             </div>
                             <p className="text-xs text-gray-600 leading-tight mt-0.5">
                                <strong>9/10</strong> khách hàng chọn mua lại sau khi ăn thử gói đầu tiên.
                             </p>
                        </div>
                    </div>
                </div>
              </div>

              {/* Interactive Tag - Hidden on very small screens */}
              <div className="absolute -top-3 -right-3 z-30 animate-bounce-slight hidden sm:block">
                  <div className="bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                      <ThumbsUp size={12} fill="currentColor" /> Ngon Khó Cưỡng
                  </div>
              </div>
           </div>
        </div>

        {/* Right: Content */}
        <div className="order-1 lg:order-2">
            <div className="mb-6 md:mb-8 text-center lg:text-left">
                <h2 className="text-2xl md:text-4xl font-extrabold mb-3 text-text-main leading-tight">
                    Vì sao khách hàng <br className="hidden lg:block"/>
                    <span className="text-green-600">Mê Mẩn Snack CVT?</span>
                </h2>
                <p className="text-gray-500 text-sm md:text-lg leading-relaxed">
                    Giải pháp ăn vặt cao cấp giúp bạn giữ chân khách hàng và tăng doanh thu bán lẻ.
                </p>
            </div>

            <div className="space-y-4 mb-8">
                {benefits.map((item, idx) => (
                <div key={idx} className={`rounded-2xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group ${item.borderColor}`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color} mt-1`}>
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-base text-gray-900 mb-2">{item.title}</h4>
                            <ul className="space-y-1.5">
                                {item.points.map((point, pIdx) => (
                                    <li key={pIdx} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
                                        <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                ))}
            </div>
            
            <div className="flex flex-col items-center lg:items-start w-full">
                <Button variant="shimmer" onClick={scrollToForm} size="lg" className="w-full sm:w-auto shadow-green/30 justify-center">
                    Đăng ký nhận mẫu thử miễn phí <ChevronRight size={18} />
                </Button>
                <p className="text-red-500 text-xs font-bold mt-2 italic animate-pulse">
                   *Số lượng mẫu thử có hạn - Đăng ký ngay
                </p>
            </div>
        </div>

      </div>
    </section>
  );
};

export default Benefits;
