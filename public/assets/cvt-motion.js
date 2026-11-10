
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.body.classList.add('cvt-motion-ready');
const bar=document.createElement('div');bar.className='cvt-scroll-progress';bar.setAttribute('aria-hidden','true');document.body.append(bar);
const header=document.querySelector('.brand-header');let ticking=false;
function update(){const range=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(range>0?Math.min(1,Math.max(0,scrollY/range)):0)+')';if(header)header.classList.toggle('cvt-scrolled',scrollY>24);ticking=false}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true}},{passive:true});addEventListener('resize',update);update();
if(!reduced&&'IntersectionObserver' in window){
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('cvt-visible');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -24px 0px'});
document.querySelectorAll('.content-section .copy,.section-head,.life-intro,.life-card,.article-card,.feature-card,.p-section-intro,.p-config-copy,.sizes>div,.faq>div,.buy,.wide-cta').forEach((el,i)=>{el.classList.add('cvt-reveal');el.style.setProperty('--cvt-delay',((el.matches('.life-card,.article-card,.feature-card')?i%3:0)*65)+'ms');observer.observe(el)});
}
const ticker=document.querySelector('.marquee');
if(ticker&&!ticker.querySelector('.cvt-ticker-track')){const track=document.createElement('div');track.className='cvt-ticker-track';const group=document.createElement('span');while(ticker.firstChild)group.append(ticker.firstChild);track.append(group,group.cloneNode(true));ticker.append(track);ticker.classList.add('cvt-ticker')}
const pack=document.querySelector('#p-flavor-pack');
if(pack&&!reduced&&typeof pack.animate==='function'){let last=pack.getAttribute('src');new MutationObserver(()=>{const next=pack.getAttribute('src');if(next!==last){last=next;pack.animate([{opacity:.2,transform:'translateY(20px) rotate(-7deg) scale(.94)'},{opacity:1,transform:'translateY(0) rotate(0) scale(1)'}],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)'})}}).observe(pack,{attributes:true,attributeFilter:['src']})}
document.querySelectorAll('[data-size]').forEach(button=>button.addEventListener('click',()=>{const panel=document.querySelector('.size-panel');if(panel&&!reduced&&panel.animate)panel.animate([{opacity:.5,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:300,easing:'ease-out'})}));
})();