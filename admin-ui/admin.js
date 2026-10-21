// Trang quản lý game. Chạy sau khi đã đăng nhập Basic Auth (trình duyệt tự gửi thông tin đăng nhập cho các request cùng nguồn).
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const form = $('#form');
const editor = $('#editor');
const statusEl = $('#status');
const errorEl = $('#form-error');

let games = [];
let current = null; // slug đang sửa, null khi thêm mới

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.className = isError ? 'status error' : 'status';
  if (text) setTimeout(() => { if (statusEl.textContent === text) statusEl.textContent = ''; }, 4000);
}

async function api(path, { method = 'GET', body, form: formData } = {}) {
  const init = { method, headers: {} };
  if (formData) init.body = formData;
  else if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`/admin/api${path}`, init);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Lỗi ${res.status}`);
  return data;
}

async function load() {
  games = await api('/games');
  renderList();
}

function renderList() {
  const list = $('#list');
  if (!games.length) {
    list.innerHTML = '<li class="empty">Chưa có game nào. Bấm "+ Thêm game" để bắt đầu.</li>';
    return;
  }
  list.innerHTML = games
    .map((g, i) => `
      <li class="row ${g.visible ? '' : 'hidden-game'}" data-slug="${esc(g.slug)}">
        ${g.icon ? `<img src="${esc(g.icon)}" alt="" width="48" height="48">` : '<div class="icon-placeholder small"></div>'}
        <div class="row-main">
          <strong>${esc(g.name)}</strong>
          <span class="muted">${esc(g.tagline || g.subtitle || '')}</span>
          <span class="muted small">/${esc(g.slug)}${g.comingSoon ? ' · đang phát triển' : ''}</span>
        </div>
        <label class="switch" title="Bật/tắt hiển thị trên trang chủ">
          <input type="checkbox" role="switch" data-action="toggle" aria-label="Hiển thị ${esc(g.name)}" ${g.visible ? 'checked' : ''}>
          <span class="track"></span>
          <span class="switch-label">${g.visible ? 'Hiện' : 'Ẩn'}</span>
        </label>
        <div class="row-actions">
          <button type="button" class="icon-btn" data-action="up" ${i === 0 ? 'disabled' : ''} title="Lên">↑</button>
          <button type="button" class="icon-btn" data-action="down" ${i === games.length - 1 ? 'disabled' : ''} title="Xuống">↓</button>
          <button type="button" class="btn ghost small" data-action="edit">Sửa</button>
        </div>
      </li>`)
    .join('');
}

$('#list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const row = btn.closest('[data-slug]');
  const slug = row.dataset.slug;
  const i = games.findIndex((g) => g.slug === slug);
  try {
    if (btn.dataset.action === 'edit') return openEditor(games[i]);
    if (btn.dataset.action === 'up' || btn.dataset.action === 'down') {
      const j = btn.dataset.action === 'up' ? i - 1 : i + 1;
      [games[i], games[j]] = [games[j], games[i]];
      games = await api('/order', { method: 'PUT', body: { slugs: games.map((g) => g.slug) } });
      renderList();
      return;
    }
  } catch (err) {
    setStatus(err.message, true);
  }
});

$('#list').addEventListener('change', async (e) => {
  if (e.target.dataset.action !== 'toggle') return;
  const slug = e.target.closest('[data-slug]').dataset.slug;
  try {
    const updated = await api(`/games/${slug}`, { method: 'PUT', body: { visible: e.target.checked } });
    games = games.map((g) => (g.slug === slug ? updated : g));
    renderList();
    setStatus(updated.visible ? 'Đã hiện game' : 'Đã ẩn game');
  } catch (err) {
    e.target.checked = !e.target.checked;
    setStatus(err.message, true);
  }
});

/** Điền form từ một game (hoặc form trống khi thêm mới). */
function fillForm(g = {}) {
  form.reset();
  const get = (path) => path.split('.').reduce((o, k) => o?.[k], g);
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') el.checked = Boolean(get(el.name));
    else if (el.name === 'screenshots') el.value = (g.screenshots || []).join('\n');
    else el.value = get(el.name) ?? '';
  }
  $('#icon-preview').hidden = !g.icon;
  if (g.icon) $('#icon-preview').src = g.icon;
  if (!g.icon) $('#icon-preview').removeAttribute('src');
  $('#form-error').hidden = true;
}

function openEditor(g) {
  current = g ? g.slug : null;
  $('#editor-title').textContent = g ? `Sửa: ${g.name}` : 'Thêm game';
  $('#delete').hidden = !g;
  fillForm(g || { visible: true });
  editor.hidden = false;
  editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeEditor() {
  editor.hidden = true;
  current = null;
}

$('#new-game').addEventListener('click', () => openEditor(null));
$('#cancel').addEventListener('click', closeEditor);

/** Đọc form thành object gửi lên API. */
function readForm() {
  const v = (name) => form.elements[name].value.trim();
  return {
    name: v('name'),
    subtitle: v('subtitle'),
    tagline: v('tagline'),
    description: v('description'),
    visible: form.elements.visible.checked,
    comingSoon: form.elements.comingSoon.checked,
    icon: v('icon'),
    screenshots: v('screenshots').split('\n').map((s) => s.trim()).filter(Boolean),
    links: {
      androidApk: v('links.androidApk'),
      playStore: v('links.playStore'),
      iosDirect: v('links.iosDirect'),
      appStore: v('links.appStore'),
      web: v('links.web'),
    },
    privacy: {
      url: v('privacy.url'),
      updated: v('privacy.updated'),
      html: form.elements['privacy.html'].value,
    },
  };
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  const payload = readForm();
  $('#save').disabled = true;
  try {
    if (current) {
      const updated = await api(`/games/${current}`, { method: 'PUT', body: payload });
      games = games.map((g) => (g.slug === current ? updated : g));
    } else {
      const created = await api('/games', { method: 'POST', body: payload });
      games = [...games, created];
    }
    renderList();
    closeEditor();
    setStatus('Đã lưu');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  } finally {
    $('#save').disabled = false;
  }
});

$('#delete').addEventListener('click', async () => {
  const g = games.find((x) => x.slug === current);
  if (!g || !confirm(`Xoá game "${g.name}"? Hành động này không hoàn tác.`)) return;
  try {
    await api(`/games/${current}`, { method: 'DELETE' });
    games = games.filter((x) => x.slug !== current);
    renderList();
    closeEditor();
    setStatus('Đã xoá game');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});

/** Tải file lên và điền đường dẫn vào ô tương ứng. */
document.querySelectorAll('[data-upload]').forEach((input) => {
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const kind = input.dataset.upload;
    const fd = new FormData();
    fd.append(kind === 'apk' ? 'apk' : 'image', file);
    input.disabled = true;
    setStatus(`Đang tải ${file.name}…`);
    try {
      const { url } = await api('/upload', { method: 'POST', form: fd });
      if (kind === 'icon') {
        form.elements.icon.value = url;
        $('#icon-preview').src = url;
        $('#icon-preview').hidden = false;
      } else if (kind === 'screenshot') {
        const area = form.elements.screenshots;
        area.value = [area.value.trim(), url].filter(Boolean).join('\n');
      } else if (kind === 'apk') {
        form.elements['links.androidApk'].value = url;
      }
      setStatus('Đã tải lên');
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      input.disabled = false;
      input.value = '';
    }
  });
});

load().catch((err) => setStatus(err.message, true));
