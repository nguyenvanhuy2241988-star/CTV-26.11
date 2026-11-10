import { listEntries } from './_db.js';

const defaultProducts = [
  { id: 'crab', name: 'Trứng cua', tag: 'ĐẬM ĐÀ, ĐÚNG GU', description: 'Một lớp vị đậm đà. Một thanh khoai giòn. Một lời mời mở đầu câu chuyện.', image: '/assets/products/crab-75.webp', color: '#ffd77c', accent: '#6b46b8', grams: '75g', price: '40.000đ', note: 'Dành một khoảng nghỉ cho vị ngon bạn thích.' },
  { id: 'egg', name: 'Trứng muối', tag: 'THƠM BÉO, THÊM VUI', description: 'Vị trứng muối thơm béo đi cùng khoai môn giòn. Hợp cho một buổi ngồi lại cùng người thương.', image: '/assets/products/egg-75.webp', color: '#ffe85a', accent: '#93621c', grams: '75g', price: '40.000đ', note: 'Thêm một gói cho cuộc hẹn hôm nay.' },
  { id: 'spicy', name: 'Cay Tứ Xuyên', tag: 'CAY CÓ CÁ TÍNH', description: 'Đổi vị cho những ngày muốn khác đi một chút. Khám phá khoai môn tẩm vị Cay Tứ Xuyên.', image: '/assets/products/spicy-75.webp', color: '#f5a096', accent: '#ae3a32', grams: '75g', price: '40.000đ', note: 'Chọn theo mức độ yêu thích vị cay của bạn.' },
  { id: 'onion', name: 'Hành lá', tag: 'THƠM VỊ HÀNH, MỘT GU KHÁC BIỆT', description: 'Đổi vị với gói xanh nổi bật. Lựa chọn khi muốn thêm một hương vị khác vào bộ sưu tập CVT.', image: '/assets/products/onion-75.webp', color: '#c9e77a', accent: '#215b38', grams: '75g', price: '40.000đ', note: 'Dòng sản phẩm quy cách 75g.' },
  { id: 'truffle', name: 'Truffle & giăm bông', tag: 'NẤM TRUFFLE ĐEN, GU MỚI', description: 'Gói 35g nhỏ gọn mang hương vị nấm truffle đen và giăm bông độc đáo.', image: '/assets/products/truffle-35.webp', color: '#e1c8ac', accent: '#4a3319', grams: '35g', price: '22.000đ', note: 'Dòng sản phẩm quy cách 35g.' }
];

const defaultPosts = [
  { id: 'chon-goi', title: '35g, 75g hay 180g — chọn gói theo cuộc hẹn', category: 'Cẩm nang', summary: 'Nhỏ gọn cho một người, vừa cho cuộc hẹn, hay thêm khoai để chia sẻ?', image: '/assets/products/crab-75.webp', body: 'Gói 35g nhỏ gọn cho một khoảng nghỉ. Gói 75g phù hợp để nhâm nhi hoặc chia sẻ trong cuộc hẹn nhỏ. Gói 180g là lựa chọn khi muốn có nhiều hơn để cùng thưởng thức.\n\nDòng 35g hiện có Trứng cua, Nấm và Trứng muối. Kiểm tra hương vị, thành phần, hạn dùng và tồn kho tại nơi mua trước khi đặt hàng.' },
  { id: 'bao-quan', title: 'Mở gói rồi, giữ giòn thế nào?', category: 'Thưởng thức', summary: 'Một vài thói quen nhỏ để thưởng thức sản phẩm sau khi mở gói.', image: '/assets/products/egg-75.webp', body: 'Luôn làm theo hướng dẫn trên bao bì. Giữ sản phẩm ở nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp.\n\nĐóng kín sau khi mở và dùng sớm. Không dùng sản phẩm khi bao bì hỏng, có dấu hiệu bất thường hoặc đã quá hạn sử dụng.' },
  { id: 'nha-san-xuat', title: 'Một góc nhìn về nhà sản xuất tại Đông Hưng', category: 'Báo chí', summary: 'Tư liệu từ People.cn về hoạt động của Trung Việt Thái, đăng ngày 09/06/2025.', image: '/assets/cvt-production-illustration.webp', body: 'Bài viết trên People.cn đề cập hoạt động chế biến thực phẩm của Trung Việt Thái tại Đông Hưng, Trung Quốc và quy mô 16 dây chuyền tại thời điểm tháng 6/2025.\n\nĐây là tư liệu doanh nghiệp, không phải chứng nhận chất lượng hoặc bảo chứng của báo chí. Hình bối cảnh trên website là ảnh minh hoạ AI.', source: 'https://gx.people.com.cn/n2/2025/0609/c229260-41254346.html' }
];

const defaultDocs = [
  { id: 'cbsp', title: 'Bản tự công bố sản phẩm', description: 'Hồ sơ pháp lý công bố chất lượng và an toàn thực phẩm', url: 'https://cvt.com.vn/chat-luong.html#ho-so', date: '2025-2026', issuer: 'CÔNG TY TNHH LYHU' }
];

const defaultOutlets = [
  { id: 'boyo-shopee', name: 'Gian hàng BOYO Mart (Shopee Mall)', address: 'Kho vận thương mại điện tử Hà Nội & TP.HCM', city: 'Toàn quốc', note: 'Giao hàng tận nơi toàn quốc', url: 'https://shopee.vn/boyo.vn/' }
];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const { searchParams } = new URL(req.url, 'http://localhost');
  const kind = searchParams.get('kind') || 'products';

  if (!['products', 'posts', 'docs', 'outlets'].includes(kind)) {
    return res.status(400).json({ error: 'Loại nội dung không hợp lệ.' });
  }

  try {
    const entries = await listEntries(kind);
    let defaults = [];
    if (kind === 'products') defaults = defaultProducts;
    else if (kind === 'posts') defaults = defaultPosts;
    else if (kind === 'docs') defaults = defaultDocs;
    else if (kind === 'outlets') defaults = defaultOutlets;

    const map = new Map(defaults.map(item => [item.id, item]));
    for (const e of entries) {
      try {
        const parsed = JSON.parse(e.payload);
        if (e.published) {
          map.set(e.id, parsed);
        } else {
          map.delete(e.id);
        }
      } catch (err) {}
    }

    return res.status(200).json({
      items: Array.from(map.values()),
      customized: entries.length > 0
    });
  } catch (err) {
    return res.status(500).json({ error: 'Không tải được nội dung.' });
  }
}
