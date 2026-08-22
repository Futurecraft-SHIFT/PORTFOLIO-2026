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
  const rinseStream = 'https://admin.stream.rinse.fm/proxy/rinse_uk/stream';
  let streamReady = false;
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
    const twojeysLeadIn = Math.max(0, Math.min(1, (progress - .87) / .13));
    section.style.setProperty('--so-twojeys-outro', twojeysLeadIn.toFixed(4));
    section.style.setProperty('--so-stars-scale', (0.06 + (0.36 * twojeysLeadIn)).toFixed(3));
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
    audioToggle?.setAttribute('aria-label', playing ? 'Pause Rinse FM UK live' : 'Play Rinse FM UK live');
    if (track) track.textContent = playing ? 'RINSE FM UK / LIVE NOW' : 'CLICK TO LISTEN';
  };

  const prepareStream = () => {
    if (streamReady) return;
    audio.src = rinseStream;
    audio.load();
    streamReady = true;
  };

  audioToggle?.addEventListener('click', async () => {
    if (!audio) return;
    try {
      if (audio.paused) {
        if (track) track.textContent = 'CONNECTING TO RINSE…';
        prepareStream();
        await audio.play();
      }
      else audio.pause();
    } catch (error) {
      if (track) track.textContent = 'OPEN RINSE FM UK';
    }
  });
  audio?.addEventListener('play', () => syncPlayer(true));
  audio?.addEventListener('pause', () => syncPlayer(false));
  audio?.addEventListener('error', () => {
    syncPlayer(false);
    if (track) track.textContent = 'OPEN RINSE FM UK';
  });

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  setScene(0);
  update();
})();
