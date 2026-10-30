(()=>{
const G=window.GALLERY||{},dlg=document.getElementById('lightbox'),img=document.getElementById('lb-img'),
title=document.getElementById('lb-title'),count=document.getElementById('lb-count'),
prev=dlg.querySelector('.lb-prev'),next=dlg.querySelector('.lb-next');
let cur=null,i=0;
function show(){const p=G[cur];img.src=p.images[i];img.alt=p.alts?p.alts[i]:p.title+' — image '+(i+1);if(p.titles)title.textContent=p.titles[i];count.textContent=(i+1)+' / '+p.images.length;
 const multi=p.images.length>1;prev.hidden=next.hidden=!multi;}
document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>{cur=b.dataset.project;i=+(b.dataset.index||0);title.textContent=G[cur].title;show();
 if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');}));
prev.addEventListener('click',()=>{const n=G[cur].images.length;i=(i-1+n)%n;show();});
next.addEventListener('click',()=>{const n=G[cur].images.length;i=(i+1)%n;show();});
dlg.querySelector('.lb-close').addEventListener('click',()=>dlg.close());
dlg.addEventListener('click',e=>{if(e.target===dlg||e.target.classList.contains('lb-stage'))dlg.close();});
document.addEventListener('keydown',e=>{if(!dlg.open)return;if(e.key==='ArrowRight')next.click();if(e.key==='ArrowLeft')prev.click();});
let sx=0;img.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
img.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>40)(d<0?next:prev).click();});
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}}),{rootMargin:'0px 0px -8% 0px'});
 document.querySelectorAll('.section-head,.feature,.work-card,.art-tile,.service,.studio-art,.studio-body,.contact > *').forEach(el=>{el.classList.add('reveal');io.observe(el);});}
})();

/* Cross-site crossfade (Aspection -> Omnidra) + arrival from omnidraglobal.com. Vanilla, rAF-throttled. */
(()=>{
const root=document.documentElement,mq=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
// arrival: ?from=omnidra -> start on the frame Omnidra's studio section ended on, then settle into the page
if(/[?&]from=omnidra(&|$)/.test(location.search)){try{history.replaceState(null,'',location.pathname+location.hash)}catch(e){}}
if(root.classList.contains('arrive')){setTimeout(()=>root.classList.add('arrive-go'),420);setTimeout(()=>root.classList.remove('arrive','arrive-go'),1700);}
const sec=document.querySelector('.xf-omni');if(!sec)return;
const stage=sec.querySelector('.xf-stage'),canvas=sec.querySelector('.xo-field');
root.classList.add('xf-js');
const clamp=(v)=>v<0?0:v>1?1:v,ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,seg=(p,a,b)=>ease(clamp((p-a)/(b-a)));
let raf=0,near=false,last='',bgV=0,stageOn=false;
function apply(p){
  const rm=mq.matches;
  let out=seg(p,.04,.46),bg=seg(p,.1,.66),inn=seg(p,.36,.84),nav=seg(p,.55,.92),xnav=seg(p,.5,.85);
  if(rm){out=p>=.3?1:0;bg=inn=nav=xnav=out;}
  const key=[out,bg,inn,nav,xnav].map(v=>v.toFixed(3)).join();
  if(key===last)return;last=key;bgV=bg;
  const s=sec.style;s.setProperty('--out',out.toFixed(3));s.setProperty('--bg',bg.toFixed(3));s.setProperty('--in',inn.toFixed(3));s.setProperty('--nav',nav.toFixed(3));
  root.style.setProperty('--xnav',xnav.toFixed(3));
  if(inn>.6)sec.setAttribute('data-end','');else sec.removeAttribute('data-end');
  field.update();
}
function tick(){raf=0;const r=sec.getBoundingClientRect(),D=sec.offsetHeight-stage.offsetHeight;
  stageOn=r.top<innerHeight&&r.bottom>0;apply(D>0?clamp(-r.top/D):1);}
function req(){if(!raf)raf=requestAnimationFrame(tick);}
sec.classList.toggle('xf-rm',mq.matches);
// the Omnidra field: the same Zig program omnidraglobal.com's hero runs, compiled to WebAssembly (2 KB)
const field=(()=>{let ex=null,img=null,ctx=null,loading=false,run=false,fr=0,bw=0,bh=0,lt=0;
  const api={update(){}};
  if(!canvas||typeof WebAssembly!=='object'||!canvas.getContext){sec.classList.add('xf-no-field');return api;}
  function size(){const r=stage.getBoundingClientRect(),cw=Math.max(1,Math.round(r.width)),ch=Math.max(1,Math.round(r.height));
    const sc=Math.min(.85,Math.sqrt(400000/(cw*ch)));bw=Math.max(16,Math.floor(cw*sc));bh=Math.max(16,Math.floor(ch*sc));
    const n=Math.round(Math.min(2200,Math.max(500,(cw*ch)/420)));if(!ex.init(bw,bh,n,(Math.random()*4294967295)>>>0))return false;
    canvas.width=bw;canvas.height=bh;img=new ImageData(new Uint8ClampedArray(ex.memory.buffer,ex.pixels_ptr(),bw*bh*4),bw,bh);return true;}
  function draw(n){ex.step(n);ctx.putImageData(img,0,0);}
  function frame(t){fr=0;if(!run)return;const dt=lt?t-lt:16.7;lt=t;draw(Math.max(1,Math.min(3,Math.round(dt/16.7))));fr=requestAnimationFrame(frame);}
  function load(){if(loading)return;loading=true;ctx=canvas.getContext('2d');
    const go=b=>WebAssembly.instantiate(b,{}).then(res=>{ex=res.instance.exports;if(!size())throw 0;draw(mq.matches?360:90);api.update();});
    fetch('omnidra-field.wasm').then(r=>r.arrayBuffer()).then(go).catch(()=>{ex=null;sec.classList.add('xf-no-field');});}
  api.load=load;
  api.update=()=>{if(!ex){if(near)load();return;}const want=stageOn&&bgV>.02&&!document.hidden&&!mq.matches;
    if(want&&!run){run=true;lt=0;if(!fr)fr=requestAnimationFrame(frame);}else if(!want&&run){run=false;if(fr)cancelAnimationFrame(fr);fr=0;}};
  let rt=0,lw=innerWidth;addEventListener('resize',()=>{if(!ex||Math.abs(innerWidth-lw)<2)return;clearTimeout(rt);rt=setTimeout(()=>{lw=innerWidth;if(size())draw(90);},180);});
  document.addEventListener('visibilitychange',()=>api.update());
  return api;})();
const onScroll=()=>{if(near)req();};
if('IntersectionObserver' in window){new IntersectionObserver(es=>{near=es[0].isIntersecting;if(near){field.update();req();}else field.update();},{rootMargin:'100% 0px 100% 0px'}).observe(sec);}else{near=true;}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',req);
const onMq=()=>{sec.classList.toggle('xf-rm',mq.matches);last='';req();};if(mq.addEventListener)mq.addEventListener('change',onMq);else if(mq.addListener)mq.addListener(onMq);
tick();
})();
