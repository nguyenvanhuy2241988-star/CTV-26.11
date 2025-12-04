
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Phone, User, Headset } from 'lucide-react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Define interface for chat messages
interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const HOTLINE = "0969.069.798";

// SYSTEM INSTRUCTION: Cấu hình nhân cách - Nhân viên CSKH thật
const SYSTEM_INSTRUCTION = `
Bạn là "Thảo" - Chuyên viên tư vấn kinh doanh cấp cao của CVT Việt Nam (Snack Khoai Môn Nhập Khẩu).
TUYỆT ĐỐI KHÔNG xưng là AI, Robot, Trợ lý ảo hay Máy học.
Hãy đóng vai một nhân viên người thật: thân thiện, nhiệt tình, sử dụng ngôn ngữ tự nhiên (dùng "Dạ", "em", "anh/chị", icon cảm xúc 😊).

NHIỆM VỤ:
- Tư vấn chính sách nhập hàng, đặc biệt là chương trình Mua 10 Tặng 1.
- Giải tỏa lo lắng của khách về vốn và rủi ro bán hàng.
- Chốt đơn hoặc xin số điện thoại khéo léo để bộ phận sale gọi lại.

NẾU KHÁCH MUỐN GẶP NGƯỜI THẬT HOẶC QUẢN LÝ:
- Hãy nói: "Dạ hiện tại em đang trực hỗ trợ mình đây ạ. Nếu vấn đề cần trao đổi qua điện thoại, anh/chị có thể gọi trực tiếp Hotline ${HOTLINE} để gặp quản lý bên em nhé ạ ^^".

PHONG CÁCH:
- Nhanh nhẹn, thấu hiểu, dùng từ ngữ đời thường (vd: "hàng đi nhanh lắm ạ", "khách bên em mê vị này lắm").
- Luôn bắt đầu câu trả lời bằng "Dạ".
`;

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // CSKH Avatar (Placeholder real person image)
  const CSKH_AVATAR = "https://ui-avatars.com/api/?name=Thảo+CVT&background=00a862&color=fff&size=128";

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: 'Dạ em chào anh/chị! Em là Thảo - Phụ trách hỗ trợ đại lý CVT Việt Nam. 😊\n\nAnh/chị đang quan tâm nhập hàng về bán hay mua dùng thử ạ? Em tư vấn mình nhé!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<Chat | null>(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Init Chat Function with Safe Checks
  const initializeChat = () => {
    try {
      const apiKey = process.env.API_KEY;
      
      // Nếu không có Key, trả về null để kích hoạt chế độ Fallback (không lỗi)
      if (!apiKey || apiKey === 'undefined' || apiKey.length < 10) {
          console.warn("ChatBot: Running in Offline/Fallback Mode (No API Key detected)");
          return null;
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });
    } catch (error) {
      console.error("Chat init error:", error);
      return null;
    }
  };

  // Initialize on mount
  useEffect(() => {
    chatInstance.current = initializeChat();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const userText = textOverride || input.trim();
    if (!userText || isLoading) return;

    // Special case for "Call Me" request
    if (userText === "CALL_REQUEST") {
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: "Tôi muốn gặp nhân viên tư vấn trực tiếp."
        };
        setMessages(prev => [...prev, newMessage]);
        
        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: `Dạ vâng ạ. Anh/chị có thể gọi ngay Hotline/Zalo: ${HOTLINE} để bên em hỗ trợ mình nhanh nhất nhé! Hoặc anh/chị để lại SĐT tại đây, lát nữa em báo các bạn kinh doanh gọi lại liền ạ. 😊`
        };
        setTimeout(() => setMessages(prev => [...prev, botMessage]), 600);
        setInput('');
        return;
    }

    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    // --- LOGIC XỬ LÝ TIN NHẮN ---
    
    // 1. Kiểm tra nếu Chat chưa khởi tạo được (do thiếu Key hoặc lỗi) -> Dùng Fallback Script
    if (!chatInstance.current) {
        setTimeout(() => {
            let reply = "Dạ hiện tại lượng tin nhắn đang quá tải nên hệ thống hơi chậm chút ạ. 😓 Anh/chị vui lòng **để lại Số Điện Thoại**, em sẽ ưu tiên báo chuyên viên kinh doanh gọi lại tư vấn kỹ hơn cho mình ngay lập tức nhé ạ! 📞";
            
            // Heuristic đơn giản để phát hiện SĐT hoặc nhu cầu giá
            const phoneRegex = /(\d{9,11})|(\d{3,4}[.\s]\d{3,4}[.\s]\d{3,4})/;
            const isAskingPrice = /(giá|vốn|tư vấn|sỉ|lẻ|bao nhiêu|tiền)/i.test(userText);
            
            if (phoneRegex.test(userText)) {
                reply = "Dạ em đã nhận được số điện thoại. Em đã chuyển thông tin cho bộ phận kinh doanh, các bạn sẽ liên hệ anh/chị trong ít phút nữa ạ! Em cảm ơn anh/chị đã quan tâm CVT ạ! ❤️";
            } else if (isAskingPrice) {
                reply = "Dạ để nhận bảng giá sỉ tốt nhất và chính sách Mua 10 Tặng 1, anh/chị giúp em để lại SĐT hoặc kết bạn Zalo 0969.069.798 nhé ạ! Em gửi bảng giá qua đó cho tiện mình tham khảo ạ.";
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: reply
            };
            setMessages(prev => [...prev, botMessage]);
            setIsLoading(false);
        }, 1500); // Giả lập độ trễ mạng
        return;
    }

    // 2. Nếu có Key -> Gọi Gemini API
    try {
      const result: GenerateContentResponse = await chatInstance.current.sendMessage({ 
        message: userText 
      });
      
      const responseText = result.text || "Dạ mạng bên em đang hơi chập chờn xíu, anh/chị nhắn lại giúp em hoặc gọi Hotline nhé ạ! 🙏";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      
      // Fallback khi API lỗi giữa chừng
      let errorMsg = `Dạ hiện tại hệ thống tin nhắn đang quá tải. Anh/chị gọi trực tiếp Hotline ${HOTLINE} giúp em để được hỗ trợ nhanh nhất nhé!`;
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: errorMsg
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Reset để thử lại lần sau hoặc chuyển sang fallback mode
      chatInstance.current = null;
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageText = (text: string | undefined | null) => {
    if (!text || typeof text !== 'string') return null;
    
    // Xử lý xuống dòng và in đậm cơ bản
    return text.split('\n').map((line, i) => {
        // Simple bold parser for **text**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <span key={i} className="block mb-1 min-h-[1em]">
                {parts.map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={index}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
            </span>
        );
    });
  };

  // Suggestion Chips (Human-like conversation starters)
  const suggestionChips = [
    { label: "💰 Vốn 3 triệu nhập được gì?", value: "Với vốn 3 triệu em nhập được bao nhiêu thùng? Có được tặng thêm gì không?" },
    { label: "📉 Sợ không bán được hàng", value: "Mình chưa bán bao giờ, sợ nhập về tồn hàng. Bên em có hỗ trợ gì không?" },
    { label: "📞 Yêu cầu gọi lại ngay", value: "CALL_REQUEST" }, // Special trigger
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 md:bottom-6 right-4 z-50 p-0 rounded-full transition-transform hover:scale-110 active:scale-95 group ${isOpen ? 'rotate-90' : 'rotate-0'}`}
      >
        <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-600 flex items-center justify-center text-white border-2 border-white overflow-hidden shadow-[0_4px_20px_rgba(0,168,98,0.4)]">
             {isOpen ? (
                 <X size={28} />
             ) : (
                 <>
                    {/* Use Icon mimicking a support person */}
                    <div className="absolute inset-0 flex items-center justify-center bg-green-600">
                        <MessageCircle size={32} fill="currentColor" className="text-white" />
                    </div>
                    {/* Notification Badge */}
                    <span className="absolute top-3 right-3 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
                    </span>
                 </>
             )}
        </div>
        {!isOpen && (
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-xl shadow-xl text-xs font-bold whitespace-nowrap border border-gray-100 animate-bounce-slight hidden md:block text-text-main group-hover:scale-105 transition-transform origin-right">
                👋 Chat với Thảo (Hỗ trợ 24/7)
                <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white transform rotate-45 border-t border-r border-gray-100"></div>
            </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-[140px] md:bottom-24 right-4 z-50 w-[90vw] md:w-[380px] h-[520px] max-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-10 fade-in duration-300 font-sans">
          
          {/* Header - Humanized */}
          <div className="bg-green-600 p-4 text-white shrink-0 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-green-400 overflow-hidden">
                    <img src={CSKH_AVATAR} alt="CSKH" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-1">
                    Thảo - Tư vấn viên
                    <div className="bg-green-500 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Online</div>
                </div>
                <div className="text-[11px] text-green-100">Thường trả lời ngay lập tức</div>
              </div>
            </div>
            
            <a 
                href={`tel:${HOTLINE.replace(/\./g, '')}`} 
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/20"
                title="Gọi trực tiếp"
            >
                <Phone size={18} fill="currentColor" />
            </a>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#f0f2f5] scroll-smooth space-y-4">
             {messages.map((msg) => (
               <div 
                 key={msg.id} 
                 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}
               >
                 {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 overflow-hidden shrink-0 shadow-sm">
                        <img src={CSKH_AVATAR} alt="Bot" className="w-full h-full object-cover" />
                    </div>
                 )}
                 <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-green-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                    }`}
                 >
                    {renderMessageText(msg.text)}
                 </div>
               </div>
             ))}

             {isLoading && (
               <div className="flex justify-start items-end gap-2">
                 <div className="w-8 h-8 rounded-full bg-white border border-gray-200 overflow-hidden shrink-0 p-1">
                     <img src={CSKH_AVATAR} alt="Bot" className="w-full h-full object-cover rounded-full opacity-50" />
                 </div>
                 <div className="bg-white rounded-2xl px-4 py-3 rounded-bl-none shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    </div>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            
            {/* Suggestion Chips */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar mask-gradient">
                {suggestionChips.map((chip, idx) => (
                    <button 
                        key={idx}
                        onClick={() => handleSendMessage(undefined, chip.value)} 
                        className={`px-3 py-2 text-[11px] font-medium rounded-lg whitespace-nowrap border transition-all active:scale-95 flex-shrink-0 shadow-sm ${
                            chip.value === "CALL_REQUEST" 
                            ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                        }`}
                    >
                        {chip.label}
                    </button>
                ))}
            </div>

            <form onSubmit={(e) => handleSendMessage(e)} className="relative flex items-center gap-2">
               <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="Nhập tin nhắn..."
                 className="flex-1 bg-gray-100 border-transparent text-sm rounded-full px-5 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all pr-12"
               />
               <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm w-9 h-9 flex items-center justify-center"
               >
                 <Send size={16} className={input.trim() ? 'ml-0.5' : ''} />
               </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};

export default ChatBot;
