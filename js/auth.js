// ═══════════════════════════════════════════════════════════
//  auth.js — SCSVMV Authentication Module (v3 — No OAuth)
//  Handles: Email/Password, OTP Login, Session management,
//           Pre-seeded student DB, Route protection guards
// ═══════════════════════════════════════════════════════════

const Auth = (() => {

  /* ─── CONFIG ─────────────────────────────────────────────── */
  const CONFIG = {
    SESSION_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
    OTP_TTL:     10 * 60 * 1000,           // 10 minutes
    DEMO_MODE:   true,                      // Always show OTP on screen
  };

  /* ─── STORAGE KEYS ──────────────────────────────────────── */
  const KEYS = {
    users:   'scsvmv_auth_users',
    session: 'scsvmv_auth_session',
    otp:     'scsvmv_auth_otp',
  };

  /* ─── HELPERS ───────────────────────────────────────────── */
  function _getUsers() { return JSON.parse(localStorage.getItem(KEYS.users) || '[]'); }
  function _saveUsers(u) { localStorage.setItem(KEYS.users, JSON.stringify(u)); }

  async function _hash(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  /* ─── PRE-SEEDED STUDENT DATABASE ───────────────────────── */
  // Default password = DOB as DDMMYYYY. Students can change it later.
  const SEED_STUDENTS = [
    {
      reg: '112398012',
      name: 'Student One',
      email: 'student1@kanchiuniv.ac.in',
      dob: '2001-01-15',    // default pwd: 15012001
      department: 'Computer Science', year: '3',
    },
    {
      reg: 'A0105',
      name: 'Student Two',
      email: 'student2@kanchiuniv.ac.in',
      dob: '2002-06-10',    // default pwd: 10062002
      department: 'Electronics', year: '2',
    },
  ];

  async function _seedAdmin() {
    const users = _getUsers();

    /* ── Admin ── */
    const ai = users.findIndex(u => u.email === 'admin@kanchiuniv.ac.in');
    const adminHash = await _hash('Admin@123');
    if (ai === -1) {
      users.push({
        id: 'USR_ADMIN', name: 'SCSVMV Admin',
        email: 'admin@kanchiuniv.ac.in',
        password_hash: adminHash,
        role: 'admin', user_type: 'admin',
        provider: 'email', verified: true,
        avatar: null, phone: '', dob: '',
        department: 'Administration', bio: 'System Administrator',
        reg_number: 'ADMIN001',
        created_date: new Date().toISOString(),
      });
    } else {
      // Always ensure admin integrity
      if (users[ai].password_hash !== adminHash) users[ai].password_hash = adminHash;
      if (users[ai].role !== 'admin') users[ai].role = 'admin';
      if (!users[ai].verified) users[ai].verified = true;
    }

    /* ── Pre-seeded students ── */
    for (const s of SEED_STUDENTS) {
      const exists = users.find(u => u.reg_number === s.reg || u.email === s.email);
      if (!exists) {
        // Default password = DOB as DDMMYYYY (e.g. 2001-01-15 → 15012001)
        const [y, m, d] = s.dob.split('-');
        const defaultPwd = `${d}${m}${y}`;
        const hash = await _hash(defaultPwd);
        users.push({
          id: 'USR_' + s.reg,
          name: s.name,
          email: s.email,
          reg_number: s.reg,
          password_hash: hash,
          role: 'user', user_type: 'student',
          provider: 'email', verified: true,
          avatar: null,
          phone: '', dob: s.dob,
          department: s.department, bio: '',
          year: s.year,
          created_date: new Date().toISOString(),
        });
      }
    }

    _saveUsers(users);
  }

  /* ─── SESSION ───────────────────────────────────────────── */
  function _createSession(user) {
    const session = {
      userId: user.id, name: user.name,
      email: user.email, role: user.role,
      user_type: user.user_type || 'student',
      avatar: user.avatar || null,
      provider: user.provider,
      expiresAt: Date.now() + CONFIG.SESSION_TTL,
    };
    localStorage.setItem(KEYS.session, JSON.stringify(session));
    return session;
  }

  function getSession() {
    try {
      const s = JSON.parse(localStorage.getItem(KEYS.session));
      if (!s) return null;
      if (Date.now() > s.expiresAt) { logout(); return null; }
      return s;
    } catch { return null; }
  }

  function isLoggedIn() { return !!getSession(); }

  function logout() {
    localStorage.removeItem(KEYS.session);
    sessionStorage.removeItem(KEYS.otp);
  }

  /* ─── ROUTE PROTECTION ──────────────────────────────────── */
  function requireAuth() {
    const sess = getSession();
    if (!sess) {
      const next = encodeURIComponent(window.location.href);
      window.location.href = (window.location.pathname.includes('/admin/') ? '../' : '') + `auth.html?next=${next}`;
      return false;
    }
    return true;
  }

  function requireAdmin() {
    const sess = getSession();
    if (!sess || sess.role !== 'admin') {
      const prefix = window.location.pathname.includes('/admin/') ? '../' : '';
      window.location.href = prefix + 'auth.html?error=admin_only';
      return false;
    }
    return true;
  }

  /* ─── OTP ───────────────────────────────────────────────── */
  function _generateOTP() {
    return CONFIG.DEMO_MODE ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  }
  function _storeOTP(email, otp) {
    sessionStorage.setItem(KEYS.otp, JSON.stringify({ email, otp, expiresAt: Date.now() + CONFIG.OTP_TTL }));
  }
  function verifyOTP(email, enteredOTP) {
    try {
      const stored = JSON.parse(sessionStorage.getItem(KEYS.otp));
      if (!stored) return { ok: false, msg: 'No OTP found. Please request again.' };
      if (Date.now() > stored.expiresAt) { sessionStorage.removeItem(KEYS.otp); return { ok: false, msg: 'OTP expired. Request a new one.' }; }
      if (stored.email.toLowerCase() !== email.toLowerCase()) return { ok: false, msg: 'Email mismatch.' };
      if (stored.otp !== enteredOTP.trim()) return { ok: false, msg: 'Incorrect OTP. Please try again.' };
      sessionStorage.removeItem(KEYS.otp);
      return { ok: true };
    } catch { return { ok: false, msg: 'Verification error.' }; }
  }

  async function sendOTP(email, name = '') {
    const otp = _generateOTP();
    _storeOTP(email.toLowerCase().trim(), otp);
    // In production: send via EmailJS
    return { ok: true, otp }; // Always return OTP for demo display
  }

  /* ─── OTP LOGIN (passwordless) ──────────────────────────── */
  async function sendLoginOTP(email) {
    const users = _getUsers();
    email = email.trim().toLowerCase();
    let user = users.find(u => u.email === email);
    if (!user) {
      // Auto-create account
      user = {
        id: 'USR_' + Date.now(), name: email.split('@')[0], email,
        password_hash: null, role: 'user', user_type: 'guest',
        provider: 'email', verified: false, avatar: null,
        phone: '', dob: '', department: '', bio: '',
        reg_number: '', created_date: new Date().toISOString(),
      };
      users.push(user); _saveUsers(users);
    }
    const otpRes = await sendOTP(email, user.name);
    return { ok: true, otp: otpRes.otp };
  }

  function loginWithOTP(email, otp) {
    const verifyRes = verifyOTP(email, otp);
    if (!verifyRes.ok) return verifyRes;
    const users = _getUsers();
    const i = users.findIndex(u => u.email === email.trim().toLowerCase());
    if (i === -1) return { ok: false, msg: 'User not found.' };
    users[i].verified = true;
    _saveUsers(users);
    const session = _createSession(users[i]);
    return { ok: true, session };
  }

  /* ─── REGISTER ──────────────────────────────────────────── */
  async function register({ name, email, password, userType, regNumber, phone, dob, department }) {
    const users = _getUsers();
    const emailLower = email.trim().toLowerCase();
    if (users.find(u => u.email === emailLower))
      return { ok: false, msg: 'An account with this email already exists.' };

    const hash = await _hash(password);
    const newUser = {
      id: 'USR_' + Date.now(),
      name: name.trim(), email: emailLower,
      password_hash: hash,
      role: 'user', user_type: userType || 'student',
      provider: 'email', verified: false,
      avatar: null, phone: phone || '', dob: dob || '',
      department: department || '', bio: '',
      reg_number: regNumber || '',
      created_date: new Date().toISOString(),
    };
    users.push(newUser); _saveUsers(users);
    const otpRes = await sendOTP(emailLower, name);
    return { ok: true, user: newUser, otp: otpRes.otp };
  }

  /* ─── MARK VERIFIED ─────────────────────────────────────── */
  function markVerified(email) {
    const users = _getUsers();
    const i = users.findIndex(u => u.email === email.toLowerCase());
    if (i !== -1) { users[i].verified = true; _saveUsers(users); return _createSession(users[i]); }
    return null;
  }

  /* ─── LOGIN ─────────────────────────────────────────────── */
  async function login({ email, password }) {
    const users = _getUsers();
    // Allow login by reg number OR email
    const emailLower = email.trim().toLowerCase();
    let user = users.find(u => u.email === emailLower) ||
               users.find(u => u.reg_number && u.reg_number.toLowerCase() === emailLower);
    if (!user) return { ok: false, msg: 'No account found. Please register first.' };

    const hash = await _hash(password);
    if (user.password_hash !== hash)
      return { ok: false, msg: 'Incorrect password. (Tip: default password is your DOB as DDMMYYYY)' };

    if (!user.verified)
      return { ok: false, msg: 'Email not verified. Check your inbox.', needsVerify: true, email: user.email };

    const session = _createSession(user);
    return { ok: true, session };
  }

  /* ─── CHANGE PASSWORD ───────────────────────────────────── */
  async function changePassword(email, oldPwd, newPwd) {
    const users = _getUsers();
    const i = users.findIndex(u => u.email === email.toLowerCase());
    if (i === -1) return { ok: false, msg: 'User not found.' };
    const oldHash = await _hash(oldPwd);
    if (users[i].password_hash && users[i].password_hash !== oldHash)
      return { ok: false, msg: 'Current password is incorrect.' };
    users[i].password_hash = await _hash(newPwd);
    _saveUsers(users);
    return { ok: true };
  }

  /* ─── UPDATE PROFILE ─────────────────────────────────────── */
  function updateProfile(email, data) {
    const users = _getUsers();
    const i = users.findIndex(u => u.email === email.toLowerCase());
    if (i === -1) return { ok: false };
    const allowed = ['name','phone','dob','department','bio','avatar'];
    allowed.forEach(k => { if (data[k] !== undefined) users[i][k] = data[k]; });
    _saveUsers(users);
    // Also update session name if changed
    if (data.name) {
      const sess = getSession();
      if (sess) { sess.name = data.name; localStorage.setItem(KEYS.session, JSON.stringify(sess)); }
    }
    return { ok: true };
  }

  /* ─── GET ALL USERS (Admin only) ─────────────────────────── */
  function getAllUsers() { return _getUsers(); }

  /* ─── POST-LOGIN REDIRECT ───────────────────────────────── */
  function _redirectAfterLogin() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    window.location.href = next ? decodeURIComponent(next) : 'index.html';
  }
  function redirectAfterLogin() { _redirectAfterLogin(); }

  /* ─── NAV USER WIDGET ───────────────────────────────────── */
  function injectNavUser(navUl, isSub = false) {
    const sess = getSession();
    const prefix = isSub ? '../' : '';
    const existing = navUl.querySelector('#navAuthItem');
    if (existing) existing.remove();
    const li = document.createElement('li');
    li.id = 'navAuthItem';
    if (sess) {
      const initials = sess.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
      li.innerHTML = `
        <div class="nav-user" onclick="this.querySelector('.nav-dropdown').classList.toggle('open')" id="navUserBtn">
          <div class="nav-avatar" title="${sess.name}">
            ${sess.avatar ? `<img src="${sess.avatar}" alt="${initials}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : initials}
          </div>
          <span class="nav-user-name">${sess.name.split(' ')[0]}</span>
          <i class="fas fa-chevron-down" style="font-size:.7rem;color:#6b7280"></i>
          <div class="nav-dropdown">
            <a href="${prefix}profile.html"><i class="fas fa-user"></i> My Profile</a>
            ${sess.role === 'admin' ? `<a href="${prefix}admin/dashboard.html"><i class="fas fa-shield-alt"></i> Admin Panel</a>` : ''}
            <a href="${prefix}create-event.html"><i class="fas fa-plus-circle"></i> Create Event</a>
            <div class="sep"></div>
            <button class="logout-btn" onclick="Auth.logout();window.location.href='${prefix}auth.html'">
              <i class="fas fa-sign-out-alt"></i> Sign Out
            </button>
          </div>
        </div>`;
    } else {
      li.innerHTML = `<a href="${prefix}auth.html" class="nav-btn" id="signInNavBtn"><i class="fas fa-user-circle"></i> Sign In</a>`;
    }
    navUl.appendChild(li);
    document.addEventListener('click', (e) => {
      const btn = document.getElementById('navUserBtn');
      if (btn && !btn.contains(e.target)) btn.querySelector('.nav-dropdown')?.classList.remove('open');
    });
  }

  /* ─── PASSWORD STRENGTH ─────────────────────────────────── */
  function checkPasswordStrength(password) {
    let score = 0;
    const checks = [password.length >= 6, /[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
    score = checks.filter(Boolean).length;
    const levels = [
      { label: '', color: 'transparent', pct: 0 },
      { label: 'Very Weak', color: '#ef4444', pct: 20 },
      { label: 'Weak', color: '#f97316', pct: 40 },
      { label: 'Fair', color: '#eab308', pct: 60 },
      { label: 'Strong', color: '#22c55e', pct: 80 },
      { label: 'Very Strong', color: '#16a34a', pct: 100 },
    ];
    return levels[score] || levels[0];
  }

  /* ─── INIT ──────────────────────────────────────────────── */
  async function init() {
    await _seedAdmin();
  }

  return {
    init, register, login, logout, markVerified, changePassword, updateProfile,
    getSession, isLoggedIn, sendOTP, sendLoginOTP, loginWithOTP, verifyOTP,
    redirectAfterLogin, requireAuth, requireAdmin, injectNavUser,
    checkPasswordStrength, getAllUsers, CONFIG,
  };
})();
