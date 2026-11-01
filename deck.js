// Deck engine: rendering, navigation, overview grid, code view, theme, highlighter.
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
  const top=(s,i)=>`<div class="top"><span class="brand"><b>attention<i>/</i>2017</b></span><span class="sec"><b>${s.section}</b> · ${String(i+1).padStart(2,'0')}</span></div>`;
  const pts=p=>p?`<ul class="points">${p.map((x,i)=>`<li><span class="n">${i+1}</span><span>${x}</span></li>`).join('')}</ul>`:'';
  const codeBox=(c,i)=>c?`<div class="code"><div class="codebox"><div class="codebar"><span>python · slide ${i+1}</span><button data-copy="${i}">Copy</button></div><pre>${hl(c)}</pre></div></div>`:'';
  const head=s=>`<div class="head">${s.kicker?`<div class="kicker">${s.kicker}</div>`:''}<h2>${s.title}</h2></div>`;

  function peTable(){
    const w=['I','love','my','country'];let h='<tr><th></th>'+[0,1,2,3,4,5].map(d=>`<th>${d%2?'cos':'sin'} ${Math.floor(d/2)}</th>`).join('')+'</tr>';
    w.forEach((t,pos)=>{h+=`<tr><th>${t} · ${pos}</th>`;for(let d=0;d<6;d++){const i=Math.floor(d/2),a=pos/Math.pow(10000,2*i/6),v=d%2?Math.cos(a):Math.sin(a);
      const pct=Math.round(Math.abs(v)*55);h+=`<td style="background:color-mix(in srgb, var(${v>=0?'--pen':'--margin'}) ${pct}%, var(--card));color:${pct>38?'var(--card)':'var(--ink)'}">${v.toFixed(3)}</td>`}h+='</tr>'});
    return `<div class="visual tbl-wrap"><table class="pe">${h}</table></div>`;
  }

  function render(s,i){
    const has=!!s.code;
    switch(s.type){
      case 'title': return `<div class="inner">${top(s,i)}<div class="title-wrap"><div class="head" style="gap:18px"><div class="kicker">notes on Vaswani et al., 2017</div>
        <h1>Attention is <em>all</em> you need</h1><p>The Transformer explained from my notebook, one hand-drawn diagram at a time.</p>
        <div class="chips">${sections.slice(1).map(x=>`<span class="chip">${x}</span>`).join('')}</div></div>
        <div class="formula">softmax( QKᵀ / √dₖ ) V<small>← the one line this deck explains</small></div></div></div>`;
      case 'map': { const desc={Foundations:'LLMs, LSTM limits, training vs inference',Input:'tokens, embeddings, positional encoding','Encoder block':'residuals, LayerNorm, feed-forward',Attention:'self-attention, Q K V, √dₖ, multi-head',Decoder:'translation, shifted right, masking, cross-attention',Architecture:'full picture, depth, LLM families','Wrap-up':'summary and references'};
        return `<div class="inner">${top(s,i)}${head(s)}<div class="map">${sections.slice(1).map((x,k)=>`<button class="stop" data-go="${SLIDES.findIndex(z=>z.section===x)}"><span class="k">stop ${k+1}</span><span class="t">${x}</span><span class="d">${desc[x]||''}</span></button>`).join('')}</div></div>`;}
      case 'table': return `<div class="inner">${top(s,i)}${head(s)}<div class="visual tbl-wrap"><table class="cmp"><tr>${s.head.map(h=>`<th>${h}</th>`).join('')}</tr>${s.rows.map(r=>`<tr>${r.map((c,k)=>`<td class="${k===2?'win':''}">${c}</td>`).join('')}</tr>`).join('')}</table></div>${s.note?`<div class="note">${s.note}</div>`:''}</div>`;
      case 'pe': return `<div class="inner">${top(s,i)}${head(s)}<div class="body">${peTable()}${pts(s.points)}</div></div>`;
      case 'quiz': return `<div class="inner">${top(s,i)}<div class="head"><div class="kicker">${s.kicker}</div></div><div class="quiz" data-quiz="${i}"><div class="q">${s.q}</div>
        ${s.opts.map((o,k)=>`<button class="opt" data-k="${k}"><span class="l">${'abcd'[k]}</span><span>${o}</span></button>`).join('')}<div class="explain" hidden>${s.explain}</div></div></div>`;
      case 'steps': return `<div class="inner">${top(s,i)}${head(s)}<div class="cols"><div class="col"><h3>Encoder side</h3><ol>${s.enc.map((x,k)=>`<li class="${s.keyEnc.includes(k)?'key':''}">${x}</li>`).join('')}</ol></div><div class="col"><h3>Decoder side</h3><ol>${s.dec.map((x,k)=>`<li class="${s.keyDec.includes(k)?'key':''}">${x}</li>`).join('')}</ol></div></div></div>`;
      case 'summary': return `<div class="inner">${top(s,i)}${head(s)}<div class="body"><div class="visual">${pts(s.points)}</div><div class="refs"><div class="kicker">read next</div>${s.refs.map(([t,u])=>`<a href="${u}" target="_blank" rel="noopener">${t}</a>`).join('')}<div class="note">Send more notebook pages and they become new slides here.</div></div></div></div>`;
      default: return `<div class="inner">${top(s,i)}${head(s)}<div class="body"><div class="visual">${s.visual||''}</div>${codeBox(s.code,i)}<div>${pts(s.points)}${s.note?`<div class="note" style="margin-top:14px">${s.note}</div>`:''}</div></div></div>`;
    }
  }

  stage.innerHTML=SLIDES.map((s,i)=>`<section class="slide ${s.code?'has-code':''}" id="s${i+1}" aria-label="Slide ${i+1}: ${(s.title||'').replace(/<[^>]+>/g,'')}">${render(s,i)}</section>`).join('');
  const els=[...stage.children];
  let idx=0;

  function go(n,push=true){
    idx=Math.max(0,Math.min(SLIDES.length-1,n));
    els.forEach((e,k)=>e.classList.toggle('active',k===idx));
    els[idx].scrollTop=0;
    $('#count').textContent=`${idx+1} / ${SLIDES.length}`;
    $('#progress').style.width=((idx+1)/SLIDES.length*100)+'%';
    $('#prev').disabled=idx===0; $('#next').disabled=idx===SLIDES.length-1;
    $('#btn-code').disabled=!SLIDES[idx].code;
    if(typeof drawInk==='function')try{drawInk()}catch(e){}
    if(push&&location.hash!=='#'+(idx+1)){try{history.replaceState(null,'','#'+(idx+1))}catch(e){location.hash=String(idx+1)}}
  }
  const fromHash=()=>{const n=parseInt(location.hash.slice(1),10);return isNaN(n)?0:n-1};
  window.addEventListener('hashchange',()=>go(fromHash(),false));

  const toggle=(cls,btn)=>{const on=document.body.classList.toggle(cls);if(btn)btn.setAttribute('aria-pressed',on)};
  function theme(){const dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme=dark?'light':'dark';try{localStorage.setItem('attn-theme',root.dataset.theme)}catch(e){}}
  try{const t=localStorage.getItem('attn-theme');if(t)root.dataset.theme=t}catch(e){}
  async function fs(){try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch(e){}}

  const ov=$('#overview');
  function openGrid(){
    $('#ov-body').innerHTML=sections.map(sec=>`<div class="ov-sec">${sec}</div><div class="ov-grid">${SLIDES.map((s,k)=>s.section!==sec?'':`<button class="ov-card ${k===idx?'cur':''}" data-go="${k}"><span class="no">${String(k+1).padStart(2,'0')}</span><span class="tt">${s.type==='quiz'?'Quiz: '+s.q:(s.title||'')}</span></button>`).join('')}</div>`).join('');
    ov.hidden=false; const c=ov.querySelector('.cur'); c&&c.focus();
  }
  const closeGrid=()=>{ov.hidden=true};

  $('#prev').onclick=()=>go(idx-1); $('#next').onclick=()=>go(idx+1);
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
    if(['ArrowRight','PageDown',' '].includes(k)){e.preventDefault();go(idx+1)}
    else if(['ArrowLeft','PageUp'].includes(k)){e.preventDefault();go(idx-1)}
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
    const off=els[idx].scrollTop, col=getComputedStyle(root).getPropertyValue('--ink-stroke').trim()||'rgba(255,214,0,.4)';
    ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=20;ctx.strokeStyle=col;
    list.forEach(st=>{ctx.beginPath();st.forEach((p,k)=>k?ctx.lineTo(p.x,p.y-off):ctx.moveTo(p.x,p.y-off));if(st.length===1)ctx.lineTo(st[0].x+.1,st[0].y-off);ctx.stroke()});
    $('#btn-clear').hidden=false;
  }
  function clearInk(){strokes[idx]=[];drawInk()}
  function setTool(t){
    tool=t;
    document.body.classList.toggle('tool-hl',t==='hl');
    $('#btn-hl').setAttribute('aria-pressed',t==='hl');
    drawInk();
  }
  $('#btn-hl').onclick=()=>setTool(tool==='hl'?null:'hl');
  $('#btn-clear').onclick=clearInk;
  ink.addEventListener('pointerdown',e=>{if(tool!=='hl')return;e.preventDefault();ink.setPointerCapture(e.pointerId);
    const off=els[idx].scrollTop;cur=[{x:e.clientX,y:e.clientY+off}];(strokes[idx]=strokes[idx]||[]).push(cur);drawInk()});
  ink.addEventListener('pointermove',e=>{if(!cur)return;cur.push({x:e.clientX,y:e.clientY+els[idx].scrollTop});drawInk()});
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
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)go(idx+(dx<0?1:-1));sx=null},{passive:true});

  go(fromHash(),false);
})();
