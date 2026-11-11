import { checkAdminAuth } from './_auth.js';
import { isDbConfigured, listRequests, updateRequestStatus, listEntries, saveEntry } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // Verify server-side authentication (strictly rejecting client-spoofed headers)
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'unauthorized', message: 'Bạn chưa đăng nhập hoặc không có quyền quản trị.' });
  }

  // GET: load leads and content
  if (req.method === 'GET') {
    if (!isDbConfigured()) {
      return res.status(503).json({
        error: 'database_unavailable',
        message: 'Cơ sở dữ liệu chưa được kết nối. Vui lòng cấu hình biến SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trên Vercel.'
      });
    }

    try {
      const requests = await listRequests(200);
      const entries = await listEntries();

      return res.status(200).json({
        requests,
        entries: entries.map(e => {
          let data = {};
          try { data = JSON.parse(e.payload); } catch (err) {}
          return { ...e, data };
        }),
        defaults: {
          products: [
            { id: 'crab', name: 'Trứng cua', tag: 'ĐẬM ĐÀ, ĐÚNG GU', description: 'Một lớp vị đậm đà. Một thanh khoai giòn. Một lời mời mở đầu câu chuyện.', image: '/assets/products/crab-75.webp', color: '#ffd77c', accent: '#6b46b8', grams: '75g', price: '40.000đ', note: 'Dành một khoảng nghỉ cho vị ngon bạn thích.' },
            { id: 'egg', name: 'Trứng muối', tag: 'THƠM BÉO, THÊM VUI', description: 'Vị trứng muối thơm béo đi cùng khoai môn giòn. Hợp cho một buổi ngồi lại cùng người thương.', image: '/assets/products/egg-75.webp', color: '#ffe85a', accent: '#93621c', grams: '75g', price: '40.000đ', note: 'Thêm một gói cho cuộc hẹn hôm nay.' },
            { id: 'spicy', name: 'Cay Tứ Xuyên', tag: 'CAY CÓ CÁ TÍNH', description: 'Đổi vị cho những ngày muốn khác đi một chút. Khám phá khoai môn tẩm vị Cay Tứ Xuyên.', image: '/assets/products/spicy-75.webp', color: '#f5a096', accent: '#ae3a32', grams: '75g', price: '40.000đ', note: 'Chọn theo mức độ yêu thích vị cay của bạn.' },
            { id: 'onion', name: 'Hành lá', tag: 'THƠM VỊ HÀNH, MỘT GU KHÁC BIỆT', description: 'Đổi vị với gói xanh nổi bật. Lựa chọn khi muốn thêm một hương vị khác vào bộ sưu tập CVT.', image: '/assets/products/onion-75.webp', color: '#c9e77a', accent: '#215b38', grams: '75g', price: '40.000đ', note: 'Dòng sản phẩm quy cách 75g.' },
            { id: 'truffle', name: 'Truffle & giăm bông', tag: 'NẤM TRUFFLE ĐEN, GU MỚI', description: 'Gói 35g nhỏ gọn mang hương vị nấm truffle đen và giăm bông độc đáo.', image: '/assets/products/truffle-35.webp', color: '#e1c8ac', accent: '#4a3319', grams: '35g', price: '22.000đ', note: 'Dòng sản phẩm quy cách 35g.' }
          ],
          posts: [
            { id: 'chon-goi', title: '35g, 75g hay 180g — chọn gói theo cuộc hẹn', category: 'Cẩm nang', summary: 'Nhỏ gọn cho một người, vừa cho cuộc hẹn, hay thêm khoai để chia sẻ?', image: '/assets/products/crab-75.webp' },
            { id: 'bao-quan', title: 'Mở gói rồi, giữ giòn thế nào?', category: 'Thưởng thức', summary: 'Một vài thói quen nhỏ để thưởng thức sản phẩm sau khi mở gói.', image: '/assets/products/egg-75.webp' },
            { id: 'nha-san-xuat', title: 'Một góc nhìn về nhà sản xuất tại Đông Hưng', category: 'Báo chí', summary: 'Tư liệu từ People.cn về hoạt động của Trung Việt Thái, đăng ngày 09/06/2025.', image: '/assets/cvt-production-illustration.webp' }
          ]
        }
      });
    } catch (err) {
      console.error('Admin GET error:', err);
      return res.status(500).json({ error: 'database_error', message: 'Không thể truy vấn dữ liệu từ cơ sở dữ liệu.' });
    }
  }

  // POST: status change or CMS entry save
  if (req.method === 'POST') {
    if (!isDbConfigured()) {
      return res.status(503).json({
        error: 'database_unavailable',
        message: 'Cơ sở dữ liệu chưa được kết nối. Không thể thực hiện lưu trữ.'
      });
    }

    try {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

      // 1. Update lead status
      if (b.action === 'status') {
        if (!['new', 'contacted', 'closed'].includes(b.status)) {
          return res.status(400).json({ error: 'invalid_status', message: 'Trạng thái không hợp lệ.' });
        }
        await updateRequestStatus(b.id, b.status);
        return res.status(200).json({ ok: true, message: 'Đã cập nhật trạng thái.' });
      }

      // 2. Save CMS entry
      if (!['products', 'posts', 'docs', 'outlets'].includes(b.kind) || !b.id) {
        return res.status(400).json({ error: 'invalid_data', message: 'Thông tin nội dung không hợp lệ.' });
      }

      await saveEntry({
        id: b.id,
        kind: b.kind,
        data: b.data || {},
        published: b.published ? 1 : 0
      });

      return res.status(200).json({ ok: true, message: 'Đã lưu nội dung thành công.' });
    } catch (err) {
      console.error('Admin POST error:', err);
      return res.status(500).json({ error: 'save_failed', message: 'Không thể lưu vào cơ sở dữ liệu.' });
    }
  }

  return res.status(405).json({ error: 'method_not_allowed' });
}
