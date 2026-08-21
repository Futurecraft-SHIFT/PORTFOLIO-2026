(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  body.classList.add('locked');
  addEventListener('load', () => setTimeout(() => {
    document.querySelector('.boot').classList.add('done');
    body.classList.remove('locked');
  }, reduced ? 0 : 900));

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  menuButton.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('span').textContent = open ? '×' : '+';
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); menuButton.querySelector('span').textContent = '+';
  }));

  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting)), {threshold:.18});
  reveals.forEach(el => revealObserver.observe(el));

  const sections = [...document.querySelectorAll('.snap-section')];
  const rail = document.querySelector('.chapter-rail');
  sections.forEach((section, i) => {
    const dot = document.createElement('a'); dot.href = `#${section.id}`; dot.setAttribute('aria-label', section.dataset.label || `Section ${i+1}`); rail.append(dot);
  });
  const dots = [...rail.children];
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(e => {
    if(e.isIntersecting) dots[sections.indexOf(e.target)]?.classList.add('active');
    else dots[sections.indexOf(e.target)]?.classList.remove('active');
  }), {threshold:.55});
  sections.forEach(s => sectionObserver.observe(s));

  if(!reduced && matchMedia('(pointer:fine)').matches) document.querySelectorAll('.tilt-card').forEach(card => {
    const base = Number(card.dataset.tilt || 0);
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5; const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform = `rotate(${base*.35}deg) perspective(1200px) rotateY(${x*10}deg) rotateX(${-y*9}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });

  const weather = {
    tracker:document.querySelector('#weather-tracker'), temp:document.querySelector('#live-temp'),
    state:document.querySelector('#weather-state'), meta:document.querySelector('#weather-meta')
  };
  const weatherCodes = code => code===0?'CLEAR SKY':code<=3?'PARTLY CLOUDY':code<=48?'MIST / FOG':code<=57?'DRIZZLE':code<=67?'RAIN':code<=77?'SNOW':code<=82?'RAIN SHOWERS':code<=86?'SNOW SHOWERS':code<=99?'THUNDERSTORM':'CURRENT CONDITIONS';
  async function updateWeather() {
    try {
      const response=await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.3851&longitude=2.1734&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m&timezone=Europe%2FMadrid',{cache:'no-store'});
      if(!response.ok) throw new Error('Weather service unavailable');
      const data=await response.json(), current=data.current;
      weather.temp.textContent=`${Math.round(current.temperature_2m)}°`;
      weather.state.textContent=weatherCodes(current.weather_code);
      weather.meta.textContent=`FEELS ${Math.round(current.apparent_temperature)}° · ${current.relative_humidity_2m}% RH · ${Math.round(current.wind_speed_10m)} KM/H`;
      weather.tracker.classList.add('live');
      parent.postMessage({type:'acg-weather',temperature:`${Math.round(current.temperature_2m)}°`,state:weatherCodes(current.weather_code),meta:`FEELS ${Math.round(current.apparent_temperature)}° · ${current.relative_humidity_2m}% RH · ${Math.round(current.wind_speed_10m)} KM/H`},'*');
    } catch(error) {
      weather.temp.textContent='--°'; weather.state.textContent='WEATHER OFFLINE'; weather.meta.textContent='RETRYING · BARCELONA'; weather.tracker.classList.remove('live');
      parent.postMessage({type:'acg-weather',temperature:'--°',state:'WEATHER OFFLINE',meta:'RETRYING · BARCELONA'},'*');
    }
  }
  updateWeather(); setInterval(updateWeather,600000);

  const shelters = Array.isArray(window.SHELTERS) ? window.SHELTERS : [];
  const canvas = document.querySelector('#city-map');
  const ctx = canvas.getContext('2d');
  const viewport = canvas.parentElement;
  const category = document.querySelector('#shelter-category');
  const search = document.querySelector('#shelter-search');
  const countEl = document.querySelector('#visible-count');
  const toast = document.querySelector('#map-toast');
  const compass = document.querySelector('.map-compass');
  const card = {
    number:document.querySelector('#shelter-number'), kind:document.querySelector('#shelter-kind'), name:document.querySelector('#shelter-name'),
    address:document.querySelector('#shelter-address'), link:document.querySelector('#shelter-link')
  };

  const cats = [...new Set(shelters.map(s => s.category))].sort((a,b)=>a.localeCompare(b));
  cats.forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; category.append(o); });

  function hash(str) { let h=2166136261; for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)} return h>>>0; }
  const districtHubs = [
    [-.56,.50],[-.18,.22],[.12,.38],[.44,.25],[.65,-.02],[.43,-.35],[.05,-.44],[-.33,-.37],[-.64,-.15],[-.78,.18]
  ];
  shelters.forEach((s,i) => {
    const h=hash(s.id+s.address), hub=districtHubs[h%districtHubs.length];
    const a=((h>>>8)%6283)/1000, r=.08+((h>>>18)%100)/100*0.23;
    s.x=hub[0]+Math.cos(a)*r; s.y=hub[1]+Math.sin(a)*r; s.h=7+(h%22); s.index=i;
  });

  let filtered=shelters, selected=null, hover=null, yaw=-.16, pitch=.48, zoom=1, dragging=false, last={x:0,y:0}, dragStart={x:0,y:0}, points=[];
  function project(x,y,z=0) {
    const c=Math.cos(yaw),s=Math.sin(yaw),rx=x*c-y*s,ry=x*s+y*c;
    const scale=Math.min(canvas.width,canvas.height)*.56*zoom;
    return {x:canvas.width*.49+rx*scale,y:canvas.height*.54+ry*scale*Math.sin(pitch)-z*devicePixelRatio*zoom};
  }
  function line(a,b,color='rgba(127,216,220,.11)',width=1) { ctx.strokeStyle=color;ctx.lineWidth=width*devicePixelRatio;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke(); }
  const landmarks = [
    {name:'TIBIDABO',type:'mountain',x:-.48,y:-.49,h:58,dx:-62,dy:-10},
    {name:'HOSPITAL SANT PAU',type:'dome',x:-.06,y:-.27,h:30,dx:-112,dy:-18},
    {name:'SAGRADA FAMÍLIA',type:'spires',x:.16,y:-.10,h:62,dx:-38,dy:-26},
    {name:'TORRE GLÒRIES / AGBAR',type:'tower',x:.46,y:.02,h:55,dx:18,dy:-24},
    {name:'PARC DEL FÒRUM',type:'forum',x:.72,y:.12,h:22,dx:20,dy:-7},
    {name:'MONTJUÏC',type:'castle',x:-.66,y:.27,h:42,dx:-76,dy:-15},
    {name:'PORT VELL / HARBOR',type:'harbor',x:-.20,y:.54,h:20,dx:-88,dy:30},
    {name:'MAREMAGNUM',type:'maremagnum',x:.18,y:.51,h:23,dx:-18,dy:28},
    {name:'BARCELONETA BEACH',type:'beach',x:.57,y:.48,h:4,dx:-8,dy:26}
  ];
  function landmarkLabel(item,point,dpr) {
    const compact=canvas.width/dpr<650, label=compact?item.name.replace('HOSPITAL ','').replace('BARCELONETA ','').replace(' / HARBOR',''):item.name;
    const x=point.x+item.dx*dpr, y=point.y+item.dy*dpr;
    ctx.font=`900 ${compact?7:8.5}pt Arial`; const width=ctx.measureText(label).width;
    ctx.fillStyle='rgba(7,12,10,.9)';ctx.fillRect(x-5*dpr,y-12*dpr,width+10*dpr,18*dpr);
    ctx.fillStyle='#f04b16';ctx.fillText(label,x,y);line({x:point.x,y:point.y},{x:x,y:y-4*dpr},'rgba(240,75,22,.65)',.8);
  }
  function drawLandmark(item,dpr) {
    const base=project(item.x,item.y,0), top=project(item.x,item.y,item.h), orange='#f04b16', paper='#f1ede1', cyan='#74d2dc', scale=dpr*zoom;
    ctx.lineWidth=1.3*dpr;ctx.strokeStyle=orange;ctx.fillStyle='rgba(240,75,22,.24)';
    if(item.type==='tower'){
      const w=9*scale;ctx.beginPath();ctx.ellipse(top.x,top.y,w,4*scale,0,0,Math.PI*2);ctx.fillStyle=orange;ctx.fill();line({x:base.x-w,y:base.y},{x:top.x-w,y:top.y},orange,1.4);line({x:base.x+w,y:base.y},{x:top.x+w,y:top.y},orange,1.4);ctx.fillStyle='rgba(240,75,22,.25)';ctx.fillRect(top.x-w,top.y,w*2,base.y-top.y);
    } else if(item.type==='spires'){
      [-.017,-.006,.006,.017].forEach((offset,i)=>{const b=project(item.x+offset,item.y+(i%2?-.008:.008),0),t=project(item.x+offset,item.y,item.h-(i%2)*13);line(b,t,i===1?paper:orange,2);ctx.beginPath();ctx.moveTo(t.x,t.y-7*scale);ctx.lineTo(t.x-3*scale,t.y+2*scale);ctx.lineTo(t.x+3*scale,t.y+2*scale);ctx.closePath();ctx.fillStyle=orange;ctx.fill()});
    } else if(item.type==='dome'){
      const w=14*scale,mid=project(item.x,item.y,item.h*.52);ctx.fillStyle='rgba(240,75,22,.28)';ctx.fillRect(base.x-w,mid.y,w*2,base.y-mid.y);ctx.beginPath();ctx.arc(top.x,mid.y,10*scale,Math.PI,0);ctx.fillStyle=orange;ctx.fill();line(base,top,paper,1);
    } else if(item.type==='mountain'){
      const l=project(item.x-.12,item.y+.04,0),r=project(item.x+.12,item.y+.04,0);ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(top.x,top.y+18*scale);ctx.lineTo(r.x,r.y);ctx.closePath();ctx.fillStyle='rgba(240,75,22,.2)';ctx.fill();ctx.stroke();line({x:top.x,y:top.y+18*scale},top,paper,2);line({x:top.x-5*scale,y:top.y+5*scale},{x:top.x+5*scale,y:top.y+5*scale},paper,1);
    } else if(item.type==='forum'){
      const a=project(item.x-.07,item.y+.035,item.h),b=project(item.x+.08,item.y+.03,item.h),c=project(item.x+.02,item.y-.055,item.h);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.fillStyle='rgba(240,75,22,.72)';ctx.fill();[a,b,c].forEach(p=>line(project(item.x,item.y,0),p,orange,1));
    } else if(item.type==='castle'){
      const left=project(item.x-.12,item.y+.04,0),right=project(item.x+.12,item.y+.04,0),hill=project(item.x,item.y,item.h*.55);ctx.beginPath();ctx.moveTo(left.x,left.y);ctx.lineTo(hill.x,hill.y);ctx.lineTo(right.x,right.y);ctx.closePath();ctx.fillStyle='rgba(240,75,22,.18)';ctx.fill();ctx.stroke();const w=16*scale,h=12*scale;ctx.fillStyle='rgba(240,75,22,.72)';ctx.fillRect(top.x-w,top.y+6*scale,w*2,h);for(let i=-1;i<=1;i++){ctx.fillRect(top.x+i*10*scale-3*scale,top.y,6*scale,7*scale)}line(project(item.x,item.y,0),top,paper,1);
    } else if(item.type==='harbor'){
      for(let j=0;j<3;j++){const a=project(item.x-.16+j*.08,item.y-.025,1),b=project(item.x-.16+j*.08,item.y+.12,1);line(a,b,j===1?paper:cyan,2)}const mast=project(item.x-.06,item.y+.01,item.h),foot=project(item.x-.06,item.y+.01,0),arm=project(item.x+.04,item.y+.01,item.h);line(foot,mast,orange,2);line(mast,arm,orange,2);line(arm,project(item.x+.04,item.y+.01,item.h*.45),orange,1);
    } else if(item.type==='maremagnum'){
      const a=project(item.x-.07,item.y+.04,item.h*.35),b=project(item.x+.07,item.y+.04,item.h*.35),c=project(item.x+.06,item.y-.04,item.h*.35),d=project(item.x-.06,item.y-.04,item.h*.35);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.fillStyle='rgba(241,237,225,.22)';ctx.fill();ctx.strokeStyle=orange;ctx.stroke();const roof=project(item.x,item.y,item.h);line(a,roof,orange,1.4);line(b,roof,orange,1.4);line(c,roof,orange,1.4);line(d,roof,orange,1.4);ctx.beginPath();ctx.arc(roof.x,roof.y,5*scale,Math.PI,0);ctx.strokeStyle=paper;ctx.stroke();
    } else if(item.type==='beach'){
      for(let j=0;j<3;j++){ctx.beginPath();for(let i=0;i<=12;i++){const q=project(item.x-.18+i*.03,item.y+j*.035+Math.sin(i*.9+j)*.01,2+j);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)}ctx.strokeStyle=j===0?paper:cyan;ctx.lineWidth=(j===0?2:1)*dpr;ctx.stroke()}
    }
    landmarkLabel(item,top,dpr);
  }
  function draw() {
    const dpr=devicePixelRatio||1, r=viewport.getBoundingClientRect();
    if(canvas.width!==Math.round(r.width*dpr)||canvas.height!==Math.round(r.height*dpr)){canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr)}
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const glow=ctx.createRadialGradient(canvas.width*.5,canvas.height*.48,0,canvas.width*.5,canvas.height*.48,canvas.width*.55);
    glow.addColorStop(0,'rgba(43,151,150,.12)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let i=-10;i<=10;i++){line(project(i/10,-.78),project(i/10,.72));line(project(-.9,i/14),project(.9,i/14));}
    const coast=[[-.92,.6],[-.58,.7],[-.08,.68],[.45,.52],[.9,.15],[.78,-.58],[.25,-.72],[-.32,-.68],[-.84,-.34],[-.92,.6]];
    ctx.beginPath(); coast.forEach((p,i)=>{const q=project(p[0],p[1]);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)}); ctx.closePath(); ctx.fillStyle='rgba(85,188,185,.04)';ctx.fill();ctx.strokeStyle='rgba(113,217,222,.58)';ctx.lineWidth=2*dpr;ctx.stroke();
    for(let i=0;i<85;i++){const h=hash('building'+i),x=((h%1000)/1000)*1.7-.85,y=(((h>>>10)%1000)/1000)*1.25-.62,z=3+(h%14);const a=project(x,y),b=project(x,y,z);line(a,b,'rgba(241,237,225,.10)',1);}
    landmarks.sort((a,b)=>a.y-b.y).forEach(item=>drawLandmark(item,dpr));
    points=[];
    const order=[...filtered].sort((a,b)=>a.y-b.y);
    order.forEach(shelter => {
      const p=project(shelter.x,shelter.y,shelter===selected?shelter.h+8:shelter.h); points.push({s:shelter,x:p.x,y:p.y});
      const base=project(shelter.x,shelter.y,0), active=shelter===selected||shelter===hover;
      line(base,p,active?'rgba(240,75,22,.9)':'rgba(116,210,220,.22)',active?1.5:.6);
      const radius=(active?6:2.5)*dpr;
      ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fillStyle=active?'#f04b16':(shelter.category==='Microrefugis'?'#f1ede1':'#74d2dc');ctx.fill();
      if(active){ctx.beginPath();ctx.arc(p.x,p.y,11*dpr,0,Math.PI*2);ctx.strokeStyle='rgba(240,75,22,.65)';ctx.lineWidth=1*dpr;ctx.stroke();}
    });
    if(selected){const p=project(selected.x,selected.y,selected.h+8);ctx.font=`900 ${10*dpr}px Arial`;ctx.fillStyle='#f1ede1';ctx.fillText(selected.name.toUpperCase().slice(0,30),p.x+14*dpr,p.y-4*dpr);}
    compass.style.setProperty('--compass',`${yaw}rad`);
  }
  function nearest(e) { const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*devicePixelRatio,y=(e.clientY-r.top)*devicePixelRatio; let best=null,dist=18*devicePixelRatio; for(const p of points){const d=Math.hypot(p.x-x,p.y-y);if(d<dist){dist=d;best=p.s}} return best; }
  function officialUrl(s) {
    const slug=s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    return `https://www.barcelona.cat/barcelona-pel-clima/ca/refugis-climatics/${slug}-${s.id}`;
  }
  function choose(s) {
    selected=s; if(!s)return; card.number.textContent=String(s.index+1).padStart(3,'0'); card.kind.textContent=s.category; card.name.textContent=s.name; card.address.textContent=s.address||'Barcelona'; card.link.href=officialUrl(s); toast.textContent=`SIGNAL ${String(s.index+1).padStart(3,'0')} LOCKED`; draw();
  }
  function filter() {
    const q=search.value.trim().toLocaleLowerCase(), cat=category.value;
    filtered=shelters.filter(s=>(cat==='all'||s.category===cat)&&(!q||`${s.name} ${s.address}`.toLocaleLowerCase().includes(q)));
    countEl.textContent=filtered.length;toast.textContent=`${filtered.length} SIGNALS IN VIEW`;if(selected&&!filtered.includes(selected))selected=null;draw();
  }
  search.addEventListener('input',filter); category.addEventListener('change',filter);
  canvas.addEventListener('pointerdown',e=>{dragging=true;last={x:e.clientX,y:e.clientY};dragStart={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener('pointermove',e=>{if(dragging){yaw+=(e.clientX-last.x)*.006;pitch=Math.max(.28,Math.min(.68,pitch-(e.clientY-last.y)*.004));last={x:e.clientX,y:e.clientY};draw()}else{const n=nearest(e);if(n!==hover){hover=n;draw()}}});
  canvas.addEventListener('pointerup',e=>{const moved=Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y);dragging=false;canvas.releasePointerCapture(e.pointerId);if(moved<7){const n=nearest(e);if(n)choose(n)}});
  canvas.addEventListener('pointerleave',()=>{dragging=false;hover=null;draw()});
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.72,Math.min(1.75,zoom*(e.deltaY>0?.92:1.08)));draw()},{passive:false});
  document.querySelector('#map-zoom-in')?.addEventListener('click',()=>{zoom=Math.min(1.75,zoom*1.12);draw()});
  document.querySelector('#map-zoom-out')?.addEventListener('click',()=>{zoom=Math.max(.72,zoom*.88);draw()});
  addEventListener('resize',draw); draw();
  if(shelters.length) choose(shelters[0]);

})();
