/**
 * Recognition Turnstile - Smart Gate Kiosk & Attendance System
 * Palette: Clean White (#FFFFFF), Emerald Green (#10B981), Slate Dark (#1E293B)
 */

const TURNSTILE_STATE = {
  gateStatus: 'READY', // 'READY', 'SCANNING', 'GRANTED', 'DENIED'
  latencySeconds: 1.80,
  confidence: 99.7,
  activePerson: {
    id: 'EMP-0142',
    name: 'Dr. Marcus Vance',
    role: 'Principal Security Architect',
    dept: 'Cyber Security Operations',
    tier: 'TIER 4 (ALL ACCESS)',
    avatar: 'assets/evidence-cam-03.svg',
    time: '08:42:19 AM',
    passType: 'ON TIME'
  },
  
  attendanceSummary: {
    totalEmployees: 210,
    present: 184,
    absent: 18,
    late: 8,
    visitors: 4,
    gatePassesToday: 342,
    avgLatency: '1.74s'
  },

  checkIns: [
    { id: 'CHK-940', name: 'Dr. Marcus Vance', role: 'Security Architect', dept: 'CyberSec', time: '08:42:19 AM', gate: 'Gate #1 (North)', status: 'ON TIME', avatarBg: 'bg-emerald-600', initials: 'MV', speed: '1.78s' },
    { id: 'CHK-939', name: 'Elena Rostova', role: 'VP Legal Counsel', dept: 'Legal', time: '08:39:04 AM', gate: 'Gate #1 (North)', status: 'ON TIME', avatarBg: 'bg-blue-600', initials: 'ER', speed: '1.65s' },
    { id: 'CHK-938', name: 'Alex Chen', role: 'Staff Firmware Dev', dept: 'R&D', time: '08:35:50 AM', gate: 'Gate #2 (East)', status: 'ON TIME', avatarBg: 'bg-indigo-600', initials: 'AC', speed: '1.82s' },
    { id: 'CHK-937', name: 'David Sterling', role: 'Chief Tech Officer', dept: 'Executive', time: '08:28:12 AM', gate: 'Gate #1 (North)', status: 'ON TIME', avatarBg: 'bg-slate-800', initials: 'DS', speed: '1.58s' },
    { id: 'CHK-936', name: 'Sarah Connor', role: 'Lead Financial Analyst', dept: 'Finance', time: '08:15:33 AM', gate: 'Gate #1 (North)', status: 'ON TIME', avatarBg: 'bg-amber-600', initials: 'SC', speed: '1.71s' },
    { id: 'CHK-935', name: 'Liam Davies', role: 'DevOps Specialist', dept: 'Infrastructure', time: '08:11:02 AM', gate: 'Gate #3 (West)', status: 'LATE', avatarBg: 'bg-rose-600', initials: 'LD', speed: '1.92s' }
  ],

  mobileTab: 'live', // 'live', 'stats', 'roster'
  soundEnabled: true
};

// Audio chimes
function playChime(type) {
  if (!TURNSTILE_STATE.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (type === 'granted') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'denied') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch(e) {}
}

// Render Attendance Check-in List on Mobile Companion App
function renderMobileCheckIns() {
  const container = document.getElementById('mobile-checkin-list');
  if (!container) return;

  container.innerHTML = '';

  TURNSTILE_STATE.checkIns.forEach(item => {
    const row = document.createElement('div');
    row.className = 'p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-3 hover:border-slate-300 transition';
    
    const isLate = item.status === 'LATE';

    row.innerHTML = `
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-full ${item.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-sm">
          ${item.initials}
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-900 leading-tight">${item.name}</h5>
          <p class="text-[10px] text-slate-500 font-medium">${item.dept} · ${item.gate}</p>
        </div>
      </div>

      <div class="text-right">
        <span class="text-[11px] font-mono font-semibold text-slate-800">${item.time}</span>
        <div class="flex items-center justify-end gap-1 mt-0.5">
          <span class="text-[9px] font-mono font-bold text-emerald-600">${item.speed}</span>
          <span class="px-1.5 py-0.2 rounded text-[9px] font-bold ${isLate ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}">
            ${item.status}
          </span>
        </div>
      </div>
    `;

    container.appendChild(row);
  });
}

// Render Mobile Stats summary
function renderMobileStats() {
  const s = TURNSTILE_STATE.attendanceSummary;
  const presentEl = document.getElementById('mobile-stat-present');
  const absentEl = document.getElementById('mobile-stat-absent');
  const lateEl = document.getElementById('mobile-stat-late');
  const rateEl = document.getElementById('mobile-stat-rate');

  if (presentEl) presentEl.innerText = `${s.present} / ${s.totalEmployees}`;
  if (absentEl) absentEl.innerText = s.absent;
  if (lateEl) lateEl.innerText = s.late;
  if (rateEl) rateEl.innerText = `${Math.round((s.present / s.totalEmployees) * 100)}%`;

  // Main Kiosk metrics
  const kioskPasses = document.getElementById('kiosk-stat-passes');
  const kioskAvgSpeed = document.getElementById('kiosk-stat-speed');
  if (kioskPasses) kioskPasses.innerText = s.gatePassesToday;
  if (kioskAvgSpeed) kioskAvgSpeed.innerText = s.avgLatency;
}

// SIMULATION: Verified Fast Pass (1.8s)
function simulateFastPass(personName = 'Dr. Marcus Vance', personRole = 'Principal Security Architect', personDept = 'CyberSec') {
  const feedImg = document.getElementById('kiosk-camera-feed');
  const speedCounter = document.getElementById('kiosk-speed-counter-2') || document.getElementById('kiosk-speed-counter');
  const gateBanner = document.getElementById('kiosk-gate-banner');
  const gateStatusText = document.getElementById('kiosk-gate-status-text');
  const gateRelay = document.getElementById('kiosk-gate-relay');
  const personCard = document.getElementById('kiosk-person-card');

  // Set scanning state
  if (feedImg) feedImg.src = 'assets/face-kiosk-feed.svg';
  if (gateStatusText) gateStatusText.innerText = 'VERIFYING FACIAL EMBEDDINGS...';
  if (gateBanner) gateBanner.className = 'mt-3 p-4 rounded-xl bg-amber-500 text-white flex items-center justify-between transition-all';
  if (gateRelay) gateRelay.innerText = 'RELAY: ARMED';

  // Animate benchmark timer from 0.0s to 1.8s
  let currentVal = 0.0;
  const targetVal = 1.78;
  const step = 0.08;
  const interval = setInterval(() => {
    currentVal += step;
    if (currentVal >= targetVal) {
      clearInterval(interval);
      currentVal = targetVal;
      completeVerification();
    }
    if (speedCounter) speedCounter.innerText = `${currentVal.toFixed(2)}s`;
  }, 40);

  function completeVerification() {
    playChime('granted');

    if (gateBanner) {
      gateBanner.className = 'mt-3 p-4 rounded-xl bg-emerald-600 text-white flex items-center justify-between transition-all shadow-md';
    }
    if (gateStatusText) {
      gateStatusText.innerHTML = `
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          ACCESS GRANTED — TURNSTILE UNLOCKED
        </span>
      `;
    }
    if (gateRelay) gateRelay.innerText = 'RELAY: OPEN [3.0s]';

    // Show Person Identity Card
    if (personCard) {
      document.getElementById('person-name').innerText = personName;
      document.getElementById('person-role').innerText = personRole;
      document.getElementById('person-dept').innerText = personDept;
      document.getElementById('person-time').innerText = new Date().toLocaleTimeString();
      personCard.classList.remove('hidden');
    }

    // Push into Attendance
    TURNSTILE_STATE.attendanceSummary.present += 1;
    TURNSTILE_STATE.attendanceSummary.gatePassesToday += 1;

    const initials = personName.split(' ').map(n => n[0]).join('');
    const newCheckIn = {
      id: `CHK-${Math.floor(1000 + Math.random() * 9000)}`,
      name: personName,
      role: personRole,
      dept: personDept,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      gate: 'Gate #1 (North)',
      status: 'ON TIME',
      avatarBg: 'bg-emerald-600',
      initials: initials,
      speed: `${targetVal.toFixed(2)}s`
    };

    TURNSTILE_STATE.checkIns.unshift(newCheckIn);
    renderMobileCheckIns();
    renderMobileStats();

    showMobileToast(`✅ ${personName} verified via Gate #1 (${targetVal.toFixed(2)}s)`);
  }
}

// SIMULATION: Unrecognized Person / Access Denied
function simulateDeniedPass() {
  const feedImg = document.getElementById('kiosk-camera-feed');
  const speedCounter = document.getElementById('kiosk-speed-counter-2') || document.getElementById('kiosk-speed-counter');
  const gateBanner = document.getElementById('kiosk-gate-banner');
  const gateStatusText = document.getElementById('kiosk-gate-status-text');
  const gateRelay = document.getElementById('kiosk-gate-relay');
  const personCard = document.getElementById('kiosk-person-card');

  if (feedImg) feedImg.src = 'assets/face-unknown-feed.svg';
  if (personCard) personCard.classList.add('hidden');

  let currentVal = 0.0;
  const targetVal = 2.12;
  const interval = setInterval(() => {
    currentVal += 0.1;
    if (currentVal >= targetVal) {
      clearInterval(interval);
      currentVal = targetVal;
      finalizeDenial();
    }
    if (speedCounter) speedCounter.innerText = `${currentVal.toFixed(2)}s`;
  }, 40);

  function finalizeDenial() {
    playChime('denied');

    if (gateBanner) {
      gateBanner.className = 'mt-3 p-4 rounded-xl bg-red-600 text-white flex items-center justify-between transition-all shadow-md';
    }
    if (gateStatusText) {
      gateStatusText.innerHTML = `
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          ACCESS DENIED — UNENROLLED BIOMETRICS
        </span>
      `;
    }
    if (gateRelay) gateRelay.innerText = 'RELAY: LOCKED';

    showMobileToast(`🚨 SECURITY FLAG: Unrecognized person attempted entry at Gate #1!`, 'alert');
  }
}

// Remote Emergency Unlock from Mobile App
function triggerRemoteUnlock() {
  playChime('granted');
  const gateBanner = document.getElementById('kiosk-gate-banner');
  const gateStatusText = document.getElementById('kiosk-gate-status-text');
  const gateRelay = document.getElementById('kiosk-gate-relay');

  if (gateBanner) gateBanner.className = 'mt-3 p-4 rounded-xl bg-emerald-600 text-white flex items-center justify-between shadow-md';
  if (gateStatusText) gateStatusText.innerText = 'REMOTE ADMIN OVERRIDE — GATE OPENED';
  if (gateRelay) gateRelay.innerText = 'RELAY: FORCED OPEN [5.0s]';

  showMobileToast('🔓 Remote Gate #1 Override Dispatched by Admin');
}

// Mobile Toast Notification
function showMobileToast(msg, type = 'normal') {
  const container = document.getElementById('mobile-toast');
  if (!container) return;

  container.innerText = msg;
  container.className = `p-2.5 rounded-xl text-[11px] font-bold shadow-lg transition-all duration-300 ${
    type === 'alert' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
  }`;
  container.style.opacity = '1';
  container.style.transform = 'translateY(0)';

  setTimeout(() => {
    container.style.opacity = '0';
    container.style.transform = 'translateY(-10px)';
  }, 3500);
}

// Mobile Tab Switcher
function setMobileTab(tab) {
  TURNSTILE_STATE.mobileTab = tab;
  ['tab-live', 'tab-stats', 'tab-roster'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'flex-1 py-1.5 text-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition';
  });

  const active = document.getElementById(`tab-${tab}`);
  if (active) active.className = 'flex-1 py-1.5 text-center text-xs font-bold text-slate-900 bg-white rounded-lg shadow-sm transition';

  const viewLive = document.getElementById('mobile-view-live');
  const viewStats = document.getElementById('mobile-view-stats');
  const viewRoster = document.getElementById('mobile-view-roster');

  if (viewLive) viewLive.classList.toggle('hidden', tab !== 'live');
  if (viewStats) viewStats.classList.toggle('hidden', tab !== 'stats');
  if (viewRoster) viewRoster.classList.toggle('hidden', tab !== 'roster');
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  renderMobileCheckIns();
  renderMobileStats();
});
