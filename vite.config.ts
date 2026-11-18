import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [{
    name: 'cvt-product-script-on-demand',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const hasShowcase = /class=["'][^"']*\bcvt-showcase\b[^"']*["']/.test(html);
        if (hasShowcase) return html;
        return html.replace(/<script\b[^>]*\bsrc=["']\/assets\/cvt-product-studio\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/g, '');
      }
    }
  }, {
    name: 'cvt-lyhu-analytics',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        // Track public pages only. The hosted tracker also restricts production hosts.
        const page = path.basename(ctx.filename);
        if (['quan-tri.html', 'HANDOFF-NOTICE.html'].includes(page)) return [];
        if (_html.includes('src="https://www.lyhu.com.vn/cvt-analytics.js"')) return [];
        return [{
          tag: 'script',
          attrs: { src: 'https://www.lyhu.com.vn/cvt-analytics.js', defer: true },
          injectTo: 'head' as const
        }];
      }
    }
  }],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        sanPham: path.resolve(__dirname, 'san-pham.html'),
        trungCua: path.resolve(__dirname, 'trung-cua.html'),
        trungMuoi: path.resolve(__dirname, 'trung-muoi.html'),
        cayTuXuyen: path.resolve(__dirname, 'cay-tu-xuyen.html'),
        hanhLa: path.resolve(__dirname, 'hanh-la.html'),
        nam: path.resolve(__dirname, 'nam.html'),
        veCvt: path.resolve(__dirname, 've-cvt.html'),
        chatLuong: path.resolve(__dirname, 'chat-luong.html'),
        hopTac: path.resolve(__dirname, 'hop-tac.html'),
        yeuCauHopTac: path.resolve(__dirname, 'yeu-cau-hop-tac.html'),
        gocCvt: path.resolve(__dirname, 'goc-cvt.html'),
        baCach: path.resolve(__dirname, 'ba-cach-mo-cuoc-vui.html'),
        chonGoi: path.resolve(__dirname, 'chon-goi-khoai-mon.html'),
        giuGion: path.resolve(__dirname, 'giu-khoai-mon-gion.html'),
        noiMua: path.resolve(__dirname, 'noi-mua.html'),
        huongDan: path.resolve(__dirname, 'huong-dan-mua-hang.html'),
        hoiDap: path.resolve(__dirname, 'hoi-dap.html'),
        lienHe: path.resolve(__dirname, 'lien-he.html'),
        quyenRiengTu: path.resolve(__dirname, 'quyen-rieng-tu.html'),
        dangKy: path.resolve(__dirname, 'dang-ky.html'),
        quanTri: path.resolve(__dirname, 'quan-tri.html'),
        notFound: path.resolve(__dirname, '404.html'),
        handoffNotice: path.resolve(__dirname, 'HANDOFF-NOTICE.html')
      }
    }
  }
});
