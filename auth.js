/* auth.js — login & signup logic for GenDiversity
   Users are stored in localStorage as:
   { "email@x.com": { name: "Jane", pass: btoa("password") } }
   NOTE: btoa is a simple encoding, NOT real encryption.
   For a production app, use a backend with proper hashing (bcrypt etc.)
*/

const USERS_KEY = 'gd_users';

/* ── helpers ── */

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCurrentUser(email) {
  sessionStorage.setItem('gd_current_user', email);
}

function getCurrentUser() {
  return sessionStorage.getItem('gd_current_user');
}

function logout() {
  sessionStorage.removeItem('gd_current_user');
  window.location.href = 'login.html';
}

/* ── UI helpers ── */

function showScreen(id) {
  document.querySelectorAll('.auth-card').forEach(el => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  clearAllErrors();
}

function clearAllErrors() {
  document.querySelectorAll('.err-msg').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('input').forEach(el => el.classList.remove('err'));
  document.querySelectorAll('.toast').forEach(el => el.classList.remove('show'));
}

function showErr(inputId, msgId, show) {
  const input = document.getElementById(inputId);
  const msg   = document.getElementById(msgId);
  if (!input || !msg) return;
  input.classList.toggle('err', show);
  msg.classList.toggle('show', show);
}

function showToast(id) {
  document.getElementById(id).classList.add('show');
}

function hideToast(id) {
  document.getElementById(id).classList.remove('show');
}

function togglePass(inputId, btn) {
  const inp = document.getElementById(inputId);
  inp.type  = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? 'Show' : 'Hide';
}

/* ── password strength ── */

function checkStrength(value) {
  const fill  = document.getElementById('str-fill');
  const label = document.getElementById('str-label');
  if (!fill) return;

  let score = 0;
  if (value.length >= 8)          score++;
  if (/[A-Z]/.test(value))        score++;
  if (/[0-9]/.test(value))        score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const levels = [
    { width: '0%',   color: '#ccc',     text: '' },
    { width: '25%',  color: '#E24B4A',  text: 'Weak' },
    { width: '50%',  color: '#BA7517',  text: 'Fair' },
    { width: '75%',  color: '#1D9E75',  text: 'Good' },
    { width: '100%', color: '#0F6E56',  text: 'Strong' },
  ];

  fill.style.width      = levels[score].width;
  fill.style.background = levels[score].color;
  label.textContent     = levels[score].text;
  label.style.color     = levels[score].color;
}

/* ── login ── */

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;

  let valid = true;
  if (!isValidEmail(email)) { showErr('login-email', 'login-email-err', true); valid = false; }
  else                       { showErr('login-email', 'login-email-err', false); }
  if (!pass)                 { showErr('login-pass',  'login-pass-err',  true); valid = false; }
  else                       { showErr('login-pass',  'login-pass-err',  false); }
  if (!valid) return;

  const users = getUsers();
  if (users[email] && users[email].pass === btoa(pass)) {
    setCurrentUser(email);
    showToast('login-success');
    hideToast('login-fail');
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
  } else {
    showToast('login-fail');
    hideToast('login-success');
  }
}

/* ── signup ── */

function doSignup() {
  const name  = document.getElementById('su-name').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const pass  = document.getElementById('su-pass').value;

  let valid = true;
  if (!name)                 { showErr('su-name',  'su-name-err',  true); valid = false; }
  else                       { showErr('su-name',  'su-name-err',  false); }
  if (!isValidEmail(email))  { showErr('su-email', 'su-email-err', true); valid = false; }
  else                       { showErr('su-email', 'su-email-err', false); }
  if (pass.length < 8)       { showErr('su-pass',  'su-pass-err',  true); valid = false; }
  else                       { showErr('su-pass',  'su-pass-err',  false); }
  if (!valid) return;

  const users = getUsers();
  if (users[email]) {
    showToast('signup-fail');
    return;
  }

  users[email] = { name, pass: btoa(pass) };
  saveUsers(users);

  showToast('signup-success');
  hideToast('signup-fail');
  setTimeout(() => showScreen('login-screen'), 1500);
}

/* ── route guard ──
   Add this to index.html <script> to protect the simulator:

   if (!sessionStorage.getItem('gd_current_user')) {
     window.location.href = 'login.html';
   }
*/
