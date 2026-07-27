/**
 * ============================================================
 * FILE            : app.js
 * VERSION         : 2.2.0
 * PROJECT         : Zero Six Inventory
 * LAST UPDATE     : 12 Juli 2026
 *
 * FUNGSI
 * ------------------------------------------------------------
 * Core Framework Frontend Zero Six Inventory. Semua halaman
 * WAJIB load file ini SEBELUM <script> khusus halaman itu
 * sendiri:
 *
 *   <script src="app.js"></script>
 *   <script> ... logic khusus halaman ini ... </script>
 *
 * ISI FILE
 * ------------------------------------------------------------
 * 1. KONFIGURASI (APP, API_URL, SESSION_KEY, dst)
 * 2. SESSION (getSession/setSession/clearSession, guard, logout)
 * 3. PANGGIL API (panggilApi() — WAJIB dipakai semua halaman
 *    untuk komunikasi ke backend, JANGAN fetch() manual)
 * 4. CACHE & SETTINGS STORAGE
 * 5. FORMATTER (angka, rupiah, tanggal)
 * 6. UI HELPER (toast, loading modal, confirm)
 * 7. UTILITY UMUM (isEmpty, debounce, dll)
 * 8. FINAL EXPORT (window.*)
 *
 * CHANGELOG
 * ------------------------------------------------------------
 * v2.2.0
 * - FIX  : panggilApi() DITAMBAHKAN — versi sebelumnya (v2.1.0,
 *          "Part 1") dipanggil di 46 tempat oleh 11 halaman tapi
 *          fungsinya sendiri TIDAK PERNAH ada di file ("Part 2"
 *          yang menambahkannya tidak pernah tergabung). Akibatnya
 *          SEMUA pemanggilan API di seluruh aplikasi gagal total
 *          (termasuk login).
 * - FIX  : File sebelumnya berisi 3 salinan hampir identik dari
 *          getSession/setSession/clearSession/isLoggedIn/
 *          getToken/guardSession/tanganiJikaSessionGagal/
 *          formatAngka/formatRupiah/formatTanggal/escapeHtml/
 *          tampilkanToast/konfirmasi — sekarang cuma 1 masing².
 * - FIX  : getSessionData()/saveSessionData()/clearSessionData()
 *          dipanggil (app.js sendiri + anggota.html + produk.html)
 *          tapi tidak pernah didefinisikan (cuma getSession() dkk
 *          TANPA "Data"). Sekarang jadi alias resmi ke
 *          getSession()/setSession()/clearSession().
 * - DEL  : Fungsi yang tidak dipanggil halaman manapun dihapus
 *          (dicek lewat grep ke semua 11 halaman) : getNamaUser,
 *          getUserName, getRole, getUserRole, renderNavbarUser,
 *          renderUserNavbar, guardGuest, forceLogout.
 * ============================================================
 */


/* ============================================================
 * 1. KONFIGURASI
 * ============================================================ */
const APP = Object.freeze({
  NAME: "Zero Six Inventory",
  VERSION: "2.1.0",
  DATABASE: "1.1.0"
});

const API_URL =
  "https://script.google.com/macros/s/AKfycbwt1kGannQxjKH966H3ZlrSW0RVqk4FGETrf_v6YWr__PRB-pTJclBlAzLWt-o6BKpPVQ/exec";

const SESSION_KEY = "zerosix_inventory_session";
const SETTINGS_KEY = "zerosix_inventory_settings";
const CACHE_KEY = "zerosix_inventory_cache";


/* ============================================================
 * 2. SESSION
 * ------------------------------------------------------------
 * Session disimpan sebagai satu object JSON di localStorage:
 * { token, nama, username, role }
 * ============================================================ */

function getSession() {

  try {

    const raw = localStorage.getItem(SESSION_KEY);

    if (!raw) return null;

    return JSON.parse(raw);

  } catch (err) {

    console.error("Session parse error:", err);

    return null;

  }

}

function setSession(sessionData) {

  if (!sessionData) return;

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(sessionData)
  );

}

function clearSession() {

  localStorage.removeItem(SESSION_KEY);

}

// Alias — beberapa halaman (anggota.html, produk.html) dan
// app.js sendiri sebelumnya memanggil nama-nama ini (dengan
// "Data") yang ternyata tidak pernah benar-benar ada.
function getSessionData() { return getSession(); }
function saveSessionData(data) { return setSession(data); }
function clearSessionData() { return clearSession(); }

function isLoggedIn() {

  const session = getSession();

  return !!(session && session.token);

}

function getToken() {

  const session = getSession();

  return session && session.token ? session.token : "";

}

/**
 * WAJIB dipanggil di awal <script> setiap halaman SETELAH
 * login. Kalau belum login, redirect ke login.html dan return
 * false — kode pemanggil HARUS berhenti kalau ini return false.
 * Otomatis isi #userNama / #userRole kalau elemen itu ada.
 */
function guardSession() {

  if (!isLoggedIn()) {

    window.location.href = "login.html";

    return false;

  }

  const session = getSession();

  const namaEl = document.getElementById("userNama");
  const roleEl = document.getElementById("userRole");

  if (namaEl) namaEl.textContent = session.nama || session.username || "-";
  if (roleEl) roleEl.textContent = session.role || "-";

  return true;

}

/**
 * Logout — panggil backend auth.logout dulu (supaya Session di
 * sheet ditandai NONAKTIF), baru hapus session lokal & redirect.
 * Tetap redirect walau request ke backend gagal.
 */
async function handleLogout() {

  const yakin = konfirmasi("Keluar dari Zero Six Inventory?");

  if (!yakin) return;

  try {

    await panggilApi("auth", "logout");

  } catch (err) {

    console.warn("Logout API gagal:", err);

  }

  clearSession();

  window.location.href = "login.html";

}

/**
 * Deteksi apakah pesan error dari backend soal session/token.
 * Kalau ya, tampilkan toast lalu redirect ke login.html —
 * return true (kode pemanggil harus berhenti kalau return true).
 */
function tanganiJikaSessionGagal(message) {

  if (!message) return false;

  const text = String(message).toLowerCase();

  const keywords = ["token", "session", "expired", "kadaluarsa"];

  const bermasalah = keywords.some(function (kata) {
    return text.includes(kata);
  });

  if (!bermasalah) return false;

  tampilkanToast("Session berakhir. Silakan login ulang.", "error");

  setTimeout(function () {

    clearSession();

    window.location.href = "login.html";

  }, 1200);

  return true;

}

async function validateSession() {

  if (!isLoggedIn()) return false;

  try {

    const result = await panggilApi("auth", "validate");

    if (!result.success) {

      tanganiJikaSessionGagal(result.message);

      return false;

    }

    return true;

  } catch (err) {

    console.error(err);

    return false;

  }

}


/* ============================================================
 * 3. PANGGIL API
 * ------------------------------------------------------------
 * SATU-SATUNYA cara halaman manapun bicara ke backend. JANGAN
 * fetch() manual di halaman — selalu lewat panggilApi() supaya
 * header/format request konsisten dan token otomatis disisipkan.
 * ============================================================ */
async function panggilApi(module, action, extra) {

  const session = getSession();

  const body = Object.assign(
    { module: module, action: action },
    (session && session.token) ? { token: session.token } : {},
    extra || {}
  );

  try {

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        // WAJIB "text/plain", BUKAN "application/json" — Apps
        // Script Web App tidak menangani preflight OPTIONS
        // dengan baik. Jangan diganti, request bisa gagal CORS.
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify(body)

    });

    return await response.json();

  } catch (err) {

    return {
      success: false,
      message: "Tidak bisa menghubungi server. Cek koneksi internet."
    };

  }

}

/**
 * GET langsung ke Web App (doGet — tidak perlu login). Dipakai
 * buat cek koneksi server, BUKAN untuk operasi data biasa.
 */
async function cekServer() {

  try {

    const response = await fetch(API_URL);

    return await response.json();

  } catch (err) {

    return { success: false, message: "Server tidak terhubung." };

  }

}


/* ============================================================
 * 4. CACHE & SETTINGS STORAGE
 * ============================================================ */
function getCache() {

  try {

    const raw = localStorage.getItem(CACHE_KEY);

    return raw ? JSON.parse(raw) : {};

  } catch (err) {

    return {};

  }

}

function setCache(data) {

  localStorage.setItem(CACHE_KEY, JSON.stringify(data || {}));

}

function clearCache() {

  localStorage.removeItem(CACHE_KEY);

}

function getSettings() {

  try {

    const raw = localStorage.getItem(SETTINGS_KEY);

    return raw ? JSON.parse(raw) : {};

  } catch (err) {

    return {};

  }

}

function saveSettings(settings) {

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings || {}));

}


/* ============================================================
 * 5. FORMATTER
 * ============================================================ */
function formatAngka(nilai) {

  return Number(nilai || 0).toLocaleString("id-ID");

}

function formatRupiah(nilai) {

  return "Rp " + Number(nilai || 0).toLocaleString("id-ID");

}

function formatTanggal(tanggal) {

  if (!tanggal) return "-";

  const date = new Date(tanggal);

  if (isNaN(date.getTime())) return tanggal;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

}

function formatTanggalPendek(tanggal) {

  if (!tanggal) return "-";

  const date = new Date(tanggal);

  if (isNaN(date.getTime())) return tanggal;

  return date.toLocaleDateString("id-ID");

}

function formatDateTime(value) {

  if (!value) return "-";

  const date = new Date(value);

  if (isNaN(date.getTime())) return value;

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

}


/* ============================================================
 * 6. UI HELPER (toast, loading modal, confirm)
 * ============================================================ */
let toastTimer = null;

function tampilkanToast(pesan, tipe) {

  const toast = document.getElementById("toast");

  if (!toast) {
    console.warn("Element #toast tidak ditemukan.");
    return;
  }

  toast.textContent = pesan || "";

  toast.className = "toast";

  if (tipe) toast.classList.add(tipe);

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(function () {

    toast.classList.remove("show");

  }, 3000);

}

function tampilkanLoading(teks) {

  let modal = document.getElementById("globalLoading");

  if (!modal) {

    modal = document.createElement("div");
    modal.id = "globalLoading";

    modal.innerHTML =
      '<div class="loading-backdrop">' +
        '<div class="loading-box">' +
          '<div class="loading-spinner"></div>' +
          '<div class="loading-text" id="loadingText">Memproses...</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

  }

  const textElement = document.getElementById("loadingText");

  if (textElement) textElement.textContent = teks || "Memproses...";

  modal.style.display = "block";

}

function sembunyikanLoading() {

  const modal = document.getElementById("globalLoading");

  if (modal) modal.style.display = "none";

}

function konfirmasi(pesan) {

  return window.confirm(pesan || "Apakah Anda yakin?");

}


/* ============================================================
 * 7. UTILITY UMUM
 * ============================================================ */
function isEmpty(value) {

  return value === null || value === undefined || value === "";

}

function toInt(value) {

  const num = parseInt(value, 10);

  return isNaN(num) ? 0 : num;

}

function toFloat(value) {

  const num = parseFloat(value);

  return isNaN(num) ? 0 : num;

}

function clone(obj) {

  return JSON.parse(JSON.stringify(obj));

}

function sleep(ms) {

  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });

}

function escapeHtml(value) {

  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

function debounce(func, delay) {

  let timeout;

  return function () {

    const context = this;
    const args = arguments;

    clearTimeout(timeout);

    timeout = setTimeout(function () {
      func.apply(context, args);
    }, delay || 300);

  };

}

function getQueryParam(key) {

  const params = new URLSearchParams(window.location.search);

  return params.get(key);

}

function copyText(text) {

  return navigator.clipboard.writeText(text);

}

function downloadJson(filename, data) {

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = filename || "data.json";

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);

}

function $(selector) { return document.querySelector(selector); }
function $all(selector) { return Array.from(document.querySelectorAll(selector)); }
function byId(id) { return document.getElementById(id); }

function resetForm(formId) {

  const form = typeof formId === "string" ? document.getElementById(formId) : formId;

  if (form) form.reset();

}

function setValue(id, value) {

  const el = document.getElementById(id);

  if (el) el.value = value ?? "";

}

function getValue(id) {

  const el = document.getElementById(id);

  return el ? el.value.trim() : "";

}

function setButtonLoading(button, textLoading) {

  if (!button) return;

  button.dataset.originalText = button.textContent;
  button.disabled = true;
  button.textContent = textLoading || "Memproses...";

}

function resetButtonLoading(button) {

  if (!button) return;

  button.disabled = false;

  if (button.dataset.originalText) button.textContent = button.dataset.originalText;

}


/* ============================================================
 * 8. FINAL EXPORT
 * ============================================================ */
window.APP = APP;
window.API_URL = API_URL;
window.SESSION_KEY = SESSION_KEY;

window.getSession = getSession;
window.setSession = setSession;
window.clearSession = clearSession;
window.getSessionData = getSessionData;
window.saveSessionData = saveSessionData;
window.clearSessionData = clearSessionData;
window.isLoggedIn = isLoggedIn;
window.getToken = getToken;
window.guardSession = guardSession;
window.handleLogout = handleLogout;
window.tanganiJikaSessionGagal = tanganiJikaSessionGagal;
window.validateSession = validateSession;

window.panggilApi = panggilApi;
window.cekServer = cekServer;

window.getCache = getCache;
window.setCache = setCache;
window.clearCache = clearCache;
window.getSettings = getSettings;
window.saveSettings = saveSettings;

window.formatAngka = formatAngka;
window.formatRupiah = formatRupiah;
window.formatTanggal = formatTanggal;
window.formatTanggalPendek = formatTanggalPendek;
window.formatDateTime = formatDateTime;

window.tampilkanToast = tampilkanToast;
window.tampilkanLoading = tampilkanLoading;
window.sembunyikanLoading = sembunyikanLoading;
window.konfirmasi = konfirmasi;

window.isEmpty = isEmpty;
window.toInt = toInt;
window.toFloat = toFloat;
window.clone = clone;
window.sleep = sleep;
window.escapeHtml = escapeHtml;
window.debounce = debounce;
window.getQueryParam = getQueryParam;
window.copyText = copyText;
window.downloadJson = downloadJson;

window.$ = $;
window.$all = $all;
window.byId = byId;
window.resetForm = resetForm;
window.setValue = setValue;
window.getValue = getValue;
window.setButtonLoading = setButtonLoading;
window.resetButtonLoading = resetButtonLoading;

console.log(
  "%cZero Six Inventory v" + APP.VERSION,
  "color:#1e4fd8;font-weight:bold;"
);
