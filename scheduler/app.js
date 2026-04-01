import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cfg = window.PRODUCTION_CONFIG;
const supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const state = {
  session: null,
  profile: null,
  defaults: [],
  polls: [],
  activePoll: null,
  slots: [],
  responses: [],
  responseSlots: [],
  profilesById: new Map(),
  myResponse: null,
  myResponseSlots: [],
};

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", init);

async function init() {
  applyLinks();
  setupTheme();
  setupCanvas();

  $("signOutBtn").addEventListener("click", signOut);

  const { data: { session } } = await supabase.auth.getSession();
  state.session = session;

  supabase.auth.onAuthStateChange(async (_event, sessionNow) => {
    state.session = sessionNow;
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
