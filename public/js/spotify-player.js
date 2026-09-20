// spotify-player.js — floating mini player driven by Spotify's official embed IFrame API.
// Audio streams straight from Spotify's own iframe (spotify:track: URIs below); this file only
// wires up custom play/pause/next/previous/track-list buttons against that embed's controller.
// Docs: https://developer.spotify.com/documentation/embeds/references/iframe-api
//
// This is a classic multi-page app, so every navigation is a full reload that tears down the
// iframe. To avoid restarting from track 1 each time, the current track/position/play-state are
// saved to localStorage on every playback update and restored (seek + resume) once the new
// page's controller is ready. There's still a brief silent gap during the page load itself —
// true gapless playback across navigations would need the whole site to intercept links and
// swap content via JS instead of reloading, which is a much bigger change.
(function () {
  const PLAYLIST = [
    { title: 'thank u, next', id: '2rPE9A1vEgShuZxxzR2tZH' },
    { title: '7 rings', id: '6ocbgoVGwYJhOv1GgI9NsF' },
    { title: 'positions', id: '0edCZS4cbBSFiVvVgBy5oc' },
    { title: 'no tears left to cry', id: '2qT1uLXPVPzGgFOx4jtEuo' },
    { title: 'into you', id: '63y6xWR4gXz7bnUGOk8iI6' },
    { title: 'problem (feat. Iggy Azalea)', id: '1uV3Ehtug28m8RmTjdEM6u' },
    { title: 'God is a woman', id: '0YinKgy0pCj3YPKUGWmTOG' }
  ];
  const STATE_KEY = 'yslanotes-music-state';
  const NOTE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 18.5a2.75 2.75 0 1 1-1.6-2.5V6.8a1 1 0 0 1 .8-1l9-1.8a1 1 0 0 1 1.2 1V16a2.75 2.75 0 1 1-1.6-2.5V6.3l-7.8 1.6v10.6Z"/></svg>';
  const PLAYING_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="10" width="3" height="8" rx="1"/><rect x="10.5" y="6" width="3" height="12" rx="1"/><rect x="17" y="12" width="3" height="6" rx="1"/></svg>';

  let controller = null;
  let currentIndex = 0;
  let isPaused = true;
  let lastKnownPositionMs = 0;
  let hasRestoredPlayback = false;

  function readSavedState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STATE_KEY));
      if (parsed && typeof parsed.index === 'number' && parsed.index >= 0 && parsed.index < PLAYLIST.length) {
        return {
          index: parsed.index,
          positionMs: typeof parsed.positionMs === 'number' ? parsed.positionMs : 0,
          wasPlaying: !!parsed.wasPlaying
        };
      }
    } catch (e) {}
    return { index: 0, positionMs: 0, wasPlaying: false };
  }

  function saveState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({
        index: currentIndex,
        positionMs: lastKnownPositionMs,
        wasPlaying: !isPaused
      }));
    } catch (e) {}
  }

  function updateUI() {
    const titleEl = document.getElementById('music-track-title');
    if (titleEl) titleEl.textContent = PLAYLIST[currentIndex].title;

    document.querySelectorAll('#music-track-list li').forEach((li, i) => {
      const active = i === currentIndex;
      li.classList.toggle('active', active);
      const iconEl = li.querySelector('.music-row-icon');
      if (iconEl) iconEl.innerHTML = active ? PLAYING_ICON : NOTE_ICON;
    });

    const playIcon = document.getElementById('music-play-icon');
    const pauseIcon = document.getElementById('music-pause-icon');
    if (playIcon && pauseIcon) {
      playIcon.classList.toggle('hidden', !isPaused);
      pauseIcon.classList.toggle('hidden', isPaused);
    }
  }

  function loadIndex(index, autoplay) {
    hasRestoredPlayback = true; // a manual pick always wins over any pending restore
    currentIndex = (index + PLAYLIST.length) % PLAYLIST.length;
    lastKnownPositionMs = 0;
    isPaused = !autoplay;
    updateUI();
    saveState();
    if (controller) {
      controller.loadUri('spotify:track:' + PLAYLIST[currentIndex].id);
      if (autoplay) controller.play();
    }
  }

  function renderTrackList() {
    const list = document.getElementById('music-track-list');
    if (!list) return;
    list.innerHTML = '';
    PLAYLIST.forEach((track, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="music-row-icon">${NOTE_ICON}</span><span class="music-row-title"></span>`;
      li.querySelector('.music-row-title').textContent = track.title;
      li.addEventListener('click', () => loadIndex(i, true));
      list.appendChild(li);
    });
  }

  function initController() {
    const el = document.getElementById('spotify-embed-container');
    if (!el || !window.SpotifyIframeApi) return;

    const saved = readSavedState();
    currentIndex = saved.index;
    updateUI();

    const options = { uri: 'spotify:track:' + PLAYLIST[currentIndex].id, width: '1', height: '1' };

    window.SpotifyIframeApi.createController(el, options, (embedController) => {
      controller = embedController;
      controller.addListener('playback_update', (e) => {
        isPaused = e.data.isPaused;
        lastKnownPositionMs = e.data.position;
        updateUI();
        saveState();

        if (!hasRestoredPlayback) {
          hasRestoredPlayback = true;
          if (saved.positionMs > 1000) controller.seek(Math.floor(saved.positionMs / 1000));
          // Browsers block autoplay-with-sound without a fresh user gesture on this new page,
          // so this resume attempt may be silently blocked — the position/track still carry
          // over either way, and a single tap on play will pick back up from here.
          if (saved.wasPlaying) controller.resume();
          return;
        }

        // auto-advance when the current track finishes
        if (!isPaused && e.data.duration > 0 && e.data.position >= e.data.duration - 400) {
          loadIndex(currentIndex + 1, true);
        }
      });
    });
  }

  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    window.SpotifyIframeApi = IFrameAPI;
    initController();
  };

  window.addEventListener('pagehide', saveState);
  window.addEventListener('beforeunload', saveState);

  document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('music-panel');
    const toggleBtn = document.getElementById('music-player-toggle');
    const closeBtn = document.getElementById('music-panel-close');
    if (!panel || !toggleBtn) return;

    renderTrackList();
    updateUI();

    let backdrop = document.getElementById('music-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'music-backdrop';
      backdrop.className = 'music-backdrop hidden';
      document.body.appendChild(backdrop);
    }

    function openPanel() {
      panel.classList.remove('hidden');
      backdrop.classList.remove('hidden');
    }
    function closePanel() {
      panel.classList.add('hidden');
      backdrop.classList.add('hidden');
    }

    toggleBtn.addEventListener('click', () => {
      if (panel.classList.contains('hidden')) openPanel(); else closePanel();
    });
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    backdrop.addEventListener('click', closePanel);

    const prevBtn = document.getElementById('music-prev');
    const nextBtn = document.getElementById('music-next');
    const playPauseBtn = document.getElementById('music-playpause');
    if (prevBtn) prevBtn.addEventListener('click', () => loadIndex(currentIndex - 1, true));
    if (nextBtn) nextBtn.addEventListener('click', () => loadIndex(currentIndex + 1, true));
    if (playPauseBtn) playPauseBtn.addEventListener('click', () => {
      if (controller) controller.togglePlay();
    });

    if (!document.getElementById('spotify-iframe-api-script')) {
      const script = document.createElement('script');
      script.id = 'spotify-iframe-api-script';
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.SpotifyIframeApi) {
      initController();
    }
  });
})();
