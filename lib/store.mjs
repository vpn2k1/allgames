// Lưu danh sách game. Có hai nơi lưu:
//  - Vercel Blob (khi có BLOB_READ_WRITE_TOKEN): dùng trên Vercel, nơi hệ thống file chỉ đọc.
//  - data/games.json trên đĩa: dùng khi chạy local. File này cũng là dữ liệu khởi tạo cho Blob lần đầu.
// Ghi nối tiếp qua một hàng đợi để tránh hai lần ghi chồng nhau.
import { readFile, writeFile, rename } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { list as listBlobs, put } from '@vercel/blob';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'data', 'games.json');
const BLOB_KEY = 'data/games.json';

export const usingBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_OK = /^(https?:\/\/|\/)[^\s]*$/;
const ASSET_OK = /^(https?:\/\/|\/(uploads|assets)\/)[^\s]*$/;
const LINK_KEYS = ['androidApk', 'playStore', 'appStore', 'iosDirect', 'web'];

let queue = Promise.resolve();

async function readAll() {
  if (usingBlob) {
    // Lỗi mạng/quyền phải nổi lên: nếu nuốt lỗi rồi quay về dữ liệu khởi tạo, lần ghi sau sẽ đè mất dữ liệu thật.
    const { blobs } = await listBlobs({ prefix: BLOB_KEY });
    const blob = blobs.find((b) => b.pathname === BLOB_KEY);
    if (blob) {
      const res = await fetch(`${blob.url}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Không đọc được dữ liệu từ Blob (${res.status})`);
      return res.json();
    }
  }
  return JSON.parse(await readFile(file, 'utf8'));
}

async function writeAll(games) {
  if (usingBlob) {
    await put(BLOB_KEY, JSON.stringify(games, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    });
    return;
  }
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(games, null, 2) + '\n');
  await rename(tmp, file);
}

/** Chạy một thao tác đọc-sửa-ghi nối tiếp. */
function locked(fn) {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

export const list = () => readAll();

export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'game';
}

class ValidationError extends Error {}

const str = (v, max, label) => {
  if (v == null) return '';
  if (typeof v !== 'string') throw new ValidationError(`${label} phải là chuỗi`);
  if (v.length > max) throw new ValidationError(`${label} quá ${max} ký tự`);
  return v.trim();
};

/** Chuẩn hoá và kiểm tra một game. `base` là bản ghi hiện có khi sửa. */
function normalize(input, base = {}) {
  const out = { ...base };
  if ('name' in input) {
    out.name = str(input.name, 100, 'Tên game');
    if (!out.name) throw new ValidationError('Tên game không được để trống');
  }
  if ('subtitle' in input) out.subtitle = str(input.subtitle, 100, 'Phụ đề');
  if ('tagline' in input) out.tagline = str(input.tagline, 200, 'Slogan');
  if ('description' in input) out.description = str(input.description, 2000, 'Mô tả');
  if ('visible' in input) out.visible = Boolean(input.visible);
  if ('comingSoon' in input) out.comingSoon = Boolean(input.comingSoon);
  if ('order' in input) out.order = Number.isFinite(Number(input.order)) ? Number(input.order) : 0;

  if ('icon' in input) {
    const icon = str(input.icon, 500, 'Icon');
    if (icon && !ASSET_OK.test(icon)) throw new ValidationError('Icon phải là link ảnh hợp lệ');
    out.icon = icon;
  }
  if ('screenshots' in input) {
    if (!Array.isArray(input.screenshots)) throw new ValidationError('Ảnh chụp màn hình phải là danh sách');
    out.screenshots = input.screenshots.map((s) => {
      const url = str(s, 500, 'Ảnh chụp');
      if (!ASSET_OK.test(url)) throw new ValidationError('Ảnh chụp phải là link ảnh hợp lệ');
      return url;
    }).filter(Boolean);
  }
  if ('links' in input) {
    const links = { ...(base.links || {}) };
    for (const key of LINK_KEYS) {
      if (!(key in (input.links || {}))) continue;
      const url = str(input.links[key], 500, 'Link');
      if (url && !URL_OK.test(url)) throw new ValidationError(`Link ${key} phải bắt đầu bằng http(s):// hoặc /`);
      links[key] = url;
    }
    out.links = links;
  }
  if ('privacy' in input) {
    const p = input.privacy || {};
    const url = str(p.url, 500, 'Link chính sách');
    if (url && !URL_OK.test(url)) throw new ValidationError('Link chính sách phải bắt đầu bằng http(s):// hoặc /');
    out.privacy = {
      html: typeof p.html === 'string' ? p.html : '',
      url,
      updated: str(p.updated, 40, 'Ngày cập nhật'),
    };
  }
  return out;
}

export async function createGame(input) {
  return locked(async () => {
    const games = await readAll();
    const name = str(input.name, 100, 'Tên game');
    if (!name) throw new ValidationError('Tên game không được để trống');
    let slug = input.slug ? str(input.slug, 60, 'Slug') : slugify(name);
    if (!SLUG.test(slug)) throw new ValidationError('Slug chỉ gồm chữ thường, số và dấu gạch ngang');
    const taken = new Set(games.map((g) => g.slug));
    if (taken.has(slug)) {
      const base = slug;
      let i = 2;
      while (taken.has(slug)) slug = `${base}-${i++}`;
    }
    const order = games.reduce((max, g) => Math.max(max, g.order ?? 0), 0) + 1;
    const game = normalize(
      { visible: true, comingSoon: false, ...input, name },
      {
        slug,
        subtitle: '',
        tagline: '',
        description: '',
        icon: '',
        screenshots: [],
        visible: true,
        comingSoon: false,
        order,
        links: Object.fromEntries(LINK_KEYS.map((k) => [k, ''])),
        privacy: { html: '', url: '', updated: '' },
      },
    );
    games.push(game);
    await writeAll(games);
    return game;
  });
}

export async function updateGame(slug, input) {
  return locked(async () => {
    const games = await readAll();
    const i = games.findIndex((g) => g.slug === slug);
    if (i < 0) return null;
    const { slug: _ignored, ...rest } = input;
    games[i] = normalize(rest, games[i]);
    games[i].updatedAt = new Date().toISOString();
    await writeAll(games);
    return games[i];
  });
}

export async function deleteGame(slug) {
  return locked(async () => {
    const games = await readAll();
    const next = games.filter((g) => g.slug !== slug);
    if (next.length === games.length) return false;
    await writeAll(next);
    return true;
  });
}

/** Đặt thứ tự hiển thị theo danh sách slug. Game không có trong danh sách giữ nguyên thứ tự sau cùng. */
export async function reorder(slugs) {
  return locked(async () => {
    const games = await readAll();
    const pos = new Map(slugs.map((s, i) => [s, i + 1]));
    const sorted = [...games].sort((a, b) => (pos.get(a.slug) ?? 1e9) - (pos.get(b.slug) ?? 1e9));
    sorted.forEach((g, i) => (g.order = i + 1));
    await writeAll(sorted);
    return sorted;
  });
}

export { ValidationError };
