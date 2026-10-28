(()=>{
const G=window.GALLERY||{},dlg=document.getElementById('lightbox'),img=document.getElementById('lb-img'),
title=document.getElementById('lb-title'),count=document.getElementById('lb-count'),
prev=dlg.querySelector('.lb-prev'),next=dlg.querySelector('.lb-next');
let cur=null,i=0;
function show(){const p=G[cur];img.src=p.images[i];img.alt=p.title+' — image '+(i+1);count.textContent=(i+1)+' / '+p.images.length;
 const multi=p.images.length>1;prev.hidden=next.hidden=!multi;}
document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>{cur=b.dataset.project;i=0;title.textContent=G[cur].title;show();
 if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');}));
prev.addEventListener('click',()=>{const n=G[cur].images.length;i=(i-1+n)%n;show();});
next.addEventListener('click',()=>{const n=G[cur].images.length;i=(i+1)%n;show();});
dlg.querySelector('.lb-close').addEventListener('click',()=>dlg.close());
dlg.addEventListener('click',e=>{if(e.target===dlg||e.target.classList.contains('lb-stage'))dlg.close();});
document.addEventListener('keydown',e=>{if(!dlg.open)return;if(e.key==='ArrowRight')next.click();if(e.key==='ArrowLeft')prev.click();});
let sx=0;img.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
img.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>40)(d<0?next:prev).click();});
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}}),{rootMargin:'0px 0px -8% 0px'});
 document.querySelectorAll('.section-head,.feature,.work-card,.service,.studio-art,.studio-body,.contact > *').forEach(el=>{el.classList.add('reveal');io.observe(el);});}
})();
