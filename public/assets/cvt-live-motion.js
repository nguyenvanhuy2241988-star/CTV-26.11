(()=>{'use strict';
document.documentElement.classList.add('cvt-motion-enabled');
document.querySelectorAll('.cvt-global-motion,.cvt-motion-toggle').forEach(button=>button.remove());
document.querySelectorAll('.cvt-showcase').forEach(root=>root.classList.remove('cvt-paused'));
const selectors=[['.home-cover img',[{transform:'scale(1.01)'},{transform:'scale(1.07)'}],9000],['.cvt-show-art img',[{transform:'translateY(12px) rotate(-5deg)'},{transform:'translateY(-22px) rotate(4deg)'}],2400],['.catalog-packs img',[{transform:'translateY(10px) rotate(-4deg)'},{transform:'translateY(-14px) rotate(4deg)'}],2000],['.cvt-range-visual img',[{transform:'translateY(4px)'},{transform:'translateY(-9px)'}],2500]];
selectors.forEach(([selector,keyframes,duration])=>document.querySelectorAll(selector).forEach((node,i)=>{if(typeof node.animate!=='function')return;node.style.setProperty('animation','none','important');node.animate(keyframes,{duration,iterations:Infinity,direction:'alternate',easing:'ease-in-out',delay:-i*450});}));
})();
