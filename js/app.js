/*
============================================================
FILE            : app.js
VERSION         : 2.1.0
PROJECT         : Zero Six Inventory
LAST UPDATE     : 23 Juli 2026

FUNGSI
------------------------------------------------------------
Core Framework Frontend Zero Six Inventory

PART 1
------------------------------------------------------------
- App Configuration
- API Configuration
- Session Storage
- Core Helper
- Basic Utility

CATATAN
------------------------------------------------------------
Semua halaman wajib load file ini.

<script src="app.js"></script>

PART 2 akan menambahkan:
- panggilApi()
- API Engine
- Error Handler
- Timeout Handler
============================================================
*/


/* ==========================================================
   APPLICATION CONFIG
========================================================== */

const APP = Object.freeze({

  NAME: "Zero Six Inventory",

  VERSION: "2.1.0",

  DATABASE: "1.1.0"

});


/* ==========================================================
   API CONFIG
========================================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbwt1kGannQxjKH966H3ZlrSW0RVqk4FGETrf_v6YWr__PRB-pTJclBlAzLWt-o6BKpPVQ/exec";


/* ==========================================================
   STORAGE KEY
========================================================== */

const SESSION_KEY = "zerosix_inventory_session";

const SETTINGS_KEY = "zerosix_inventory_settings";

const CACHE_KEY = "zerosix_inventory_cache";


/* ==========================================================
   SESSION STORAGE
========================================================== */

/**
 * Ambil data session dari localStorage.
 *
 * Return:
 * {
 *   token,
 *   nama,
 *   username,
 *   role
 * }
 *
 * atau null
 */
function getSession() {

  try {

    const raw = localStorage.getItem(SESSION_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);

  } catch (err) {

    console.error("Gagal membaca session.", err);

    return null;

  }

}


/**
 * Simpan session login.
 */
function setSession(sessionData) {

  if (!sessionData) {
    return;
  }

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(sessionData)
  );

}


/**
 * Hapus session login.
 */
function clearSession() {

  localStorage.removeItem(SESSION_KEY);

}


/**
 * Cek apakah user sudah login.
 */
function isLoggedIn() {

  const session = getSession();

  return !!(
    session &&
    session.token
  );

}


/**
 * Ambil token login.
 */
function getToken() {

  const session = getSession();

  return session
    ? session.token
    : "";

}


/**
 * Ambil nama user login.
 */
function getNamaUser() {

  const session = getSession();

  return session
    ? (session.nama || "")
    : "";

}


/**
 * Ambil username user login.
 */
function getUsername() {

  const session = getSession();

  return session
    ? (session.username || "")
    : "";

}


/**
 * Ambil role user login.
 */
function getRole() {

  const session = getSession();

  return session
    ? (session.role || "")
    : "";

}


/* ==========================================================
   CACHE STORAGE
========================================================== */

function getCache() {

  try {

    const raw = localStorage.getItem(CACHE_KEY);

    if (!raw) {
      return {};
    }

    return JSON.parse(raw);

  } catch {

    return {};

  }

}


function setCache(data) {

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify(data || {})
  );

}


function clearCache() {

  localStorage.removeItem(CACHE_KEY);

}


/* ==========================================================
   SETTINGS STORAGE
========================================================== */

function getSettings() {

  try {

    const raw = localStorage.getItem(SETTINGS_KEY);

    if (!raw) {
      return {};
    }

    return JSON.parse(raw);

  } catch {

    return {};

  }

}


function saveSettings(settings) {

  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(settings || {})
  );

}


/* ==========================================================
   CORE UTILITIES
========================================================== */

/**
 * Nilai kosong?
 */
function isEmpty(value) {

  return (
    value === null ||
    value === undefined ||
    value === ""
  );

}


/**
 * Ubah ke integer aman.
 */
function toInt(value) {

  const num = parseInt(value, 10);

  return isNaN(num)
    ? 0
    : num;

}


/**
 * Ubah ke float aman.
 */
function toFloat(value) {

  const num = parseFloat(value);

  return isNaN(num)
    ? 0
    : num;

}


/**
 * Clone object sederhana.
 */
function clone(obj) {

  return JSON.parse(
    JSON.stringify(obj)
  );

}


/**
 * Delay async.
 */
function sleep(ms) {

  return new Promise(function(resolve) {

    setTimeout(resolve, ms);

  });

}


/**
 * Generate random ID frontend.
 */
function generateId(prefix = "TMP") {

  return (
    prefix +
    "-" +
    Date.now() +
    "-" +
    Math.floor(Math.random() * 9999)
  );

}


/* ==========================================================
   DOM HELPER
========================================================== */

function el(id) {

  return document.getElementById(id);

}


function qs(selector) {

  return document.querySelector(selector);

}


function qsa(selector) {

  return Array.from(
    document.querySelectorAll(selector)
  );

}


/* ==========================================================
   DEBUG
========================================================== */

function debug(...args) {

  console.log(
    "[ZeroSix]",
    ...args
  );

}


console.log(
  "%cZero Six Inventory v" + APP.VERSION,
  "color:#1f4fd7;font-weight:bold;"
);

debug("Core Framework Loaded");
/* ============================================================
 * SESSION & AUTH HELPERS
 * ============================================================ */

/**
 * Ambil data session dari localStorage.
 * Return:
 * - object session
 * - null jika tidak ada / rusak
 */
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

/**
 * Simpan session baru.
 */
function setSession(data) {

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(data || {})
  );

}

/**
 * Hapus session.
 */
function clearSession() {

  localStorage.removeItem(SESSION_KEY);

}

/**
 * Ambil token aktif.
 */
function getToken() {

  const session = getSession();

  if (!session) return "";

  return session.token || "";

}

/**
 * Cek apakah session tersedia.
 */
function isLoggedIn() {

  const token = getToken();

  return token !== "";

}

/**
 * Guard halaman login.
 *
 * Jika user sudah login,
 * redirect langsung ke dashboard.
 */
function guardGuest() {

  if (isLoggedIn()) {

    window.location.href = "dashboard.html";

    return false;

  }

  return true;

}

/**
 * Guard halaman admin.
 *
 * Jika belum login:
 * redirect ke login.
 */
function guardSession() {

  if (!isLoggedIn()) {

    clearSession();

    window.location.href = "login.html";

    return false;

  }

  return true;

}

/**
 * Logout lokal.
 *
 * Tidak memanggil backend.
 * Dipakai saat token invalid.
 */
function forceLogout() {

  clearSession();

  window.location.href = "login.html";

}

/**
 * Logout normal.
 *
 * Panggil backend auth.logout.
 */
async function handleLogout() {

  const yakin = confirm(
    "Keluar dari aplikasi?"
  );

  if (!yakin) return;

  try {

    await panggilApi(
      "auth",
      "logout"
    );

  } catch (err) {

    console.warn(
      "Logout API gagal:",
      err
    );

  }

  clearSession();

  window.location.href = "login.html";

}

/**
 * Deteksi error session/token.
 *
 * Return:
 * true  = session bermasalah
 * false = bukan masalah session
 */
function tanganiJikaSessionGagal(message) {

  if (!message) return false;

  const text = String(message).toLowerCase();

  const keywords = [
    "token",
    "session",
    "expired",
    "kadaluarsa",
    "login"
  ];

  const ditemukan = keywords.some(function (kata) {
    return text.includes(kata);
  });

  if (!ditemukan) {
    return false;
  }

  tampilkanToast(
    "Session berakhir. Silakan login ulang.",
    "error"
  );

  setTimeout(function () {

    forceLogout();

  }, 1200);

  return true;

}

/**
 * Ambil nama user aktif.
 */
function getNamaUser() {

  const session = getSession();

  return session?.nama || "-";

}

/**
 * Ambil role user aktif.
 */
function getRoleUser() {

  const session = getSession();

  return session?.role || "-";

}

/**
 * Isi navbar user otomatis.
 */
function renderNavbarUser() {

  const namaEl =
    document.getElementById("userNama");

  const roleEl =
    document.getElementById("userRole");

  if (namaEl) {
    namaEl.textContent = getNamaUser();
  }

  if (roleEl) {
    roleEl.textContent = getRoleUser();
  }

}

/**
 * Validasi session ke backend.
 *
 * Dipanggil saat halaman dibuka.
 */
async function validateSession() {

  if (!isLoggedIn()) {
    return false;
  }

  try {

    const result = await panggilApi(
      "auth",
      "validate"
    );

    if (!result.success) {

      tanganiJikaSessionGagal(
        result.message
      );

      return false;

    }

    return true;

  } catch (err) {

    console.error(err);

    return false;

  }

}
/* ============================================================
 * SECTION 7 : HTML ESCAPE
 * ------------------------------------------------------------
 * Mencegah XSS saat render data ke innerHTML.
 * WAJIB dipakai untuk data dari Spreadsheet/API.
 * ============================================================ */
function escapeHtml(value){

  if(value === null || value === undefined){
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ============================================================
 * SECTION 8 : FORMAT ANGKA
 * ============================================================ */
function formatAngka(value){

  const angka = Number(value || 0);

  return angka.toLocaleString("id-ID");

}


/* ============================================================
 * SECTION 9 : FORMAT RUPIAH
 * ============================================================ */
function formatRupiah(value){

  const angka = Number(value || 0);

  return "Rp " + angka.toLocaleString("id-ID");

}


/* ============================================================
 * SECTION 10 : FORMAT TANGGAL
 * ------------------------------------------------------------
 * Input:
 * 2026-07-12
 *
 * Output:
 * 12 Juli 2026
 * ============================================================ */
function formatTanggal(tanggal){

  if(!tanggal){
    return "-";
  }

  const date = new Date(tanggal);

  if(isNaN(date.getTime())){
    return tanggal;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

}


/* ============================================================
 * SECTION 11 : FORMAT DATETIME
 * ============================================================ */
function formatDateTime(value){

  if(!value){
    return "-";
  }

  const date = new Date(value);

  if(isNaN(date.getTime())){
    return value;
  }

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

}


/* ============================================================
 * SECTION 12 : LOADING BUTTON
 * ------------------------------------------------------------
 * Dipakai hampir semua halaman.
 * ============================================================ */
function setButtonLoading(button, textLoading){

  if(!button){
    return;
  }

  button.dataset.originalText = button.textContent;

  button.disabled = true;
  button.textContent = textLoading || "Memproses...";

}

function resetButtonLoading(button){

  if(!button){
    return;
  }

  button.disabled = false;

  if(button.dataset.originalText){
    button.textContent = button.dataset.originalText;
  }

}


/* ============================================================
 * SECTION 13 : TOAST NOTIFICATION
 * ------------------------------------------------------------
 * styles.css sudah punya class:
 * .toast
 * .toast.show
 * ============================================================ */
let toastTimer = null;

function tampilkanToast(pesan){

  const toast = document.getElementById("toast");

  if(!toast){
    return;
  }

  toast.textContent = pesan;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(function(){

    toast.classList.remove("show");

  }, 3000);

}


/* ============================================================
 * SECTION 14 : CONFIRM DELETE
 * ------------------------------------------------------------
 * Helper standar supaya semua halaman konsisten.
 * ============================================================ */
function konfirmasi(pesan){

  return window.confirm(
    pesan || "Apakah Anda yakin?"
  );

}


/* ============================================================
 * SECTION 15 : GET QUERY PARAM
 * ------------------------------------------------------------
 * contoh:
 * produk.html?id=BR001
 *
 * getQueryParam("id")
 * => BR001
 * ============================================================ */
function getQueryParam(key){

  const params = new URLSearchParams(
    window.location.search
  );

  return params.get(key);

}

/* ============================================================
 * AUTH & SESSION HANDLER
 * ============================================================ */

/**
 * Ambil data session aktif.
 * Return:
 * - object session jika ada
 * - null jika tidak ada / rusak
 */
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

/**
 * Simpan session baru.
 */
function setSession(sessionData) {

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(sessionData)
  );

}

/**
 * Hapus session.
 */
function clearSession() {

  localStorage.removeItem(SESSION_KEY);

}

/**
 * Cek apakah user login.
 */
function isLoggedIn() {

  const session = getSession();

  return !!(
    session &&
    session.token
  );

}

/**
 * Guard halaman.
 * Kalau belum login -> redirect login.
 */
function guardSession() {

  if (!isLoggedIn()) {

    window.location.href = "login.html";

    return false;

  }

  return true;

}

/**
 * Ambil token aktif.
 */
function getToken() {

  const session = getSession();

  return session?.token || "";

}

/**
 * Ambil nama user.
 */
function getUserName() {

  const session = getSession();

  return session?.nama || "";

}

/**
 * Ambil role user.
 */
function getUserRole() {

  const session = getSession();

  return session?.role || "";

}

/**
 * Isi navbar user otomatis.
 */
function renderNavbarUser() {

  const namaEl = document.getElementById("userNama");
  const roleEl = document.getElementById("userRole");

  if (namaEl) {
    namaEl.textContent = getUserName();
  }

  if (roleEl) {
    roleEl.textContent = getUserRole();
  }

}

/**
 * Logout.
 */
async function handleLogout() {

  const yakin = confirm(
    "Keluar dari Zero Six Inventory?"
  );

  if (!yakin) return;

  try {

    await panggilApi(
      "auth",
      "logout"
    );

  } catch (err) {

    console.warn(
      "Logout API gagal:",
      err
    );

  }

  clearSession();

  window.location.href = "login.html";

}

/**
 * Tangani token invalid.
 */
function tanganiJikaSessionGagal(message) {

  const text = String(
    message || ""
  ).toLowerCase();

  const perluLogout =
    text.includes("token") ||
    text.includes("session");

  if (!perluLogout) {
    return false;
  }

  tampilkanToast(
    "Session berakhir. Silakan login ulang."
  );

  setTimeout(function () {

    clearSession();

    window.location.href = "login.html";

  }, 1000);

  return true;

}


/* ============================================================
 * FORMATTER
 * ============================================================ */

/**
 * Format angka Indonesia.
 */
function formatAngka(nilai) {

  const angka = Number(nilai || 0);

  return angka.toLocaleString("id-ID");

}

/**
 * Format rupiah.
 */
function formatRupiah(nilai) {

  const angka = Number(nilai || 0);

  return "Rp " +
    angka.toLocaleString("id-ID");

}

/**
 * Format tanggal Indonesia.
 */
function formatTanggal(tanggal) {

  if (!tanggal) return "-";

  const date = new Date(tanggal);

  if (isNaN(date)) return tanggal;

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );

}

/**
 * Format tanggal pendek.
 */
function formatTanggalPendek(tanggal) {

  if (!tanggal) return "-";

  const date = new Date(tanggal);

  if (isNaN(date)) return tanggal;

  return date.toLocaleDateString(
    "id-ID"
  );

}

/* ============================================================
 * TOAST
 * ============================================================ */

function tampilkanToast(pesan, tipe){

  const toast = document.getElementById("toast");

  if(!toast){
    console.warn("Element #toast tidak ditemukan.");
    return;
  }

  toast.textContent = pesan || "";

  toast.className = "toast";

  if(tipe){
    toast.classList.add(tipe);
  }

  toast.classList.add("show");

  clearTimeout(window.__toastTimer);

  window.__toastTimer = setTimeout(function(){

    toast.classList.remove("show");

  }, 3000);

}


/* ============================================================
 * MODAL LOADING
 * ============================================================ */

function tampilkanLoading(teks){

  let modal = document.getElementById("globalLoading");

  if(!modal){

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

  if(textElement){
    textElement.textContent = teks || "Memproses...";
  }

  modal.style.display = "block";

}

function sembunyikanLoading(){

  const modal = document.getElementById("globalLoading");

  if(modal){
    modal.style.display = "none";
  }

}


/* ============================================================
 * SIMPLE CONFIRM
 * ============================================================ */

function konfirmasi(pesan){

  return window.confirm(pesan || "Apakah Anda yakin?");

}


/* ============================================================
 * DOM HELPERS
 * ============================================================ */

function $(selector){

  return document.querySelector(selector);

}

function $all(selector){

  return Array.from(
    document.querySelectorAll(selector)
  );

}

function byId(id){

  return document.getElementById(id);

}


/* ============================================================
 * FORM HELPERS
 * ============================================================ */

function resetForm(formId){

  const form = typeof formId === "string"
    ? document.getElementById(formId)
    : formId;

  if(!form) return;

  form.reset();

}

function setValue(id, value){

  const el = byId(id);

  if(el){
    el.value = value ?? "";
  }

}

function getValue(id){

  const el = byId(id);

  return el ? el.value.trim() : "";

}


/* ============================================================
 * NUMBER FORMAT
 * ============================================================ */

function formatAngka(nilai){

  return Number(nilai || 0)
    .toLocaleString("id-ID");

}

function formatRupiah(nilai){

  return "Rp " + Number(nilai || 0)
    .toLocaleString("id-ID");

}


/* ============================================================
 * DATE FORMAT
 * ============================================================ */

function formatTanggal(tanggal){

  if(!tanggal) return "-";

  const d = new Date(tanggal);

  if(isNaN(d.getTime())){
    return tanggal;
  }

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

}

function formatTanggalPendek(tanggal){

  if(!tanggal) return "-";

  const d = new Date(tanggal);

  if(isNaN(d.getTime())){
    return tanggal;
  }

  return d.toLocaleDateString("id-ID");
}


/* ============================================================
 * ESCAPE HTML
 * WAJIB untuk data dari spreadsheet
 * ============================================================ */

function escapeHtml(text){

  const div = document.createElement("div");

  div.textContent = text ?? "";

  return div.innerHTML;

}


/* ============================================================
 * DEBOUNCE
 * Untuk Search Produk, Search Anggota, dll
 * ============================================================ */

function debounce(func, delay){

  let timeout;

  return function(){

    const context = this;
    const args = arguments;

    clearTimeout(timeout);

    timeout = setTimeout(function(){

      func.apply(context, args);

    }, delay || 300);

  };

}


/* ============================================================
 * COPY TEXT
 * ============================================================ */

function copyText(text){

  return navigator.clipboard.writeText(text);

}


/* ============================================================
 * DOWNLOAD JSON DEBUG
 * ============================================================ */

function downloadJson(filename, data){

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


/* ============================================================
 * AUTO SET USER INFO DI NAVBAR
 * ============================================================ */

function renderUserNavbar(){

  const session = getSessionData();

  if(!session) return;

  const namaEl = document.getElementById("userNama");
  const roleEl = document.getElementById("userRole");

  if(namaEl){
    namaEl.textContent = session.nama || "-";
  }

  if(roleEl){
    roleEl.textContent = session.role || "-";
  }

}


/* ============================================================
 * FINAL EXPORT
 * ============================================================ */

window.API_URL = API_URL;
window.SESSION_KEY = SESSION_KEY;

window.getSessionData = getSessionData;
window.saveSessionData = saveSessionData;
window.clearSessionData = clearSessionData;

window.guardSession = guardSession;
window.handleLogout = handleLogout;

window.panggilApi = panggilApi;

window.tanganiJikaSessionGagal = tanganiJikaSessionGagal;

window.tampilkanToast = tampilkanToast;

window.tampilkanLoading = tampilkanLoading;
window.sembunyikanLoading = sembunyikanLoading;

window.konfirmasi = konfirmasi;

window.escapeHtml = escapeHtml;

window.formatAngka = formatAngka;
window.formatRupiah = formatRupiah;

window.formatTanggal = formatTanggal;
window.formatTanggalPendek = formatTanggalPendek;

window.debounce = debounce;

window.copyText = copyText;

window.$ = $;
window.$all = $all;
window.byId = byId;

window.getValue = getValue;
window.setValue = setValue;
window.resetForm = resetForm;

window.renderUserNavbar = renderUserNavbar;

window.downloadJson = downloadJson;