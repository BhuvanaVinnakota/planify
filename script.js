// ============================================================
// script.js — Shared JavaScript for all Planify pages
// ============================================================

async function checkAuth() {
  const res = await fetch('/api/me');
  if (!res.ok) {
    window.location.href = '/';
    return null;
  }
  return await res.json();
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('active');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('active');
}

function showLogoutModal() {
  document.getElementById('logout-modal').classList.add('active');
}

function hideLogoutModal() {
  document.getElementById('logout-modal').classList.remove('active');
}

async function confirmLogout() {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
}

async function api(method, url, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  return res.json();
}
