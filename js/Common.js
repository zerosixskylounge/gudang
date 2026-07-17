/* ============================================================
   GANTI URL INI dengan URL Web App hasil Deploy Apps Script kamu
   Cukup diisi SEKALI di sini — semua halaman pakai file ini.
   ============================================================ */
const API_URL = "https://script.google.com/macros/s/AKfycbyx1GfMeVMhc4bN2uk5T2bNsWg42rvvN_JMOqqaFs6SinCXy4nF2kckaP0pU8BTDgTYgw/exec";

const KATEGORI_GLYPH = { Bar: '🍸', Koki: '🍳', Produk: '📦', Inventaris: '🧹' };
const KATEGORI_LIST = ['Bar', 'Koki', 'Produk', 'Inventaris'];

/* ---------- API helper ---------- */
async function api(action, payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // hindari CORS preflight
    body: JSON.stringify({ action, payload: payload || {} })
  });
  return res.json();
}

/* ---------- loading overlay ---------- */
function showLoading(msg) {
  const el = document.createElement('div');
  el.className = 'loading-overlay';
  el.id = 'loadingOverlay';
  el.innerHTML = '<div class="loading-box">' + (msg || 'Memproses…') + '</div>';
  document.body.appendChild(el);
}
function hideLoading() {
  const el = document.getElementById('loadingOverlay');
  if (el) el.remove();
}

/* ---------- auth guard: panggil di setiap halaman selain login.html ---------- */
function requireLogin() {
  const user = sessionStorage.getItem('czs_user');
  if (!user) {
    location.href = 'login.html';
    return null;
  }
  return user;
}

/* ---------- render header standar di semua halaman ---------- */
function renderHeader(user) {
  const el = document.getElementById('appHeader');
  if (!el) return;
  el.innerHTML =
    '<a class="brand" href="menu.html">' +
      '<span class="kecil">Gudang</span>' +
      '<span class="besar">CAFE ZERO SIX</span>' +
    '</a>' +
    '<div class="user">' +
      '<span>' + user + '</span>' +
      '<button id="logoutBtn">Keluar</button>' +
    '</div>';
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('czs_user');
    location.href = 'login.html';
  });
}

/* ---------- proteksi double-submit ---------- */
function guardDoubleSubmit(buttonEl, asyncFn) {
  buttonEl.addEventListener('click', async () => {
    if (buttonEl.dataset.busy === '1') return; // sudah diproses, abaikan klik kedua
    buttonEl.dataset.busy = '1';
    buttonEl.disabled = true;
    try {
      await asyncFn();
    } finally {
      buttonEl.dataset.busy = '0';
      buttonEl.disabled = false;
    }
  });
}
