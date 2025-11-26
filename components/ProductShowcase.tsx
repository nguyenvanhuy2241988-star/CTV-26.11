
import React from 'react';
import SectionHeading from './ui/SectionHeading';
import { ShoppingBag, Star, Zap, Flame, Leaf, Beef, Diamond, Crown, ArrowRight } from 'lucide-react';

interface ProductLine {
  id: string;
  name: string;
  weights: string[];
  image: string;
  bgClass: string; // Tailwind class for bg color
  textClass: string; // Tailwind class for text color
  tags?: string[];
  icon: React.ReactNode;
  description: string;
}

const ProductShowcase: React.FC = () => {
  const scrollToForm = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Order: Trứng Cua (TC) -> Trứng Muối (TM) -> Cay (CA)
  const products: ProductLine[] = [
    {
      id: "TC",
      name: "Trứng Cua",
      weights: ["35g", "75g", "180g"],
      image: "https://lh3.googleusercontent.com/d/1yPH38a74fTWDZ208EqR24aU4X5UemMts",
      textClass: "text-amber-700",
      bgClass: "bg-amber-50",
      tags: ["Best Seller"],
      icon: <Zap size={14} fill="currentColor" />,
      description: "Hương gạch cua đậm đà, lạ miệng, kích thích vị giác. Dòng bán chạy nhất hiện nay."
    },
    {
      id: "TM",
      name: "Trứng Muối",
      weights: ["35g", "75g", "180g"],
      image: "https://lh3.googleusercontent.com/d/1WyGIymEnZU9VnnZFXAJ2QWtmo0cA9jyc",
      textClass: "text-orange-600",
      bgClass: "bg-orange-50",
      tags: ["Hot Trend"],
      icon: <Star size={14} fill="currentColor" />,
      description: "Vị mặn ngọt béo ngậy huyền thoại. Phù hợp mọi lứa tuổi."
    },
    {
      id: "CA",
      name: "Cay Tứ Xuyên",
      weights: ["35g", "75g", "180g"],
      image: "https://lh3.googleusercontent.com/d/1m3vNt2c75Fjs_8FQxBIlkwJDWg1f5UD9",
      textClass: "text-red-700",
      bgClass: "bg-red-50",
      tags: ["Cay nồng"],
      icon: <Flame size={14} fill="currentColor" />,
      description: "Cay tê đầu lưỡi chuẩn vị Trung Hoa. Tốn bia, hợp quán nhậu."
    },
    {
      id: "HL",
      name: "Hành Lá",
      weights: ["35g", "75g"],
      image: "https://lh3.googleusercontent.com/d/1KTmnzuytC8WcqgGQMMD2Xv_bYgyczYUa",
      textClass: "text-green-700",
      bgClass: "bg-green-50",
      tags: ["Truyền thống"],
      icon: <Leaf size={14} fill="currentColor" />,
      description: "Thơm nhẹ hành lá, vị mặn vừa phải. Dễ ăn, hợp trẻ em."
    },
    {
      id: "BB",
      name: "Bò Bít Tết",
      weights: ["35g"],
      image: "https://lh3.googleusercontent.com/d/1CgLV_SQen38-WyANRNHCZWNu5dJT-wOn",
      textClass: "text-gray-800",
      bgClass: "bg-gray-100",
      tags: ["Manly"],
      icon: <Beef size={14} />,
      description: "Vị thịt nướng BBQ thơm lừng. Bao bì đen sang trọng."
    },
    {
      id: "TR",
      name: "Nấm Truffle",
      weights: ["35g"],
      image: "https://lh3.googleusercontent.com/d/1ENTOgvQBDwF3huAwnXihesUfePqCzYWu",
      textClass: "text-slate-800",
      bgClass: "bg-slate-100",
      tags: ["Premium"],
      icon: <Diamond size={14} />,
      description: "Hương nấm Truffle đen quý tộc. Phân khúc khách cao cấp."
    },
  ];

  return (
    <section id="products" className="mb-24 scroll-mt-20">
      <SectionHeading 
        title="6 Hương Vị Độc Bản" 
        description="Đa dạng quy cách (35g, 75g, 180g) phù hợp mọi kênh bán: Tạp hoá, Siêu thị, Quà biếu, Quán Cafe."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
        {products.map((product) => {
          const isBestSeller = product.tags?.includes("Best Seller");
          const isHotTrend = product.tags?.includes("Hot Trend");

          // Dynamic Styles for highlighting hierarchy
          let cardStyle = "border-gray-100 bg-white";
          let shadowStyle = "shadow-card hover:shadow-lg";
          let scaleStyle = "";
          let opacityStyle = "opacity-100";

          if (isBestSeller) {
              // Level 1: Best Seller - Stronger Distinction
              cardStyle = "border-2 border-red-600 ring-4 ring-red-50 bg-gradient-to-b from-red-50 via-white to-white";
              shadowStyle = "shadow-[0_30px_60px_-10px_rgba(220,38,38,0.3)] hover:shadow-[0_35px_70px_-10px_rgba(220,38,38,0.4)]";
              // Reduced scale from 110 to 105, and margins from 6 to 3 for better balance
              scaleStyle = "lg:-mt-3 lg:mb-3 z-20 transform lg:scale-105"; 
          } else if (isHotTrend) {
              // Level 2: Hot Trend
              cardStyle = "border-2 border-orange-400 ring-2 ring-orange-50 bg-gradient-to-b from-[#fff7ed] to-white";
              shadowStyle = "shadow-[0_20px_40px_-10px_rgba(249,115,22,0.2)] hover:shadow-[0_25px_50px_-10px_rgba(249,115,22,0.25)]";
              // Reduced scale from 105 to 102
              scaleStyle = "z-10 lg:scale-102";
          } else {
              // Level 3: Standard
              cardStyle = "border border-gray-100 bg-white hover:border-gray-200";
              shadowStyle = "shadow-sm hover:shadow-md";
              scaleStyle = "z-0";
              opacityStyle = "opacity-95 hover:opacity-100";
          }

          return (
            <div key={product.id} className={`group relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col ${cardStyle} ${shadowStyle} ${scaleStyle} ${opacityStyle}`}>
                
                {/* Special Corner Badges */}
                {isBestSeller && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl z-30 shadow-lg flex items-center gap-1.5 animate-pulse-glow">
                        <Crown size={12} fill="currentColor" /> BEST SELLER
                    </div>
                )}
                {isHotTrend && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl z-30 shadow-lg flex items-center gap-1.5">
                        <Flame size={12} fill="currentColor" /> HOT TREND
                    </div>
                )}

                {/* Top Half: Image & Bg */}
                <div className={`h-[240px] md:h-[260px] relative overflow-hidden flex items-center justify-center p-6 ${isBestSeller ? 'bg-transparent' : product.bgClass}`}>
                   
                   {/* Tags */}
                   <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                     {product.tags?.map((tag, idx) => {
                       const isSpecialTag = tag === "Best Seller" || tag === "Hot Trend";
                       if (isSpecialTag) return null; // Handled by corner badge
                       
                       return (
                        <span key={idx} className="text-[10px] font-bold px-2.5 py-1 rounded bg-white/90 backdrop-blur uppercase tracking-wider shadow-sm text-gray-800">
                            {tag}
                        </span>
                       );
                     })}
                   </div>
                   
                   <img 
                      src={product.image} 
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-auto h-full max-h-full object-contain drop-shadow-xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3"
                   />
                </div>

                {/* Bottom Half: Info */}
                <div className="p-5 md:p-6 flex flex-col flex-1 relative">
                    {isBestSeller && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-600 text-[9px] font-bold px-3 py-1 rounded-full border border-red-200 whitespace-nowrap shadow-sm z-20">
                            Được 80% đại lý chọn
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-2 pt-2">
                        <span className={`${product.textClass} p-1.5 bg-gray-50 rounded-full`}>{product.icon}</span>
                        <h3 className={`text-lg md:text-xl font-bold ${product.textClass}`}>{product.name}</h3>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-5 line-clamp-3 leading-relaxed">
                        {product.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100/50">
                        <div className="flex gap-1.5 flex-wrap">
                            {product.weights.map((w) => (
                                <span key={w} className="px-2 py-1 rounded-md bg-white border border-gray-200 text-[10px] md:text-[11px] font-bold text-gray-600 hover:border-gray-300 transition-colors cursor-default shadow-sm">
                                    {w}
                                </span>
                            ))}
                        </div>
                        <button 
                            onClick={scrollToForm}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg transform hover:scale-105 shrink-0 ${isBestSeller ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200 ring-2 ring-red-100' : 'bg-gray-900 text-white hover:bg-green-600 shadow-gray-200'}`}
                            title="Nhập hàng ngay"
                        >
                            {isBestSeller ? <ArrowRight size={18} /> : <ShoppingBag size={18} />}
                        </button>
                    </div>
                </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductShowcase;
