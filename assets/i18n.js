/* Troca de idioma PT/EN do site.
   - Português é o conteúdo do HTML; o inglês vem de window.PAGE_EN (definido por página).
   - data-i18n="chave"            → troca o innerHTML
   - data-i18n-attr="alt:chave;aria-label:chave2" → troca atributos
   - img.l10n                       → troca img/x.webp ↔ img/en/x.webp
   - Componentes montados por JS escutam o evento "langchange" e usam I18N.L(pt, en). */
(function(){
  var KEY='a11y-site-lang';
  var lang;
  try{lang=localStorage.getItem(KEY)}catch(e){}
  if(lang!=='pt'&&lang!=='en'){lang=/^pt/i.test(navigator.language||'pt')?'pt':'en';}
  var orig=new WeakMap(), origAttr=new WeakMap(), origTitle=document.title, origDesc=null;

  function dict(){return window.PAGE_EN||{}}
  function L(pt,en){return lang==='en'?en:pt}

  function swapImg(img){
    var src=img.getAttribute('src');if(!src)return;
    var m=src.match(/^(.*img\/)(en\/)?([^\/]+)$/);if(!m)return;
    img.setAttribute('src',m[1]+(lang==='en'?'en/':'')+m[3]);
  }
  function apply(){
    var d=dict();
    document.documentElement.lang=lang==='en'?'en':'pt-BR';
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      if(!orig.has(el))orig.set(el,el.innerHTML);
      var k=el.getAttribute('data-i18n');
      el.innerHTML=(lang==='en'&&d[k]!=null)?d[k]:orig.get(el);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function(el){
      var pairs=el.getAttribute('data-i18n-attr').split(';');
      if(!origAttr.has(el)){var o={};pairs.forEach(function(p){var a=p.split(':')[0].trim();o[a]=el.getAttribute(a)});origAttr.set(el,o);}
      var o2=origAttr.get(el);
      pairs.forEach(function(p){var s=p.split(':'),a=s[0].trim(),k=(s[1]||'').trim();
        var v=(lang==='en'&&d[k]!=null)?d[k]:o2[a];if(v!=null)el.setAttribute(a,v);});
    });
    document.querySelectorAll('img.l10n').forEach(swapImg);
    if(d._title)document.title=lang==='en'?d._title:origTitle;
    var md=document.querySelector('meta[name="description"]');
    if(md){if(origDesc===null)origDesc=md.getAttribute('content');md.setAttribute('content',lang==='en'&&d._desc?d._desc:origDesc);}
    document.querySelectorAll('.lang button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.lang===lang?'true':'false')});
    document.dispatchEvent(new CustomEvent('langchange',{detail:{lang:lang}}));
  }
  function set(l){if(l===lang)return;lang=l;try{localStorage.setItem(KEY,l)}catch(e){}apply();
    var live=document.getElementById('lang-live');if(live)live.textContent=l==='en'?'Page in English':'Página em português';}

  function mountSwitch(){
    document.querySelectorAll('[data-lang-switch]').forEach(function(host){
      host.innerHTML='<div class="lang" role="group" aria-label="Idioma / Language">'+
        '<button type="button" data-lang="pt" lang="pt-BR" aria-label="Português">PT</button>'+
        '<button type="button" data-lang="en" lang="en" aria-label="English">EN</button></div>';
      host.addEventListener('click',function(e){var b=e.target.closest('[data-lang]');if(b)set(b.dataset.lang)});
    });
    var live=document.createElement('p');live.id='lang-live';live.className='visually-hidden';live.setAttribute('aria-live','polite');document.body.appendChild(live);
  }
  window.I18N={get lang(){return lang},L:L,set:set,apply:apply};
  function boot(){mountSwitch();apply();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0);
})();
