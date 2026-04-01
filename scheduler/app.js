import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cfg = window.PRODUCTION_CONFIG;
const supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const state = {
  session: null,
  profile: null,
  defaults: [],
  polls: [],
  selectedPollId: null,
  slots: [],
  responses: [],
  responseSlots: [],
  profilesById: new Map(),
  myResponse: null,
  myResponseSlots: [],
  draftPrefs: new Map(),
  currentTool: "available",
  dragging: false,
  lastPaintedSlot: null
};

const el = {
  authSection: document.getElementById("authSection"),
  appShell: document.getElementById("appShell"),
  topbar: document.getElementById("topbar"),
  profileCard: document.getElementById("profileCard"),
  defaultsCard: document.getElementById("defaultsCard"),
  adminWrap: document.getElementById("adminWrap"),
  adminCard: document.getElementById("adminCard"),
  boardTools: document.getElementById("boardTools"),
  calendarWrap: document.getElementById("calendarWrap"),
  boardActions: document.getElementById("boardActions"),
  rankedCard: document.getElementById("rankedCard"),
  peopleCard: document.getElementById("peopleCard"),
  themeToggle: document.getElementById("themeToggle"),
  signOutBtn: document.getElementById("signOutBtn"),
  homeLink: document.getElementById("homeLink"),
  membersLink: document.getElementById("membersLink")
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  el.homeLink.href = cfg.publicHomeUrl;
  el.membersLink.href = cfg.membersUrl;

  setupTheme();
  setupCanvas();

  el.signOutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
  });

  document.addEventListener("mouseup", () => {
    state.dragging = false;
    state.lastPaintedSlot = null;
  });

  document.addEventListener("mouseleave", () => {
    state.dragging = false;
    state.lastPaintedSlot = null;
  });

  const { data: { session } } = await supabase.auth.getSession();
  state.session = session;

  supabase.auth.onAuthStateChange(async (_event, sessionNow) => {
    state.session = sessionNow;
    await boot();
  });

  await boot();
}

async function boot() {
  try {
    if (!state.session) {
      renderAuth();
      el.appShell.classList.add("hidden");
      el.signOutBtn.hidden = true;
      return;
    }

    el.signOutBtn.hidden = false;

    await ensureProfile();
    await loadDefaults();
    await loadPolls();
    await loadSelectedPollData();
    await loadResultsData();

    el.authSection.innerHTML = "";
    el.appShell.classList.remove("hidden");

    renderTopbar();
    renderProfileCard();
    renderDefaultsCard();
    renderBoardTools();
    renderCalendar();
    renderBoardActions();
    renderRankedCard();
    renderPeopleCard();
    renderAdminCard();
  } catch (err) {
    renderFatal(err);
  }
}

function renderFatal(err) {
  el.authSection.innerHTML = `
    <div class="error-box">
      <div><strong>Scheduler error</strong></div>
      <div class="small mono" style="margin-top:6px;">${escapeHtml(err?.message || String(err))}</div>
    </div>
  `;
  el.appShell.classList.add("hidden");
}

function renderAuth() {
  el.authSection.innerHTML = `
    <div class="card">
      <div class="auth-grid">
        <form id="signInForm" class="card">
          <h2 class="auth-card-title">Sign in</h2>
          <div class="grid">
            <div class="field">
              <label class="label" for="signInEmail">Email</label>
              <input class="input" id="signInEmail" type="email" required />
            </div>
            <div class="field">
              <label class="label" for="signInPassword">Password</label>
              <input class="input" id="signInPassword" type="password" required />
            </div>
            <div class="row">
              <button class="btn btn-primary" type="submit">Sign in</button>
              <span id="signInMsg" class="small muted"></span>
            </div>
          </div>
        </form>

        <form id="signUpForm" class="card">
          <h2 class="auth-card-title">Sign up</h2>
          <div class="grid">
            <div class="field">
              <label class="label" for="signUpName">Full name</label>
              <input class="input" id="signUpName" type="text" required />
            </div>
            <div class="field">
              <label class="label" for="signUpEmail">Email</label>
              <input class="input" id="signUpEmail" type="email" required />
            </div>
            <div class="field">
              <label class="label" for="signUpPassword">Password</label>
              <input class="input" id="signUpPassword" type="password" required />
            </div>
            <div class="row">
              <button class="btn" type="submit">Create account</button>
              <span id="signUpMsg" class="small muted"></span>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById("signInForm").addEventListener("submit", handleSignIn);
  document.getElementById("signUpForm").addEventListener("submit", handleSignUp);
}

async function handleSignIn(e) {
  e.preventDefault();
  const msg = document.getElementById("signInMsg");
  msg.textContent = "Signing in...";

  const email = document.getElementById("signInEmail").value.trim();
  const password = document.getElementById("signInPassword").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  msg.textContent = error ? error.message : "Signed in";
}

async function handleSignUp(e) {
  e.preventDefault();
  const msg = document.getElementById("signUpMsg");
  msg.textContent = "Creating account...";

  const full_name = document.getElementById("signUpName").value.trim();
  const email = document.getElementById("signUpEmail").value.trim();
  const password = document.getElementById("signUpPassword").value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name }
    }
  });

  if (error) {
    msg.textContent = error.message;
    return;
  }

  if (data.session) {
    msg.textContent = "Account created and signed in.";
  } else {
    msg.textContent = "Account created. If sign-in fails, confirm this user in Supabase Users first, then sign in.";
  }
}

async function ensureProfile() {
  const uid = state.session.user.id;

  let { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .maybeSingle();

  if (error) throw error;

  if (!profile) {
    const { data: inserted, error: upsertError } = await supabase
      .from("profiles")
      .upsert({
        id: uid,
        email: state.session.user.email,
        full_name: state.session.user.user_metadata?.full_name || ""
      })
      .select()
      .single();

    if (upsertError) throw upsertError;
    profile = inserted;
  }

  state.profile = profile;
}

async function loadDefaults() {
  const { data, error } = await supabase
    .from("availability_defaults")
    .select("*")
    .eq("user_id", state.profile.id)
    .order("weekday", { ascending: true });

  if (error) throw error;

  const map = new Map((data || []).map((row) => [row.weekday, row]));
  state.defaults = [];

  for (let weekday = 0; weekday < 7; weekday++) {
    state.defaults.push(
      map.get(weekday) || {
        user_id: state.profile.id,
        weekday,
        enabled: false,
        start_minute: 1080,
        end_minute: 1260,
        preference: "available"
      }
    );
  }
}

async function loadPolls() {
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  state.polls = data || [];

  const remembered = localStorage.getItem("vw_selected_poll_id");
  const existingIds = new Set(state.polls.map(p => p.id));

  if (remembered && existingIds.has(remembered)) {
    state.selectedPollId = remembered;
  } else {
    const firstOpen = state.polls.find(p => p.status === "open");
    state.selectedPollId = firstOpen?.id || state.polls[0]?.id || null;
  }
}

async function selectPoll(pollId) {
  state.selectedPollId = pollId || null;
  if (pollId) localStorage.setItem("vw_selected_poll_id", pollId);
  await loadSelectedPollData();
  await loadResultsData();
  renderTopbar();
  renderBoardTools();
  renderCalendar();
  renderBoardActions();
  renderRankedCard();
  renderPeopleCard();
  renderAdminCard();
}

function getSelectedPoll() {
  return state.polls.find(p => p.id === state.selectedPollId) || null;
}

async function loadSelectedPollData() {
  const poll = getSelectedPoll();

  state.slots = [];
  state.myResponse = null;
  state.myResponseSlots = [];
  state.draftPrefs = new Map();

  if (!poll) return;

  const { data: slots, error: slotsError } = await supabase
    .from("poll_slots")
    .select("*")
    .eq("poll_id", poll.id)
    .order("slot_start", { ascending: true });

  if (slotsError) throw slotsError;
  state.slots = slots || [];

  const { data: response, error: responseError } = await supabase
    .from("responses")
    .select("*")
    .eq("poll_id", poll.id)
    .eq("user_id", state.profile.id)
    .maybeSingle();

  if (responseError) throw responseError;
  state.myResponse = response || null;

  if (state.myResponse) {
    const { data: rs, error: rsError } = await supabase
      .from("response_slots")
      .select("*")
      .eq("response_id", state.myResponse.id);

    if (rsError) throw rsError;
    state.myResponseSlots = rs || [];
  }

  initializeDraftPrefs();
}

function initializeDraftPrefs() {
  state.draftPrefs = new Map();

  const existingMap = new Map(state.myResponseSlots.map(r => [r.slot_id, r.preference]));
  for (const slot of state.slots) {
    const pref = existingMap.get(slot.id) || deriveDefaultPreference(slot);
    state.draftPrefs.set(slot.id, pref);
  }
}

async function loadResultsData() {
  const poll = getSelectedPoll();

  state.responses = [];
  state.responseSlots = [];
  state.profilesById = new Map();

  if (!poll) return;

  const { data: responses, error: responsesError } = await supabase
    .from("responses")
    .select("*")
    .eq("poll_id", poll.id);

  if (responsesError) throw responsesError;
  state.responses = responses || [];

  if (!state.responses.length) return;

  const responseIds = state.responses.map(r => r.id);
  const userIds = [...new Set(state.responses.map(r => r.user_id))];

  const [{ data: rslots, error: rslotsError }, { data: profiles, error: profilesError }] = await Promise.all([
    supabase.from("response_slots").select("*").in("response_id", responseIds),
    supabase.from("profiles").select("id, full_name, role, department").in("id", userIds)
  ]);

  if (rslotsError) throw rslotsError;
  if (profilesError) throw profilesError;

  state.responseSlots = rslots || [];
  state.profilesById = new Map((profiles || []).map(p => [p.id, p]));
}

function renderTopbar() {
  const poll = getSelectedPoll();

  el.topbar.innerHTML = `
    <div class="topbar-flex">
      <div class="topbar-left">
        <div class="field" style="min-width:280px;">
          <label class="label">Poll</label>
          <select class="select" id="pollSelect">
            ${state.polls.map(p => `
              <option value="${p.id}" ${p.id === state.selectedPollId ? "selected" : ""}>
                ${escapeHtml(p.title)}${p.status !== "open" ? ` (${escapeHtml(p.status)})` : ""}
              </option>
            `).join("")}
          </select>
        </div>

        ${poll ? `
          <span class="chip">${escapeHtml(poll.status)}</span>
          <span class="chip">${escapeHtml(poll.timezone)}</span>
          <span class="chip">${state.responses.length} responses</span>
        ` : `<span class="chip">No poll</span>`}
      </div>

      <div class="topbar-right">
        <button class="btn" id="refreshBtn" type="button">Refresh</button>
      </div>
    </div>
  `;

  const pollSelect = document.getElementById("pollSelect");
  if (pollSelect) {
    pollSelect.addEventListener("change", async (e) => {
      await selectPoll(e.target.value);
    });
  }

  document.getElementById("refreshBtn")?.addEventListener("click", async () => {
    await loadPolls();
    await loadSelectedPollData();
    await loadResultsData();
    renderTopbar();
    renderCalendar();
    renderRankedCard();
    renderPeopleCard();
    renderAdminCard();
  });
}

function renderProfileCard() {
  el.profileCard.innerHTML = `
    <div class="k">Account</div>
    <h2 class="section-title">You</h2>

    <div class="grid">
      <div class="field">
        <label class="label" for="profileName">Full name</label>
        <input class="input" id="profileName" type="text" value="${escapeAttr(state.profile.full_name || "")}" />
      </div>

      <div class="field">
        <label class="label" for="profileDepartment">Department</label>
        <input class="input" id="profileDepartment" type="text" value="${escapeAttr(state.profile.department || "")}" placeholder="Camera, Cast, Direction..." />
      </div>

      <div class="field">
        <label class="label" for="profileRole">Role</label>
        <input class="input" id="profileRole" type="text" value="${escapeAttr(state.profile.role || "")}" placeholder="Director, DP, Anakin..." />
      </div>

      <div class="row">
        <button class="btn btn-primary" id="saveProfileBtn" type="button">Save</button>
        ${state.profile.is_admin ? `<span class="chip">Admin</span>` : `<span class="chip">Crew</span>`}
      </div>

      <div id="profileMsg" class="small muted"></div>
    </div>
  `;

  document.getElementById("saveProfileBtn").addEventListener("click", saveProfile);
}

async function saveProfile() {
  const payload = {
    full_name: document.getElementById("profileName").value.trim(),
    department: document.getElementById("profileDepartment").value.trim(),
    role: document.getElementById("profileRole").value.trim()
  };

  const msg = document.getElementById("profileMsg");
  msg.textContent = "Saving...";

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", state.profile.id)
    .select()
    .single();

  msg.textContent = error ? error.message : "Saved";
  if (!error) {
    state.profile = data;
    renderPeopleCard();
    renderRankedCard();
  }
}

function renderDefaultsCard() {
  el.defaultsCard.innerHTML = `
    <div class="k">Defaults</div>
    <h2 class="section-title">Recurring</h2>

    <div class="default-list">
      ${state.defaults.map(row => `
        <div class="default-row">
          <div><strong>${DAYS[row.weekday].slice(0,3)}</strong></div>

          <div class="field">
            <label class="label">Use</label>
            <select class="select default-enabled" data-day="${row.weekday}">
              <option value="false" ${!row.enabled ? "selected" : ""}>Off</option>
              <option value="true" ${row.enabled ? "selected" : ""}>On</option>
            </select>
          </div>

          <div class="field">
            <label class="label">Start</label>
            <input class="input default-start" data-day="${row.weekday}" type="time" value="${minutesToTime(row.start_minute)}" />
          </div>

          <div class="field">
            <label class="label">End</label>
            <input class="input default-end" data-day="${row.weekday}" type="time" value="${minutesToTime(row.end_minute)}" />
          </div>

          <div class="field">
            <label class="label">Paint</label>
            <select class="select default-pref" data-day="${row.weekday}">
              <option value="available" ${row.preference === "available" ? "selected" : ""}>Available</option>
              <option value="maybe" ${row.preference === "maybe" ? "selected" : ""}>If needed</option>
              <option value="unavailable" ${row.preference === "unavailable" ? "selected" : ""}>Unavailable</option>
            </select>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="row" style="margin-top:12px;">
      <button class="btn" id="saveDefaultsBtn" type="button">Save defaults</button>
      <div id="defaultsMsg" class="small muted"></div>
    </div>
  `;

  document.getElementById("saveDefaultsBtn").addEventListener("click", saveDefaults);
}

async function saveDefaults() {
  const msg = document.getElementById("defaultsMsg");
  msg.textContent = "Saving...";

  const payload = state.defaults.map(row => ({
    user_id: state.profile.id,
    weekday: row.weekday,
    enabled: document.querySelector(`.default-enabled[data-day="${row.weekday}"]`).value === "true",
    start_minute: timeToMinutes(document.querySelector(`.default-start[data-day="${row.weekday}"]`).value),
    end_minute: timeToMinutes(document.querySelector(`.default-end[data-day="${row.weekday}"]`).value),
    preference: document.querySelector(`.default-pref[data-day="${row.weekday}"]`).value
  }));

  const { error } = await supabase
    .from("availability_defaults")
    .upsert(payload, { onConflict: "user_id,weekday" });

  msg.textContent = error ? error.message : "Saved";
  if (!error) {
    await loadDefaults();
    initializeDraftPrefs();
    renderCalendar();
  }
}

function renderBoardTools() {
  const poll = getSelectedPoll();

  el.boardTools.innerHTML = `
    <div class="board-tools">
      <div class="tool-group">
        <button class="btn btn-good ${state.currentTool === "available" ? "btn-active" : ""}" data-tool="available" type="button">Available</button>
        <button class="btn btn-maybe ${state.currentTool === "maybe" ? "btn-active" : ""}" data-tool="maybe" type="button">If needed</button>
        <button class="btn btn-bad ${state.currentTool === "unavailable" ? "btn-active" : ""}" data-tool="unavailable" type="button">Clear</button>
      </div>

      <div class="action-group">
        ${poll ? `<span class="chip">${escapeHtml(poll.title)}</span>` : `<span class="chip">No poll selected</span>`}
      </div>
    </div>
  `;

  el.boardTools.querySelectorAll("[data-tool]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.currentTool = btn.dataset.tool;
      renderBoardTools();
    });
  });
}

function renderCalendar() {
  const poll = getSelectedPoll();

  if (!poll) {
    el.calendarWrap.innerHTML = `<div class="notice">No poll yet.</div>`;
    return;
  }

  if (!state.slots.length) {
    el.calendarWrap.innerHTML = `<div class="notice">This poll has no generated slots.</div>`;
    return;
  }

  const grid = buildGridData();
  const scoreMap = buildScoreMap();

  const templateColumns = `${"var(--time-col) "} ${grid.days.map(() => "var(--day-col)").join(" ")}`;

  let html = `
    <div class="calendar-shell">
      <div class="calendar-scroll">
        <div class="calendar-grid" style="grid-template-columns:${templateColumns};">
          <div class="cal-head-time"></div>
          ${grid.days.map(day => `
            <div class="cal-head-day">
              <div class="day-main">${escapeHtml(day.labelMain)}</div>
              <div class="day-sub">${escapeHtml(day.labelSub)}</div>
            </div>
          `).join("")}
  `;

  for (const minute of grid.minutes) {
    html += `<div class="cal-time">${escapeHtml(formatMinute(minute))}</div>`;

    for (const day of grid.days) {
      const key = `${day.key}|${minute}`;
      const slot = grid.lookup.get(key);

      if (!slot) {
        html += `<div class="cal-cell pref-disabled"></div>`;
        continue;
      }

      const pref = state.draftPrefs.get(slot.id) || "unavailable";
      const counts = scoreMap.get(slot.id) || { available: 0, maybe: 0, score: 0 };

      html += `
        <div
          class="cal-cell cal-slot pref-${pref}"
          data-slot="${slot.id}"
          title="${escapeHtml(buildCellTitle(slot, counts))}"
        >
          ${(counts.available || counts.maybe) ? `<div class="cell-count">${counts.available}${counts.maybe ? `+${counts.maybe}` : ""}</div>` : ""}
        </div>
      `;
    }
  }

  html += `
        </div>
      </div>
    </div>
  `;

  el.calendarWrap.innerHTML = html;

  el.calendarWrap.querySelectorAll(".cal-slot").forEach(node => {
    node.addEventListener("mousedown", (e) => {
      e.preventDefault();
      state.dragging = true;
      paintSlot(node.dataset.slot);
    });

    node.addEventListener("mouseenter", () => {
      if (state.dragging) paintSlot(node.dataset.slot);
    });

    node.addEventListener("click", (e) => {
      e.preventDefault();
      paintSlot(node.dataset.slot);
    });
  });
}

function paintSlot(slotId) {
  if (!slotId) return;
  if (state.lastPaintedSlot === slotId && state.dragging) return;

  state.draftPrefs.set(slotId, state.currentTool);
  state.lastPaintedSlot = slotId;

  const cell = el.calendarWrap.querySelector(`.cal-slot[data-slot="${slotId}"]`);
  if (!cell) return;

  cell.classList.remove("pref-available", "pref-maybe", "pref-unavailable");
  cell.classList.add(`pref-${state.currentTool}`);
}

function renderBoardActions() {
  const poll = getSelectedPoll();

  if (!poll) {
    el.boardActions.innerHTML = "";
    return;
  }

  el.boardActions.innerHTML = `
    <div class="board-actions">
      <div class="action-group">
        <button class="btn" id="applyDefaultsBtn" type="button">Apply defaults</button>
        <button class="btn" id="clearGridBtn" type="button">Clear all</button>
        <button class="btn btn-primary" id="saveResponseBtn" type="button">Save response</button>
      </div>

      <div class="board-status">
        ${state.myResponse ? `Last saved: ${escapeHtml(formatDateTime(state.myResponse.updated_at || state.myResponse.submitted_at))}` : "Not saved yet"}
        <span id="saveResponseMsg" class="small muted" style="margin-left:10px;"></span>
      </div>
    </div>
  `;

  document.getElementById("applyDefaultsBtn").addEventListener("click", () => {
    initializeDraftPrefs();
    renderCalendar();
  });

  document.getElementById("clearGridBtn").addEventListener("click", () => {
    for (const slot of state.slots) state.draftPrefs.set(slot.id, "unavailable");
    renderCalendar();
  });

  document.getElementById("saveResponseBtn").addEventListener("click", saveResponse);
}

async function saveResponse() {
  const poll = getSelectedPoll();
  const msg = document.getElementById("saveResponseMsg");
  msg.textContent = "Saving...";

  let responseId = state.myResponse?.id || null;

  if (!responseId) {
    const { data: inserted, error: insertError } = await supabase
      .from("responses")
      .upsert({
        poll_id: poll.id,
        user_id: state.profile.id,
        notes: ""
      }, { onConflict: "poll_id,user_id" })
      .select()
      .single();

    if (insertError) {
      msg.textContent = insertError.message;
      return;
    }
    responseId = inserted.id;
    state.myResponse = inserted;
  }

  const payload = state.slots.map(slot => ({
    response_id: responseId,
    slot_id: slot.id,
    preference: state.draftPrefs.get(slot.id) || "unavailable"
  }));

  const { error } = await supabase
    .from("response_slots")
    .upsert(payload, { onConflict: "response_id,slot_id" });

  msg.textContent = error ? error.message : "Saved";

  if (!error) {
    await loadSelectedPollData();
    await loadResultsData();
    renderBoardActions();
    renderCalendar();
    renderRankedCard();
    renderPeopleCard();
  }
}

function renderRankedCard() {
  const poll = getSelectedPoll();
  const ranked = rankSlots();

  el.rankedCard.innerHTML = `
    <div class="k">Best times</div>
    <h2 class="section-title">Ranking</h2>

    ${!poll ? `<div class="notice">No poll selected.</div>` : ""}

    <div class="rank-list">
      ${ranked.slice(0, 10).map((row, index) => `
        <div class="rank-item">
          <div class="rank-top">
            <div>
              <div class="rank-title">#${index + 1} • ${escapeHtml(formatSlotPrimary(row.slot))}</div>
              <div class="rank-sub">${escapeHtml(formatSlotSecondary(row.slot))}</div>
            </div>
            <div class="score-pill">Score ${row.score}</div>
          </div>
          <div class="row" style="margin-top:8px;">
            <span class="chip">${row.availableCount} available</span>
            <span class="chip">${row.maybeCount} maybe</span>
            ${row.missingRequired.length ? `<span class="chip">Missing: ${escapeHtml(row.missingRequired.join(", "))}</span>` : `<span class="chip">All required covered</span>`}
          </div>
        </div>
      `).join("") || `<div class="notice">No responses yet.</div>`}
    </div>
  `;
}

function renderPeopleCard() {
  const poll = getSelectedPoll();
  const respondedUsers = [...new Set(state.responses.map(r => r.user_id))].map(uid => state.profilesById.get(uid)).filter(Boolean);

  el.peopleCard.innerHTML = `
    <div class="k">People</div>
    <h2 class="section-title">Respondents</h2>

    ${poll?.required_people?.length ? `
      <div class="notice" style="margin-bottom:12px;">
        <strong>Required:</strong> ${escapeHtml(poll.required_people.join(", "))}
      </div>
    ` : ""}

    <div class="people-list">
      ${respondedUsers.map(p => `
        <div class="person-row">
          <div>
            <div><strong>${escapeHtml(p.full_name || "Unnamed user")}</strong></div>
            <div class="person-role">${escapeHtml(p.role || "No role")}</div>
          </div>
          <span class="chip">${escapeHtml(p.department || "—")}</span>
        </div>
      `).join("") || `<div class="notice">Nobody has responded yet.</div>`}
    </div>
  `;
}

function renderAdminCard() {
  if (!state.profile?.is_admin) {
    el.adminWrap.classList.add("hidden");
    el.adminCard.innerHTML = "";
    return;
  }

  el.adminWrap.classList.remove("hidden");

  el.adminCard.innerHTML = `
    <div class="grid">
      <div class="grid-2">
        <div class="field">
          <label class="label" for="adminTitle">Title</label>
          <input class="input" id="adminTitle" type="text" placeholder="Fight rehearsal" />
        </div>
        <div class="field">
          <label class="label" for="adminRequired">Required people</label>
          <input class="input" id="adminRequired" type="text" placeholder="Sardor Danier, Tobin Caldwell" />
        </div>
      </div>

      <div class="field">
        <label class="label" for="adminDesc">Description</label>
        <textarea class="textarea" id="adminDesc" placeholder="Optional"></textarea>
      </div>

      <div class="grid-2">
        <div class="field">
          <label class="label" for="adminStartDate">Start date</label>
          <input class="input" id="adminStartDate" type="date" />
        </div>
        <div class="field">
          <label class="label" for="adminEndDate">End date</label>
          <input class="input" id="adminEndDate" type="date" />
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <label class="label" for="adminDayStart">Daily start</label>
          <input class="input" id="adminDayStart" type="time" value="18:00" />
        </div>
        <div class="field">
          <label class="label" for="adminDayEnd">Daily end</label>
          <input class="input" id="adminDayEnd" type="time" value="22:00" />
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <label class="label" for="adminStep">Step minutes</label>
          <select class="select" id="adminStep">
            <option value="30" selected>30</option>
            <option value="60">60</option>
            <option value="15">15</option>
          </select>
        </div>
        <div class="field">
          <label class="label" for="adminStatus">Initial status</label>
          <select class="select" id="adminStatus">
            <option value="open" selected>open</option>
            <option value="draft">draft</option>
            <option value="closed">closed</option>
          </select>
        </div>
      </div>

      <div class="row">
        <button class="btn btn-primary" id="createPollBtn" type="button">Create poll</button>
        <span id="adminMsg" class="small muted"></span>
      </div>

      <div class="admin-poll-list">
        ${state.polls.map(p => `
          <div class="admin-poll-item">
            <div class="row" style="justify-content:space-between;">
              <div>
                <div><strong>${escapeHtml(p.title)}</strong></div>
                <div class="small muted">${escapeHtml(p.description || "")}</div>
              </div>
              <span class="chip">${escapeHtml(p.status)}</span>
            </div>

            <div class="row" style="margin-top:10px;">
              <button class="btn admin-open-btn" data-id="${p.id}" type="button">Set open</button>
              <button class="btn admin-close-btn" data-id="${p.id}" type="button">Set closed</button>
              <button class="btn admin-draft-btn" data-id="${p.id}" type="button">Set draft</button>
              <button class="btn admin-view-btn" data-id="${p.id}" type="button">View</button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  document.getElementById("createPollBtn").addEventListener("click", createPoll);

  el.adminCard.querySelectorAll(".admin-open-btn").forEach(btn => {
    btn.addEventListener("click", async () => updatePollStatus(btn.dataset.id, "open"));
  });
  el.adminCard.querySelectorAll(".admin-close-btn").forEach(btn => {
    btn.addEventListener("click", async () => updatePollStatus(btn.dataset.id, "closed"));
  });
  el.adminCard.querySelectorAll(".admin-draft-btn").forEach(btn => {
    btn.addEventListener("click", async () => updatePollStatus(btn.dataset.id, "draft"));
  });
  el.adminCard.querySelectorAll(".admin-view-btn").forEach(btn => {
    btn.addEventListener("click", async () => selectPoll(btn.dataset.id));
  });
}

async function updatePollStatus(pollId, status) {
  await supabase.from("polls").update({ status }).eq("id", pollId);
  await loadPolls();
  await loadSelectedPollData();
  await loadResultsData();
  renderTopbar();
  renderCalendar();
  renderRankedCard();
  renderPeopleCard();
  renderAdminCard();
}

async function createPoll() {
  const msg = document.getElementById("adminMsg");
  msg.textContent = "Creating...";

  const title = document.getElementById("adminTitle").value.trim();
  const description = document.getElementById("adminDesc").value.trim();
  const startDate = document.getElementById("adminStartDate").value;
  const endDate = document.getElementById("adminEndDate").value;
  const dayStart = document.getElementById("adminDayStart").value;
  const dayEnd = document.getElementById("adminDayEnd").value;
  const step = Number(document.getElementById("adminStep").value);
  const status = document.getElementById("adminStatus").value;
  const requiredPeople = document.getElementById("adminRequired").value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  if (!title || !startDate || !endDate || !dayStart || !dayEnd) {
    msg.textContent = "Fill the required fields.";
    return;
  }

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({
      title,
      description,
      timezone: cfg.timezone,
      status,
      required_people: requiredPeople,
      created_by: state.profile.id
    })
    .select()
    .single();

  if (pollError) {
    msg.textContent = pollError.message;
    return;
  }

  const slots = generateSlotsForPoll(poll.id, startDate, endDate, dayStart, dayEnd, step);

  const { error: slotsError } = await supabase
    .from("poll_slots")
    .insert(slots);

  if (slotsError) {
    msg.textContent = slotsError.message;
    return;
  }

  msg.textContent = "Created";

  document.getElementById("adminTitle").value = "";
  document.getElementById("adminDesc").value = "";
  document.getElementById("adminRequired").value = "";

  await loadPolls();
  await selectPoll(poll.id);
}

function generateSlotsForPoll(pollId, startDate, endDate, dayStart, dayEnd, stepMinutes) {
  const slots = [];
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const [startHour, startMinute] = dayStart.split(":").map(Number);
  const [endHour, endMinute] = dayEnd.split(":").map(Number);

  let sortOrder = 0;

  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    for (let mins = startHour * 60 + startMinute; mins < endHour * 60 + endMinute; mins += stepMinutes) {
      const slotStart = new Date(day);
      slotStart.setHours(Math.floor(mins / 60), mins % 60, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + stepMinutes);

      slots.push({
        poll_id: pollId,
        slot_start: slotStart.toISOString(),
        slot_end: slotEnd.toISOString(),
        label: "",
        location: "",
        sort_order: sortOrder++
      });
    }
  }

  return slots;
}

function buildGridData() {
  const dayMap = new Map();
  const minuteSet = new Set();
  const lookup = new Map();

  for (const slot of state.slots) {
    const dayKey = getDateKey(slot.slot_start);
    const minute = getMinuteInTimezone(slot.slot_start, cfg.timezone);

    if (!dayMap.has(dayKey)) {
      const d = new Date(slot.slot_start);
      dayMap.set(dayKey, {
        key: dayKey,
        labelMain: new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          timeZone: cfg.timezone
        }).format(d),
        labelSub: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          timeZone: cfg.timezone
        }).format(d)
      });
    }

    minuteSet.add(minute);
    lookup.set(`${dayKey}|${minute}`, slot);
  }

  const days = [...dayMap.values()].sort((a, b) => a.key.localeCompare(b.key));
  const minutes = [...minuteSet].sort((a, b) => a - b);

  return { days, minutes, lookup };
}

function buildScoreMap() {
  const scoreMap = new Map();
  const responseById = new Map(state.responses.map(r => [r.id, r]));

  for (const slot of state.slots) {
    scoreMap.set(slot.id, { available: 0, maybe: 0, score: 0 });
  }

  for (const rs of state.responseSlots) {
    const response = responseById.get(rs.response_id);
    if (!response) continue;

    const profile = state.profilesById.get(response.user_id);
    const role = profile?.role || "";
    const roleWeight = cfg.roleWeights[role] ?? 1;
    const prefScore = cfg.preferenceScores[rs.preference] ?? 0;

    const current = scoreMap.get(rs.slot_id) || { available: 0, maybe: 0, score: 0 };
    if (rs.preference === "available") current.available += 1;
    if (rs.preference === "maybe") current.maybe += 1;
    current.score += prefScore * roleWeight;
    scoreMap.set(rs.slot_id, current);
  }

  return scoreMap;
}

function rankSlots() {
  const poll = getSelectedPoll();
  const scoreMap = buildScoreMap();
  const responseById = new Map(state.responses.map(r => [r.id, r]));
  const slotResponses = new Map(state.slots.map(s => [s.id, []]));

  for (const rs of state.responseSlots) {
    if (slotResponses.has(rs.slot_id)) slotResponses.get(rs.slot_id).push(rs);
  }

  return state.slots.map(slot => {
    const list = slotResponses.get(slot.id) || [];
    const presentRequired = new Set();
    let availableCount = 0;
    let maybeCount = 0;
    let score = scoreMap.get(slot.id)?.score || 0;

    for (const rs of list) {
      const response = responseById.get(rs.response_id);
      const profile = state.profilesById.get(response?.user_id);
      const fullName = profile?.full_name || "";

      if (rs.preference === "available") availableCount += 1;
      if (rs.preference === "maybe") maybeCount += 1;

      if (poll?.required_people?.includes(fullName)) {
        if (rs.preference === "available") {
          score += cfg.requiredAvailableBonus;
          presentRequired.add(fullName);
        } else if (rs.preference === "maybe") {
          score += cfg.requiredMaybeBonus;
          presentRequired.add(fullName);
        }
      }
    }

    const missingRequired = (poll?.required_people || []).filter(name => !presentRequired.has(name));

    return { slot, score, availableCount, maybeCount, missingRequired };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.slot.slot_start) - new Date(b.slot.slot_start);
  });
}

function deriveDefaultPreference(slot) {
  const weekday = getWeekdayIndex(slot.slot_start, cfg.timezone);
  const minuteStart = getMinuteInTimezone(slot.slot_start, cfg.timezone);
  const minuteEnd = getMinuteInTimezone(slot.slot_end, cfg.timezone);
  const rule = state.defaults.find(d => d.weekday === weekday);

  if (!rule || !rule.enabled) return "unavailable";
  if (minuteStart >= rule.start_minute && minuteEnd <= rule.end_minute) {
    return rule.preference;
  }
  return "unavailable";
}

function buildCellTitle(slot, counts) {
  return `${formatSlotPrimary(slot)} ${formatSlotSecondary(slot)} • ${counts.available} available • ${counts.maybe} maybe`;
}

function getDateKey(value) {
  const d = new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: cfg.timezone
  }).formatToParts(d);

  const year = parts.find(p => p.type === "year").value;
  const month = parts.find(p => p.type === "month").value;
  const day = parts.find(p => p.type === "day").value;
  return `${year}-${month}-${day}`;
}

function getWeekdayIndex(value, tz) {
  const weekdayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: tz
  }).format(new Date(value));
  return DAYS.indexOf(weekdayName);
}

function getMinuteInTimezone(value, tz) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz
  }).formatToParts(new Date(value));

  const hour = Number(parts.find(p => p.type === "hour")?.value || 0);
  const minute = Number(parts.find(p => p.type === "minute")?.value || 0);
  return hour * 60 + minute;
}

function formatMinute(minute) {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(d);
}

function minutesToTime(mins) {
  const hh = String(Math.floor(mins / 60)).padStart(2, "0");
  const mm = String(mins % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function timeToMinutes(value) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function formatSlotPrimary(slot) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: cfg.timezone
  }).format(new Date(slot.slot_start));
}

function formatSlotSecondary(slot) {
  const start = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: cfg.timezone
  }).format(new Date(slot.slot_start));

  const end = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: cfg.timezone
  }).format(new Date(slot.slot_end));

  return `${start}–${end}`;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: cfg.timezone
  }).format(new Date(value));
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}

function setupTheme() {
  const KEY = "theme";
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    el.themeToggle.textContent = theme === "light" ? "Dark mode" : "Light mode";
    try { localStorage.setItem(KEY, theme); } catch {}
  }

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch {}
  apply(saved === "light" ? "light" : "dark");

  el.themeToggle.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    apply(cur === "light" ? "dark" : "light");
  });
}

function setupCanvas() {
  const root = document.documentElement;
  const canvas = document.getElementById("wbwCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  let W = 0;
  let H = 0;
  let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  const palette = {
    dark: {
      bg0:[4,6,10],
      bg1:[6,9,14],
      star:[235,245,255],
      thread:[120,200,255]
    },
    light: {
      bg0:[251,251,251],
      bg1:[240,243,246],
      star:[10,12,16],
      thread:[14,165,233]
    }
  };

  const stars = [];
  const threads = [];

  function rand(a,b){ return a + Math.random() * (b - a); }
  function rgba(rgb,a){ return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`; }

  function resize() {
    W = Math.floor(window.innerWidth);
    H = Math.floor(window.innerHeight);
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function init() {
    stars.length = 0;
    threads.length = 0;

    for (let i = 0; i < 240; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: rand(0.25, 1.1),
        a: rand(0.08, 0.55),
        tw: rand(0.0006, 0.0018),
        ph: rand(0, Math.PI * 2)
      });
    }

    for (let i = 0; i < 7; i++) {
      threads.push({
        seed: rand(0, 1000),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.000045, 0.00007),
        width: rand(0.9, 2.0),
        alpha: rand(0.04, 0.10),
        tilt: rand(-0.78, 0.78),
        offset: rand(-0.22, 0.22)
      });
    }
  }

  function threadX(th, y, t) {
    const time = t * th.speed + th.phase;
    const w1 = 0.36 * Math.sin(time + y * 2.2 + th.seed);
    const w2 = 0.16 * Math.sin(time * 1.6 + y * 5.2 + th.seed * 0.3);
    const base = 0.5 + th.offset + th.tilt * (y - 0.5);
    return base + w1 + w2;
  }

  function frame(t) {
    const theme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const p = palette[theme];

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, rgba(p.bg0, 1));
    bg.addColorStop(1, rgba(p.bg1, 1));
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (const s of stars) {
      const tw = 0.62 + 0.38 * Math.sin(t * s.tw + s.ph);
      ctx.fillStyle = rgba(p.star, s.a * tw);
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const th of threads) {
      ctx.strokeStyle = rgba(p.thread, th.alpha);
      ctx.lineWidth = th.width;
      ctx.beginPath();

      const steps = 68;
      for (let i = 0; i <= steps; i++) {
        const yy = i / steps;
        const x = threadX(th, yy, t) * W;
        const y = (yy * 1.3 - 0.15) * H;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    }

    ctx.restore();
    requestAnimationFrame(frame);
  }

  resize();
  init();
  requestAnimationFrame(frame);
  window.addEventListener("resize", resize, { passive: true });
}    state.session = sessionNow;
    await boot();
  });

  await boot();
}

function applyLinks() {
  $("homeLink").href = cfg.publicHomeUrl;
  $("membersLink").href = cfg.membersUrl;
}

async function boot() {
  renderAuth();

  if (!state.session) {
    hideSignedInSections();
    $("signOutBtn").hidden = true;
    return;
  }

  $("signOutBtn").hidden = false;

  await ensureProfile();
  await loadDefaults();
  await loadPolls();
  await loadActivePollData();
  await loadResultsData();

  renderProfile();
  renderDefaults();
  renderPoll();
  renderResults();
  renderAdmin();

  showSignedInSections();
}

function hideSignedInSections() {
  $("profileSection").hidden = true;
  $("defaultsSection").hidden = true;
  $("pollSection").hidden = true;
  $("resultsSection").hidden = true;
  $("adminSection").hidden = true;
}

function showSignedInSections() {
  $("profileSection").hidden = false;
  $("defaultsSection").hidden = false;
  $("pollSection").hidden = false;
  $("resultsSection").hidden = false;
  $("adminSection").hidden = !state.profile?.is_admin;
}

function renderAuth() {
  const el = $("authCard");

  if (!state.session) {
    el.innerHTML = `
      <div class="card auth-box">
        <div class="notice">
          Use your production email. You will receive a magic link. After the first login, I recommend setting your real full name immediately.
        </div>

        <form id="loginForm" class="grid" autocomplete="on">
          <div class="field">
            <label class="label" for="loginEmail">Email</label>
            <input class="input" id="loginEmail" type="email" placeholder="you@example.com" required />
          </div>
          <div class="row">
            <button class="btn btn-primary" type="submit">Send magic link</button>
            <span class="muted small">No password needed.</span>
          </div>
        </form>

        <div id="loginMessage" class="small muted"></div>
      </div>
    `;

    $("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = $("loginEmail").value.trim();
      const msg = $("loginMessage");
      msg.textContent = "Sending magic link...";

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.href
        }
      });

      msg.textContent = error
        ? `Error: ${error.message}`
        : "Magic link sent. Open your email and come back through that link.";
    });

    return;
  }

  el.innerHTML = `
    <div class="card auth-box">
      <div class="notice">
        Signed in as <b>${escapeHtml(state.session.user.email || "")}</b>
      </div>
    </div>
  `;
}

async function signOut() {
  await supabase.auth.signOut();
}

async function ensureProfile() {
  const user = state.session.user;

  let { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (!profile) {
    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || ""
      })
      .select()
      .single();

    if (insertError) throw insertError;
    profile = inserted;
  }

  state.profile = profile;
}

async function loadDefaults() {
  const { data, error } = await supabase
    .from("availability_defaults")
    .select("*")
    .order("weekday", { ascending: true });

  if (error) throw error;

  const byDay = new Map((data || []).map((row) => [row.weekday, row]));
  const filled = [];

  for (let weekday = 0; weekday < 7; weekday++) {
    filled.push(
      byDay.get(weekday) || {
        weekday,
        enabled: false,
        start_minute: 1080,
        end_minute: 1260,
        preference: "available"
      }
    );
  }

  state.defaults = filled;
}

async function loadPolls() {
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  state.polls = data || [];
  state.activePoll = state.polls.find((p) => p.status === "open") || state.polls[0] || null;
}

async function loadActivePollData() {
  state.slots = [];
  state.myResponse = null;
  state.myResponseSlots = [];

  if (!state.activePoll) return;

  const { data: slots, error: slotsError } = await supabase
    .from("poll_slots")
    .select("*")
    .eq("poll_id", state.activePoll.id)
    .order("slot_start", { ascending: true });

  if (slotsError) throw slotsError;
  state.slots = slots || [];

  const { data: response, error: responseError } = await supabase
    .from("responses")
    .select("*")
    .eq("poll_id", state.activePoll.id)
    .eq("user_id", state.profile.id)
    .maybeSingle();

  if (responseError && responseError.code !== "PGRST116") throw responseError;
  state.myResponse = response || null;

  if (state.myResponse) {
    const { data: rs, error: rsError } = await supabase
      .from("response_slots")
      .select("*")
      .eq("response_id", state.myResponse.id);

    if (rsError) throw rsError;
    state.myResponseSlots = rs || [];
  }
}

async function loadResultsData() {
  state.responses = [];
  state.responseSlots = [];
  state.profilesById = new Map();

  if (!state.activePoll) return;

  const { data: responses, error: responsesError } = await supabase
    .from("responses")
    .select("*")
    .eq("poll_id", state.activePoll.id);

  if (responsesError) throw responsesError;
  state.responses = responses || [];

  if (state.responses.length) {
    const responseIds = state.responses.map((r) => r.id);
    const userIds = [...new Set(state.responses.map((r) => r.user_id))];

    const [{ data: responseSlots, error: rsError }, { data: profiles, error: profilesError }] =
      await Promise.all([
        supabase.from("response_slots").select("*").in("response_id", responseIds),
        supabase.from("profiles").select("id, full_name, role, department").in("id", userIds)
      ]);

    if (rsError) throw rsError;
    if (profilesError) throw profilesError;

    state.responseSlots = responseSlots || [];
    state.profilesById = new Map((profiles || []).map((p) => [p.id, p]));
  }
}

function renderProfile() {
  const el = $("profileCard");
  const p = state.profile;

  el.innerHTML = `
    <div class="card profile-box">
      <div class="grid-2">
        <div class="field">
          <label class="label" for="fullNameInput">Full name</label>
          <input class="input" id="fullNameInput" type="text" value="${escapeAttr(p.full_name || "")}" />
        </div>
        <div class="field">
          <label class="label" for="emailInput">Email</label>
          <input class="input" id="emailInput" type="text" value="${escapeAttr(p.email || state.session.user.email || "")}" disabled />
        </div>
      </div>

      <div class="grid-2">
        <div class="field">
          <label class="label" for="departmentInput">Department</label>
          <input class="input" id="departmentInput" type="text" value="${escapeAttr(p.department || "")}" placeholder="Camera, Direction, Cast..." />
        </div>
        <div class="field">
          <label class="label" for="roleInput">Role</label>
          <input class="input" id="roleInput" type="text" value="${escapeAttr(p.role || "")}" placeholder="Director, DP, Anakin..." />
        </div>
      </div>

      <div class="row">
        <button class="btn btn-primary" id="saveProfileBtn" type="button">Save profile</button>
        <span class="chip">${p.is_admin ? "Admin account" : "Crew account"}</span>
        <span id="profileMsg" class="muted small"></span>
      </div>
    </div>
  `;

  $("saveProfileBtn").addEventListener("click", async () => {
    const payload = {
      full_name: $("fullNameInput").value.trim(),
      department: $("departmentInput").value.trim(),
      role: $("roleInput").value.trim()
    };

    const msg = $("profileMsg");
    msg.textContent = "Saving...";

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", state.profile.id)
      .select()
      .single();

    msg.textContent = error ? `Error: ${error.message}` : "Saved";
    if (!error) state.profile = data;
  });
}

function renderDefaults() {
  const el = $("defaultsCard");

  el.innerHTML = `
    <div class="card defaults-box">
      <div class="notice">
        These are your recurring defaults. When a new poll appears, the page uses these to prefill your response.
      </div>

      <div id="defaultsRows" class="grid"></div>

      <div class="row">
        <button class="btn btn-primary" id="saveDefaultsBtn" type="button">Save recurring defaults</button>
        <span id="defaultsMsg" class="muted small"></span>
      </div>
    </div>
  `;

  const rows = $("defaultsRows");
  rows.innerHTML = state.defaults.map((row) => `
    <div class="default-day">
      <div>
        <strong>${DAYS[row.weekday]}</strong>
      </div>
      <div class="field">
        <label class="label">Use</label>
        <select class="select default-enabled" data-day="${row.weekday}">
          <option value="false" ${!row.enabled ? "selected" : ""}>Off</option>
          <option value="true" ${row.enabled ? "selected" : ""}>On</option>
        </select>
      </div>
      <div class="field">
        <label class="label">Start</label>
        <input class="input default-start" data-day="${row.weekday}" type="time" value="${minutesToTime(row.start_minute)}" />
      </div>
      <div class="field">
        <label class="label">End</label>
        <input class="input default-end" data-day="${row.weekday}" type="time" value="${minutesToTime(row.end_minute)}" />
      </div>
      <div class="field">
        <label class="label">Preference</label>
        <select class="select default-pref" data-day="${row.weekday}">
          <option value="available" ${row.preference === "available" ? "selected" : ""}>Available</option>
          <option value="maybe" ${row.preference === "maybe" ? "selected" : ""}>If needed</option>
          <option value="unavailable" ${row.preference === "unavailable" ? "selected" : ""}>Unavailable</option>
        </select>
      </div>
    </div>
  `).join("");

  $("saveDefaultsBtn").addEventListener("click", saveDefaults);
}

async function saveDefaults() {
  const msg = $("defaultsMsg");
  msg.textContent = "Saving...";

  const payload = state.defaults.map((row) => {
    const day = row.weekday;
    return {
      user_id: state.profile.id,
      weekday: day,
      enabled: document.querySelector(`.default-enabled[data-day="${day}"]`).value === "true",
      start_minute: timeToMinutes(document.querySelector(`.default-start[data-day="${day}"]`).value),
      end_minute: timeToMinutes(document.querySelector(`.default-end[data-day="${day}"]`).value),
      preference: document.querySelector(`.default-pref[data-day="${day}"]`).value
    };
  });

  const { error } = await supabase
    .from("availability_defaults")
    .upsert(payload, { onConflict: "user_id,weekday" });

  msg.textContent = error ? `Error: ${error.message}` : "Saved";
  if (!error) await loadDefaults();
}

function renderPoll() {
  const el = $("pollCard");

  if (!state.activePoll) {
    el.innerHTML = `<div class="card empty">No poll yet. If you are an admin, create one below.</div>`;
    return;
  }

  const map = new Map(state.myResponseSlots.map((r) => [r.slot_id, r.preference]));
  const derived = new Map(
    state.slots.map((slot) => [slot.id, map.get(slot.id) || deriveDefaultPreference(slot)])
  );

  el.innerHTML = `
    <div class="card poll-box">
      <div class="grid">
        <div>
          <div class="row">
            <span class="chip">${escapeHtml(state.activePoll.status)}</span>
            <span class="chip">${escapeHtml(state.activePoll.timezone)}</span>
            ${state.activePoll.required_people?.length ? `<span class="chip">Required: ${escapeHtml(state.activePoll.required_people.join(", "))}</span>` : ""}
          </div>
          <h3 style="margin:10px 0 4px;">${escapeHtml(state.activePoll.title)}</h3>
          <div class="muted">${escapeHtml(state.activePoll.description || "")}</div>
        </div>

        <hr class="line" />

        <div id="slotList" class="grid"></div>

        <div class="field">
          <label class="label" for="responseNotes">Notes</label>
          <textarea class="textarea" id="responseNotes" placeholder="Anything leadership should know?">${escapeHtml(state.myResponse?.notes || "")}</textarea>
        </div>

        <div class="row">
          <button class="btn btn-primary" id="submitResponseBtn" type="button">Save response</button>
          <button class="btn" id="applyDefaultsBtn" type="button">Apply recurring defaults again</button>
          <span id="responseMsg" class="muted small"></span>
        </div>
      </div>
    </div>
  `;

  const slotList = $("slotList");
  slotList.innerHTML = state.slots.map((slot) => {
    const pref = derived.get(slot.id);
    return `
      <div class="slot-card">
        <div class="slot-top">
          <div>
            <div class="slot-title">${escapeHtml(formatSlotPrimary(slot))}</div>
            <div class="slot-meta">${escapeHtml(formatSlotSecondary(slot))}${slot.location ? ` • ${escapeHtml(slot.location)}` : ""}</div>
          </div>
          ${slot.label ? `<span class="chip">${escapeHtml(slot.label)}</span>` : ""}
        </div>

        <div class="segmented" data-slot="${slot.id}">
          ${prefButton(slot.id, "available", pref, "Available")}
          ${prefButton(slot.id, "maybe", pref, "If needed")}
          ${prefButton(slot.id, "unavailable", pref, "Unavailable")}
        </div>
      </div>
    `;
  }).join("");

  slotList.querySelectorAll(".pref-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slotId = btn.dataset.slot;
      const pref = btn.dataset.pref;
      setPref(slotId, pref);
    });
  });

  $("submitResponseBtn").addEventListener("click", submitResponse);
  $("applyDefaultsBtn").addEventListener("click", () => {
    state.slots.forEach((slot) => setPref(slot.id, deriveDefaultPreference(slot)));
  });
}

function prefButton(slotId, pref, activePref, label) {
  return `
    <button
      class="pref-btn"
      type="button"
      data-slot="${slotId}"
      data-pref="${pref}"
      data-active="${pref === activePref ? "true" : "false"}"
    >
      ${label}
    </button>
  `;
}

function setPref(slotId, pref) {
  document.querySelectorAll(`.pref-btn[data-slot="${slotId}"]`).forEach((btn) => {
    btn.dataset.active = btn.dataset.pref === pref ? "true" : "false";
  });
}

async function submitResponse() {
  const msg = $("responseMsg");
  msg.textContent = "Saving response...";

  const notes = $("responseNotes").value.trim();

  let responseId = state.myResponse?.id || null;

  if (!responseId) {
    const { data: inserted, error: insertError } = await supabase
      .from("responses")
      .upsert({
        poll_id: state.activePoll.id,
        user_id: state.profile.id,
        notes
      }, { onConflict: "poll_id,user_id" })
      .select()
      .single();

    if (insertError) {
      msg.textContent = `Error: ${insertError.message}`;
      return;
    }
    responseId = inserted.id;
    state.myResponse = inserted;
  } else {
    const { error: updateError } = await supabase
      .from("responses")
      .update({ notes })
      .eq("id", responseId);

    if (updateError) {
      msg.textContent = `Error: ${updateError.message}`;
      return;
    }
  }

  const slotPayload = state.slots.map((slot) => {
    const activeBtn = document.querySelector(`.pref-btn[data-slot="${slot.id}"][data-active="true"]`);
    return {
      response_id: responseId,
      slot_id: slot.id,
      preference: activeBtn?.dataset.pref || deriveDefaultPreference(slot)
    };
  });

  const { error: rsError } = await supabase
    .from("response_slots")
    .upsert(slotPayload, { onConflict: "response_id,slot_id" });

  msg.textContent = rsError ? `Error: ${rsError.message}` : "Saved";

  if (!rsError) {
    await loadActivePollData();
    await loadResultsData();
    renderPoll();
    renderResults();
  }
}

function renderResults() {
  const el = $("resultsCard");

  if (!state.activePoll) {
    el.innerHTML = `<div class="card empty">No active poll.</div>`;
    return;
  }

  const ranked = rankSlots();

  const topThree = ranked.slice(0, 3);

  el.innerHTML = `
    <div class="card results-box">
      ${topThree.length ? `
        <div class="grid-2">
          ${topThree.map((r, i) => `
            <div class="rank-card">
              <h3>${i === 0 ? "Best overall" : i === 1 ? "Second strongest" : "Third strongest"}</h3>
              <div><strong>${escapeHtml(formatSlotPrimary(r.slot))}</strong></div>
              <div class="muted">${escapeHtml(formatSlotSecondary(r.slot))}</div>
              <div class="row" style="margin-top:10px;">
                <span class="chip">Score ${r.score}</span>
                <span class="chip">Available ${r.availableCount}</span>
                <span class="chip">Maybe ${r.maybeCount}</span>
              </div>
              <div class="small muted" style="margin-top:10px;">
                ${r.missingRequired.length ? `Missing required: ${escapeHtml(r.missingRequired.join(", "))}` : "All required people covered."}
              </div>
            </div>
          `).join("")}
        </div>
      ` : `<div class="empty">No responses yet.</div>`}

      <div class="table-shell" style="margin-top:14px;">
        <table class="table">
          <thead>
            <tr>
              <th>Slot</th>
              <th>Score</th>
              <th>Available</th>
              <th>If needed</th>
              <th>Missing required</th>
            </tr>
          </thead>
          <tbody>
            ${ranked.map((r) => `
              <tr>
                <td>
                  <div><strong>${escapeHtml(formatSlotPrimary(r.slot))}</strong></div>
                  <div class="muted small">${escapeHtml(formatSlotSecondary(r.slot))}</div>
                </td>
                <td>${r.score}</td>
                <td>${r.availableCount}</td>
                <td>${r.maybeCount}</td>
                <td>${escapeHtml(r.missingRequired.join(", ") || "—")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function rankSlots() {
  if (!state.slots.length) return [];

  const responseById = new Map(state.responses.map((r) => [r.id, r]));
  const responseSlotsBySlot = new Map(state.slots.map((s) => [s.id, []]));

  state.responseSlots.forEach((rs) => {
    if (responseSlotsBySlot.has(rs.slot_id)) {
      responseSlotsBySlot.get(rs.slot_id).push(rs);
    }
  });

  return state.slots.map((slot) => {
    const list = responseSlotsBySlot.get(slot.id) || [];
    let score = 0;
    let availableCount = 0;
    let maybeCount = 0;

    const presentRequired = new Set();

    for (const rs of list) {
      const response = responseById.get(rs.response_id);
      if (!response) continue;

      const profile = state.profilesById.get(response.user_id);
      const fullName = profile?.full_name || "Unknown";
      const role = profile?.role || "";
      const roleWeight = cfg.roleWeights[role] ?? 1;
      const prefScore = cfg.preferenceScores[rs.preference] ?? 0;

      if (rs.preference === "available") availableCount += 1;
      if (rs.preference === "maybe") maybeCount += 1;

      score += prefScore * roleWeight;

      if (state.activePoll.required_people?.includes(fullName)) {
        if (rs.preference === "available") {
          score += cfg.requiredAvailableBonus;
          presentRequired.add(fullName);
        } else if (rs.preference === "maybe") {
          score += cfg.requiredMaybeBonus;
          presentRequired.add(fullName);
        }
      }
    }

    const missingRequired = (state.activePoll.required_people || []).filter((name) => !presentRequired.has(name));

    return {
      slot,
      score,
      availableCount,
      maybeCount,
      missingRequired
    };
  }).sort((a, b) => b.score - a.score || a.slot.slot_start.localeCompare(b.slot.slot_start));
}

function renderAdmin() {
  const el = $("adminCard");

  if (!state.profile?.is_admin) {
    el.innerHTML = "";
    return;
  }

  el.innerHTML = `
    <div class="card admin-box">
      <div class="notice">
        One slot per line format:
        <br />
        <code>2026-04-10T18:00:00-07:00|2026-04-10T20:00:00-07:00|Fight rehearsal|Warren Studio</code>
      </div>

      <div class="grid">
        <div class="field">
          <label class="label" for="pollTitleInput">Poll title</label>
          <input class="input" id="pollTitleInput" type="text" placeholder="Fight rehearsal availability" />
        </div>

        <div class="field">
          <label class="label" for="pollDescInput">Description</label>
          <textarea class="textarea" id="pollDescInput" placeholder="What is this poll for?"></textarea>
        </div>

        <div class="field">
          <label class="label" for="requiredPeopleInput">Required people (comma-separated full names)</label>
          <input class="input" id="requiredPeopleInput" type="text" placeholder="Sardor Danier, Tobin Caldwell" />
        </div>

        <div class="field">
          <label class="label" for="slotsInput">Slots</label>
          <textarea class="textarea" id="slotsInput" placeholder="One slot per line"></textarea>
        </div>

        <div class="row">
          <button class="btn btn-primary" id="createPollBtn" type="button">Create new poll</button>
          <span id="adminMsg" class="muted small"></span>
        </div>
      </div>

      <hr class="line" />

      <div class="table-shell">
        <table class="table">
          <thead>
            <tr>
              <th>Poll</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.polls.map((poll) => `
              <tr>
                <td>
                  <div><strong>${escapeHtml(poll.title)}</strong></div>
                  <div class="muted small">${escapeHtml(poll.description || "")}</div>
                </td>
                <td>${escapeHtml(poll.status)}</td>
                <td>${escapeHtml(formatDateTime(poll.created_at))}</td>
                <td>
                  <button class="btn admin-set-open" data-id="${poll.id}" type="button">Set open</button>
                  <button class="btn admin-set-closed" data-id="${poll.id}" type="button">Close</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  $("createPollBtn").addEventListener("click", createPoll);

  el.querySelectorAll(".admin-set-open").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await updatePollStatus(btn.dataset.id, "open");
    });
  });

  el.querySelectorAll(".admin-set-closed").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await updatePollStatus(btn.dataset.id, "closed");
    });
  });
}

async function createPoll() {
  const msg = $("adminMsg");
  msg.textContent = "Creating poll...";

  const title = $("pollTitleInput").value.trim();
  const description = $("pollDescInput").value.trim();
  const requiredPeople = $("requiredPeopleInput").value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const lines = $("slotsInput").value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!title || !lines.length) {
    msg.textContent = "Add a title and at least one slot.";
    return;
  }

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({
      title,
      description,
      timezone: cfg.timezone,
      status: "open",
      created_by: state.profile.id,
      required_people: requiredPeople
    })
    .select()
    .single();

  if (pollError) {
    msg.textContent = `Error: ${pollError.message}`;
    return;
  }

  const slots = lines.map((line, index) => {
    const [slotStart, slotEnd, label = "", location = ""] = line.split("|").map((x) => x.trim());
    return {
      poll_id: poll.id,
      slot_start: slotStart,
      slot_end: slotEnd,
      label,
      location,
      sort_order: index
    };
  });

  const { error: slotsError } = await supabase.from("poll_slots").insert(slots);

  msg.textContent = slotsError ? `Error: ${slotsError.message}` : "Poll created";

  if (!slotsError) {
    $("pollTitleInput").value = "";
    $("pollDescInput").value = "";
    $("requiredPeopleInput").value = "";
    $("slotsInput").value = "";
    await loadPolls();
    await loadActivePollData();
    await loadResultsData();
    renderPoll();
    renderResults();
    renderAdmin();
  }
}

async function updatePollStatus(pollId, status) {
  await supabase.from("polls").update({ status }).eq("id", pollId);
  await loadPolls();
  await loadActivePollData();
  await loadResultsData();
  renderPoll();
  renderResults();
  renderAdmin();
}

function deriveDefaultPreference(slot) {
  const start = new Date(slot.slot_start);
  const end = new Date(slot.slot_end);

  const weekday = Number(
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: cfg.timezone
    }).formatToParts(start).find((p) => p.type === "weekday")?.value
      ? start.toLocaleDateString("en-US", { weekday: "short", timeZone: cfg.timezone })
      : start.getDay()
  );

  const actualDay = new Date(slot.slot_start).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: cfg.timezone
  });
  const dayIndex = DAYS.findIndex((d) => d === actualDay);
  const rule = state.defaults.find((d) => d.weekday === dayIndex);

  if (!rule || !rule.enabled) return "unavailable";

  const startMinute = getMinuteInTimeZone(start, cfg.timezone);
  const endMinute = getMinuteInTimeZone(end, cfg.timezone);

  if (startMinute >= rule.start_minute && endMinute <= rule.end_minute) {
    return rule.preference;
  }

  return "unavailable";
}

function getMinuteInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);

  return hour * 60 + minute;
}

function minutesToTime(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function timeToMinutes(value) {
  const [h, m] = value.split(":").map(Number);
  return (h * 60) + m;
}

function formatSlotPrimary(slot) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: cfg.timezone
  }).format(new Date(slot.slot_start));
}

function formatSlotSecondary(slot) {
  const start = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: cfg.timezone
  }).format(new Date(slot.slot_start));

  const end = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: cfg.timezone
  }).format(new Date(slot.slot_end));

  return `${start}–${end} (${cfg.timezone})`;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: cfg.timezone
  }).format(new Date(value));
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}

function setupTheme() {
  const KEY = "theme";
  const root = document.documentElement;
  const btn = $("themeToggle");
  const label = $("themeLabel");

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    label.textContent = theme === "light" ? "Dark mode" : "Light mode";
    localStorage.setItem(KEY, theme);
  }

  const saved = localStorage.getItem(KEY);
  apply(saved === "light" ? "light" : "dark");

  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    apply(next);
  });
}

function setupCanvas() {
  const root = document.documentElement;
  const canvas = $("wbwCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });

  let W = 0;
  let H = 0;
  let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let theme = root.getAttribute("data-theme") === "light" ? "light" : "dark";

  const palette = {
    dark: {
      bg0:[4,6,10],
      bg1:[6,9,14],
      fog:[14,24,36],
      star:[235,245,255],
      thread:[120,200,255],
      horizon:[145,220,255]
    },
    light:{
      bg0:[251,251,251],
      bg1:[240,243,246],
      fog:[205,225,240],
      star:[10,12,16],
      thread:[14,165,233],
      horizon:[0,120,170]
    }
  };

  const stars = [];
  const threads = [];
  const STAR_COUNT = 280;
  const THREAD_COUNT = 8;

  function rand(a,b){ return a + Math.random()*(b-a); }
  function rgba(rgb,a){ return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`; }

  function resize() {
    W = Math.floor(window.innerWidth);
    H = Math.floor(window.innerHeight);
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  function init() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: rand(0.25, 1.15),
        a: rand(0.10, 0.60),
        tw: rand(0.0006, 0.0018),
        ph: rand(0, Math.PI * 2)
      });
    }

    threads.length = 0;
    for (let i = 0; i < THREAD_COUNT; i++) {
      threads.push({
        seed: rand(0, 1000),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.000045, 0.000070),
        width: rand(0.9, 2.2),
        alpha: rand(0.05, 0.12),
        tilt: rand(-0.78, 0.78),
        offset: rand(-0.22, 0.22)
      });
    }
  }

  function threadX(th, y, t) {
    const time = t * th.speed + th.phase;
    const w1 = 0.36 * Math.sin(time + y * 2.2 + th.seed);
    const w2 = 0.16 * Math.sin(time * 1.6 + y * 5.2 + th.seed * 0.3);
    const base = 0.5 + th.offset + th.tilt * (y - 0.5);
    return base + w1 + w2;
  }

  function draw(t) {
    theme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const p = palette[theme];

    ctx.clearRect(0,0,W,H);

    const bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0, rgba(p.bg0, 1));
    bg.addColorStop(1, rgba(p.bg1, 1));
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,W,H);

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (const s of stars) {
      const tw = 0.62 + 0.38 * Math.sin(t * s.tw + s.ph);
      ctx.fillStyle = rgba(p.star, s.a * tw);
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const th of threads) {
      ctx.strokeStyle = rgba(p.thread, th.alpha);
      ctx.lineWidth = th.width;
      ctx.beginPath();

      const steps = 70;
      for (let i = 0; i <= steps; i++) {
        const yy = i / steps;
        const x = threadX(th, yy, t) * W;
        const y = (yy * 1.3 - 0.15) * H;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    }

    ctx.restore();

    requestAnimationFrame(draw);
  }

  resize();
  init();
  requestAnimationFrame(draw);

  new MutationObserver(() => {
    theme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  window.addEventListener("resize", resize, { passive: true });
}
