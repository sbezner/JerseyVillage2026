(() => {
  'use strict';

  const DETAIL_TABS = ['Bio', 'Positions', 'Contact', 'Social Activity'];
  const socialCache = new Map();

  let candidatesData = null;
  let electionData = null;
  let propositionData = null;

  let activeRaceId = null;
  let activeCandidateId = null;
  let activeDetailTab = 'Bio';

  // DOM refs
  const $countdown = document.getElementById('countdown');
  const $disclaimerBanner = document.getElementById('disclaimer-banner');
  const $raceTabs = document.getElementById('race-tabs');
  const $candidateTabs = document.getElementById('candidate-tabs');
  const $detailTabs = document.getElementById('detail-tabs');
  const $detailPanel = document.getElementById('detail-panel');
  const $candidateHeader = document.getElementById('candidate-header');
  const $raceView = document.getElementById('race-view');
  const $raceTitle = document.getElementById('race-title');
  const $raceDescription = document.getElementById('race-description');
  const $propositionView = document.getElementById('proposition-view');
  const $propositionContent = document.getElementById('proposition-content');
  const $electionInfoView = document.getElementById('election-info-view');
  const $electionInfoContent = document.getElementById('election-info-content');
  const $footerDisclaimer = document.getElementById('footer-disclaimer');

  // --- Helpers ---

  function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  function initials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  function truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.slice(0, max - 1).trimEnd() + '\u2026' : str;
  }

  function hostname(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  function sourceLabel(src) {
    // Prefer the snippet (page title), fall back to hostname
    const raw = src.snippet && src.snippet.trim()
      ? src.snippet.trim()
      : hostname(src.url);
    // Strip common trailing site names like " | Community Impact" for cleaner display
    const cleaned = raw.replace(/\s*[|\u2014\u2013-]\s*[^|]+$/, '').trim() || raw;
    return truncate(cleaned, 65);
  }

  function platformLabel(platform) {
    const map = { facebook: 'Facebook', x: 'X', twitter: 'X', web: 'Web' };
    return map[platform] || 'Web';
  }

  // --- Data Loading ---

  async function loadData() {
    const [candidates, election, proposition] = await Promise.all([
      fetch('data/candidates.json').then(r => r.json()),
      fetch('data/election.json').then(r => r.json()),
      fetch('data/proposition-a.json').then(r => r.json())
    ]);
    candidatesData = candidates;
    electionData = election;
    propositionData = proposition;
  }

  async function loadSocialData(candidateId) {
    if (socialCache.has(candidateId)) return socialCache.get(candidateId);
    try {
      const data = await fetch(`data/social/${candidateId}.json`).then(r => r.json());
      socialCache.set(candidateId, data);
      return data;
    } catch {
      return null;
    }
  }

  // --- Countdown ---

  function updateCountdown() {
    if (!electionData) return;
    const election = new Date(electionData.electionDate + 'T00:00:00');
    const now = new Date();
    const diff = election - now;

    if (diff <= 0) {
      $countdown.textContent = 'Election Day!';
      return;
    }

    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    $countdown.textContent = `${days} day${days !== 1 ? 's' : ''} until Election Day \u2014 May 2, 2026`;
  }

  // --- Race Navigation ---

  function buildRaceTabs() {
    $raceTabs.innerHTML = '';

    candidatesData.races.forEach(race => {
      const btn = document.createElement('button');
      btn.className = 'race-tab';
      btn.role = 'tab';
      btn.textContent = race.title;
      btn.dataset.raceId = race.id;
      btn.setAttribute('aria-selected', 'false');
      btn.addEventListener('click', () => selectRace(race.id));
      $raceTabs.appendChild(btn);
    });

    // Proposition A tab
    const propBtn = document.createElement('button');
    propBtn.className = 'race-tab';
    propBtn.role = 'tab';
    propBtn.textContent = 'Proposition A';
    propBtn.dataset.raceId = 'proposition-a';
    propBtn.setAttribute('aria-selected', 'false');
    propBtn.addEventListener('click', () => selectRace('proposition-a'));
    $raceTabs.appendChild(propBtn);

    // Election Info tab
    const infoBtn = document.createElement('button');
    infoBtn.className = 'race-tab';
    infoBtn.role = 'tab';
    infoBtn.textContent = 'Election Info';
    infoBtn.dataset.raceId = 'election-info';
    infoBtn.setAttribute('aria-selected', 'false');
    infoBtn.addEventListener('click', () => selectRace('election-info'));
    $raceTabs.appendChild(infoBtn);
  }

  function selectRace(raceId) {
    activeRaceId = raceId;

    $raceTabs.querySelectorAll('.race-tab').forEach(tab => {
      tab.setAttribute('aria-selected', tab.dataset.raceId === raceId ? 'true' : 'false');
    });

    $raceView.classList.toggle('hidden', raceId === 'proposition-a' || raceId === 'election-info');
    $propositionView.classList.toggle('hidden', raceId !== 'proposition-a');
    $electionInfoView.classList.toggle('hidden', raceId !== 'election-info');

    if (raceId === 'proposition-a') {
      renderProposition();
    } else if (raceId === 'election-info') {
      renderElectionInfo();
    } else {
      const race = candidatesData.races.find(r => r.id === raceId);
      if (race) {
        $raceTitle.textContent = race.title;
        $raceDescription.textContent = race.description || '';
        buildCandidateTabs(race);
        selectCandidate(race.candidates[0].id);
      }
    }
  }

  // --- Candidate Tabs ---

  function buildCandidateTabs(race) {
    $candidateTabs.innerHTML = '';

    race.candidates.forEach(candidate => {
      const btn = document.createElement('button');
      btn.className = 'candidate-tab';
      btn.role = 'tab';
      btn.dataset.candidateId = candidate.id;
      btn.setAttribute('aria-selected', 'false');

      const avatarEl = `<span class="avatar">${esc(initials(candidate.name))}</span>`;
      let labelContent = `<span>${esc(candidate.name)}</span>`;
      if (candidate.unopposed) {
        labelContent = `<span>${esc(candidate.name)}</span><span class="unopposed-badge">Unopposed</span>`;
      }

      btn.innerHTML = `${avatarEl}<span class="tab-label">${labelContent}</span>`;
      btn.addEventListener('click', () => selectCandidate(candidate.id));
      $candidateTabs.appendChild(btn);
    });
  }

  function selectCandidate(candidateId) {
    activeCandidateId = candidateId;
    activeDetailTab = 'Bio';

    $candidateTabs.querySelectorAll('.candidate-tab').forEach(tab => {
      tab.setAttribute('aria-selected', tab.dataset.candidateId === candidateId ? 'true' : 'false');
    });

    renderCandidateHeader();
    buildDetailTabs();
    renderDetailPanel();
  }

  function renderCandidateHeader() {
    const result = getCandidate(activeCandidateId);
    if (!result) return;
    const { candidate, race } = result;

    const badges = [];
    if (candidate.incumbent) badges.push('Incumbent');
    if (candidate.unopposed) badges.push('Unopposed');
    const badgeHtml = badges.map(b =>
      `<span class="candidate-badge">${esc(b)}</span>`
    ).join(' ');

    $candidateHeader.innerHTML = `
      <span class="avatar avatar-lg">${esc(initials(candidate.name))}</span>
      <div class="candidate-header-text">
        <h2 class="candidate-name">${esc(candidate.name)} ${badgeHtml}</h2>
        <p class="candidate-race-label">${esc(race.title)}</p>
      </div>
    `;
  }

  // --- Detail Tabs ---

  function buildDetailTabs() {
    $detailTabs.innerHTML = '';

    DETAIL_TABS.forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'detail-tab';
      btn.role = 'tab';
      btn.textContent = tab;
      btn.setAttribute('aria-selected', tab === activeDetailTab ? 'true' : 'false');
      btn.addEventListener('click', () => {
        activeDetailTab = tab;
        $detailTabs.querySelectorAll('.detail-tab').forEach(t => {
          t.setAttribute('aria-selected', t.textContent === tab ? 'true' : 'false');
        });
        renderDetailPanel();
      });
      $detailTabs.appendChild(btn);
    });
  }

  // --- Detail Rendering ---

  function getCandidate(id) {
    for (const race of candidatesData.races) {
      const c = race.candidates.find(c => c.id === id);
      if (c) return { candidate: c, race };
    }
    return null;
  }

  function renderDetailPanel() {
    const result = getCandidate(activeCandidateId);
    if (!result) return;
    const { candidate, race } = result;

    switch (activeDetailTab) {
      case 'Bio': renderBio(candidate, race); break;
      case 'Positions': renderPositions(candidate, race); break;
      case 'Contact': renderContact(candidate, race); break;
      case 'Social Activity': renderSocial(candidate); break;
    }
  }

  function renderBio(candidate, race) {
    $detailPanel.innerHTML = `
      <p class="bio-text">${esc(candidate.bio)}</p>
    `;
  }

  function renderPositions(candidate, race) {
    if (!candidate.positions || candidate.positions.length === 0) {
      $detailPanel.innerHTML = '<p class="no-contact">No position information available yet.</p>';
      return;
    }

    const items = candidate.positions.map(p => `
      <div class="position-item">
        <div class="position-topic">${esc(p.topic)}</div>
        <p>${esc(p.statement)}</p>
      </div>
    `).join('');

    $detailPanel.innerHTML = `
      <div class="positions-heading">Positions on Issues</div>
      ${items}
    `;
  }

  function renderContact(candidate, race) {
    const c = candidate.contact || {};
    const links = [];

    if (c.email) links.push(`<li><strong>Email:</strong> <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`);
    if (c.website) links.push(`<li><strong>Website:</strong> <a href="${esc(c.website)}" target="_blank" rel="noopener">${esc(c.website)}</a></li>`);
    if (c.facebook) links.push(`<li><strong>Facebook:</strong> <a href="${esc(c.facebook)}" target="_blank" rel="noopener">${esc(c.facebook)}</a></li>`);
    if (c.twitter) links.push(`<li><strong>X / Twitter:</strong> <a href="${esc(c.twitter)}" target="_blank" rel="noopener">${esc(c.twitter)}</a></li>`);

    $detailPanel.innerHTML = links.length === 0
      ? '<p class="no-contact">No contact information available yet. Check back for updates.</p>'
      : `<ul class="contact-list">${links.join('')}</ul>`;
  }

  async function renderSocial(candidate) {
    $detailPanel.innerHTML = '<p class="loading">Loading social media activity...</p>';

    const data = await loadSocialData(candidate.id);

    if (activeCandidateId !== candidate.id || activeDetailTab !== 'Social Activity') return;

    if (!data || !data.summaries || data.summaries.length === 0) {
      $detailPanel.innerHTML = '<p class="no-contact">No social media activity data available yet.</p>';
      return;
    }

    const updated = data.lastUpdated
      ? `Last updated: ${new Date(data.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : '';

    const entries = data.summaries.map(s => {
      const sources = (s.sources || []).map(src => {
        const label = sourceLabel(src);
        const platform = platformLabel(src.platform);
        const host = hostname(src.url);
        return `
          <li class="source-item">
            <span class="source-platform">${esc(platform)}</span>
            <a href="${esc(src.url)}" target="_blank" rel="noopener" class="source-link">
              <span class="source-title">${esc(label)}</span>
              <span class="source-host">${esc(host)}</span>
            </a>
          </li>
        `;
      }).join('');

      return `
        <div class="social-entry">
          <div class="social-date">${esc(s.date)}</div>
          <p class="social-summary-text">${esc(s.summary)}</p>
          ${sources ? `
            <div class="social-sources">
              <div class="social-sources-label">Sources</div>
              <ul class="source-list">${sources}</ul>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    $detailPanel.innerHTML = `
      <div class="social-meta"><span class="social-updated">${esc(updated)}</span></div>
      <div class="social-entries">${entries}</div>
    `;
  }

  // --- Proposition ---

  function renderProposition() {
    if (!propositionData) return;
    const p = propositionData;

    const details = (p.details || []).map(d => `<li>${esc(d)}</li>`).join('');
    const forArgs = (p.forArguments || []).map(a => `<li>${esc(a)}</li>`).join('');
    const againstArgs = (p.againstArguments || []).map(a => `<li>${esc(a)}</li>`).join('');

    $propositionContent.innerHTML = `
      <div class="proposition-card">
        <h2>${esc(p.title)}</h2>
        <p class="subtitle">${esc(p.subtitle)}</p>
        <p class="summary">${esc(p.summary)}</p>
        <h3>Key Facts</h3>
        <ul>${details}</ul>
        <div class="arguments-grid">
          <div class="argument-col for">
            <h3>Arguments For</h3>
            <ul>${forArgs}</ul>
          </div>
          <div class="argument-col against">
            <h3>Arguments Against</h3>
            <ul>${againstArgs}</ul>
          </div>
        </div>
      </div>
    `;
  }

  // --- Election Info ---

  function renderElectionInfo() {
    if (!electionData) return;
    const e = electionData;

    const earlyLocations = (e.earlyVoting?.locations || []).map(loc => `
      <div class="location-card">
        <div class="location-name">${esc(loc.name)}</div>
        <div>${esc(loc.address)}</div>
        <div>${esc(loc.hours)}</div>
      </div>
    `).join('');

    const edayLocations = (e.electionDay?.locations || []).map(loc => `
      <div class="location-card">
        <div class="location-name">${esc(loc.name)}</div>
        <div>${esc(loc.address)}</div>
        <div>${esc(loc.hours)}</div>
      </div>
    `).join('');

    $electionInfoContent.innerHTML = `
      <div class="election-info-card">
        <h2>${esc(e.electionName)}</h2>

        <div class="info-section">
          <h3>Election Day</h3>
          <p><strong>${formatDate(e.electionDate)}</strong></p>
          ${edayLocations}
        </div>

        <div class="info-section">
          <h3>Early Voting</h3>
          <p>${formatDate(e.earlyVoting?.start)} \u2013 ${formatDate(e.earlyVoting?.end)}</p>
          ${earlyLocations}
        </div>

        <div class="info-section">
          <h3>Voter Registration</h3>
          <p>Registration deadline: <strong>${formatDate(e.voterInfo?.registrationDeadline)}</strong></p>
          <p><a href="${esc(e.voterInfo?.registrationUrl || '#')}" target="_blank" rel="noopener">Register to Vote (VoteTexas.gov)</a></p>
          <p><a href="${esc(e.voterInfo?.countyElectionsUrl || '#')}" target="_blank" rel="noopener">Harris County Elections</a></p>
        </div>

        <div class="info-section">
          <h3>Voter ID Requirements</h3>
          <p>${esc(e.voterInfo?.voterIdRequirements || '')}</p>
        </div>
      </div>
    `;
  }

  // --- Init ---

  async function init() {
    try {
      await loadData();
    } catch (err) {
      document.querySelector('main').innerHTML = '<p style="padding:40px;text-align:center;">Unable to load election data. Please try again later.</p>';
      console.error('Failed to load data:', err);
      return;
    }

    $disclaimerBanner.textContent = electionData.disclaimer;
    $footerDisclaimer.textContent = electionData.disclaimer;

    updateCountdown();
    setInterval(updateCountdown, 60000);

    buildRaceTabs();
    selectRace(candidatesData.races[0].id);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
