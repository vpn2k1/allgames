// Ứng dụng Express: trang giới thiệu, trang chi tiết, trang chính sách và admin (có đăng nhập).
// Dùng chung cho chạy local (server.mjs) và Vercel (api/index.mjs).
// Biến môi trường: ADMIN_PASSWORD (bắt buộc để bật admin), ADMIN_USER (mặc định "admin"),
// BLOB_READ_WRITE_TOKEN (bật lưu trữ Vercel Blob).
import express from 'express';
import multer from 'multer';
import { put } from '@vercel/blob';
import { createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as store from './lib/store.mjs';
import { ValidationError, usingBlob } from './lib/store.mjs';
import { indexPage, gamePage, policyIndexPage, policyPage, robotsTxt, sitemapXml } from './lib/render.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const publicDir = join(root, 'public');
const uploadDir = join(publicDir, 'uploads');
const adminDir = join(root, 'admin-ui');

const IMAGE_TYPES = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };
const APK_TYPES = ['application/vnd.android.package-archive', 'application/octet-stream'];
// Hàm serverless của Vercel nhận tối đa ~4.5MB mỗi request, nên trên Vercel chỉ tải ảnh nhỏ lên.
const MAX_IMAGE = 4 * 1024 * 1024;
const MAX_APK = 300 * 1024 * 1024;

const digest = (s) => createHash('sha256').update(s).digest();
const safeEqual = (a, b) => timingSafeEqual(digest(a), digest(b));

/** Xác thực Basic Auth cho admin. Truyền hàm khác vào createApp khi cần (ví dụ khi kiểm thử). */
export function basicAuth({ user = process.env.ADMIN_USER || 'admin', password = process.env.ADMIN_PASSWORD || '' } = {}) {
  return (req, res, next) => {
    if (!password) {
      return res.status(503).type('text').send('Admin chưa bật. Đặt biến môi trường ADMIN_PASSWORD rồi khởi động lại.');
    }
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme === 'Basic' && token) {
      const [u, ...rest] = Buffer.from(token, 'base64').toString('utf8').split(':');
      if (safeEqual(u ?? '', user) && safeEqual(rest.join(':'), password)) return next();
    }
    res.set('WWW-Authenticate', 'Basic realm="VPN Games admin", charset="UTF-8"');
    return res.status(401).type('text').send('Cần đăng nhập');
  };
}

const fail = (res, err) => {
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File quá lớn' });
  if (err?.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ error: 'Sai tên field upload' });
  console.error(err);
  return res.status(500).json({ error: 'Lỗi máy chủ' });
};

export function createApp({ requireAdmin = basicAuth() } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  // Tệp tĩnh. Trên Vercel, thư mục public/ được CDN phục vụ trực tiếp; các dòng này phục vụ khi chạy local.
  // /privacy đăng ký trước route /privacy/:slug để file HTML tĩnh (triangle-master.html) được ưu tiên.
  app.use('/assets', express.static(join(publicDir, 'assets')));
  app.use('/uploads', express.static(uploadDir));
  app.use('/privacy', express.static(join(publicDir, 'privacy'), { index: false, redirect: false }));

  // Giao diện admin nằm ngoài public/ để không bị phục vụ công khai.
  app.use('/admin', requireAdmin, express.static(adminDir));

  const upload = multer({
    storage: usingBlob
      ? multer.memoryStorage()
      : multer.diskStorage({
          // Tạo thư mục khi có upload, không tạo lúc khởi động: hệ thống file Vercel chỉ đọc nên mkdir ở đây làm hàm crash.
          destination: (_req, _file, cb) => {
            try {
              mkdirSync(uploadDir, { recursive: true });
              cb(null, uploadDir);
            } catch (err) {
              cb(err);
            }
          },
          filename: (_req, file, cb) => {
            const ext = IMAGE_TYPES[file.mimetype] || (file.originalname.toLowerCase().endsWith('.apk') ? '.apk' : '');
            cb(null, `${randomUUID()}${ext}`);
          },
        }),
    limits: { fileSize: usingBlob ? MAX_IMAGE : MAX_APK },
    fileFilter: (_req, file, cb) => {
      if (file.fieldname === 'image') {
        return IMAGE_TYPES[file.mimetype] ? cb(null, true) : cb(new ValidationError('Chỉ nhận ảnh PNG, JPG hoặc WebP'));
      }
      if (file.fieldname === 'apk') {
        if (usingBlob) {
          return cb(new ValidationError('Trên Vercel không tải APK trực tiếp được (giới hạn 4.5MB). Hãy đưa APK lên GitHub Releases hoặc nơi lưu file khác rồi dán link.'));
        }
        const ok = file.originalname.toLowerCase().endsWith('.apk') && APK_TYPES.includes(file.mimetype);
        return ok ? cb(null, true) : cb(new ValidationError('Chỉ nhận file .apk'));
      }
      return cb(new ValidationError('Sai tên field upload'));
    },
  });

  const admin = express.Router();

  admin.get('/games', async (_req, res) => {
    try {
      res.json(await store.list());
    } catch (err) {
      fail(res, err);
    }
  });

  admin.post('/games', async (req, res) => {
    try {
      res.status(201).json(await store.createGame(req.body || {}));
    } catch (err) {
      fail(res, err);
    }
  });

  admin.put('/games/:slug', async (req, res) => {
    try {
      const game = await store.updateGame(req.params.slug, req.body || {});
      if (!game) return res.status(404).json({ error: 'Không tìm thấy game' });
      res.json(game);
    } catch (err) {
      fail(res, err);
    }
  });

  admin.delete('/games/:slug', async (req, res) => {
    try {
      if (!(await store.deleteGame(req.params.slug))) return res.status(404).json({ error: 'Không tìm thấy game' });
      res.status(204).end();
    } catch (err) {
      fail(res, err);
    }
  });

  admin.put('/order', async (req, res) => {
    try {
      if (!Array.isArray(req.body?.slugs)) throw new ValidationError('Thiếu danh sách slug');
      res.json(await store.reorder(req.body.slugs.map(String)));
    } catch (err) {
      fail(res, err);
    }
  });

  /** Nhận một file ảnh hoặc APK (field "image" hoặc "apk") và trả về đường dẫn công khai. */
  admin.post('/upload', (req, res) => {
    upload.fields([{ name: 'image', maxCount: 1 }, { name: 'apk', maxCount: 1 }])(req, res, async (err) => {
      if (err) return fail(res, err);
      const file = req.files?.image?.[0] || req.files?.apk?.[0];
      if (!file) return res.status(400).json({ error: 'Chưa chọn file' });
      try {
        if (!usingBlob) return res.status(201).json({ url: `/uploads/${file.filename}`, name: file.originalname, size: file.size });
        const blob = await put(`uploads/${randomUUID()}${IMAGE_TYPES[file.mimetype]}`, file.buffer, {
          access: 'public',
          contentType: file.mimetype,
          addRandomSuffix: false,
        });
        return res.status(201).json({ url: blob.url, name: file.originalname, size: file.size });
      } catch (e) {
        return fail(res, e);
      }
    });
  });

  app.use('/admin/api', requireAdmin, admin);

  // Trang công khai
  const wrap = (fn) => async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (err) {
      next(err);
    }
  };
  const notFound = (res) => res.status(404).type('html').send('<meta name="robots" content="noindex"><p>Không tìm thấy trang. <a href="/">Về trang chủ</a></p>');
  const lookup = async (slug) => {
    const games = await store.list();
    return { games, game: games.find((g) => g.slug === slug && g.visible) };
  };
  // CDN của Vercel giữ trang 60 giây, nên sửa trong admin hiện ra trong vòng 1 phút.
  const html = (res, body) => res.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300').type('html').send(body);

  app.get('/robots.txt', (_req, res) => res.type('text').send(robotsTxt()));
  app.get('/sitemap.xml', wrap(async (_req, res) => res.set('Cache-Control', 'public, max-age=0, s-maxage=3600').type('application/xml').send(sitemapXml(await store.list()))));

  app.get('/', wrap(async (_req, res) => html(res, indexPage(await store.list()))));
  app.get('/privacy', wrap(async (_req, res) => html(res, policyIndexPage(await store.list()))));

  app.get('/game/:slug', wrap(async (req, res) => {
    const { games, game } = await lookup(req.params.slug);
    return game ? html(res, gamePage(game, games)) : notFound(res);
  }));

  app.get('/privacy/:slug', wrap(async (req, res) => {
    const { games, game } = await lookup(req.params.slug);
    if (!game || !(game.privacy?.html || game.privacy?.url)) return notFound(res);
    if (!game.privacy.html) return res.redirect(302, game.privacy.url);
    return html(res, policyPage(game, game.privacy.updated, games));
  }));

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).type('text').send('Lỗi máy chủ');
  });

  return app;
}

export default createApp();
