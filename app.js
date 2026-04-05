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
  const $raceView = document.getElementById('race-view');
  const $propositionView = document.getElementById('proposition-view');
  const $propositionContent = document.getElementById('proposition-content');
  const $electionInfoView = document.getElementById('election-info-view');
  const $electionInfoContent = document.getElementById('election-info-content');
  const $footerDisclaimer = document.getElementById('footer-disclaimer');

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
    $countdown.textContent = `${days} day${days !== 1 ? 's' : ''} until Election Day — May 2, 2026`;
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

    // Update race tab states
    $raceTabs.querySelectorAll('.race-tab').forEach(tab => {
      tab.setAttribute('aria-selected', tab.dataset.raceId === raceId ? 'true' : 'false');
    });

    // Show correct view
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

      let label = candidate.name;
      if (candidate.unopposed) {
        label += '<span class="unopposed-badge">(Unopposed)</span>';
      }
      btn.innerHTML = label;

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

    buildDetailTabs();
    renderDetailPanel();
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
      case 'Bio':
        renderBio(candidate, race);
        break;
      case 'Positions':
        renderPositions(candidate);
        break;
      case 'Contact':
        renderContact(candidate);
        break;
      case 'Social Activity':
        renderSocial(candidate);
        break;
    }
  }

  function renderBio(candidate, race) {
    const badges = [];
    if (candidate.incumbent) badges.push('Incumbent');
    if (candidate.unopposed) badges.push('Unopposed');
    const badgeHtml = badges.length
      ? ` <span class="candidate-badge">${esc(badges.join(' · '))}</span>`
      : '';

    $detailPanel.innerHTML = `
      <h2 class="candidate-name">${esc(candidate.name)}${badgeHtml}</h2>
      <p class="candidate-race-label">${esc(race.title)}${race.description ? ' — ' + esc(race.description) : ''}</p>
      <p class="bio-text">${esc(candidate.bio)}</p>
    `;
  }

  function renderPositions(candidate) {
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
      <h2 class="candidate-name">${esc(candidate.name)}</h2>
      <h3 style="margin-bottom:16px;color:var(--color-primary)">Positions on Issues</h3>
      ${items}
    `;
  }

  function renderContact(candidate) {
    const c = candidate.contact || {};
    const links = [];

    if (c.email) links.push(`<li><strong>Email:</strong> <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`);
    if (c.website) links.push(`<li><strong>Website:</strong> <a href="${esc(c.website)}" target="_blank" rel="noopener">${esc(c.website)}</a></li>`);
    if (c.facebook) links.push(`<li><strong>Facebook:</strong> <a href="${esc(c.facebook)}" target="_blank" rel="noopener">${esc(c.facebook)}</a></li>`);
    if (c.twitter) links.push(`<li><strong>X / Twitter:</strong> <a href="${esc(c.twitter)}" target="_blank" rel="noopener">${esc(c.twitter)}</a></li>`);

    if (links.length === 0) {
      $detailPanel.innerHTML = `
        <h2 class="candidate-name">${esc(candidate.name)}</h2>
        <p class="no-contact">No contact information available yet. Check back for updates.</p>
      `;
      return;
    }

    $detailPanel.innerHTML = `
      <h2 class="candidate-name">${esc(candidate.name)}</h2>
      <ul class="contact-list">${links.join('')}</ul>
    `;
  }

  async function renderSocial(candidate) {
    $detailPanel.innerHTML = `
      <h2 class="candidate-name">${esc(candidate.name)}</h2>
      <p class="loading">Loading social media activity...</p>
    `;

    const data = await loadSocialData(candidate.id);

    // Guard: user may have navigated away
    if (activeCandidateId !== candidate.id || activeDetailTab !== 'Social Activity') return;

    if (!data || !data.summaries || data.summaries.length === 0) {
      $detailPanel.innerHTML = `
        <h2 class="candidate-name">${esc(candidate.name)}</h2>
        <p class="no-contact">No social media activity data available yet.</p>
      `;
      return;
    }

    const updated = data.lastUpdated
      ? `Last updated: ${new Date(data.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : '';

    const entries = data.summaries.map(s => {
      const sources = (s.sources || []).map(src =>
        `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.platform || 'Link')}</a>`
      ).join(' &middot; ');

      return `
        <div class="social-entry">
          <div class="social-date">${esc(s.date)}</div>
          <p class="social-summary-text">${esc(s.summary)}</p>
          ${sources ? `<div class="social-sources">Sources: ${sources}</div>` : ''}
        </div>
      `;
    }).join('');

    $detailPanel.innerHTML = `
      <div class="social-header">
        <h2 class="candidate-name">${esc(candidate.name)}</h2>
        <span class="social-updated">${esc(updated)}</span>
      </div>
      ${entries}
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
          <p>${formatDate(e.earlyVoting?.start)} &ndash; ${formatDate(e.earlyVoting?.end)}</p>
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

  // --- Init ---

  async function init() {
    try {
      await loadData();
    } catch (err) {
      document.querySelector('main').innerHTML = '<p style="padding:40px;text-align:center;">Unable to load election data. Please try again later.</p>';
      console.error('Failed to load data:', err);
      return;
    }

    // Disclaimer
    $disclaimerBanner.textContent = electionData.disclaimer;
    $footerDisclaimer.textContent = electionData.disclaimer;

    // Countdown
    updateCountdown();
    setInterval(updateCountdown, 60000);

    // Build navigation
    buildRaceTabs();

    // Default to first race
    selectRace(candidatesData.races[0].id);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
