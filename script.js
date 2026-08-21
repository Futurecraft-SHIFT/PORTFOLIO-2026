(() => {
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const map = (n, a, b, c = 0, d = 1) => c + (d - c) * clamp((n - a) / (b - a));
  const smooth = t => t * t * (3 - 2 * t);
  const damp = (current, target, speed, deltaSeconds) => lerp(current, target, 1 - Math.exp(-speed * deltaSeconds));
  const holdFade = (p, enterStart, enterEnd, leaveStart, leaveEnd) => {
    const enter = smooth(map(p, enterStart, enterEnd));
    const leave = 1 - smooth(map(p, leaveStart, leaveEnd));
    return clamp(enter * leave);
  };
  const rangeFade = (p, a, b, fade = .035) => {
    const enter = smooth(map(p, a - fade, a));
    const leave = 1 - smooth(map(p, b, b + fade));
    return clamp(enter * leave);
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Loader
  const loader = $('#loader');
  const loaderBar = $('#loaderBar');
  const loaderCount = $('#loaderCount');
  let loadValue = 0;
  const loadStarted = performance.now();
  const loadTimer = setInterval(() => {
    const elapsed = performance.now() - loadStarted;
    const target = document.readyState === 'complete' ? 100 : Math.min(92, elapsed / 18);
    loadValue += (target - loadValue) * .11;
    loaderBar.style.width = `${loadValue}%`;
    loaderCount.textContent = String(Math.round(loadValue)).padStart(3, '0');
    if (loadValue > 99.3) {
      clearInterval(loadTimer);
      loaderBar.style.width = '100%';
      loaderCount.textContent = '100';
      setTimeout(() => {
        loader.classList.add('is-hidden');
        document.body.classList.add('is-loaded');
      }, 320);
    }
  }, 32);
  window.addEventListener('load', () => { loadValue = Math.max(loadValue, 94); });
  setTimeout(() => { loadValue = 100; }, 2400);

  // Custom cursor
  const cursor = $('#cursor');
  const cursorText = $('span', cursor);
  let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
  cursor.style.setProperty('--cursor-x', `${mouseX}px`);
  cursor.style.setProperty('--cursor-y', `${mouseY}px`);
  window.addEventListener('pointermove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.setProperty('--cursor-x', `${mouseX}px`);
    cursor.style.setProperty('--cursor-y', `${mouseY}px`);
  }, { passive: true });
  document.addEventListener('pointerover', e => {
      const interactive = e.target.closest('a, button, .project-trigger, [data-cursor]');
      if (interactive) {
        const cursorLabel = interactive.dataset.cursor || (interactive.classList.contains('project-trigger') ? 'OPEN' : 'ENTER');
        cursor.classList.add('is-active');
        cursor.classList.toggle('is-open', cursorLabel === 'OPEN');
        cursorText.textContent = cursorLabel;
      }
  });
  document.addEventListener('pointerout', e => {
      const interactive = e.target.closest('a, button, .project-trigger, [data-cursor]');
      if (!interactive || (e.relatedTarget && interactive.contains(e.relatedTarget))) return;
      cursor.classList.remove('is-active', 'is-open');
  });

  // Index panel
  const indexPanel = $('#indexPanel');
  const indexButton = $('#indexButton');
  const setIndex = open => {
    indexPanel.classList.toggle('is-open', open);
    indexPanel.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('index-open', open);
  };
  indexButton.addEventListener('click', () => setIndex(true));
  $$('[data-close-index]').forEach(el => el.addEventListener('click', () => setIndex(false)));

  // In-view reveals
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .14, rootMargin: '0px 0px -7% 0px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  // CUPRA 3D stack using the official symbol as a CSS mask
  const cupraLogo = $('#cupraLogo3d');
  const fortniteLogo = $('#fortniteLogo3d');
  const cupraVortex = $('#cupraVortex');
  const cupraVortexParticles = $('#cupraVortexParticles');
  const cupraCrossoverFlare = $('#cupraCrossoverFlare');
  const layerCount = 22;
  for (let i = 0; i < layerCount; i++) {
    const layer = document.createElement('i');
    layer.className = `cupra-logo-layer${i === layerCount - 1 ? ' front' : ''}`;
    const z = (i - layerCount / 2) * 3.1;
    layer.style.transform = `translateZ(${z}px)`;
    if (i < layerCount - 1) {
      const brightness = 22 + i * .75;
      layer.style.background = `linear-gradient(110deg, hsl(${248 + i * 1.1} 65% ${brightness}%), hsl(${198 + i * .6} 68% ${brightness + 7}%))`;
      layer.style.opacity = String(.34 + i / layerCount * .42);
    }
    cupraLogo.appendChild(layer);
  }

  // A second extruded identity turns the existing CUPRA artifact into a crossover reveal.
  const fortniteLayerCount = 14;
  for (let i = 0; i < fortniteLayerCount; i++) {
    const layer = document.createElement('i');
    layer.className = `fortnite-logo-layer${i === fortniteLayerCount - 1 ? ' front' : ''}`;
    layer.textContent = 'FORTNITE';
    const z = (i - fortniteLayerCount / 2) * 3.8;
    layer.style.transform = `translateZ(${z}px)`;
    layer.style.opacity = i === fortniteLayerCount - 1 ? '1' : String(.28 + i / fortniteLayerCount * .5);
    fortniteLogo.appendChild(layer);
  }

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('i');
    particle.style.setProperty('--particle-angle', `${i * 7.5}deg`);
    particle.style.setProperty('--particle-radius', `${18 + (i % 9) * 4}vmin`);
    particle.style.setProperty('--particle-delay', `${-(i % 12) * .13}s`);
    particle.style.setProperty('--particle-size', `${2 + (i % 4) * 1.5}px`);
    cupraVortexParticles.appendChild(particle);
  }

  // A real truncated-icosahedron football: twelve pentagons and twenty hexagons
  // projected from 3D on every frame. It remains light enough for the long scroll edit.
  const fffBallCanvas = $('#fffBallCanvas');
  const fffFootballRenderer = (() => {
    if (!fffBallCanvas) return () => {};
    const ctx = fffBallCanvas.getContext('2d');
    if (!ctx) return () => {};
    const phi = (1 + Math.sqrt(5)) / 2;
    const normalize = p => {
      const length = Math.hypot(p.x, p.y, p.z) || 1;
      return { x:p.x / length, y:p.y / length, z:p.z / length };
    };
    const vertices = [
      [-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],
      [0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],
      [phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]
    ].map(([x,y,z]) => normalize({x,y,z}));
    const triangles = [
      [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
      [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
      [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
      [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];
    const neighbours = vertices.map(() => new Set());
    triangles.forEach(([a,b,c]) => {
      neighbours[a].add(b); neighbours[a].add(c);
      neighbours[b].add(a); neighbours[b].add(c);
      neighbours[c].add(a); neighbours[c].add(b);
    });
    const points = new Map();
    const truncatedPoint = (from,to) => {
      const key = `${from}-${to}`;
      if (!points.has(key)) {
        const a = vertices[from], b = vertices[to];
        points.set(key, normalize({x:(2*a.x+b.x)/3,y:(2*a.y+b.y)/3,z:(2*a.z+b.z)/3}));
      }
      return points.get(key);
    };
    const orientFace = face => {
      const a=face[0], b=face[1], c=face[2];
      const ab={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z};
      const ac={x:c.x-a.x,y:c.y-a.y,z:c.z-a.z};
      const normal={x:ab.y*ac.z-ab.z*ac.y,y:ab.z*ac.x-ab.x*ac.z,z:ab.x*ac.y-ab.y*ac.x};
      const center=face.reduce((sum,p)=>({x:sum.x+p.x,y:sum.y+p.y,z:sum.z+p.z}),{x:0,y:0,z:0});
      return normal.x*center.x+normal.y*center.y+normal.z*center.z < 0 ? [...face].reverse() : face;
    };
    const faces = triangles.map(([a,b,c],index) => ({
      type:'hex', index, points:orientFace([truncatedPoint(a,b),truncatedPoint(b,a),truncatedPoint(b,c),truncatedPoint(c,b),truncatedPoint(c,a),truncatedPoint(a,c)])
    }));
    vertices.forEach((vertex,index) => {
      const reference = Math.abs(vertex.y) < .9 ? {x:0,y:1,z:0} : {x:1,y:0,z:0};
      const tangent = normalize({x:reference.y*vertex.z-reference.z*vertex.y,y:reference.z*vertex.x-reference.x*vertex.z,z:reference.x*vertex.y-reference.y*vertex.x});
      const bitangent = {x:vertex.y*tangent.z-vertex.z*tangent.y,y:vertex.z*tangent.x-vertex.x*tangent.z,z:vertex.x*tangent.y-vertex.y*tangent.x};
      const pentagon = [...neighbours[index]].map(n => truncatedPoint(index,n)).sort((p,q) => {
        const pa={x:p.x-vertex.x,y:p.y-vertex.y,z:p.z-vertex.z};
        const qa={x:q.x-vertex.x,y:q.y-vertex.y,z:q.z-vertex.z};
        const ap=Math.atan2(pa.x*bitangent.x+pa.y*bitangent.y+pa.z*bitangent.z,pa.x*tangent.x+pa.y*tangent.y+pa.z*tangent.z);
        const aq=Math.atan2(qa.x*bitangent.x+qa.y*bitangent.y+qa.z*bitangent.z,qa.x*tangent.x+qa.y*tangent.y+qa.z*tangent.z);
        return ap-aq;
      });
      faces.push({type:'pent',index:20+index,points:orientFace(pentagon)});
    });
    const rotate = (p,rx,ry,rz) => {
      let {x,y,z}=p;
      let c=Math.cos(rx),s=Math.sin(rx); [y,z]=[y*c-z*s,y*s+z*c];
      c=Math.cos(ry);s=Math.sin(ry); [x,z]=[x*c+z*s,-x*s+z*c];
      c=Math.cos(rz);s=Math.sin(rz); [x,y]=[x*c-y*s,x*s+y*c];
      return {x,y,z};
    };
    return (rx=0,ry=0,rz=0) => {
      const rect=fffBallCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr=Math.min(devicePixelRatio||1,2);
      const width=Math.round(rect.width*dpr),height=Math.round(rect.height*dpr);
      if (fffBallCanvas.width!==width || fffBallCanvas.height!==height) { fffBallCanvas.width=width; fffBallCanvas.height=height; }
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,rect.width,rect.height);
      const cx=rect.width/2,cy=rect.height/2,scale=Math.min(rect.width,rect.height)*.39;
      const sphereRadius=Math.min(rect.width,rect.height)*.355;
      const sphereBase=ctx.createRadialGradient(cx-sphereRadius*.35,cy-sphereRadius*.42,sphereRadius*.04,cx,cy,sphereRadius*1.08);
      sphereBase.addColorStop(0,'#2865ff'); sphereBase.addColorStop(.38,'#073bd6'); sphereBase.addColorStop(.78,'#001c92'); sphereBase.addColorStop(1,'#000b55');
      ctx.fillStyle=sphereBase; ctx.beginPath(); ctx.arc(cx,cy,sphereRadius,0,Math.PI*2); ctx.fill();
      const projectedFaces=faces.map(face => {
        const rotated=face.points.map(p=>rotate(p,rx,ry,rz));
        const a=rotated[0],b=rotated[1],c=rotated[2];
        const ab={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},ac={x:c.x-a.x,y:c.y-a.y,z:c.z-a.z};
        const normal=normalize({x:ab.y*ac.z-ab.z*ac.y,y:ab.z*ac.x-ab.x*ac.z,z:ab.x*ac.y-ab.y*ac.x});
        const depth=rotated.reduce((sum,p)=>sum+p.z,0)/rotated.length;
        const path=rotated.map(p=>{const perspective=2.75/(3.15-p.z);return {x:cx+p.x*scale*perspective,y:cy-p.y*scale*perspective};});
        return {...face,rotated,path,normal,depth};
      }).filter(face=>face.normal.z>-.05).sort((a,b)=>a.depth-b.depth);
      projectedFaces.forEach(face => {
        const light=clamp(face.normal.x*-.28+face.normal.y*.42+face.normal.z*.78,-1,1);
        const center=face.path.reduce((sum,p)=>({x:sum.x+p.x,y:sum.y+p.y}),{x:0,y:0}); center.x/=face.path.length; center.y/=face.path.length;
        const inset=face.path.map(p=>({x:center.x+(p.x-center.x)*.895,y:center.y+(p.y-center.y)*.895}));
        const drawPath=path=>{ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();};

        drawPath(face.path);
        ctx.lineJoin='round'; ctx.lineWidth=Math.max(4,rect.width*.0105); ctx.strokeStyle='rgba(0,7,72,.9)'; ctx.stroke();
        ctx.lineWidth=Math.max(1,rect.width*.0025); ctx.strokeStyle='rgba(91,127,255,.24)'; ctx.stroke();

        drawPath(inset);
        const faceGradient=ctx.createRadialGradient(center.x-rect.width*.025,center.y-rect.height*.03,0,center.x,center.y,Math.max(24,rect.width*.115));
        const lift=face.type==='pent' ? -9 : 5;
        const bright=Math.round(clamp(54+light*42+lift,18,112));
        faceGradient.addColorStop(0,`rgb(${Math.round(bright*.15)},${Math.round(bright*.62)},${Math.min(255,bright+145)})`);
        faceGradient.addColorStop(.58,`rgb(0,${Math.round(bright*.42)},${Math.min(240,bright+98)})`);
        faceGradient.addColorStop(1,`rgb(0,${Math.round(bright*.2)},${Math.min(180,bright+50)})`);
        ctx.fillStyle=faceGradient;
        ctx.shadowColor='rgba(0,2,45,.7)'; ctx.shadowBlur=Math.max(3,rect.width*.008); ctx.shadowOffsetY=Math.max(1,rect.width*.003); ctx.fill();
        ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetY=0;
        ctx.lineWidth=Math.max(.7,rect.width*.0017); ctx.strokeStyle='rgba(96,142,255,.44)'; ctx.stroke();

        ctx.save(); drawPath(inset); ctx.clip();
        ctx.globalAlpha=.12;
        for (let grain=0; grain<12; grain++) {
          const seed=Math.sin((face.index+1)*91.17+(grain+1)*37.41)*43758.5453;
          const seed2=Math.sin((face.index+1)*53.73+(grain+1)*19.87)*24634.6345;
          const gx=center.x+((seed-Math.floor(seed))-.5)*rect.width*.105;
          const gy=center.y+((seed2-Math.floor(seed2))-.5)*rect.height*.105;
          ctx.strokeStyle=grain%3===0?'rgba(255,255,255,.65)':'rgba(0,0,45,.5)';
          ctx.lineWidth=Math.max(.35,rect.width*.00055); ctx.beginPath(); ctx.moveTo(gx,gy); ctx.quadraticCurveTo(gx+2,gy-1,gx+4,gy+.5); ctx.stroke();
        }
        ctx.restore(); ctx.globalAlpha=1;
      });
      const shine=ctx.createRadialGradient(cx-rect.width*.13,cy-rect.height*.17,0,cx-rect.width*.13,cy-rect.height*.17,rect.width*.37);
      shine.addColorStop(0,'rgba(255,255,255,.3)'); shine.addColorStop(.2,'rgba(255,255,255,.075)'); shine.addColorStop(1,'rgba(255,255,255,0)');
      ctx.globalCompositeOperation='screen'; ctx.fillStyle=shine; ctx.beginPath(); ctx.arc(cx,cy,Math.min(rect.width,rect.height)*.36,0,Math.PI*2); ctx.fill(); ctx.globalCompositeOperation='source-over';
    };
  })();

  // Ambient pointer influence on logo
  let logoMouseX = 0, logoMouseY = 0;
  window.addEventListener('pointermove', e => {
    logoMouseX = (e.clientX / innerWidth - .5) * 10;
    logoMouseY = (e.clientY / innerHeight - .5) * 7;
  });

  // Project modal
  const projectModal = $('#projectModal');
  const projectClose = $('#projectClose');
  const projectTitle = $('#projectTitle');
  const projectKicker = $('#projectKicker');
  const projectDescription = $('#projectDescription');
  const projectTags = $('#projectTags');
  const projectGallery = $('#projectGallery');

  const projects = {
    'automotive-development': {
      kicker: 'AUTOMOTIVE DEVELOPMENT / PROCESS A—Z',
      title: 'FORM INTO REALITY',
      description: 'Production-oriented digital development requires more than attractive surfaces. It means protecting design intent through packaging, construction, surface quality, technical feasibility and the final visual story. This selection focuses on the work of turning an idea into a credible automotive object.',
      tags: ['DIGITAL MODELLING', 'SURFACE QUALITY', 'PRODUCTION AWARENESS', 'AUTOMOTIVE DESIGN', 'VISUALIZATION'],
      media: [
        ['assets/auto-lucid.webp','wide','Lucid Gravity / production development context'],
        ['assets/auto-bmw-interior.webp','wide','BMW interior / experience architecture and detail'],
        ['assets/auto-kia-front.webp','wide','KIA front architecture / clean product definition']
      ]
    },
    'design-intent': {
      kicker: 'DESIGN INTENT / PROPORTION / CONCEPT STORY',
      title: 'THE IDEA BEFORE THE OUTPUT',
      description: 'A different part of the automotive journey: establishing character, proportion, stance, graphic identity and the emotional logic of the object. These concept and editorial explorations show how a strong design idea can remain coherent across form, brand and communication.',
      tags: ['DESIGN INTENT', 'PROPORTION', 'CONCEPT DEVELOPMENT', 'BRAND LANGUAGE', 'STORYTELLING'],
      media: [
        ['assets/auto-kia-proceed.webp','wide','KIA Proceed concept / proportion and surface'],
        ['assets/auto-genesis.webp','wide','Genesis Essentia / concept visualization'],
        ['assets/editorial-citroen.webp','wide','Citroën performance concept / speculative design language'],
        ['assets/editorial-bmw.webp','','BMW motorsport concept / graphic and performance identity'],
        ['assets/editorial-alpine.webp','','Alpine electrified racing concept / heritage reinterpreted']
      ]
    },
    cupra: {
      kicker: 'CUPRA × FORTNITE / SPECULATIVE CROSSOVER CAMPAIGN',
      title: 'DROP IN. DRIVE OUT.',
      description: 'A speculative crossover world that reframes CUPRA show cars as selectable cultural icons. Two pilot characters, emote-driven attitude, monumental vehicles and a game-ready landscape connect automotive visualization with entertainment, campaign storytelling and digital product culture.',
      tags: ['CREATIVE DIRECTION', 'WORLD-BUILDING', 'GAME CULTURE', 'CAMPAIGN', 'CINEMATIC VISUALIZATION'],
      media: [
        ['assets/cupra-fortnite-lineup.png','wide','Campaign master / four-car drop'],
        ['assets/cupra-fortnite-pilot-coupe.png','wide','Player 01 / show-car hero'],
        ['assets/cupra-fortnite-pilot-suv.png','wide','Player 02 / SUV hero']
      ]
    },
    'object-experience': {
      kicker: 'I DESIGN EXPERIENCES / PRODUCT + 3D + BRAND STORYTELLING',
      title: 'OBJECT TO EXPERIENCE',
      description: 'A technical footwear concept developed beyond form into a full product ecosystem: Alias surfacing, material definition, visualization, graphic language and campaign imagery. The product is the beginning; the identity completes the experience.',
      tags: ['INDUSTRIAL DESIGN', 'AUTODESK ALIAS', 'CMF', 'PRODUCT VISUALIZATION', 'BRANDING'],
      media: [
        ['assets/product-stero-front.webp','','Final product hero / front three-quarter'],
        ['assets/product-stero-rear.webp','','Final product hero / outsole and rear'],
        ['assets/product-alias-1.webp','','Early surface definition'],
        ['assets/product-alias-2.webp','','Alias development / surface continuity'],
        ['assets/product-stero-campaign.webp','tall','Campaign system / product data aesthetic'],
        ['assets/product-stero-logo.webp','','Brand motion and graphic language']
      ]
    },
    mobility: {
      kicker: 'MICROMOBILITY / INDUSTRIAL DESIGN / URBAN SYSTEMS',
      title: 'DETAIL TO SYSTEM',
      description: 'Mobility thinking across scales: believable components, cargo-bike architecture, compact urban platforms and design details that carry a wider system. The work connects physical product decisions to cleaner last-mile experiences.',
      tags: ['MICROMOBILITY', 'URBAN SYSTEMS', 'INDUSTRIAL DESIGN', 'CMF', 'FUTURE TRANSPORT'],
      media: [
        ['assets/mobility-bike.webp','wide','Cargo-bike architecture / modular urban utility'],
        ['assets/mobility-frame-detail.webp','','Frame interface / light, CMF and construction'],
        ['assets/mobility-vehicle.webp','wide','Compact future mobility platform'],
        ['assets/mobility-compact-side.webp','wide','Modular vehicle architecture / reduction and packaging'],
        ['assets/mobility-suspension.webp','','Mechanical detail / performance and material contrast'],
        ['assets/wheel-aero.webp','','Aerodynamic wheel study'],
        ['assets/wheel-heritage.webp','','Wheel graphic and material exploration']
      ]
    },
    campaign: {
      kicker: 'LIFESTYLE / OUTDOOR / MOTION',
      title: 'DESIGNING DESIRE',
      description: 'A visual world that moves from performance product to culture: casting, styling, editorial photography, landscape, motion and graphic attitude. The campaign work demonstrates how an object becomes an emotional universe.',
      tags: ['ART DIRECTION', 'FASHION', 'OUTDOOR', 'MOTION', 'CAMPAIGN SYSTEM'],
      media: [
        ['assets/outdoor-wide.mp4','video wide','Campaign motion / cinematic landscape'],
        ['assets/outdoor-portrait.webp','tall','Portrait / product and identity'],
        ['assets/outdoor-fashion.webp','tall','Styling / floral technical contrast'],
        ['assets/outdoor-trail.webp','','Trail product story'],
        ['assets/outdoor-runner.webp','','Movement / hero image']
      ]
    },
    editorial: {
      kicker: 'EDITORIAL / GRAPHIC SYSTEMS / CULTURAL STORYTELLING',
      title: 'A LANGUAGE FOR EVERY STORY',
      description: 'Personal editorial explorations that translate brand history, place and product into distinct visual systems. Each project changes voice while preserving hierarchy, impact and a clear point of view.',
      tags: ['GRAPHIC DESIGN', 'TYPOGRAPHY', 'EDITORIAL', 'BRAND ADAPTATION', 'ART DIRECTION'],
      media: [
        ['assets/editorial-acg.webp','','ACG / Barcelona heat department'],
        ['assets/editorial-acg-towel.webp','','ACG / cooling technology system'],
        ['assets/editorial-acg-fan.webp','','ACG / airflow device'],
        ['assets/editorial-gramicci.webp','','Gramicci / California summer essentials'],
        ['assets/editorial-gramicci-tahoe.webp','','Gramicci / Lake Tahoe object story'],
        ['assets/editorial-diadora.webp','','Diadora / performance heritage'],
        ['assets/editorial-decathlon.webp','','Decathlon / city-to-terrain system'],
        ['assets/editorial-bialetti.webp','','Bialetti / Italian icon and ritual'],
        ['assets/editorial-primavera.webp','','Primavera Sound / typography and culture'],
        ['assets/editorial-fiat.webp','wide','FIAT / future micro-mobility'],
        ['assets/editorial-city.webp','','Barcelona civic identity exploration']
      ]
    },
    space: {
      kicker: 'SCENOGRAPHY / ENVIRONMENT / LIGHT',
      title: 'ATMOSPHERE AS MATERIAL',
      description: 'Spatial studies positioned between architecture, exhibition, launch environment and cinematic production design. Light, negative space and material restraint define how the object — and the visitor — feels inside the world.',
      tags: ['SCENOGRAPHY', 'SPATIAL DESIGN', 'LIGHTING', 'ENVIRONMENT ART', 'WORLD-BUILDING'],
      media: [
        ['assets/space-round.webp','wide','Circular terracotta environment'],
        ['assets/space-brutalist.webp','wide','Brutalist frame / sculptural installation'],
        ['assets/space-desert.webp','','Desert architecture / reflective stage']
      ]
    }
  };

  // V1 content manifest. Each project has one narrative home so the journey
  // can grow without recycling the same case study in multiple chapters.
  Object.assign(projects, {
    'digital-craft': {
      kicker: 'I DESIGN EXPERIENCES / DIGITAL CRAFT + INDUSTRIAL DESIGN',
      title: 'DIGITAL CRAFT',
      description: 'Physical products are experienced through proportion, touch, use, material and identity. This selection connects industrial design discipline with the digital assets and visual systems that carry an object into culture.',
      tags: ['INDUSTRIAL DESIGN', '3D DEVELOPMENT', 'CMF', 'DIGITAL ASSETS', 'BRAND LANGUAGE'],
      media: [
        ['assets/digital-craft-01-lucid-gravity.jpg', 'wide', 'Lucid Gravity X / exterior concept and digital visualization'],
        ['assets/digital-craft-02-bmw-interior.jpg', 'wide', 'BMW interior / spatial experience and digital definition'],
        ['assets/digital-craft-03-concept-surfacing.jpg', 'wide', 'Automotive concept / proportion and surfacing study'],
        ['assets/digital-craft-04-mobility-frame.png', '', 'Micromobility frame / construction, comfort and CMF'],
        ['assets/digital-craft-05-kia-front.png', 'wide', 'KIA front architecture / digital definition and design intent'],
        ['assets/digital-craft-06-wheel-concept.png', 'tall', 'Wheel concept / geometric volume and material contrast'],
        ['assets/digital-craft-07-industrial-sculpture.png', '', 'Industrial object study / form, texture and lighting'],
        ['assets/digital-craft-08-product-family.png', '', 'Product family / proportion, repetition and surface language'],
        ['assets/digital-craft-09-mobility-detail.png', 'tall', 'Mobility detail / structure, graphics and CMF'],
        ['assets/digital-craft-10-xmod-wheel.jpg', '', 'XMOD wheel / digital craft and material exploration']
      ]
    },
    'fff-jacquemus': {
      kicker: 'I DESIGN MOVEMENT / FFF × JACQUEMUS × ALPINE',
      title: 'LE BLEU EN MOUVEMENT.',
      description: 'A speculative World Cup collaboration translating the codes of the French national team and Jacquemus into a singular performance object. Monochrome French blue, restrained white aerodynamics, tricolour detailing and player identity connect fashion, football and movement in one cinematic campaign world.',
      tags: ['CREATIVE DIRECTION', 'COLLABORATION', 'FASHION CULTURE', 'MOVEMENT', 'CINEMATIC CAMPAIGN', 'WORLD CUP'],
      media: [
        ['assets/fff-jacquemus-03-front.jpg','wide','The national object / front campaign hero'],
        ['assets/fff-jacquemus-01-interior.jpg','wide','Couture cockpit / sculptural blue interior'],
        ['assets/fff-jacquemus-04-players.jpg','wide','The squad / tricolour player identity detail'],
        ['assets/fff-jacquemus-05-profile.jpg','wide','Silhouette / fashion in motion'],
        ['assets/fff-jacquemus-02-rear.jpg','wide','A290_R / rear identity and white aero fin'],
        ['assets/fff-jacquemus-06-overhead.jpg','wide','Final form / ultra-blue overhead composition']
      ]
    },
    nike: {
      kicker: 'I DESIGN STORIES / NIKE — OBJECTS BECOME CULTURE',
      title: 'DESIGNING DESIRE',
      description: 'A lifestyle and outdoor visual world built through casting, styling, product placement, editorial imagery and motion. The work moves beyond showing an object to creating a cultural signal around it.',
      tags: ['CREATIVE DIRECTION', 'ART DIRECTION', 'FASHION', 'MOTION', 'CAMPAIGN'],
      media: [
        ['assets/outdoor-wide.mp4', 'video wide', 'Campaign film / cinematic landscape and motion'],
        ['assets/outdoor-portrait.webp', 'tall', 'Portrait, flower jewelry and technical product'],
        ['assets/outdoor-fashion.webp', 'tall', 'Styling, identity and cultural contrast'],
        ['assets/outdoor-trail.webp', '', 'Product story in context'],
        ['assets/outdoor-runner.webp', 'wide', 'Movement-led campaign hero']
      ]
    },
    gramicci: {
      kicker: 'I DESIGN STORIES / WORLD-BUILDING — GRAMICCI',
      title: 'CALIFORNIA IS A STATE OF MIND',
      description: 'A brand journey across six California locations, combining cultural research, location-based storytelling, generative terrain, animated editorial language and a family of collectible digital assets.',
      tags: ['WORLD-BUILDING', 'BRAND CULTURE', 'EDITORIAL', 'COLLECTIBLE ASSETS', 'INTERACTIVE STORY'],
      media: [
        ['assets/editorial-gramicci.webp', 'tall', 'California summer essentials / world entry'],
        ['assets/editorial-gramicci-tahoe.webp', 'tall', 'Lake Tahoe / location and collectible asset story']
      ]
    },
    acg: {
      kicker: 'I DESIGN SYSTEMS / ACG BARCELONA',
      title: 'BUILT FOR CITY HEAT',
      description: 'An urban campaign system in which live weather, 570 climate shelters, a spatial 3D map, product utility and field reporting operate as one connected experience.',
      tags: ['SYSTEM DESIGN', 'LIVE INFORMATION', '3D MAP', 'CLIMATE SHELTERS', 'FIELD NOTES'],
      media: [
        ['assets/editorial-acg.webp', 'tall', 'Barcelona heat department / master system'],
        ['assets/editorial-acg-towel.webp', 'tall', 'Cooling utility / product communication'],
        ['assets/editorial-acg-fan.webp', 'tall', 'Airflow device / asset language']
      ]
    },
    future: {
      kicker: 'DESIGN THE FUTURE / HONOR THE PAST',
      title: 'VELOCITÀ FUTURA',
      description: 'A racing-eyewear campaign that translates Cinelli’s visual memory into a future-facing product world. Heritage becomes material, color, speed and a new object of desire.',
      tags: ['PRODUCT STORY', 'HERITAGE', 'CAMPAIGN', 'INDUSTRIAL DESIGN', 'CULTURE'],
      media: [
        ['assets/cinelli-aero-visor-product.jpg', '', 'Aero Visor / future-facing product hero'],
        ['assets/cinelli-aero-visor-rider.jpg', '', 'Racing memory / campaign in motion'],
        ['assets/cinelli-aero-visor-hero.jpg', '', 'Aero Visor / frontal campaign hero']
      ]
    }
  });

  function openProject(key) {
    const project = projects[key];
    if (!project) return;
    projectModal.dataset.project = key;
    projectKicker.textContent = project.kicker;
    projectTitle.textContent = project.title;
    projectDescription.textContent = project.description;
    projectTags.innerHTML = project.tags.map(t => `<span>${t}</span>`).join('');
    projectGallery.innerHTML = project.media.map(([src, cls, caption], index) => {
      const isVideo = cls.includes('video');
      const figureClass = cls.replace('video', '').trim();
      const stageNumber = String(index + 1).padStart(2, '0');
      const stageTotal = String(project.media.length).padStart(2, '0');
      const media = isVideo
        ? `<video autoplay muted loop playsinline controls><source src="${src}" type="video/mp4"></video>`
        : `<img src="${src}" alt="${caption}" loading="${index === 0 ? 'eager' : 'lazy'}">`;
      const ambientImage = isVideo ? '' : ` style="--detail-ambient:url(${src})"`;
      return `<figure class="project-modal__stage ${figureClass}" data-stage="${stageNumber}"${ambientImage}><div class="project-modal__media-shell">${media}</div><figcaption><span>${stageNumber} / ${stageTotal}</span><strong>${caption}</strong></figcaption></figure>`;
    }).join('');
    cursor.classList.remove('is-active', 'is-open');
    cursorText.textContent = 'VIEW';
    projectModal.appendChild(cursor);
    document.body.classList.add('modal-open');
    projectModal.showModal();
    projectModal.scrollTop = 0;
  }

  $$('.project-trigger').forEach(el => el.addEventListener('click', () => openProject(el.dataset.project)));
  const closeProject = () => {
    projectModal.close();
    document.body.classList.remove('modal-open');
    cursor.classList.remove('is-active', 'is-open');
    cursorText.textContent = 'VIEW';
    document.body.appendChild(cursor);
  };
  projectClose.dataset.cursor = 'CLOSE';
  projectClose.addEventListener('click', closeProject);
  projectModal.addEventListener('click', e => { if (e.target === projectModal) closeProject(); });
  projectModal.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (cursor.parentElement !== document.body) document.body.appendChild(cursor);
  });

  // Ricard Pétanque is loaded only when requested. It stays inside the
  // portfolio journey, but remains an independent playable experience.
  const gameModal = $('#gameModal');
  const gameFrame = $('#gameFrame');
  const gameClose = $('#gameClose');
  let gameLoaded = false;
  const openGame = () => {
    document.body.classList.add('game-open');
    gameModal.showModal();
    if (!gameLoaded) {
      gameFrame.src = 'games/ricard-petanque.html';
      gameLoaded = true;
    }
  };
  const closeGame = () => {
    gameModal.close();
    document.body.classList.remove('game-open');
  };
  $$('[data-game-launch]').forEach(el => el.addEventListener('click', openGame));
  gameFrame.addEventListener('load', () => gameModal.classList.add('is-ready'));
  gameClose.addEventListener('click', closeGame);
  gameModal.addEventListener('close', () => document.body.classList.remove('game-open'));

  // Main animation loop
  const heroTitle = $('.hero__title');
  const heroSolid = $('.hero__line--solid');
  const heroHolo = $('.hero__line--holo');
  function fitHeroLines() {
    const pageX = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-x')) || 40;
    const available = Math.max(280, innerWidth - pageX * 2);
    [[heroSolid, .84], [heroHolo, .77]].forEach(([line, preferred]) => {
      if (!line) return;
      line.style.transform = 'none';
      const natural = Math.max(1, line.scrollWidth);
      const scale = Math.min(preferred, available / natural);
      line.style.transform = `scaleX(${scale})`;
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeroLines);
  window.addEventListener('load', fitHeroLines);
  const heroFragments = $$('.hero__fragments figure');
  const formSection = $('#form');
  const formTrack = $('#formTrack');
  const formProgress = $('#formProgress');
  const cupraSection = $('#cupra');
  const cupraLogoScene = $('#cupraLogoScene');
  const fortniteLogoScene = $('#fortniteLogo3d');
  const cupraLogoCopy = $('.cupra-logo-copy', cupraLogoScene);
  const cupraOrbits = $$('.cupra-orbit', cupraLogoScene);
  const cupraSlides = $('#cupraSlides');
  const cupraSlideEls = $$('.cupra-slide');
  const cupraEndcopy = $('#cupraEndcopy');
  const cupraCounter = $('#cupraCounter');
  const movementIntro = $('#movement');
  const fffMovement = $('#fffMovement');
  const fffOrbScene = $('#fffOrbScene');
  const fffBall = $('#fffBall');
  const fffBallObject = $('.fff-ball__object', fffBall);
  const fffCrest = $('#fffCrest');
  const fffOrbCopy = $('#fffOrbCopy');
  const fffOrbFlare = $('#fffOrbFlare');
  const fffSlides = $('#fffSlides');
  const fffSlideEls = $$('.fff-slide', fffMovement);
  const fffEndcopy = $('#fffEndcopy');
  const fffCounter = $('#fffCounter');
  const fffOrbits = $$('.fff-orbit', fffOrbScene);
  const systemsSection = $('#system-engine-section');
  const systemsStatement = $('.systems__statement');
  const systemsAlt = $('.systems__statement-alt');
  const systemEngine = $('#systemEngine');
  const systemsFoot = $('.systems__foot');
  const metaThinking = $('#metaThinking');
  const metaFlowValue = $('#metaFlowValue');
  const aboutSection = $('#about');
  const aboutTiles = $$('.about__filmstrip .about__tile', aboutSection);
  const narrativeRail = $('#narrativeRail');
  const narrativeRailProgress = $('#narrativeRailProgress');
  const narrativePoints = $$('[data-narrative-point]', narrativeRail);
  const narrativeThresholds = $$('[data-narrative-threshold]');
  const narrativeChapters = $$('[data-journey-chapter]');
  const narrativeStart = $('#act-feel');
  const narrativeEnd = $('#contact');
  const gramicciSection = $('#gramicci');
    const gramicciStops = $$('#gramicciRoute button');
  const gramicciStop = $('#gramicciStop');
  const gramicciCoordinate = $('#gramicciCoordinate');
  const gramicciFrame = $('#gramicciFrame');
  const gramicciVisual = $('.world-feature__visual', gramicciSection);
  const gramicciObjectStrip = $('#gramicciObjectStrip');
  const gramicciObjectImages = [$('#gramicciObject1'), $('#gramicciObject2'), $('#gramicciObject3')];
  const gramicciObjectCaptions = [$('#gramicciCaption1'), $('#gramicciCaption2'), $('#gramicciCaption3')];
  const gramicciObjectSets = [
    [['yosemite-carabiner.jpg','YOSEMITE CARABINER'],['yosemite-chalk-bag.jpg','CHALK BAG'],['yosemite-camp-chair.jpg','BASE CAMP CHAIR']],
    [['lake-tahoe-camp-mug.jpg','ALPINE CAMP MUG'],['lake-tahoe-cooler.jpg','TRAIL COOLER'],['lake-tahoe-lure.jpg','LUCKY LAKE LURE']],
    [['san-francisco-coffee-cup.jpg','FOG READY CUP'],['san-francisco-poncho.jpg','FOG READY PONCHO'],['san-francisco-bell.jpg','CABLE CAR BELL']],
    [['los-angeles-camera.jpg','CITY FILM CAMERA'],['los-angeles-cassette-player.jpg','SIDEWALK CASSETTE PLAYER'],['los-angeles-waist-pack.jpg','BOULEVARD WAIST PACK']],
    [['joshua-tree-emergency-kit.jpg','DESERT EMERGENCY KIT'],['joshua-tree-camp-plate.jpg','CAMP PLATE'],['joshua-tree-shovel.jpg','TRAIL SHOVEL']],
    [['palm-springs-shaker.jpg','DESERT COCKTAIL SHAKER'],['palm-springs-towel.jpg','OASIS TOWEL'],['palm-springs-pool-float.jpg','POOL FLOAT']]
  ];
  let gramicciObjectIndex = -1;
  const gramicciCoordinates = [
    '37.8651° N · 119.5383° W',
    '39.0968° N · 120.0324° W',
    '37.7749° N · 122.4194° W',
    '34.0522° N · 118.2437° W',
    '34.0119° N · 116.3190° W',
    '33.8303° N · 116.5453° W'
  ];
  const journeySection = $('#journey');
  const journeyIntro = $('#journeyIntro');
  const journeyStops = $$('.journey-stop', journeySection);
  const journeyButtons = $$('[data-journey-target]', journeySection);
  const journeyProgress = $('#journeyProgress');
  const journeyCount = $('#journeyCount');
  const journeyRanges = [
    [.10, .12, .245, .265],
    [.28, .30, .425, .445],
    [.46, .48, .605, .625],
    [.64, .66, .785, .805],
    [.82, .84, .975, .995]
  ];
  const acgExperience = $('#acgExperience');
  const acgFrame = $('#acgFrame');
  const acgCards = $$('#acgExperience [data-acg-layer]');
  const acgTemp = $('#acgTemp');
  const acgShelters = $('#acgShelters');
  const acgLayer = $('#acgLayer');
  const acgHeroTemp = $('#acgHeroTemp');
  const acgHeroWeather = $('#acgHeroWeather');
  const acgHeroMeta = $('#acgHeroMeta');
  const mercSection = $('#house-of-merc');
  const mercPack = $('#mercPack');
  const mercPackStatus = $('#mercPackStatus');
  const mercCards = $$('.merc-player-card', mercSection);
  const mercCampaignMaster = $('#mercCampaignMaster');
  const mercCampaignFrames = $$('.merc-campaign__frame', mercSection);
  const mercCounter = $('#mercCounter');
  const mercProgress = $('#mercProgress');
  const nav = $('#nav');
  const navHoverQuery = matchMedia('(hover: hover) and (pointer: fine)');
  const navIntroUntil = performance.now() + 5200;

  // HOUSE OF MERC waits for a deliberate horizontal tear before its story unlocks.
  let mercRipped = false;
  let mercDragging = false;
  let mercDragStartX = 0;
  let mercRipProgress = 0;
  let mercResetFrame = 0;
  let mercGateEngaged = false;
  let mercLastScrollY = scrollY;
  let mercGateCorrection = 0;
  let mercTouchY = 0;

  const mercGateProgress = .155;
  const getMercScrollBounds = () => {
    if (!mercSection) return null;
    const sectionTop = scrollY + mercSection.getBoundingClientRect().top;
    const scrollable = Math.max(1, mercSection.offsetHeight - innerHeight);
    return {
      sectionTop,
      gateY: sectionTop + scrollable * mercGateProgress,
      sectionEnd: sectionTop + scrollable
    };
  };

  const setMercGate = locked => {
    if (!mercSection) return;
    mercGateEngaged = locked && !mercRipped;
    mercSection.classList.toggle('is-scroll-locked', mercGateEngaged);
    if (mercGateEngaged) mercPackStatus.textContent = 'RIP REQUIRED / SCROLL LOCKED';
    else if (!mercRipped) mercPackStatus.textContent = 'FOIL SEALED / 5 CARDS INSIDE';
  };

  const holdAtMercGate = () => {
    const bounds = getMercScrollBounds();
    if (!bounds || mercRipped) return;
    setMercGate(true);
    cancelAnimationFrame(mercGateCorrection);
    mercGateCorrection = requestAnimationFrame(() => {
      window.scrollTo({ top: bounds.gateY, left: scrollX, behavior: 'auto' });
      mercLastScrollY = bounds.gateY;
      mercPack?.focus({ preventScroll: true });
    });
  };

  const shouldHoldMercGate = projectedY => {
    if (!mercSection || mercRipped) return false;
    const bounds = getMercScrollBounds();
    if (!bounds) return false;
    const approachingFromAbove = scrollY >= bounds.sectionTop - innerHeight * .12 && scrollY < bounds.sectionEnd;
    return approachingFromAbove && projectedY >= bounds.gateY;
  };

  const paintMercRip = progress => {
    mercRipProgress = clamp(progress);
    mercSection.style.setProperty('--merc-rip', mercRipProgress.toFixed(4));
    mercSection.style.setProperty('--merc-rip-width', `${mercRipProgress * 100}%`);
    mercSection.style.setProperty('--merc-rip-x', `${mercRipProgress * 42}px`);
    mercSection.style.setProperty('--merc-rip-y', `${mercRipProgress * -16}px`);
    mercSection.style.setProperty('--merc-rip-rot', `${mercRipProgress * 3}deg`);
  };

  const completeMercRip = () => {
    if (mercRipped) return;
    mercRipped = true;
    mercDragging = false;
    cancelAnimationFrame(mercResetFrame);
    paintMercRip(1);
    mercPack.classList.remove('is-dragging');
    mercPack.classList.add('is-ripped');
    mercPack.setAttribute('aria-pressed', 'true');
    setMercGate(false);
    mercPackStatus.textContent = 'FOIL OPEN / SCROLL UNLOCKED';
  };

  const resetMercRip = () => {
    cancelAnimationFrame(mercResetFrame);
    const tick = () => {
      paintMercRip(mercRipProgress + (0 - mercRipProgress) * .2);
      if (mercRipProgress > .006) mercResetFrame = requestAnimationFrame(tick);
      else paintMercRip(0);
    };
    mercResetFrame = requestAnimationFrame(tick);
  };

  const resetMercExperience = () => {
    if (!mercRipped) return;
    mercRipped = false;
    mercDragging = false;
    cancelAnimationFrame(mercResetFrame);
    mercPack.classList.remove('is-dragging', 'is-ripped');
    mercPack.setAttribute('aria-pressed', 'false');
    setMercGate(false);
    paintMercRip(0);
  };

  if (mercPack) {
    mercPack.addEventListener('pointerdown', event => {
      if (mercRipped) return;
      cancelAnimationFrame(mercResetFrame);
      mercDragging = true;
      mercDragStartX = event.clientX - mercRipProgress * Math.min(340, mercPack.offsetWidth * .72);
      mercPack.classList.add('is-dragging');
      mercPack.setPointerCapture?.(event.pointerId);
    });
    mercPack.addEventListener('pointermove', event => {
      if (!mercDragging || mercRipped) return;
      const distance = Math.min(340, mercPack.offsetWidth * .72);
      paintMercRip((event.clientX - mercDragStartX) / Math.max(1, distance));
      if (mercRipProgress >= .94) completeMercRip();
    });
    const releaseMercRip = event => {
      if (!mercDragging || mercRipped) return;
      mercDragging = false;
      mercPack.classList.remove('is-dragging');
      if (mercPack.hasPointerCapture?.(event.pointerId)) mercPack.releasePointerCapture(event.pointerId);
      if (mercRipProgress >= .72) completeMercRip();
      else resetMercRip();
    };
    mercPack.addEventListener('pointerup', releaseMercRip);
    mercPack.addEventListener('pointercancel', releaseMercRip);
    mercPack.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && !mercRipped) {
        event.preventDefault();
        completeMercRip();
      }
    });
  }

  // The reveal is an interaction, not an optional decoration: downward travel pauses
  // once the pack has completed its arrival, while upward travel always stays available.
  window.addEventListener('wheel', event => {
    if (event.deltaY <= 0 || !shouldHoldMercGate(scrollY + event.deltaY)) return;
    event.preventDefault();
    holdAtMercGate();
  }, { passive: false });

  window.addEventListener('touchstart', event => {
    mercTouchY = event.touches[0]?.clientY || 0;
  }, { passive: true });

  window.addEventListener('touchmove', event => {
    const nextTouchY = event.touches[0]?.clientY || mercTouchY;
    const downwardPageTravel = mercTouchY - nextTouchY;
    if (downwardPageTravel > 0 && shouldHoldMercGate(scrollY + downwardPageTravel)) {
      event.preventDefault();
      holdAtMercGate();
    }
    mercTouchY = nextTouchY;
  }, { passive: false });

  window.addEventListener('keydown', event => {
    const downKeys = ['ArrowDown', 'PageDown', 'End', ' '];
    const editable = event.target instanceof HTMLElement && event.target.matches('input, textarea, select, [contenteditable="true"]');
    if (editable || !downKeys.includes(event.key) || !shouldHoldMercGate(scrollY + innerHeight * .85)) return;
    event.preventDefault();
    holdAtMercGate();
  });

  window.addEventListener('scroll', () => {
    const currentY = scrollY;
    const bounds = getMercScrollBounds();
    if (!bounds || mercRipped) {
      mercLastScrollY = currentY;
      return;
    }
    const movingDown = currentY > mercLastScrollY + .5;
    const crossedGate = movingDown && mercLastScrollY >= bounds.sectionTop - innerHeight * .12 && mercLastScrollY < bounds.sectionEnd && currentY > bounds.gateY;
    if (crossedGate) {
      holdAtMercGate();
      return;
    }
    if (currentY < bounds.gateY - 10 && mercGateEngaged) setMercGate(false);
    mercLastScrollY = currentY;
  }, { passive: true });

  // Four personal images remain present while one randomly trades places.
  const aboutAnchors = [
    { x: 7, y: 10, r: -3 },
    { x: 39, y: 7, r: 2 },
    { x: 74, y: 9, r: 3 },
    { x: 80, y: 42, r: -2 },
    { x: 72, y: 66, r: 2 },
    { x: 45, y: 68, r: -3 },
    { x: 9, y: 65, r: 2 },
    { x: 7, y: 38, r: -2 }
  ];
  const aboutMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let aboutShuffleTimer = 0;
  let aboutShuffleActive = false;
  let aboutHiddenTile = null;

  const placeAboutTile = (tile, anchorIndex) => {
    const anchor = aboutAnchors[anchorIndex];
    const isWide = tile.classList.contains('about__tile--car');
    const isSquare = tile.classList.contains('about__tile--city');
    const maxX = isWide ? 72 : isSquare ? 80 : 84;
    tile.dataset.anchor = String(anchorIndex);
    tile.style.setProperty('--x', `${Math.min(anchor.x, maxX)}vw`);
    tile.style.setProperty('--y', `${anchor.y}vh`);
    tile.style.setProperty('--r', `${anchor.r + (Math.random() * 2.4 - 1.2)}deg`);
  };

  const shuffleAboutTiles = () => {
    const visibleTiles = aboutTiles.filter(tile => tile !== aboutHiddenTile);
    if (!visibleTiles.length || !aboutHiddenTile) return;
    const outgoing = visibleTiles[Math.floor(Math.random() * visibleTiles.length)];
    const occupied = new Set(visibleTiles.filter(tile => tile !== outgoing).map(tile => Number(tile.dataset.anchor)));
    const hiddenAnchor = Number(aboutHiddenTile.dataset.anchor);
    const outgoingAnchor = Number(outgoing.dataset.anchor);
    const candidates = aboutAnchors
      .map((_, index) => index)
      .filter(index => !occupied.has(index) && index !== hiddenAnchor && index !== outgoingAnchor);
    const nextAnchor = candidates[Math.floor(Math.random() * candidates.length)] ?? outgoingAnchor;
    const incoming = aboutHiddenTile;

    incoming.classList.add('is-relocating');
    placeAboutTile(incoming, nextAnchor);
    void incoming.offsetWidth;
    incoming.classList.remove('is-relocating');
    requestAnimationFrame(() => {
      incoming.classList.remove('is-hidden');
      incoming.classList.add('is-visible');
      outgoing.classList.remove('is-visible');
      outgoing.classList.add('is-hidden');
      aboutHiddenTile = outgoing;
    });
  };

  const configureAboutShuffle = () => {
    const shouldAnimate = innerWidth > 900 && !aboutMotionPreference.matches && aboutTiles.length === 5;
    if (shouldAnimate === aboutShuffleActive) return;
    aboutShuffleActive = shouldAnimate;
    clearInterval(aboutShuffleTimer);
    aboutShuffleTimer = 0;

    if (!shouldAnimate) {
      aboutHiddenTile = null;
      aboutTiles.forEach(tile => {
        tile.classList.remove('is-visible', 'is-hidden');
        tile.removeAttribute('data-anchor');
        tile.style.removeProperty('--x');
        tile.style.removeProperty('--y');
        tile.style.removeProperty('--r');
      });
      return;
    }

    const initialAnchors = [2, 0, 3, 6, 5];
    aboutTiles.forEach((tile, index) => {
      placeAboutTile(tile, initialAnchors[index]);
      tile.classList.toggle('is-visible', index !== aboutTiles.length - 1);
      tile.classList.toggle('is-hidden', index === aboutTiles.length - 1);
    });
    aboutHiddenTile = aboutTiles[aboutTiles.length - 1];
    aboutShuffleTimer = setInterval(shuffleAboutTiles, 4200);
  };

  configureAboutShuffle();
  if (aboutMotionPreference.addEventListener) aboutMotionPreference.addEventListener('change', configureAboutShuffle);

  window.addEventListener('message', event => {
    if (event.source !== acgFrame?.contentWindow || event.data?.type !== 'acg-weather') return;
    const temperature = String(event.data.temperature || '--°');
    const state = String(event.data.state || 'CURRENT CONDITIONS');
    const meta = String(event.data.meta || 'BARCELONA');
    acgTemp.textContent = temperature;
    acgHeroTemp.textContent = temperature;
    acgHeroWeather.textContent = state;
    acgHeroMeta.textContent = meta;
  });

  if (gramicciSection && gramicciStops.length) {
    gramicciStops.forEach((stop, index) => {
      stop.addEventListener('click', () => {
        const sectionTop = scrollY + gramicciSection.getBoundingClientRect().top;
        const scrollableDistance = Math.max(1, gramicciSection.offsetHeight - innerHeight);
        const stopProgress = (index + .18) / gramicciStops.length;
        window.scrollTo({ top: sectionTop + scrollableDistance * stopProgress, behavior: 'smooth' });
      });
    });
  }

  if (journeySection && journeyButtons.length) {
    journeyButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const sectionTop = scrollY + journeySection.getBoundingClientRect().top;
        const scrollableDistance = Math.max(1, journeySection.offsetHeight - innerHeight);
        const range = journeyRanges[index];
        const targetProgress = (range[1] + range[2]) / 2;
        window.scrollTo({ top: sectionTop + scrollableDistance * targetProgress, behavior: 'smooth' });
      });
    });
  }

  if (gramicciVisual) {
    let gramicciDragging = false;
    let gramicciPreviousX = 0;
    let gramicciPreviousY = 0;

    gramicciVisual.addEventListener('pointerdown', event => {
      if (event.target.closest('.gramicci-object-strip')) return;
      gramicciDragging = true;
      gramicciPreviousX = event.clientX;
      gramicciPreviousY = event.clientY;
      gramicciVisual.setPointerCapture?.(event.pointerId);
    });
    gramicciVisual.addEventListener('pointermove', event => {
      if (gramicciDragging) {
        gramicciFrame?.contentWindow?.postMessage({
          type: 'gramicci-drag',
          dx: event.clientX - gramicciPreviousX,
          dy: event.clientY - gramicciPreviousY
        }, '*');
        gramicciPreviousX = event.clientX;
        gramicciPreviousY = event.clientY;
        return;
      }
      const rect = gramicciVisual.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / Math.max(1, rect.width));
      const y = clamp((event.clientY - rect.top) / Math.max(1, rect.height));
      gramicciFrame?.contentWindow?.postMessage({ type: 'gramicci-pointer', x, y, active: true }, '*');
    });
    gramicciVisual.addEventListener('pointerleave', () => {
      gramicciFrame?.contentWindow?.postMessage({ type: 'gramicci-pointer', active: false }, '*');
    });
    const stopGramicciDrag = event => {
      gramicciDragging = false;
      gramicciFrame?.contentWindow?.postMessage({ type: 'gramicci-pointer', active: false }, '*');
      if (gramicciVisual.hasPointerCapture?.(event.pointerId)) gramicciVisual.releasePointerCapture(event.pointerId);
    };
    gramicciVisual.addEventListener('pointerup', stopGramicciDrag);
    gramicciVisual.addEventListener('pointercancel', stopGramicciDrag);
  }

  let lastScroll = scrollY;
  let scrollVelocity = 0;
  let smoothedScroll = scrollY;
  let smoothedCupraProgress = sectionProgress(cupraSection);
  let smoothedFffProgress = fffMovement ? sectionProgress(fffMovement) : 0;
  let smoothedLogoMouseX = 0;
  let smoothedLogoMouseY = 0;
  let previousFrameTime = performance.now();
  const sectionProgressMemory = new WeakMap();
  let rafId;

  function sectionProgress(section) {
    const rect = section.getBoundingClientRect();
    const distance = section.offsetHeight - innerHeight;
    return distance > 0 ? clamp(-rect.top / distance) : 0;
  }

  function easedSectionProgress(section, deltaSeconds, speed = 7) {
    const target = sectionProgress(section);
    const current = sectionProgressMemory.has(section) ? sectionProgressMemory.get(section) : target;
    const next = Math.abs(target - current) < .00005 ? target : damp(current, target, speed, deltaSeconds);
    sectionProgressMemory.set(section, next);
    return next;
  }

  function frame(now = performance.now()) {
    const deltaSeconds = clamp((now - previousFrameTime) / 1000, 0, .05);
    previousFrameTime = now;
    const sy = scrollY;
    smoothedScroll = damp(smoothedScroll, sy, 8, deltaSeconds);
    scrollVelocity = damp(scrollVelocity, sy - lastScroll, 8, deltaSeconds);
    lastScroll = sy;

    // The navigation behaves like a discreet reveal layer on pointer devices:
    // present at the opening, then visible only while the pointer occupies the top band.
    const indexIsOpen = document.body.classList.contains('index-open');
    const navHasFocus = nav.contains(document.activeElement);
    if (navHoverQuery.matches) {
      const atOpening = sy < 12;
      const inRevealBand = mouseY <= 88;
      const inIntroWindow = performance.now() < navIntroUntil;
      nav.classList.toggle('is-hidden', !(atOpening || inRevealBand || inIntroWindow || indexIsOpen || navHasFocus));
    } else {
      // Touch devices retain the familiar scroll-direction fallback because they cannot hover.
      nav.classList.toggle('is-hidden', sy > 160 && scrollVelocity > 2.4 && !indexIsOpen && !navHasFocus);
      if (scrollVelocity < -1.2 || sy < 12) nav.classList.remove('is-hidden');
    }

    // The projects remain discrete pieces of evidence, while these interstitial
    // thresholds make their relationship read as one continuous argument.
    narrativeThresholds.forEach(section => {
      const p = easedSectionProgress(section, deltaSeconds, 7);
      const enter = smooth(map(p, .02, .20));
      const exit = 1 - smooth(map(p, .80, .98));
      const opacity = enter * exit;
      const inverse = 1 - enter;
      section.style.setProperty('--threshold-p', p.toFixed(4));
      section.style.setProperty('--threshold-enter', enter.toFixed(4));
      section.style.setProperty('--threshold-exit', exit.toFixed(4));
      section.style.setProperty('--threshold-opacity', opacity.toFixed(4));
      section.style.setProperty('--threshold-soft-opacity', (opacity * .78).toFixed(4));
      section.style.setProperty('--threshold-light-x', `${18 + p * 30}%`);
      section.style.setProperty('--threshold-orbit-x', `${inverse * 18}vw`);
      section.style.setProperty('--threshold-orbit-y', `${inverse * 10}vh`);
      section.style.setProperty('--threshold-orbit-scale', String(.72 + enter * .28));
      section.style.setProperty('--threshold-act-y', `${inverse * 22}px`);
      section.style.setProperty('--threshold-copy-x', `${inverse * -8}vw`);
      section.style.setProperty('--threshold-copy-y', `${inverse * 6}vh`);
      section.style.setProperty('--threshold-copy-scale', String(.96 + enter * .04));
      section.style.setProperty('--threshold-body-y', `${inverse * 34}px`);
    });

    if (narrativeRail && narrativeStart && narrativeEnd) {
      let activeNarrative = 'signal';
      const activationLine = innerHeight * .52;
      narrativeChapters.forEach(section => {
        if (section.getBoundingClientRect().top <= activationLine) activeNarrative = section.dataset.journeyChapter;
      });
      const startY = narrativeStart.offsetTop;
      const endY = narrativeEnd.offsetTop + narrativeEnd.offsetHeight - innerHeight;
      const journeyProgress = clamp((sy - startY) / Math.max(1, endY - startY));
      narrativeRail.style.setProperty('--rail-progress', `${journeyProgress * 100}%`);
      narrativeRail.dataset.active = activeNarrative;
      narrativeRail.classList.toggle('is-visible', activeNarrative !== 'signal' && sy > innerHeight * 1.15 && !indexIsOpen);
      const fffRect = fffMovement?.getBoundingClientRect();
      const fffOwnsFrame = Boolean(fffRect && fffRect.top <= activationLine && fffRect.bottom > activationLine);
      narrativeRail.classList.toggle('is-section-suppressed', fffOwnsFrame);
      narrativePoints.forEach(point => point.classList.toggle('is-active', point.dataset.narrativePoint === activeNarrative));
      if (narrativeRailProgress) narrativeRailProgress.style.height = innerWidth > 900 ? `${journeyProgress * 100}%` : '100%';
    }

    // Opening parallax
    const heroP = clamp(smoothedScroll / Math.max(innerHeight, 1));
    heroTitle.style.transform = `translateY(calc(-48% + ${heroP * 12}vh)) scale(${1 - heroP * .055})`;
    heroTitle.style.opacity = String(1 - heroP * .72);
    heroFragments.forEach((el, i) => {
      const dir = i % 2 ? -1 : 1;
      el.style.translate = `${dir * heroP * (28 + i * 11)}px ${heroP * (24 + i * 7)}px`;
      el.style.opacity = String(.48 * (1 - heroP * .8));
    });

    // Horizontal FORM journey
    if (innerWidth > 900) {
      const p = easedSectionProgress(formSection, deltaSeconds, 8);
      const rootPadding = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-x')) || 40;
      const trackPadding = parseFloat(getComputedStyle(formTrack).paddingRight) || rootPadding * 3;
      const maxX = Math.max(0, formTrack.scrollWidth - innerWidth + rootPadding + trackPadding * .3);
      formTrack.style.transform = `translate3d(${-p * maxX}px,0,0)`;
      formProgress.style.width = `${p * 100}%`;
    }

    // HOUSE OF MERC: the pack arrives automatically; the reveal remains locked to the manual tear.
    if (mercSection) {
      const mp = easedSectionProgress(mercSection, deltaSeconds, 6.5);
      if (mercRipped && mp < .018) resetMercExperience();
      const end = mercRipped ? smooth(map(mp, .965, .99)) : 0;
      const cardWindow = mercRipped ? holdFade(mp, .17, .20, .58, .615) : 0;
      const masterWindow = mercRipped ? holdFade(mp, .885, .91, .965, .995) : 0;
      const campaignWindow = mercRipped ? holdFade(mp, .615, .64, .875, .895) : 0;
      const viewportShift = innerWidth <= 600 ? -innerWidth * .12 : innerWidth <= 900 ? -innerWidth * .23 : -innerWidth * .32;
      const campaignScale = lerp(1, .96, smooth(map(mp, .17, .22)));
      const packPointerX = (mouseX / innerWidth - .5) * 7;
      const packPointerY = (mouseY / innerHeight - .5) * -6;
      let packShift = viewportShift;
      let packY = 0;
      let packZ = 0;
      let packScale = campaignScale;
      let packRotateX = mercRipped ? 0 : packPointerY;
      let packRotateY = mercRipped ? 360 : 360 + packPointerX;
      let packRotateZ = -3;

      // A four-beat arrival: launch, orbit, overshoot and weighted settle.
      if (mp < .045) {
        const beat = smooth(map(mp, 0, .045));
        packShift = lerp(innerWidth * .62, innerWidth * .16, beat);
        packY = lerp(innerHeight * .24, innerHeight * -.14, beat);
        packZ = lerp(-520, 100, beat);
        packScale = lerp(.26, .84, beat);
        packRotateX = lerp(28, -13, beat);
        packRotateY = lerp(-70, 150, beat);
        packRotateZ = lerp(-24, 14, beat);
      } else if (mp < .095) {
        const beat = smooth(map(mp, .045, .095));
        packShift = lerp(innerWidth * .16, innerWidth * -.13, beat);
        packY = lerp(innerHeight * -.14, innerHeight * .07, beat);
        packZ = lerp(100, 155, beat);
        packScale = lerp(.84, 1.12, beat);
        packRotateX = lerp(-13, 9, beat);
        packRotateY = lerp(150, 315, beat);
        packRotateZ = lerp(14, -9, beat);
      } else if (mp < .15) {
        const beat = smooth(map(mp, .095, .15));
        packShift = lerp(innerWidth * -.13, viewportShift, beat);
        packY = lerp(innerHeight * .07, 0, beat);
        packZ = lerp(155, 0, beat);
        packScale = lerp(1.12, 1, beat);
        packRotateX = lerp(9, packPointerY, beat);
        packRotateY = lerp(315, 360 + packPointerX, beat);
        packRotateZ = lerp(-9, -3, beat);
      }

      mercSection.style.setProperty('--merc-intro-opacity', String((1 - smooth(map(mp, .04, .145))) * (1 - end)));
      mercSection.style.setProperty('--merc-pack-opacity', String((mercRipped ? 1 - smooth(map(mp, .175, .225)) : 1) * (1 - end)));
      mercSection.style.setProperty('--merc-card-opacity', String(cardWindow * (1 - end)));
      mercSection.style.setProperty('--merc-master-opacity', String(masterWindow));
      mercSection.style.setProperty('--merc-campaign-opacity', String(campaignWindow * (1 - end)));
      mercSection.style.setProperty('--merc-end-opacity', String(end));
      mercSection.style.setProperty('--merc-enter-energy', String(smooth(map(mp, 0, .025)) * (1 - smooth(map(mp, .12, .165)))));
      mercPack.style.transform = `translate3d(calc(-50% + ${packShift}px),calc(-50% + ${packY}px),${packZ}px) rotateX(${packRotateX}deg) rotateY(${packRotateY}deg) rotateZ(${packRotateZ}deg) scale(${packScale})`;
      mercProgress.style.width = `${mp * 100}%`;

      const cardFan = smooth(map(mp, .47, .555));
      const cardFade = 1 - smooth(map(mp, .58, .615));
      let revealedCards = 0;
      mercCards.forEach((card, index) => {
        const revealStart = .18 + index * .075;
        const reveal = mercRipped ? smooth(map(mp, revealStart, revealStart + .065)) : 0;
        const x = (index - 1.5) * (innerWidth <= 600 ? 6.5 : 7.5) * cardFan;
        const y = Math.abs(index - 1.5) * 1.1 * cardFan;
        const rotation = (index - 1.5) * 5.5 * cardFan;
        const scale = lerp(.72, innerWidth <= 600 ? .82 : .9, reveal);
        const tiltX = (mouseY / innerHeight - .5) * -7 + (1 - reveal) * 26;
        const tiltY = (mouseX / innerWidth - .5) * 10 + (index - 1.5) * 2.8 * cardFan;
        const depth = index * 9 + reveal * 22;
        card.style.opacity = String(reveal * cardFade);
        card.style.transform = `translate3d(calc(-50% + ${x}vw),calc(-50% + ${lerp(26,y,reveal)}vh),${depth}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${rotation}deg) scale(${scale})`;
        card.style.zIndex = String(20 + index);
        if (reveal > .55) revealedCards = index + 1;
      });

      if (mercCampaignMaster) {
        const masterLocal = smooth(map(mp, .885, .91));
        mercCampaignMaster.style.opacity = String(masterWindow);
        mercCampaignMaster.style.transform = `translate3d(-50%,-50%,0) scale(${lerp(1.1,1,masterLocal)})`;
      }

      let activeCampaign = -1;
      const campaignRanges = [
        [.62, .64, .675, .69],
        [.69, .71, .745, .76],
        [.76, .78, .815, .83],
        [.83, .85, .875, .89]
      ];
      mercCampaignFrames.forEach((frame, index) => {
        const range = campaignRanges[index] || campaignRanges[campaignRanges.length - 1];
        const opacity = mercRipped ? holdFade(mp, ...range) : 0;
        const local = smooth(map(mp, range[0], range[3]));
        const holoTiltX = (mouseY / innerHeight - .5) * -4;
        const holoTiltY = (mouseX / innerWidth - .5) * 6;
        frame.style.opacity = String(opacity);
        frame.style.setProperty('--holo-progress', local.toFixed(4));
        frame.style.transform = `translate3d(${lerp(13,-4,local)}vw,-50%,${lerp(-100,30,local)}px) rotateX(${holoTiltX}deg) rotateY(${holoTiltY}deg) rotateZ(${lerp(1.5,-.8,local)}deg) scale(${lerp(.94,1.015,local)})`;
        if (opacity > .45) activeCampaign = index + 1;
      });

      if (!mercRipped) mercCounter.textContent = '00';
      else if (activeCampaign >= 1) mercCounter.textContent = String(activeCampaign + 1).padStart(2, '0');
      else if (masterWindow > .45) mercCounter.textContent = '05';
      else mercCounter.textContent = String(Math.max(1, revealedCards)).padStart(2, '0');
    }

    // CUPRA chapter choreography
    const targetCupraProgress = sectionProgress(cupraSection);
    smoothedCupraProgress = damp(smoothedCupraProgress, targetCupraProgress, 5.5, deltaSeconds);
    if (Math.abs(targetCupraProgress - smoothedCupraProgress) < .00008) smoothedCupraProgress = targetCupraProgress;
    smoothedLogoMouseX = damp(smoothedLogoMouseX, logoMouseX, 6, deltaSeconds);
    smoothedLogoMouseY = damp(smoothedLogoMouseY, logoMouseY, 6, deltaSeconds);
    const cp = smoothedCupraProgress;
    const logoOpacity = holdFade(cp, -.01, 0, .49, .525);
    cupraLogoScene.style.opacity = logoOpacity;
    cupraLogoScene.style.transform = `scale(${lerp(.94, 1.03, smooth(map(cp, 0, .15)))})`;

    // Establish the original monumental CUPRA artifact before the crossover begins.
    const intertwine = smooth(map(cp, .15, .355));
    const collapse = smooth(map(cp, .355, .455));
    const orbitRadius = Math.sin(intertwine * Math.PI) * Math.min(innerWidth * .3, 470);
    const orbitPhase = lerp(-.35, 10.9, intertwine) + collapse * Math.PI * 2.15;
    const cupraX = Math.cos(orbitPhase) * orbitRadius;
    const cupraY = Math.sin(orbitPhase) * orbitRadius * .43;
    const fortniteX = Math.cos(orbitPhase + Math.PI) * orbitRadius;
    const fortniteY = Math.sin(orbitPhase + Math.PI) * orbitRadius * .43;
    const depth = Math.sin(orbitPhase) * 150 * (1 - collapse);
    const rotY = lerp(0, 325, intertwine) + collapse * 690 + smoothedLogoMouseX * (1 - collapse);
    const rotX = lerp(4, -8, intertwine) + collapse * 76 - smoothedLogoMouseY * (1 - collapse);
    const cupraScale = lerp(lerp(1.18, .92, intertwine), .025, collapse);
    const fortniteScale = lerp(lerp(.62, 1, intertwine), .025, collapse);
    cupraLogo.style.transform = `translate3d(${cupraX * (1 - collapse)}px,${cupraY * (1 - collapse)}px,${depth}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${intertwine * 196 + collapse * 315}deg) scale(${cupraScale})`;
    fortniteLogoScene.style.transform = `translate3d(${fortniteX * (1 - collapse)}px,${fortniteY * (1 - collapse)}px,${-depth}px) rotateX(${-rotX * .55 - collapse * 48}deg) rotateY(${-rotY * .88}deg) rotateZ(${-orbitPhase * 15 - collapse * 270}deg) scale(${fortniteScale})`;
    const pairOpacity = 1 - smooth(map(cp, .432, .458));
    cupraLogo.style.opacity = pairOpacity;
    fortniteLogoScene.style.opacity = smooth(map(cp, .11, .16)) * pairOpacity;
    cupraLogoCopy.style.opacity = holdFade(cp, .13, .17, .31, .35);
    const orbitOpacity = 1 - smooth(map(cp, .355, .435));
    cupraOrbits.forEach(orbit => { orbit.style.opacity = orbitOpacity; });
    cupraVortex.style.opacity = holdFade(cp, .15, .18, .415, .465);
    cupraVortex.style.transform = `translate(-50%,-50%) rotate(${orbitPhase * 36}deg) scale(${lerp(.62, 1.45, intertwine) * lerp(1, .12, collapse)})`;

    // Both identities now finish their rotation while contracting into the crossover
    // mark. The isolated cross is deliberately held before the campaign reveal.
    const crossArrival = smooth(map(cp, .405, .457));
    const crossPulse = 1 + Math.sin(smooth(map(cp, .445, .49)) * Math.PI) * .1;
    cupraCrossoverFlare.style.opacity = holdFade(cp, .405, .445, .49, .525);
    cupraCrossoverFlare.style.transform = `translate(-50%,-50%) scale(${lerp(.06, 1, crossArrival) * crossPulse}) rotate(${lerp(-70, 0, crossArrival)}deg)`;

    const slidesOpacity = holdFade(cp, .495, .515, .895, .91);
    cupraSlides.style.opacity = slidesOpacity;
    const slideRanges = [
      [.505, .525, .625, .64],
      [.64, .655, .755, .77],
      [.77, .785, .88, .895]
    ];
    let activeIndex = 0;
    cupraSlideEls.forEach((slide, i) => {
      const op = holdFade(cp, ...slideRanges[i]);
      slide.style.opacity = op;
      slide.style.pointerEvents = op > .55 ? 'auto' : 'none';
      const img = $('img', slide);
      img.style.transform = 'none';
      if (op > .5) activeIndex = i;
    });
    cupraCounter.textContent = cp < .505 ? '00' : String(activeIndex + 1).padStart(2, '0');
    const endOpacity = smooth(map(cp, .91, .95));
    cupraEndcopy.style.opacity = endOpacity;
    cupraEndcopy.style.pointerEvents = endOpacity > .7 ? 'auto' : 'none';

    // Movement threshold: the story leaves the frame and becomes physical energy.
    if (movementIntro) {
      const mip = easedSectionProgress(movementIntro, deltaSeconds, 7);
      const movementEase = smooth(map(mip, .04, .88));
      movementIntro.style.setProperty('--movement-p', movementEase.toFixed(4));
      movementIntro.style.setProperty('--movement-light-x', `${lerp(18,72,movementEase)}%`);
      movementIntro.style.setProperty('--movement-copy-x', `${lerp(-6,0,movementEase)}vw`);
      movementIntro.style.setProperty('--movement-number-x', `${lerp(14,-2,movementEase)}vw`);
      movementIntro.style.setProperty('--movement-ball-x', `${lerp(48,78,movementEase)}%`);
    }

    // FFF × Jacquemus: a dimensional football and sculptural federation crest
    // orbit one another before resolving into three paired ultra-blue tableaux.
    if (fffMovement) {
      const targetFffProgress = sectionProgress(fffMovement);
      smoothedFffProgress = damp(smoothedFffProgress, targetFffProgress, 6.2, deltaSeconds);
      if (Math.abs(targetFffProgress - smoothedFffProgress) < .00008) smoothedFffProgress = targetFffProgress;
      const fp = smoothedFffProgress;
      const fffPointerX = smoothedLogoMouseX * .62;
      const fffPointerY = smoothedLogoMouseY * .58;

      const orbOpacity = holdFade(fp, -.01, 0, .275, .315);
      const orbArrival = smooth(map(fp, .01, .105));
      const orbResolve = smooth(map(fp, .205, .29));
      const pairMotion = smooth(map(fp, .035, .255));
      const pairExit = smooth(map(fp, .255, .305));
      const pairOpacity = orbArrival * (1 - smooth(map(fp,.275,.305)));
      const orbSpin = lerp(-28, 286, pairMotion);
      const pairAngle = lerp(-.65, 1.18, pairMotion) * Math.PI;
      const sharedOrbitX = Math.sin(pairAngle) * 1.15;
      const sharedOrbitY = Math.cos(pairAngle) * .8;
      const convergence = Math.sin(pairMotion * Math.PI) * 4.25;
      const pairSpread = lerp(20.5, 17.5, pairMotion);
      const ballOrbitX = sharedOrbitX - pairSpread * .5 + convergence;
      const crestOrbitX = sharedOrbitX + pairSpread * .5 - convergence;
      const ballOrbitY = sharedOrbitY + Math.sin(pairMotion * Math.PI * 2) * .7;
      const crestOrbitY = sharedOrbitY - Math.sin(pairMotion * Math.PI * 2) * .7;
      const depthExchange = Math.sin(pairMotion * Math.PI * 2) * 42;
      const pairScaleOut = lerp(1, .24, pairExit);
      fffOrbScene.style.opacity = String(orbOpacity);
      fffOrbScene.style.transform = `scale(${lerp(.95,1.025,orbArrival)})`;
      fffBall.style.opacity = String(pairOpacity);
      fffBall.style.transform = `translate3d(calc(-50% + ${ballOrbitX}vw),calc(-50% + ${ballOrbitY}vh),${lerp(-190,72,orbArrival) + depthExchange}px) rotateZ(${lerp(-7,5,pairMotion)}deg) scale(${lerp(.66,1,orbArrival) * pairScaleOut})`;
      const footballRx = (lerp(-18,34,smooth(map(fp,.01,.29))) - fffPointerY) * Math.PI / 180;
      const footballRy = (orbSpin + fffPointerX) * Math.PI / 180;
      fffFootballRenderer(footballRx,footballRy,lerp(-9,16,orbResolve)*Math.PI/180);
      if (fffBallObject) {
        fffBallObject.style.transform = `rotateX(${lerp(-9,11,pairMotion) - fffPointerY*.22}deg) rotateY(${lerp(-14,22,pairMotion) + fffPointerX*.26}deg) rotateZ(${lerp(-5,4,pairMotion)}deg)`;
      }
      if (fffCrest) {
        fffCrest.style.opacity = String(pairOpacity);
        fffCrest.style.transform = `translate3d(calc(-50% + ${crestOrbitX}vw),calc(-50% + ${crestOrbitY}vh),${lerp(-205,64,orbArrival) - depthExchange}px) rotateX(${lerp(-18,7,pairMotion) - fffPointerY*.28}deg) rotateY(${lerp(27,-9,pairMotion) + fffPointerX*.34}deg) rotateZ(${lerp(9,-4,pairMotion)}deg) scale(${lerp(.65,1,orbArrival) * pairScaleOut})`;
      }
      fffOrbCopy.style.opacity = String(holdFade(fp,.06,.09,.205,.245));
      fffOrbCopy.style.transform = `translate3d(${lerp(-4,0,smooth(map(fp,.04,.11)))}vw,${lerp(20,-14,smooth(map(fp,.08,.25)))}px,0)`;
      fffOrbits.forEach((orbit,index) => {
        orbit.style.opacity = String((1 - orbResolve) * (.84 - index * .14));
        orbit.style.filter = `blur(${orbResolve * (index + 1) * 1.1}px)`;
      });
      fffOrbFlare.style.opacity = String(holdFade(fp,.265,.285,.307,.327));
      fffOrbFlare.style.transform = `translate(-50%,-50%) scale(${lerp(.08,5.8,smooth(map(fp,.267,.323)))})`;

      const fffSlidesOpacity = holdFade(fp,.305,.325,.90,.925);
      fffSlides.style.opacity = String(fffSlidesOpacity);
      const fffSlideRanges = [
        [.31,.325,.485,.50],
        [.50,.515,.68,.695],
        [.695,.71,.90,.915]
      ];
      let activeFffIndex = -1;
      fffSlideEls.forEach((slide,index) => {
        const range = fffSlideRanges[index];
        const opacity = holdFade(fp,...range);
        const local = smooth(map(fp,range[0],range[3]));
        slide.style.opacity = String(opacity);
        slide.style.pointerEvents = opacity > .56 ? 'auto' : 'none';
        $$('img',slide).forEach((image,imageIndex) => {
          const direction = imageIndex ? -1 : 1;
          image.style.transform = `scale(${lerp(1.018,1,local)}) translate3d(${lerp(direction*.7,direction*-.35,local)}%,0,0)`;
        });
        if (opacity > .48) activeFffIndex = index;
      });
      fffCounter.textContent = activeFffIndex < 0 ? '00' : String(activeFffIndex + 1).padStart(2,'0');
      const fffEndOpacity = smooth(map(fp,.915,.955));
      fffEndcopy.style.opacity = String(fffEndOpacity);
      fffEndcopy.style.pointerEvents = fffEndOpacity > .72 ? 'auto' : 'none';
    }

    // Gramicci unfolds as a location-based world rather than a linked card.
    if (gramicciSection) {
      const gp = easedSectionProgress(gramicciSection, deltaSeconds, 7);
      gramicciSection.style.setProperty('--gram-p', gp.toFixed(4));
      gramicciSection.style.setProperty('--gram-assets', smooth(map(gp, .08, .16)).toFixed(4));
      const stopIndex = Math.min(gramicciStops.length - 1, Math.floor(map(gp, .03, .97) * gramicciStops.length));
      gramicciStops.forEach((stop, i) => stop.classList.toggle('is-active', i === stopIndex));
      gramicciStop.textContent = `STOP ${String(stopIndex + 1).padStart(2, '0')} / 06`;
      gramicciCoordinate.textContent = gramicciCoordinates[stopIndex];
      gramicciFrame?.contentWindow?.postMessage({ type: 'gramicci-location', index: stopIndex }, '*');
      if (stopIndex !== gramicciObjectIndex) {
        gramicciObjectIndex = stopIndex;
        gramicciObjectStrip.classList.add('is-changing');
        window.setTimeout(() => {
          gramicciObjectSets[stopIndex].forEach(([file, label], itemIndex) => {
            const image = gramicciObjectImages[itemIndex];
            image.src = `experiences/gramicci/assets/${file}`;
            image.alt = label;
            gramicciObjectCaptions[itemIndex].textContent = label;
          });
          gramicciObjectStrip.classList.remove('is-changing');
        }, 150);
      }
    }

    // Designing the Journey extends Gramicci into five distinct campaign destinations.
    if (journeySection) {
      const jp = easedSectionProgress(journeySection, deltaSeconds, 7);
      const introOpacity = holdFade(jp, 0, .02, .10, .125);
      journeyIntro.style.opacity = introOpacity;
      journeyIntro.style.transform = `translate3d(0,${lerp(0,-38,smooth(map(jp,.03,.15)))}px,0) scale(${lerp(1,.97,smooth(map(jp,.03,.15)))})`;

      let activeJourney = -1;
      if (jp >= .095) {
        activeJourney = 0;
        journeyRanges.forEach((range, index) => {
          if (jp >= range[0]) activeJourney = index;
        });
      }
      journeyStops.forEach((stop, index) => {
        const range = journeyRanges[index];
        const opacity = holdFade(jp, ...range);
        const arrival = smooth(map(jp, range[0], range[1]));
        const departure = smooth(map(jp, range[2], range[3]));
        stop.style.opacity = opacity;
        stop.style.pointerEvents = opacity > .58 ? 'auto' : 'none';
        stop.style.transform = `translate3d(${lerp(7,0,arrival) + lerp(0,-5,departure)}vw,${lerp(24,0,arrival) + lerp(0,-18,departure)}px,0) scale(${lerp(.97,1,arrival) + lerp(0,.015,departure)})`;
        $$('.journey-frame', stop).forEach((frame, frameIndex) => {
          const direction = frameIndex % 2 ? -1 : 1;
          const frameOffset = lerp(18,0,arrival) + lerp(0,-10,departure);
          frame.style.transform = `translate3d(0,${direction * frameOffset}px,0)`;
        });
        if (opacity > .45) activeJourney = index;
      });

      const visibleJourney = Math.max(0, activeJourney);
      journeySection.dataset.active = String(visibleJourney);
      journeyButtons.forEach((button, index) => button.classList.toggle('is-active', index === activeJourney));
      journeyProgress.style.width = `${smooth(map(jp,.10,.995)) * 100}%`;
      journeyCount.textContent = activeJourney < 0 ? '00' : String(activeJourney + 1).padStart(2,'0');
    }

    // Metacognitive Design reveals the invisible lens between signal and perception.
    if (metaThinking) {
      const mtp = easedSectionProgress(metaThinking, deltaSeconds, 6.5);
      const manifestoPhase = holdFade(mtp, .02, .08, .25, .31);
      const diagramPhase = holdFade(mtp, .34, .40, .61, .67);
      const messagePhase = smooth(map(mtp, .72, .79));
      const pointerX = (mouseX / innerWidth - .5) * 18;
      const pointerY = (mouseY / innerHeight - .5) * 13;
      metaThinking.style.setProperty('--meta-manifesto', String(manifestoPhase));
      metaThinking.style.setProperty('--meta-diagram', String(diagramPhase));
      metaThinking.style.setProperty('--meta-message', String(messagePhase));
      metaThinking.style.setProperty('--meta-mx', `${pointerX}px`);
      metaThinking.style.setProperty('--meta-my', `${pointerY}px`);
      if (metaFlowValue) metaFlowValue.textContent = lerp(.01, .95, smooth(map(mtp, .32, .69))).toFixed(2);
    }

    // ACG moves from live urban information to product and asset layers.
    if (acgExperience) {
      const ap = easedSectionProgress(acgExperience, deltaSeconds, 7);
      acgExperience.style.setProperty('--acg-p', smooth(map(ap, 0, .5)).toFixed(4));
      acgExperience.style.setProperty('--acg-media', smooth(map(ap, .53, .60)).toFixed(4));
      const acgCardRanges = [
        [.62, .65, .72, .75],
        [.76, .79, .86, .89],
        [.90, .93, .985, 1]
      ];
      let activeCard = -1;
      acgCards.forEach((card, i) => {
        const range = acgCardRanges[i];
        const visibility = holdFade(ap, ...range);
        const arrival = smooth(map(ap, range[0], range[1]));
        card.classList.remove('is-active');
        card.style.opacity = String(visibility);
        card.style.transform = `translate3d(${lerp(7,0,arrival)}%,${lerp(18,0,arrival)}px,0) scale(${lerp(.97,1,arrival)})`;
        if (visibility > .5) activeCard = i;
      });
      acgFrame.style.pointerEvents = ap < .53 ? 'auto' : 'none';
      const shelterCount = Math.round(570 * smooth(map(ap, .02, .3)));
      acgShelters.textContent = String(shelterCount).padStart(3, '0');
      acgLayer.textContent = activeCard < 0 ? 'MAP' : acgCards[activeCard].dataset.acgLayer;
    }

    // Systems sequence
    const sp = easedSectionProgress(systemsSection, deltaSeconds, 7);
    const statementP = 1 - smooth(map(sp, .22, .30));
    systemsStatement.style.opacity = String(statementP);
    systemsStatement.style.transform = `translateY(${-map(sp,.0,.30,0,80)}px)`;
    systemsAlt.style.opacity = String(holdFade(sp, .10, .15, .22, .30));
    const engineP = holdFade(sp, .34, .42, .74, .82);
    const engineArrival = smooth(map(sp, .34, .42));
    systemEngine.style.opacity = engineP;
    systemEngine.style.transform = `scale(${lerp(.82,1,engineArrival)})`;
    const footP = smooth(map(sp, .84, .90));
    systemsFoot.style.opacity = footP;
    systemsFoot.style.transform = `translateY(${lerp(22,0,footP)}px)`;

    rafId = requestAnimationFrame(frame);
  }
  frame();

  // Keep calculations accurate after image/font loading and resize
  window.addEventListener('resize', () => {
    fitHeroLines();
    if (innerWidth <= 900) formTrack.style.transform = '';
    configureAboutShuffle();
  });

  // System nodes have lightweight feedback
  $$('.system-node').forEach((node, i) => {
    node.addEventListener('mouseenter', () => {
      node.style.boxShadow = `0 0 45px ${i % 2 ? 'rgba(89,226,255,.18)' : 'rgba(119,85,255,.25)'}`;
    });
    node.addEventListener('mouseleave', () => { node.style.boxShadow = ''; });
  });

  // Keyboard conveniences
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && indexPanel.classList.contains('is-open')) setIndex(false);
    if (e.key === 'Escape' && gameModal.open) closeGame();
  });
})();
