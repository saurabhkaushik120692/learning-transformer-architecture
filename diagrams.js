// Drawing helpers and hand-drawn style SVG diagrams, one per concept.
/* ============ drawing helpers ============ */
const T=(x,y,t,c='')=>{const L=String(t).split('\n');return `<text x="${x}" y="${y}" class="${c}" text-anchor="middle" dominant-baseline="central">${L.map((l,i)=>`<tspan x="${x}" dy="${i?1.05:-(L.length-1)*0.52}em">${l}</tspan>`).join('')}</text>`};
const TL=(x,y,t,c='')=>`<text x="${x}" y="${y}" class="${c}" dominant-baseline="central">${t}</text>`;
const B=(x,y,w,h,t,c='',tc='')=>`<g class="bx ${c}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>${t!==''?T(x+w/2,y+h/2,t,tc):''}</g>`;
const A=(x1,y1,x2,y2,c='')=>`<path class="ar ${c}" d="M${x1} ${y1} L${x2} ${y2}"/>`;
const P=(d,c='')=>`<path class="ar ${c}" d="${d}"/>`;
const L=(d,c='')=>`<path class="ln ${c}" d="${d}"/>`;
const V=(x,y,vals,o={})=>{const w=o.w||30,h=o.h||26;return vals.map((v,i)=>`<rect class="cell ${o.c||''}" x="${x+i*w}" y="${y}" width="${w}" height="${h}" rx="3"/>${v!==''?T(x+i*w+w/2,y+h/2,v,'svg-mono'):''}`).join('')+(o.label?T(x+vals.length*w/2,y+h+16,o.label,'sm muted'):'')};
const M=(x,y,r,c,cw,ch,cls='')=>Array.from({length:r*c},(_,k)=>`<rect class="cell ${cls}" x="${x+(k%c)*cw}" y="${y+Math.floor(k/c)*ch}" width="${cw}" height="${ch}"/>`).join('');
const S=(vb,inner,label='')=>`<svg viewBox="${vb}" role="img" aria-label="${label}">${inner}</svg>`;

/* ============ diagrams ============ */
const DIA={
llm:S('0 0 540 280',`
  ${T(270,30,'The cat sat on the ____')}
  ${T(270,64,'model predicts the next word ↓','sm muted')}
  ${[['mat',.62],['floor',.21],['sofa',.11],['moon',.01]].map(([w,p],i)=>`
    ${TL(30,110+i*42,w)}<rect class="bar ${i?'soft':''}" x="120" y="${96+i*42}" width="${Math.max(3,p*340)}" height="28" rx="5"/>
    ${TL(130+Math.max(3,p*340),110+i*42,p.toFixed(2),'svg-mono')}`).join('')}
  ${T(270,268,'probabilities after softmax · they add up to 1','sm red')}`,'Next word prediction bar chart'),

timeline:S('0 0 560 290',`
  ${B(20,40,150,62,'RNN\n1986')}${B(205,40,150,62,'LSTM / GRU\n1997 / 2014')}${B(390,40,150,62,'Encoder–Decoder\n2014')}
  ${B(390,170,150,62,'Enc–Dec\n+ attention 2015')}${B(205,170,150,62,'ULMFiT\n2018')}${B(20,170,150,62,'Transformer\n2017','hot')}
  ${A(170,71,203,71)}${A(355,71,388,71)}${A(465,102,465,168)}${A(390,201,357,201)}${A(205,201,172,201)}
  ${L('M200 250 L200 260 L545 260 L545 250','red')}${T(372,276,'all of these are built on LSTMs','sm red')}
  ${T(95,250,'“Attention is all\nyou need”','sm blue')}`,'Evolution from RNN to Transformer'),

seqpar:S('0 0 540 300',`
  ${TL(10,22,'RNN / LSTM · one step at a time','red')}
  ${['How','are','you'].map((w,i)=>B(20+i*170,45,120,46,w)+`${T(80+i*170,108,'t = '+(i+1),'sm muted')}`).join('')}
  ${A(140,68,188,68)}${A(310,68,358,68)}
  ${TL(10,160,'Transformer · all tokens at once','blue')}
  ${['How','are','you'].map((w,i)=>B(20+i*170,180,120,46,w,'pen')+A(80+i*170,226,80+i*170,252,'pen')).join('')}
  ${B(20,254,460,38,'one parallel step · fast on GPUs','hot')}`,'Sequential vs parallel processing'),

infer:S('0 0 540 270',`
  ${TL(14,26,'1 · Training','red')}
  ${B(20,48,140,52,'lots of text')}${A(160,74,205,74)}${B(207,48,130,52,'model','pen')}${A(337,74,382,74)}${B(384,48,140,52,'adjust weights')}
  ${P('M454 100 Q454 130 272 130 Q262 130 262 104','red')}${T(360,146,'repeat for many epochs','sm red')}
  ${TL(14,186,'2 · Inference','blue')}
  ${B(20,206,140,52,'prompt')}${A(160,232,205,232)}${B(207,206,130,52,'GPT','hot')}${A(337,232,382,232)}${B(384,206,140,52,'answer')}`,'Training vs inference'),

pipeline:S('0 0 560 260',`
  ${B(10,30,110,56,'Text')}${B(150,30,120,56,'Tokenize')}${B(300,30,120,56,'Embedding')}${B(440,30,110,56,'+ Position')}
  ${B(440,170,110,56,'Self-\nattention','hot')}${B(300,170,120,56,'Feed-\nforward')}${B(150,170,120,56,'Output','pen')}
  ${A(120,58,148,58)}${A(270,58,298,58)}${A(420,58,438,58)}${A(495,86,495,168)}${A(440,198,422,198)}${A(300,198,272,198)}
  ${T(225,128,'inside one encoder block →','sm red')}
  ${L('M290 160 L290 240 L556 240 L556 160','red')}`,'Transformer input pipeline'),

embed:S('0 0 540 330',`
  ${['How','are','you'].map((w,i)=>B(30+i*175,14,110,40,w)).join('')}
  ${B(20,80,500,44,'Embedding layer · 512-d · trainable','pen')}
  ${[0,1,2].map(i=>A(85+i*175,54,85+i*175,78)+A(85+i*175,124,85+i*175,146)+V(40+i*175,148,['','','',''],{label:'e'+(i+1)})+T(85+i*175,206,'+','red')+V(40+i*175,218,['','','',''],{c:'pe',label:'p'+(i+1)})+A(85+i*175,262,85+i*175,282)+V(40+i*175,284,['','','',''],{c:'on'})).join('')}
  ${TL(10,300,'x','blue')}`,'Embedding plus positional encoding'),

vecops:S('0 0 540 300',`
  ${TL(10,24,'Concatenation · append','red')}
  ${V(20,46,[1,2,3])}${T(70,92,'+')}${V(20,106,[5,6,7])}${A(130,96,190,96)}${V(200,82,[1,2,3,5,6,7],{c:'on'})}
  ${T(290,128,'length grows: 3 + 3 = 6','sm muted')}
  ${TL(10,176,'Addition · element by element','blue')}
  ${V(20,196,[1,2,3])}${T(70,242,'+')}${V(20,256,[5,6,7])}${A(130,246,190,246)}${V(200,232,[6,8,10],{c:'on'})}
  ${T(345,245,'length stays 3','sm muted')}`,'Concatenation vs addition'),

order:S('0 0 540 250',`
  ${B(20,40,190,48,'Dog bites man')}${B(20,150,190,48,'Man bites dog')}
  ${A(210,64,300,110)}${A(210,174,300,140)}
  ${B(302,90,220,62,'{ dog, bites, man }','red dash')}
  ${T(412,182,'same set of tokens.\nsame meaning?','sm red')}`,'Order matters'),

sine:(()=>{const x0=40,xs=55,y0=125,ys=80;const pts=f=>Array.from({length:91},(_,k)=>{const p=k*0.09;return `${k?'L':'M'}${(x0+p*xs).toFixed(1)} ${(y0-f(p)*ys).toFixed(1)}`}).join(' ');
  const mk=(p,c,lab)=>`<circle class="dot" cx="${x0+p*xs}" cy="${y0-Math.sin(p)*ys}" r="5"/><circle class="dot" cx="${x0+p*xs}" cy="${y0-Math.cos(p)*ys}" r="5"/>${T(x0+p*xs,240,lab,'sm '+c)}`;
  return S('0 0 540 260',`${L(`M${x0} ${y0} L530 ${y0}`,'soft')}${L(`M${x0} 30 L${x0} 220`,'soft')}
   ${TL(8,y0-ys,'+1','sm muted')}${TL(8,y0+ys,'−1','sm muted')}
   ${L(pts(Math.sin),'pen')}${L(pts(Math.cos),'red')}
   ${L(`M${x0+xs} 30 L${x0+xs} 220`,'soft')}${L(`M${x0+2*xs} 30 L${x0+2*xs} 220`,'soft')}
   ${mk(1,'blue','pos 1')}${mk(2,'blue','pos 2')}
   ${TL(420,40,'sin','blue')}${TL(470,40,'cos','red')}
   ${TL(260,225,'x = position','sm muted')}`,'Sine and cosine curves')})(),

apple:S('0 0 540 280',`
  ${TL(10,40,'<tspan class="blue">Apple</tspan> launched a new phone')}
  ${TL(10,80,'while I was eating the <tspan class="red">apple</tspan>.')}
  ${A(40,58,110,150,'pen')}${A(280,98,380,150,'red')}
  ${V(40,154,['','','',''],{c:'blue'})}${T(100,206,'company / phone','sm blue')}
  ${V(320,154,['','','',''],{c:'pe'})}${T(380,206,'fruit','sm red')}
  ${T(270,252,'same word, two different contextual vectors','sm muted')}`,'Self-attention gives context'),

bank:(()=>{const arc=(x1,x2,y,h,w,lab,c)=>{if(x1===x2)return `${L(`M${x1-10} ${y} C${x1-34} ${y-h}, ${x1+34} ${y-h}, ${x1+10} ${y}`,c)}`.replace('class="ln','style="stroke-width:'+w+'" class="ln')+T(x1,y-h+8,lab,'svg-mono');
  const m=(x1+x2)/2;return `<path class="ln ${c}" style="stroke-width:${w}" d="M${x1} ${y} Q${m} ${y-h} ${x2} ${y}"/>`+T(m,y-h/2-12,lab,'svg-mono')};
  const row=(y,ws,wts,c)=>ws.map((w,i)=>B(40+i*170,y,120,40,w,i===1?'hot':'')).join('')+arc(270,100,y,90,1+wts[0]*12,wts[0],c)+arc(270,270,y,70,1+wts[1]*12,wts[1],c)+arc(270,440,y,90,1+wts[2]*12,wts[2],c);
  return S('0 0 540 320',`${row(120,['money','bank','grows'],[.62,.30,.08],'pen')}${row(270,['river','bank','flows'],[.58,.33,.09],'red')}
    ${TL(10,148,'S1','sm muted')}${TL(10,298,'S2','sm muted')}`,'Bank attends differently in two sentences')})(),

qkv:S('0 0 540 280',`
  ${B(10,112,100,50,'e_money','hot')}
  ${A(110,128,175,52)}${A(110,137,175,137)}${A(110,146,175,222)}
  ${[['W_Q',20,'pen'],['W_K',105,'pen'],['W_V',190,'red']].map(([n,y,c])=>`<g class="bx ${c}"><rect x="178" y="${y}" width="110" height="62" rx="6"/></g>${L(`M215 ${y} L215 ${y+62} M252 ${y} L252 ${y+62} M178 ${y+31} L288 ${y+31}`,'soft')}${T(233,y-8,n,'sm')}`).join('')}
  ${A(288,51,345,51)}${A(288,136,345,136)}${A(288,221,345,221)}
  ${V(350,38,['','','',''],{c:'blue'})}${TL(476,51,'q  query')}
  ${V(350,123,['','','',''],{c:'blue'})}${TL(476,136,'k  key')}
  ${V(350,208,['','','',''],{c:'pe'})}${TL(476,221,'v  value')}
  ${T(233,272,'learnable weights','sm red')}`,'Q K V projections'),

scaled:S('0 0 560 300',`
  ${B(20,40,90,44,'Q','pen')}${B(20,110,90,44,'K','pen')}${B(20,220,90,44,'V','red')}
  ${B(150,62,115,60,'Q · Kᵀ\nscores')}${A(110,62,148,84)}${A(110,132,148,104)}
  ${B(295,62,105,60,'÷ √dₖ\n= ÷ 8')}${A(265,92,293,92)}
  ${B(430,62,115,60,'softmax\nweights','hot')}${A(400,92,428,92)}
  ${B(295,212,105,60,'weights\n× V')}${A(110,242,293,242,'red')}${P('M487 122 Q487 190 402 230')}
  ${B(430,212,115,60,'Y\ncontext','pen')}${A(400,242,428,242)}
  ${T(207,160,'how much each word\nmatches every other word','sm muted')}`,'Scaled dot-product attention'),

dot:S('0 0 540 300',`
  ${TL(10,24,'Dot product = similarity score','red')}
  ${V(20,50,[1,2],{w:40,h:32})}${T(118,66,'·')}${V(140,40,[3],{w:40,h:28})}${V(140,68,[4],{w:40,h:28})}
  ${T(330,66,'= 1×3 + 2×4 = 11')}
  ${TL(10,140,'Softmax turns scores into weights','blue')}
  ${[[2.0,.66],[1.0,.24],[0.1,.10]].map(([s,w],i)=>`${TL(20,180+i*38,'s'+(i+1)+' = '+s.toFixed(1),'sm')}${A(118,180+i*38,150,180+i*38)}<rect class="bar ${i?'soft':''}" x="160" y="${168+i*38}" width="${w*330}" height="24" rx="4"/>${TL(170+w*330,180+i*38,'w'+(i+1)+' = '+w.toFixed(2),'svg-mono')}`).join('')}
  ${T(270,290,'wᵢ = eˢⁱ / (eˢ¹ + eˢ² + eˢ³)','sm muted')}`,'Dot product and softmax'),

sqrtdk:S('0 0 540 290',`
  ${L('M20 230 L520 230','soft')}
  ${[[1,0,0],[.67,.24,.09]].map((g,gi)=>g.map((p,i)=>`<rect class="bar ${gi?'':'red'}" x="${50+gi*260+i*62}" y="${230-Math.max(2,p*170)}" width="44" height="${Math.max(2,p*170)}" rx="4"/>${T(72+gi*260+i*62,220-Math.max(2,p*170),p.toFixed(2),'svg-mono')}`).join('')).join('')}
  ${T(135,255,'raw scores 24, 16, 8','sm red')}${T(395,255,'scaled ÷ 8 → 3, 2, 1','sm blue')}
  ${T(135,280,'one word takes everything','sm muted')}${T(395,280,'weights stay spread out','sm muted')}`,'Effect of scaling by root dk'),

multihead:S('0 0 560 290',`
  ${B(10,118,105,54,'X\nn × 512','hot')}
  ${['head 1','head 2','head 3','⋮','head 8'].map((h,i)=>(h==='⋮'?T(225,25+i*58,'⋮'):B(175,4+i*56,100,42,h,'pen'))+(h==='⋮'?'':A(115,145,173,25+i*56)+A(275,25+i*56,333,145))).join('')}
  ${T(225,286,'8 heads × 64-d each','sm muted')}
  ${B(335,112,105,66,'concat\n8 × 64\n= 512')}${A(440,145,463,145)}
  ${B(465,118,85,54,'× W_O','red')}`,'Multi-head attention'),

residual:S('0 0 560 260',`
  ${B(10,60,95,46,'sunny')}${B(150,60,110,46,'sunlight')}${B(305,60,95,46,'dhoop')}${B(445,60,100,46,'bright')}
  ${A(105,83,148,83)}${A(260,83,303,83)}${A(400,83,443,83)}
  ${P('M57 106 Q57 150 200 150 L470 150 Q495 150 495 112','red')}${T(275,166,'skip connection · add the original input back','sm red')}
  ${A(495,106,495,200)}${B(400,198,150,50,'bright + sunny','hot')}
  ${T(190,222,'output = x + F(x)','blue')}`,'Residual connection analogy'),

addnorm:S('0 0 540 270',`
  ${V(20,40,['1','1','2'])}${T(130,53,'x  input','sm muted')}
  ${T(65,92,'+','red')}
  ${V(20,106,['1','3','4'],{c:'blue'})}${T(140,119,'z  attention','sm muted')}
  ${A(110,150,205,150)}${V(210,137,['2','4','6'],{c:'on'})}${T(255,182,'x + z','sm muted')}
  ${A(300,150,335,150)}${B(337,128,90,44,'LayerNorm','pen')}${A(427,150,440,150)}
  ${V(205,214,['−1.22','0','1.22'],{w:56})}${P('M480 172 Q480 228 375 228')}
  ${T(290,262,'mean 0, spread 1 · per token','sm red')}`,'Add and layer normalization'),

ffn:(()=>{const col=(x,n,y0,gap)=>Array.from({length:n},(_,i)=>[x,y0+i*gap]);const a=col(90,3,80,60),b=col(270,6,30,40),c=col(450,3,80,60);
  const edges=(p,q)=>p.flatMap(([x1,y1])=>q.map(([x2,y2])=>`M${x1} ${y1} L${x2} ${y2}`)).join(' ');
  return S('0 0 540 290',`<path class="ln soft" d="${edges(a,b)} ${edges(b,c)}"/>
   ${[...a,...b,...c].map(([x,y])=>`<circle class="dot" cx="${x}" cy="${y}" r="11"/>`).join('')}
   ${b.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" style="fill:var(--pen)"/>`).join('')}
   ${T(90,270,'512','svg-mono')}${T(270,270,'2048 · ReLU','svg-mono')}${T(450,270,'512','svg-mono')}
   ${T(90,30,'in','sm muted')}${T(450,30,'out','sm muted')}`,'Feed-forward network')})(),

encoder:S('0 0 380 470',`
  ${B(100,410,240,46,'x = embedding + position','hot')}
  ${A(220,410,220,378)}${B(100,330,240,46,'Multi-head self-attention','pen')}
  ${A(220,330,220,302)}${B(100,262,240,38,'Add & LayerNorm')}
  ${A(220,262,220,232)}${B(100,184,240,46,'Feed-forward (FFN)')}
  ${A(220,184,220,152)}${B(100,114,240,38,'Add & LayerNorm')}
  ${A(220,114,220,72)}${B(70,22,300,48,'next encoder · or the decoder','red dash')}
  ${P('M220 396 L40 396 L40 281 L96 281','red')}${P('M220 246 L40 246 L40 133 L96 133','red')}
  ${T(30,340,'skip','sm red')}${T(30,190,'skip','sm red')}`,'One encoder block'),

full:S('0 0 560 520',`
  <g class="bx dash"><rect x="25" y="228" width="230" height="190" rx="14"/></g>${T(20,240,'N×','sm red')}
  ${B(40,370,200,32,'Multi-head attention','pen')}${B(40,330,200,30,'Add & Norm')}${B(40,286,200,32,'Feed-forward')}${B(40,246,200,30,'Add & Norm')}
  ${B(40,466,200,38,'inputs + positions','hot')}${A(140,466,140,404)}${A(140,370,140,362)}${A(140,330,140,320)}${A(140,286,140,278)}
  ${T(140,210,'ENCODER','blue')}
  <g class="bx dash"><rect x="295" y="150" width="250" height="268" rx="14"/></g>${T(540,162,'N×','sm red')}
  ${B(310,374,220,32,'Masked multi-head attn','red')}${B(310,334,220,30,'Add & Norm')}${B(310,288,220,34,'Cross-attention','pen')}${B(310,248,220,30,'Add & Norm')}${B(310,204,220,32,'Feed-forward')}${B(310,164,220,30,'Add & Norm')}
  ${B(310,466,220,38,'outputs, shifted right','hot')}${A(420,466,420,408)}${A(420,374,420,366)}${A(420,334,420,324)}${A(420,288,420,280)}${A(420,248,420,238)}${A(420,204,420,196)}
  ${A(420,164,420,128)}${B(340,94,160,32,'Linear')}${A(420,94,420,74)}${B(340,40,160,32,'Softmax','hot')}${T(420,16,'next-word probabilities','sm blue')}
  ${P('M240 261 L275 261 L275 305 L308 305','pen')}${T(140,176,'K, V →\ncross-attention','sm blue')}`,'Full Transformer architecture'),

mask:(()=>{const w=['I','love','my','country'];return S('0 0 540 280',`
  ${w.map((t,i)=>T(170+i*70,24,t,'sm')+TL(20,70+i*52,t,'sm')).join('')}
  ${w.map((_,r)=>w.map((_,c)=>`<rect class="cell ${c<=r?'on':''}" x="${140+c*70}" y="${46+r*52}" width="60" height="44" rx="5"/>${T(170+c*70,68+r*52,c<=r?'✓':'−∞',c<=r?'blue':'red')}`).join('')).join('')}
  ${T(270,270,'a word may only look at itself and earlier words','sm muted')}`,'Masked attention grid')})(),

layers:S('0 0 540 300',`
  ${[['Layer 12','deep context'],['Layer 6','sentence understanding'],['Layer 3','phrase meaning'],['Layer 1','basic word relations']].map(([l,d],i)=>B(30,20+i*62,170,48,l,i?'':'hot')+TL(220,44+i*62,d)).join('')}
  ${P('M18 262 L18 30','red')}${T(110,285,'each layer refines the representation','sm red')}`,'Layer hierarchy'),

families:S('0 0 560 280',`
  ${B(10,30,170,52,'Encoder only','pen')}${B(195,30,170,52,'Encoder–decoder')}${B(380,30,170,52,'Decoder only','hot')}
  ${T(95,118,'BERT\nRoBERTa','sm')}${T(280,118,'original Transformer\nT5 · BART','sm')}
  ${T(465,140,'GPT · Claude Sonnet\nLlama · Qwen\nDeepSeek · Gemini','sm')}
  ${T(95,200,'understands text\n(classify, search)','sm muted')}${T(280,200,'translate,\nsummarize','sm muted')}${T(465,222,'generates text,\nnext-word prediction','sm muted')}`,'Transformer families'),

shapes:S('0 0 560 270',`
  ${V(10,40,['','','','','',''],{w:28})}${T(94,90,'e_money · 1 × 512','sm')}
  ${T(200,53,'×')}
  ${M(225,18,4,3,34,22,'blue')}${T(276,120,'W_Q · 512 × 64','sm blue')}
  ${A(335,53,375,53)}${V(380,40,['','','',''],{w:28,c:'on'})}${T(436,90,'q · 1 × 64','sm')}
  ${T(280,170,'(1 × 512) · (512 × 64) = (1 × 64)','svg-mono')}
  ${B(150,200,260,52,'so dₖ = 64,  √dₖ = 8','hot')}`,'Matrix shapes for Q'),

ambig:(()=>{const row=(y,ws,arcs)=>{const xs=[];let x=14;const out=ws.map(w=>{const wd=Math.max(44,w.length*11+16);xs.push(x+wd/2);const r=B(x,y,wd,34,w,'','sm');x+=wd+6;return r}).join('');
   const arc=([i,j,h,c,lab])=>{const m=(xs[i]+xs[j])/2,yy=h>0?y:y+34;return `<path class="ln ${c}" style="stroke-width:2.4" d="M${xs[i]} ${yy} Q${m} ${yy-h} ${xs[j]} ${yy}"/>`+T(m,yy-h/2+(h>0?-10:10),lab,'sm '+(c==='pen'?'blue':'red'))};
   return out+arcs.map(arc).join('')};
  return S('0 0 560 330',`${row(70,['The','chicken','is','ready','to','eat'],[[1,5,56,'pen','head 1: the chicken is food'],[1,5,-56,'red','head 2: the chicken is hungry']])}
   ${row(240,['Man','saw','the','astronomer','with','a','telescope'],[[0,6,90,'pen','head 1: the man has it'],[3,6,-56,'red','head 2: the astronomer has it']])}`,'Two heads, two readings')})(),

concat:S('0 0 560 260',`
  ${M(14,30,2,3,26,26,'blue')}${T(53,100,'CE head 1\n2 × 3','sm blue')}
  ${M(14,150,2,3,26,26,'pe')}${T(53,220,'CE head 2\n2 × 3','sm red')}
  ${A(100,56,160,96)}${A(100,176,160,120)}
  ${M(165,82,2,6,24,26,'on')}${T(237,152,'concat · 2 × 6','sm')}
  ${T(325,108,'×')}
  ${M(345,30,6,3,24,22,'')}${T(381,178,'W_O · 6 × 3\nlearnable','sm')}
  ${A(425,108,460,108)}${M(465,82,2,3,26,26,'on')}${T(504,152,'final · 2 × 3','sm')}
  ${T(280,240,'rows = money, bank · back to the original width','sm muted')}`,'Concatenating heads'),

scaling:S('0 0 540 280',`
  ${TL(10,22,'raw values','sm muted')}${V(20,40,[2,4,6],{w:44})}
  ${A(160,53,200,30)}${A(160,53,200,120)}
  ${TL(210,16,'min-max → [0, 1]','sm red')}${V(210,30,['0','0.5','1'],{w:56,c:'pe'})}
  ${TL(210,104,'standard → μ 0, σ 1','sm blue')}${V(210,118,['−1.22','0','1.22'],{w:56,c:'blue'})}
  ${A(294,146,294,180,'pen')}
  ${B(150,184,290,44,'× γ + β   (γ = [1,1,1], β = [0,0,0] at start)','hot','sm')}
  ${T(295,256,'LayerNorm uses the standard version, per token','sm muted')}`,'Normalization types'),

nmt:S('0 0 560 270',`
  ${B(30,60,180,130,'Encoder\nreads the\nsource','pen')}${B(350,60,180,130,'Decoder\nwrites the\ntarget','red')}
  ${M(235,30,2,3,22,18,'on')}${T(268,80,'context','sm muted')}
  ${P('M210 100 L330 100 L330 125 L348 125','pen')}
  ${A(120,235,120,192)}${A(440,192,440,235,'red')}
  ${T(120,252,'We are friends')}${T(440,252,'हम दोस्त हैं')}
  ${T(280,18,'original task: machine translation','sm muted')}`,'Encoder reads, decoder writes'),

autoreg:S('0 0 560 300',`
  ${TL(8,18,'LSTM · training and prediction are both step by step','sm red')}
  ${['Nice','to','meet','you'].map((w,i)=>B(14+i*136,36,100,40,'LSTM','','sm')+T(64+i*136,92,'t'+i+' · '+w,'sm muted')).join('')}
  ${A(114,56,148,56)}${A(250,56,284,56)}${A(386,56,420,56)}
  ${TL(8,140,'Transformer decoder at inference · one word per pass','sm blue')}
  ${[['<SOS>','हम'],['<SOS> हम','दोस्त'],['<SOS> हम दोस्त','हैं']].map(([inp,out],i)=>`${B(14,158+i*46,230,36,inp,'','sm')}${A(244,176+i*46,300,176+i*46,'pen')}${B(304,158+i*46,110,36,'decoder','pen','sm')}${A(414,176+i*46,446,176+i*46,'pen')}${B(450,158+i*46,96,36,out,'hot','sm')}`).join('')}`,'Autoregressive generation'),

shifted:S('0 0 560 250',`
  ${TL(8,30,'target','sm muted')}${['हम','दोस्त','हैं','<EOS>'].map((w,i)=>B(120+i*108,12,96,38,w,'hot','sm')).join('')}
  ${[0,1,2,3].map(i=>A(168+i*108,132,168+i*108,54,'pen')).join('')}
  ${T(340,93,'predicts the next word','sm blue')}
  ${TL(8,154,'decoder input','sm muted')}${['<SOS>','हम','दोस्त','हैं'].map((w,i)=>B(120+i*108,136,96,38,w,i?'':'red','sm')).join('')}
  ${P('M168 196 Q168 232 260 232 L392 232','red')}${T(290,218,'everything moves one step right','sm red')}`,'Shifted right'),

maskflow:(()=>{const g=(x,y,vals,c)=>vals.map((r,i)=>r.map((v,j)=>`<rect class="cell ${typeof c==='function'?c(i,j):c}" x="${x+j*42}" y="${y+i*32}" width="42" height="32"/>${T(x+j*42+21,y+i*32+16,v,'svg-mono')}`).join('')).join('');
  const S3=[['s11','s12','s13'],['s21','s22','s23'],['s31','s32','s33']];
  const Mk=[['0','−∞','−∞'],['0','0','−∞'],['0','0','0']];
  const W=[['w11','0','0'],['w21','w22','0'],['w31','w32','w33']];
  return S('0 0 560 290',`${g(10,20,S3,'')}${T(73,132,'scaled scores','sm')}${T(150,68,'+')}
   ${g(165,20,Mk,(i,j)=>j>i?'pe':'')}${T(228,132,'mask','sm red')}${A(296,68,330,68)}
   ${g(335,20,S3.map((r,i)=>r.map((v,j)=>j>i?'−∞':v)),(i,j)=>j>i?'pe':'')}${T(398,132,'masked scores','sm')}
   ${P('M398 120 Q398 200 300 214','pen')}${T(468,170,'softmax','sm blue')}
   ${g(165,180,W,(i,j)=>j>i?'':'on')}${T(228,290-4,'weights · future = 0','sm blue')}`,'Masking step by step')})(),

selfcross:(()=>{const grid=(x,rows,cols,big)=>`${cols.map((c,j)=>T(x+70+j*56,40,c,'sm')).join('')}${rows.map((r,i)=>T(x+20,82+i*50,r,'sm')).join('')}
   ${rows.map((_,i)=>cols.map((_,j)=>`<rect class="cell" x="${x+42+j*56}" y="${58+i*50}" width="56" height="50"/><circle cx="${x+70+j*56}" cy="${83+i*50}" r="${big[i][j]}" style="fill:var(--pen)"/>`).join('')).join('')}`;
  return S('0 0 560 280',`${grid(0,['we','are','friends'],['we','are','friends'],[[10,3,4],[4,10,3],[4,3,10]])}
   ${grid(290,['हम','दोस्त','हैं'],['we','are','friends'],[[10,2,4],[2,3,10],[2,8,3]])}
   ${T(130,235,'self-attention\nsame sequence','sm')}${T(420,235,'cross-attention\ntwo different sequences','sm')}
   ${T(530,20,'Q ↓  K →','sm muted')}`,'Self vs cross attention grids')})(),

crosscalc:S('0 0 560 290',`
  ${B(10,30,150,48,'decoder: हम दोस्त हैं','red','sm')}${B(10,190,150,48,'encoder: we are friends','pen','sm')}
  ${A(160,54,215,54,'red')}${A(160,206,215,140,'pen')}${A(160,222,215,232,'pen')}
  ${B(218,34,60,40,'Q','red')}${B(218,120,60,40,'K','pen')}${B(218,212,60,40,'V','pen')}
  ${B(310,60,120,56,'QKᵀ / √dₖ\n3 × 3')}${A(278,54,308,78)}${A(278,140,308,100)}
  ${B(450,60,100,56,'softmax','hot')}${A(430,88,448,88)}
  ${B(380,200,170,56,'weights × V\nCE for हम, दोस्त, हैं','hot','sm')}${A(278,232,378,228)}${A(500,116,480,198)}`,'Cross-attention calculation'),

decoder:S('0 0 400 540',`
  ${B(80,488,240,40,'x = e + p  (shifted right)','hot','sm')}
  ${A(200,488,200,462)}${B(80,422,240,40,'Masked self-attention','red','sm')}
  ${A(200,422,200,402)}${B(80,368,240,32,'Add & LayerNorm','','sm')}
  ${A(200,368,200,346)}${B(80,306,240,40,'Cross-attention','pen','sm')}
  ${A(200,306,200,286)}${B(80,252,240,32,'Add & LayerNorm','','sm')}
  ${A(200,252,200,230)}${B(80,190,240,40,'Feed-forward','','sm')}
  ${A(200,190,200,170)}${B(80,136,240,32,'Add & LayerNorm','','sm')}
  ${A(200,136,200,114)}${B(80,78,240,34,'Linear (vocab size)','','sm')}
  ${A(200,78,200,58)}${B(80,20,240,36,'Softmax → next word','hot','sm')}
  ${P('M380 326 L325 326','pen')}${T(372,290,'K, V\nfrom\nencoder','sm blue')}
  ${P('M200 476 L40 476 L40 384 L76 384','red')}${P('M200 412 L40 412 L40 268 L76 268','red')}${P('M200 296 L40 296 L40 152 L76 152','red')}
  ${T(22,440,'skip','sm red')}`,'One decoder block'),

linear:S('0 0 560 290',`
  ${V(10,30,['','','','','',''],{w:28,c:'on',label:'FFN output · 512'})}
  ${A(180,43,220,43)}${B(222,22,320,44,'Linear · 512 → vocab size','pen','sm')}
  ${A(380,66,380,92)}${B(260,94,240,38,'Softmax','hot','sm')}
  ${[['<SOS>',0],['हम',.7],['दोस्त',.2],['हैं',.1]].map(([w,p],i)=>`${TL(20,160+i*30,w,'sm')}<rect class="bar ${i===1?'':'soft'}" x="110" y="${149+i*30}" width="${Math.max(3,p*330)}" height="22" rx="4"/>${TL(120+Math.max(3,p*330),160+i*30,p.toFixed(1),'svg-mono')}`).join('')}
  ${T(470,190,'actual: हम\nloss compares\nthe two','sm red')}`,'Linear and softmax output')
};

