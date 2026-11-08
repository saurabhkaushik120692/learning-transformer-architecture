// Deck engine: rendering, episodes, step labels, step reveal, overview grid, code view, theme, pointer, highlighter, recording mode.
/* ============ engine ============ */
(()=>{
  const $=(s,r=document)=>r.querySelector(s), stage=$('#stage'), root=document.documentElement;
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const KW=/^(def|class|return|import|from|as|if|else|elif|for|in|not|and|or|lambda|with|None|True|False|super|self)$/;
  function hl(code){
    return esc(code).replace(/(#[^\n]*)|("[^"\n]*"|'[^'\n]*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*)(?=\()|(\b[A-Za-z_]\w*\b)/g,(m,c,s,n,f,w)=>{
      if(c)return `<span class="tok-c">${c}</span>`; if(s)return `<span class="tok-s">${s}</span>`; if(n)return `<span class="tok-n">${n}</span>`;
      if(f)return KW.test(f)?`<span class="tok-k">${f}</span>`:`<span class="tok-f">${f}</span>`;
      if(w&&KW.test(w))return `<span class="tok-k">${w}</span>`; return m;});
  }
  const sections=[...new Set(SLIDES.map(s=>s.section))];
  const epOf=[];{let e=0;SLIDES.forEach((s,i)=>{if(s.type==='episode')e=s.ep;epOf[i]=e})}
  const epStart=n=>SLIDES.findIndex(s=>s.type==='episode'&&s.ep===n);
  const stepOf=[];{let e=0,k=0;SLIDES.forEach((s,i)=>{if(s.type==='episode'){e=s.ep;k=0}
    stepOf[i]=e&&!['episode','next','quiz'].includes(s.type)?`${e}.${++k}`:''})}
  const pad=n=>String(n).padStart(2,'0');
  const top=(s,i)=>`<div class="top"><span class="brand"><b>attention<i>/</i>2017</b></span><span class="sec">${epOf[i]?`<b>EP ${pad(epOf[i])}</b> · ${s.type==='episode'||s.type==='next'?'':s.section+' · '}`:'<b>Intro</b> · '}${pad(i+1)}</span></div>`;
  const pts=p=>p?`<ul class="points">${p.map((x,i)=>`<li><span class="n">${i+1}</span><span>${x}</span></li>`).join('')}</ul>`:'';
  const codeBox=(c,i)=>c?`<div class="code"><div class="codebox"><div class="codebar"><span>python · slide ${i+1}</span><button data-copy="${i}">Copy</button></div><pre>${hl(c)}</pre></div></div>`:'';
  const head=(s,i)=>`<div class="head"><div class="kick-row">${stepOf[i]?`<span class="stepno">Step ${stepOf[i]}</span>`:''}${s.kicker?`<div class="kicker">${s.kicker}</div>`:''}</div><h2>${s.title}</h2></div>`;

  function peTable(){
    const w=['I','love','my','country'];let h='<tr><th></th>'+[0,1,2,3,4,5].map(d=>`<th>${d%2?'cos':'sin'} ${Math.floor(d/2)}</th>`).join('')+'</tr>';
    w.forEach((t,pos)=>{h+=`<tr><th>${t} · ${pos}</th>`;for(let d=0;d<6;d++){const i=Math.floor(d/2),a=pos/Math.pow(10000,2*i/6),v=d%2?Math.cos(a):Math.sin(a);
      const pct=Math.round(Math.abs(v)*55);h+=`<td style="background:color-mix(in srgb, var(${v>=0?'--pen':'--margin'}) ${pct}%, var(--card));color:${pct>38?'var(--card)':'var(--ink)'}">${v.toFixed(3)}</td>`}h+='</tr>'});
    return `<div class="visual tbl-wrap"><table class="pe">${h}</table></div>`;
  }

  /* ---------- hero: live self-attention map on the title ---------- */
  const HW=['Attention','is','all','you','need'];
  const HA=[[.30,.08,.12,.15,.35],[.20,.30,.10,.10,.30],[.15,.10,.35,.10,.30],[.10,.05,.10,.40,.35],[.35,.10,.20,.15,.20]];
  const hy=k=>38+k*62;
  function heroArt(){
    let g='';
    HW.forEach((_,a)=>HW.forEach((_,b)=>{g+=`<path class="att-line" data-a="${a}" data-b="${b}" d="M150 ${hy(a)} C 215 ${hy(a)}, 245 ${hy(b)}, 310 ${hy(b)}"/>`}));
    const col=(x,anchor,side)=>HW.map((w,k)=>`<g class="tok" data-side="${side}" data-k="${k}" tabindex="${side==='q'?0:-1}" role="button" aria-label="Use ${w} as the query"><rect x="${anchor==='end'?x-128:x-6}" y="${hy(k)-19}" width="134" height="38" rx="8"/><text x="${x}" y="${hy(k)}" text-anchor="${anchor}" dominant-baseline="central">${w}</text></g>`).join('');
    const ws=HW.map((_,k)=>`<text class="att-w" x="${478}" y="${hy(k)}" text-anchor="end" dominant-baseline="central"></text>`).join('');
    return `<svg viewBox="0 0 486 340" role="img" aria-label="Attention weights from one word to every word in the title">${g}${col(142,'end','q')}${col(318,'start','k')}${ws}
      <text x="80" y="326" text-anchor="middle" class="sm muted" style="font-size:15px">query</text><text x="372" y="326" text-anchor="middle" class="sm muted" style="font-size:15px">keys</text></svg>`;
  }
  let heroQ=0, heroTimer=null, heroUser=false;
  function setHero(q){
    heroQ=q; const root_=stage.querySelector('.hero-art'); if(!root_)return;
    root_.querySelectorAll('.att-line').forEach(l=>{const a=+l.dataset.a,b=+l.dataset.b,w=HA[a][b],on=a===q;
      l.style.strokeWidth=on?(1.5+w*26):1; l.style.opacity=on?(.35+w*1.6):.07;});
    root_.querySelectorAll('.tok').forEach(t=>t.classList.toggle('q',t.dataset.side==='q'&&+t.dataset.k===q));
    root_.querySelectorAll('.att-w').forEach((t,k)=>{t.textContent=HA[q][k].toFixed(2)});
    const lab=document.getElementById('hero-q'); if(lab)lab.textContent=HW[q];
  }
  function heroCycle(){
    clearInterval(heroTimer); heroTimer=null;
    if(heroUser||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    heroTimer=setInterval(()=>{ if(idx===0)setHero((heroQ+1)%HW.length) },2400);
  }
  stage.addEventListener('click',e=>{const t=e.target.closest('.tok');if(!t)return;heroUser=true;clearInterval(heroTimer);setHero(+t.dataset.k)});
  stage.addEventListener('keydown',e=>{const t=e.target.closest('.tok');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();heroUser=true;clearInterval(heroTimer);setHero(+t.dataset.k)}});

  function render(s,i){
    const has=!!s.code;
    switch(s.type){
      case 'title': return `<div class="inner">${top(s,i)}<div class="hero">
        <div class="hero-copy">
          <div class="hero-eyebrow">The Transformer, explained</div>
          <h1><span class="w">Attention</span> <span class="w">is</span> <span class="w all">all</span> <span class="w">you</span> <span class="w">need</span></h1>
          <p class="lede">One formula replaced recurrence and became the engine inside every modern LLM. Here is how it works, piece by piece, with diagrams and runnable Python.</p>
          <div class="spec" aria-label="Original Transformer base model sizes">
            <div><b>512</b><span>d_model</span></div><div><b>8</b><span>heads</span></div><div><b>64</b><span>d_k</span></div><div><b>2048</b><span>FFN width</span></div><div><b>6+6</b><span>layers</span></div>
          </div>
          <div class="hero-start"><button class="btn-start" data-go="1">Start the series <span aria-hidden="true">→</span></button><small>4 episodes · press → to step through</small></div>
        </div>
        <div class="hero-art">${heroArt()}
          <div class="cap"><span>self-attention · query <b id="hero-q">Attention</b></span><span>tap a word</span></div>
          <div class="hero-formula">softmax( QKᵀ / √dₖ ) V</div>
        </div>
      </div></div>`;
      case 'map': return `<div class="inner">${top(s,i)}${head(s,i)}<div class="map4">${EPISODES.map(ep=>{const a=epStart(ep.n),b=ep.n<4?epStart(ep.n+1):SLIDES.length;
          return `<button class="stop" data-go="${a}"><span class="k">${pad(ep.n)}</span><span class="t">${ep.title}</span><ul>${ep.topics.map(t=>`<li>${t}</li>`).join('')}</ul><span class="len">slides ${a+1}–${b} · 20–30 min</span></button>`}).join('')}</div></div>`;
      case 'legend': { const sw=(c,lab)=>`<svg viewBox="0 0 220 80"><g class="bx ${c}"><rect x="10" y="12" width="200" height="56" rx="10"/></g>${T(110,40,lab,'sm')}</svg>`;
        return `<div class="inner">${top(s,i)}${head(s,i)}<div class="code4">
          <div class="c">${sw('learn','W_Q · Linear · FFN')}<h3>Learnable weights</h3><p>Numbers the model learns in training: W_Q, W_K, W_V, Wᴼ, embedding, FFN, LayerNorm γ and β, the final Linear.</p></div>
          <div class="c">${sw('data','x · q · k · v · y')}<h3>Data and vectors</h3><p>What flows through the model: token embeddings, q, k, v, scores and the contextual outputs.</p></div>
          <div class="c">${sw('fix','softmax · ÷√dₖ · mask')}<h3>Fixed operations</h3><p>Maths with no weights: softmax, ÷ √dₖ, the mask, sin/cos positional encoding, skip connections.</p></div>
          <div class="c">${sw('hot','this slide')}<h3>Focus</h3><p>Yellow marks the part the current slide is about.</p></div>
        </div></div>`; }
      case 'episode': { const ep=EPISODES[s.ep-1], prev=EPISODES[s.ep-2];
        return `<div class="inner">${top(s,i)}<div class="ep-cover"><div><div class="ep-num">${pad(ep.n)}<small>episode<br>of 04</small></div><h1>${ep.title}</h1></div>
          <div class="ep-list"><h3>In this episode</h3><ol>${ep.topics.map(t=>`<li>${t}</li>`).join('')}</ol>
          ${prev?`<div class="ep-prev"><b>Previously · episode ${pad(prev.n)}</b><ul>${prev.recap.map(t=>`<li>${t}</li>`).join('')}</ul></div>`:''}</div></div></div>`; }
      case 'next': { const ep=EPISODES[s.ep-1], nx=EPISODES[s.ep];
        return `<div class="inner">${top(s,i)}<div class="ep-end"><div class="head" style="gap:14px"><div class="kicker">end of episode ${pad(ep.n)}</div><p class="big">What we <em>covered</em></p>
          <ul class="points">${ep.recap.map((t,k)=>`<li><span class="n">${k+1}</span><span>${t}</span></li>`).join('')}</ul></div>
          <div class="ep-next"><span class="lbl">Up next · episode ${pad(nx.n)}</span><span class="t">${nx.title}</span><ul>${nx.topics.map(t=>`<li>${t}</li>`).join('')}</ul><button data-go="${epStart(nx.n)}">Go to episode ${pad(nx.n)} →</button></div></div></div>`; }
      case 'table': return `<div class="inner">${top(s,i)}${head(s,i)}<div class="visual tbl-wrap"><table class="cmp"><tr>${s.head.map(h=>`<th>${h}</th>`).join('')}</tr>${s.rows.map(r=>`<tr>${r.map((c,k)=>`<td class="${k===2&&!s.plain?'win':''}">${c}</td>`).join('')}</tr>`).join('')}</table></div>${s.note?`<div class="note">${s.note}</div>`:''}</div>`;
      case 'pe': return `<div class="inner">${top(s,i)}${head(s,i)}<div class="body">${peTable()}${pts(s.points)}</div></div>`;
      case 'quiz': return `<div class="inner">${top(s,i)}<div class="head"><div class="kicker">${s.kicker}</div></div><div class="quiz" data-quiz="${i}"><div class="q">${s.q}</div>
        ${s.opts.map((o,k)=>`<button class="opt" data-k="${k}"><span class="l">${'abcd'[k]}</span><span>${o}</span></button>`).join('')}<div class="explain" hidden>${s.explain}</div></div></div>`;
      case 'steps': return `<div class="inner">${top(s,i)}${head(s,i)}<div class="cols"><div class="col"><h3>Encoder side</h3><ol>${s.enc.map((x,k)=>`<li class="${s.keyEnc.includes(k)?'key':''}">${x}</li>`).join('')}</ol></div><div class="col"><h3>Decoder side</h3><ol>${s.dec.map((x,k)=>`<li class="${s.keyDec.includes(k)?'key':''}">${x}</li>`).join('')}</ol></div></div></div>`;
      case 'summary': return `<div class="inner">${top(s,i)}${head(s,i)}<div class="body"><div class="visual">${pts(s.points)}</div><div class="refs"><div class="kicker">read next</div>${s.refs.map(([t,u])=>`<a href="${u}" target="_blank" rel="noopener">${t}</a>`).join('')}</div></div></div>`;
      default: return `<div class="inner">${top(s,i)}${head(s,i)}<div class="body"><div class="visual">${s.visual||''}</div>${codeBox(s.code,i)}<div>${pts(s.points)}${s.note?`<div class="note" style="margin-top:14px">${s.note}</div>`:''}</div></div></div>`;
    }
  }

  stage.innerHTML=SLIDES.map((s,i)=>`<section class="slide type-${s.type||'concept'} ${s.code?'has-code':''}" id="s${i+1}" aria-label="Slide ${i+1}: ${(s.title||'').replace(/<[^>]+>/g,'')}">${render(s,i)}</section>`).join('');
  const els=[...stage.children];
  setHero(0); heroCycle();
  let idx=0;

  /* step-by-step reveal */
  let stepMode=true, frag=0;
  try{if(localStorage.getItem('attn-steps')==='off')stepMode=false}catch(e){}
  const frags=k=>[...els[k].querySelectorAll('.points li, table.cmp tr:not(:first-child)')].filter(()=>SLIDES[k].type!=='next');
  function paint(){
    const f=frags(idx);
    f.forEach((el,k)=>{el.classList.add('frag');
      const shown=!stepMode||k<frag; el.classList.toggle('hide',!shown);
      el.classList.toggle('now',stepMode&&k===frag-1); el.classList.toggle('done',stepMode&&k<frag-1);});
  }
  function quizAt(k){return SLIDES[k].type==='quiz'?els[k].querySelector('.quiz'):null}
  function reveal(qz){if(!qz||qz.dataset.done)return false;const s=SLIDES[+qz.dataset.quiz];qz.dataset.done=1;
    qz.querySelectorAll('.opt').forEach(b=>{if(+b.dataset.k===s.answer)b.classList.add('right')});qz.querySelector('.explain').hidden=false;return true}
  function next(){
    const total=frags(idx).length;
    if(stepMode&&frag<total){frag++;paint();return}
    if(stepMode&&reveal(quizAt(idx)))return;
    if(idx<SLIDES.length-1)go(idx+1);
  }
  function prev(){
    if(stepMode&&frag>0){frag--;paint();return}
    if(idx>0)go(idx-1,true,true);
  }
  function setSteps(on){stepMode=on;$('#btn-steps').setAttribute('aria-pressed',on);try{localStorage.setItem('attn-steps',on?'on':'off')}catch(e){}
    frag=on?0:frags(idx).length;paint()}

  function go(n,push=true,fromBack=false){
    idx=Math.max(0,Math.min(SLIDES.length-1,n));
    frag=fromBack?frags(idx).length:0; paint();
    els.forEach((e,k)=>e.classList.toggle('active',k===idx));
    els[idx].scrollTop=0;
    $('#count').textContent=`${idx+1} / ${SLIDES.length}`;
    $('#progress').style.width=((idx+1)/SLIDES.length*100)+'%';
    $('#prev').disabled=idx===0&&frag===0; $('#next').disabled=false;
    $('#btn-code').disabled=!SLIDES[idx].code;
    if(typeof drawInk==='function')try{drawInk()}catch(e){}
    if(push&&location.hash!=='#'+(idx+1)){try{history.replaceState(null,'','#'+(idx+1))}catch(e){location.hash=String(idx+1)}}
  }
  const fromHash=()=>{const hs=location.hash.slice(1),m=/^ep([1-4])$/.exec(hs);if(m)return epStart(+m[1]);const n=parseInt(hs,10);return isNaN(n)?0:n-1};
  window.addEventListener('hashchange',()=>go(fromHash(),false));

  const toggle=(cls,btn)=>{const on=document.body.classList.toggle(cls);if(btn)btn.setAttribute('aria-pressed',on)};
  function theme(){const dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme=dark?'light':'dark';try{localStorage.setItem('attn-theme',root.dataset.theme)}catch(e){}}
  try{const t=localStorage.getItem('attn-theme');if(t)root.dataset.theme=t}catch(e){}
  async function fs(){try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch(e){}}

  const ov=$('#overview');
  function openGrid(){
    const label=n=>n?`Episode ${pad(n)} · ${EPISODES[n-1].title}`:'Intro';
    $('#ov-body').innerHTML=[0,1,2,3,4].map(sec=>`<div class="ov-sec">${label(sec)}</div><div class="ov-grid">${SLIDES.map((s,k)=>epOf[k]!==sec?'':`<button class="ov-card ${k===idx?'cur':''}" data-go="${k}"><span class="no">${stepOf[k]||String(k+1).padStart(2,'0')}</span><span class="tt">${s.type==='quiz'?'Quiz: '+s.q:s.type==='episode'?'Episode cover':s.type==='next'?'Recap + up next':(s.title||'')}</span></button>`).join('')}</div>`).join('');
    ov.hidden=false; const c=ov.querySelector('.cur'); c&&c.focus();
  }
  const closeGrid=()=>{ov.hidden=true};

  $('#prev').onclick=prev; $('#next').onclick=next;
  $('#btn-steps').onclick=()=>setSteps(!stepMode);
  $('#btn-grid').onclick=openGrid; $('#ov-close').onclick=closeGrid;
  $('#btn-code').onclick=()=>toggle('show-code',$('#btn-code'));
  $('#btn-theme').onclick=theme; $('#btn-fs').onclick=fs;

  document.addEventListener('click',e=>{
    const g=e.target.closest('[data-go]'); if(g){go(+g.dataset.go);closeGrid();return}
    const cp=e.target.closest('[data-copy]');
    if(cp){const code=SLIDES[+cp.dataset.copy].code;
      navigator.clipboard.writeText(code).then(()=>{cp.textContent='Copied'},()=>{const pre=cp.closest('.codebox').querySelector('pre');const r=document.createRange();r.selectNodeContents(pre);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);cp.textContent='Selected, press Ctrl+C'});
      setTimeout(()=>{cp.textContent='Copy'},1800);return}
    const o=e.target.closest('.opt');
    if(o){const qz=o.closest('.quiz'),s=SLIDES[+qz.dataset.quiz];if(qz.dataset.done)return;qz.dataset.done=1;
      qz.querySelectorAll('.opt').forEach(b=>{const k=+b.dataset.k;if(k===s.answer)b.classList.add('right');else if(b===o)b.classList.add('wrong')});
      qz.querySelector('.explain').hidden=false}
  });

  document.addEventListener('keydown',e=>{
    if(e.metaKey||e.ctrlKey||e.altKey)return;
    if(!ov.hidden){if(e.key==='Escape'||e.key==='g'||e.key==='G')closeGrid();return}
    const k=e.key;
    if(['ArrowRight','PageDown',' ','ArrowDown'].includes(k)){e.preventDefault();next()}
    else if(['ArrowLeft','PageUp','ArrowUp'].includes(k)){e.preventDefault();prev()}
    else if(k==='p'||k==='P')setTool(tool==='ptr'?null:'ptr');
    else if(k==='s'||k==='S')setSteps(!stepMode);
    else if(k==='r'||k==='R')setRec(!document.body.classList.contains('rec'));
    else if(k==='a'||k==='A'){frag=frags(idx).length;paint()}
    else if(k==='Home')go(0); else if(k==='End')go(SLIDES.length-1);
    else if(k==='g'||k==='G')openGrid();
    else if((k==='c'||k==='C')&&SLIDES[idx].code)toggle('show-code',$('#btn-code'));
    else if(k==='h'||k==='H')setTool(tool==='hl'?null:'hl');
    else if(k==='x'||k==='X')clearInk();
    else if(k==='Escape'&&tool)setTool(null);
    else if(k==='t'||k==='T')theme(); else if(k==='f'||k==='F')fs();
  });

  /* ---------- presenter tool: highlighter ---------- */
  let tool=null; const ink=$('#ink'), ctx=ink.getContext('2d');
  const strokes={};            // slide index -> [[{x,y}...]] in slide-content coords
  let cur=null;
  function sizeInk(){const d=devicePixelRatio||1;ink.width=innerWidth*d;ink.height=innerHeight*d;ctx.setTransform(d,0,0,d,0,0);drawInk()}
  function drawInk(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    const list=strokes[idx]; if(!list||!list.length){$('#btn-clear').hidden=tool!=='hl';return}
    const off=els[idx].scrollTop*(document.body.classList.contains('rec')?recScale:1), col=getComputedStyle(root).getPropertyValue('--ink-stroke').trim()||'rgba(255,214,0,.4)';
    ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=20;ctx.strokeStyle=col;
    list.forEach(st=>{ctx.beginPath();st.forEach((p,k)=>k?ctx.lineTo(p.x,p.y-off):ctx.moveTo(p.x,p.y-off));if(st.length===1)ctx.lineTo(st[0].x+.1,st[0].y-off);ctx.stroke()});
    $('#btn-clear').hidden=false;
  }
  function clearInk(){strokes[idx]=[];drawInk()}
  function setTool(t){
    tool=t;
    document.body.classList.toggle('tool-hl',t==='hl');document.body.classList.toggle('tool-ptr',t==='ptr');
    $('#btn-hl').setAttribute('aria-pressed',t==='hl');$('#btn-ptr').setAttribute('aria-pressed',t==='ptr');
    if(t!=='ptr')ptr.hidden=true;
    drawInk();
  }
  $('#btn-hl').onclick=()=>setTool(tool==='hl'?null:'hl');
  $('#btn-ptr').onclick=()=>setTool(tool==='ptr'?null:'ptr');
  const ptr=$('#pointer');
  document.addEventListener('pointermove',e=>{
    if(document.body.classList.contains('rec'))document.body.classList.toggle('show-ui',e.clientY>innerHeight-110);
    if(tool!=='ptr')return;
    if(e.target.closest&&e.target.closest('.toolbar')){ptr.hidden=true;return}
    ptr.hidden=false;ptr.style.transform=`translate(${e.clientX}px,${e.clientY}px)`});
  root.addEventListener('mouseleave',()=>{ptr.hidden=true});

  /* recording mode */
  let recScale=1;
  function fitRec(){recScale=Math.min(innerWidth/1280,innerHeight/720);root.style.setProperty('--rec-scale',recScale)}
  function setRec(on){document.body.classList.toggle('rec',on);$('#btn-rec').setAttribute('aria-pressed',on);fitRec();
    try{localStorage.setItem('attn-rec',on?'on':'off')}catch(e){};drawInk()}
  $('#btn-rec').onclick=()=>setRec(!document.body.classList.contains('rec'));
  addEventListener('resize',fitRec);
  $('#btn-clear').onclick=clearInk;
  ink.addEventListener('pointerdown',e=>{if(tool!=='hl')return;e.preventDefault();ink.setPointerCapture(e.pointerId);
    const off=els[idx].scrollTop*(document.body.classList.contains('rec')?recScale:1);cur=[{x:e.clientX,y:e.clientY+off}];(strokes[idx]=strokes[idx]||[]).push(cur);drawInk()});
  ink.addEventListener('pointermove',e=>{if(!cur)return;cur.push({x:e.clientX,y:e.clientY+els[idx].scrollTop*(document.body.classList.contains('rec')?recScale:1)});drawInk()});
  const endStroke=()=>{cur=null};
  ink.addEventListener('pointerup',endStroke);ink.addEventListener('pointercancel',endStroke);
  ink.addEventListener('wheel',e=>{els[idx].scrollTop+=e.deltaY},{passive:true});
  els.forEach(el=>el.addEventListener('scroll',()=>{if(el===els[idx])drawInk()},{passive:true}));
  addEventListener('resize',sizeInk);
  new MutationObserver(drawInk).observe(root,{attributes:true,attributeFilter:['data-theme']});
  sizeInk();

  let sx=null,sy=null;
  stage.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  stage.addEventListener('touchend',e=>{if(sx===null||tool==='hl')return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)(dx<0?next():prev());sx=null},{passive:true});

  $('#btn-steps').setAttribute('aria-pressed',stepMode);
  try{if(localStorage.getItem('attn-rec')==='on')setRec(true)}catch(e){}
  go(fromHash(),false);
})();
