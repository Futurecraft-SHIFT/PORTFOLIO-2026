(() => {
  const section = document.querySelector('.sala-onda');
  if (!section) return;

  const scenes = [...section.querySelectorAll('[data-sala-scene]')];
  const routeButtons = [...section.querySelectorAll('[data-sala-target]')];
  const progressBar = document.getElementById('salaOndaProgress');
  const audio = document.getElementById('salaOndaAudio');
  const audioToggle = document.getElementById('salaOndaAudioToggle');
  const player = document.getElementById('salaOndaPlayer');
  const track = document.getElementById('salaOndaTrack');
  const ntsStream = 'https://audio-edge-5bkfj.fra.h.radiomast.io/nts1/hls.m3u8';
  let hls;
  let streamReady = false;
  let streamLoading;
  let activeScene = -1;
  let raf = 0;
  const sceneOrder = [0, 2, 1, 3];

  const setScene = index => {
    if (activeScene === index) return;
    activeScene = index;
    const sceneIndex = sceneOrder[index] ?? index;
    section.dataset.activeScene = String(sceneIndex);
    scenes.forEach((scene, i) => scene.classList.toggle('is-active', i === sceneIndex));
    routeButtons.forEach((button, i) => button.classList.toggle('is-active', i === index));
  };

  const update = () => {
    raf = 0;
    const rect = section.getBoundingClientRect();
    const travel = Math.max(1, section.offsetHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / travel));
    const sceneIndex = Math.min(3, Math.floor(progress * 4.0001));
    section.style.setProperty('--so-p', progress.toFixed(4));
    if (progressBar) progressBar.style.width = `${progress * 100}%`;
    setScene(sceneIndex);
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  routeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.salaTarget || 0);
      const travel = section.offsetHeight - innerHeight;
      const target = section.offsetTop + travel * ((index + .08) / 4);
      window.scrollTo({ top: target, behavior: 'smooth' });
    });
  });

  const syncPlayer = playing => {
    player?.classList.toggle('is-playing', playing);
    audioToggle?.setAttribute('aria-pressed', String(playing));
    audioToggle?.setAttribute('aria-label', playing ? 'Pause NTS Channel 1 live' : 'Play NTS Channel 1 live');
    if (track) track.textContent = playing ? 'NTS CHANNEL 1 / LIVE NOW' : 'CLICK TO LISTEN';
  };

  const prepareStream = () => {
    if (streamReady) return Promise.resolve();
    if (streamLoading) return streamLoading;
    streamLoading = new Promise(async (resolve, reject) => {
      try {
        if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          audio.src = ntsStream;
          audio.load();
          streamReady = true;
          resolve();
          return;
        }
        if (!window.Hls?.isSupported()) throw new Error('HLS is not supported');
        hls?.destroy();
        hls = new window.Hls();
        hls.loadSource(ntsStream);
        hls.attachMedia(audio);
        hls.once(window.Hls.Events.MANIFEST_PARSED, () => {
          streamReady = true;
          resolve();
        });
        hls.once(window.Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) reject(new Error(data.details || 'Unable to load NTS'));
        });
      } catch (error) {
        reject(error);
      }
    }).catch(error => {
      streamLoading = undefined;
      throw error;
    });
    return streamLoading;
  };

  audioToggle?.addEventListener('click', async () => {
    if (!audio) return;
    try {
      if (audio.paused) {
        if (track) track.textContent = 'CONNECTING TO NTS…';
        await prepareStream();
        await audio.play();
      }
      else audio.pause();
    } catch (error) {
      if (track) track.textContent = 'OPEN NTS CHANNEL 1';
    }
  });
  audio?.addEventListener('play', () => syncPlayer(true));
  audio?.addEventListener('pause', () => syncPlayer(false));
  audio?.addEventListener('error', () => {
    syncPlayer(false);
    if (track) track.textContent = 'OPEN NTS CHANNEL 1';
  });

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  setScene(0);
  update();
})();
