/* Demonstração do A11Y for Moodle rodando no próprio site.
   6 das 30 opções, com os mesmos comportamentos do painel real:
   Alt+A abre/fecha, Esc fecha e devolve o foco, focus trap, aria-live no contador. */
(function(){
  var KEY='a11y-site-demo';
  var OPTS=[
    {id:'font',label:['Fonte Legível','Readable Font'],desc:['Aplica Atkinson Hyperlegible em tudo','Applies Atkinson Hyperlegible everywhere'],type:'toggle',icon:'<path d="M4 7V4h16v3M9 20h6M12 4v16"/>'},
    {id:'size',label:['Tamanho do Texto','Text Size'],desc:['Três níveis de aumento','Three enlargement levels'],type:'level',max:3,icon:'<path d="M3 19 8 6l5 13M4.8 15h6.4M15 19l3-8 3 8M15.9 16.7h4.2"/>'},
    {id:'contrast',label:['Alto Contraste','High Contrast'],desc:['Fundo escuro e texto claro','Dark background, light text'],type:'toggle',icon:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>'},
    {id:'links',label:['Destacar Links','Highlight Links'],desc:['Sublinha e contorna os links','Underlines and outlines links'],type:'toggle',icon:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'},
    {id:'pause',label:['Pausar Animações','Pause Animations'],desc:['Para todo movimento do site','Stops all motion on the site'],type:'toggle',icon:'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>'},
    {id:'guide',label:['Guia de Leitura','Reading Guide'],desc:['Uma linha acompanha o ponteiro','A line follows the pointer'],type:'toggle',icon:'<path d="M3 12h18M3 6h10M3 18h14"/>'}
  ];
  var T=function(p,e){return window.I18N&&I18N.lang==='en'?e:p};var tx=function(a){return T(a[0],a[1])};
  var state={};
  try{state=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){state={}}

  var css=`
  .a11yx-fab{position:fixed;right:max(20px,env(safe-area-inset-right,0px));bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:90;width:56px;height:56px;border-radius:50%;border:0;background:var(--accent);color:var(--on-accent);display:grid;place-items:center;cursor:pointer;box-shadow:0 10px 30px -8px rgba(20,60,160,.55)}
  .a11yx-fab:hover{transform:scale(1.05)}
  html.a11yx-away .a11yx-fab{opacity:0;visibility:hidden;transform:scale(.6);transition:opacity .2s,transform .2s,visibility 0s .2s}
  .a11yx-fab{transition:opacity .2s,transform .2s}
  .a11yx-fab__badge{position:absolute;top:-2px;right:-2px;min-width:20px;height:20px;border-radius:10px;background:var(--fg);color:var(--bg);font:700 .7rem/20px var(--font-body);padding:0 5px}
  .a11yx-panel{position:fixed;right:max(20px,env(safe-area-inset-right,0px));bottom:calc(88px + env(safe-area-inset-bottom,0px));z-index:91;width:min(360px,calc(100vw - 32px));max-height:min(620px,calc(100vh - 120px));overflow:auto;background:var(--surface);color:var(--fg);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow);font-family:var(--font-body)}
  .a11yx-panel header{display:flex;gap:12px;align-items:center;padding:16px 16px 12px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--surface)}
  .a11yx-panel header .ic{width:36px;height:36px;border-radius:10px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;flex:none}
  .a11yx-panel h2{font-size:1rem;letter-spacing:0}
  .a11yx-panel header p{font-size:.8rem;color:var(--muted)}
  .a11yx-panel .x{margin-left:auto;display:flex;gap:6px}
  .a11yx-ib{width:34px;height:34px;border-radius:9px;border:1px solid var(--line);background:var(--surface);color:var(--fg);display:grid;place-items:center;cursor:pointer}
  .a11yx-note{margin:12px 16px 4px;font-size:.8rem;color:var(--muted);background:var(--surface-2);border-radius:10px;padding:8px 10px}
  .a11yx-list{list-style:none;margin:0;padding:6px 8px 10px}
  .a11yx-row{display:flex;align-items:center;gap:12px;width:100%;padding:10px 8px;border:0;border-radius:12px;background:transparent;color:inherit;text-align:left;cursor:pointer;font:inherit}
  .a11yx-row:hover{background:var(--surface-2)}
  .a11yx-row .oi{width:34px;height:34px;border-radius:9px;background:var(--surface-2);display:grid;place-items:center;flex:none}
  .a11yx-row .t{flex:1;min-width:0;display:grid}
  .a11yx-row .t b{font-weight:400;font-size:.95rem}
  .a11yx-row .t small{font-size:.76rem;color:var(--muted)}
  .a11yx-sw{width:40px;height:24px;border-radius:12px;background:var(--line);position:relative;flex:none;transition:background .2s}
  .a11yx-sw::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:left .2s}
  .a11yx-row[aria-pressed="true"] .a11yx-sw{background:var(--accent)}
  .a11yx-row[aria-pressed="true"] .a11yx-sw::after{left:19px}
  .a11yx-row[aria-pressed="true"] .oi{background:var(--accent-soft);color:var(--accent)}
  .a11yx-dots{display:flex;gap:4px;align-items:center;font-size:.75rem;color:var(--muted)}
  .a11yx-dots i{width:6px;height:6px;border-radius:50%;background:var(--line)}
  .a11yx-dots i.on{background:var(--accent)}
  .a11yx-panel footer{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 16px;border-top:1px solid var(--line);font-size:.8rem;color:var(--muted)}
  .a11yx-panel kbd{font:600 .72rem var(--font-mono);border:1px solid var(--line);border-radius:6px;padding:2px 6px}
  .a11yx-guide{position:fixed;left:0;right:0;height:3px;background:var(--accent);z-index:89;pointer-events:none;top:0;box-shadow:0 0 0 1px rgba(255,255,255,.6)}
  @media (max-width:560px){.a11yx-panel{right:0;left:0;bottom:0;width:auto;max-height:82vh;border-radius:20px 20px 0 0;padding-bottom:env(safe-area-inset-bottom,0px)}}

  html.a11yx-font body, html.a11yx-font h1, html.a11yx-font h2, html.a11yx-font h3, html.a11yx-font h4{font-family:"Atkinson Hyperlegible",system-ui,sans-serif!important;letter-spacing:0!important}
  html.a11yx-links a{text-decoration:underline!important;text-decoration-thickness:2px!important;outline:2px solid currentColor;outline-offset:2px;border-radius:3px}
  html.a11yx-pause *,html.a11yx-pause *::before,html.a11yx-pause *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
  html.a11yx-contrast{--bg:#000;--surface:#000;--surface-2:#111;--fg:#fff;--muted:#e8e8e8;--line:#fff;--accent:#ffd400;--accent-soft:#222;--on-accent:#000;--focus:#ffd400;--deep:#000;--deep-2:#000;--deep-fg:#fff;--deep-muted:#eee;--deep-accent:#ffd400;--nav-bg:#000;color-scheme:dark}
  html.a11yx-contrast img{filter:contrast(1.15)}
  `;
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var svg=function(p,s){return '<svg width="'+(s||18)+'" height="'+(s||18)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+p+'</svg>'};
  var PERSON='<circle cx="12" cy="4.5" r="2" fill="currentColor" stroke="none"/><path d="M5 8.5c2.3.7 4.6 1 7 1s4.7-.3 7-1M12 9.5v4.5m0 0-3 6.5m3-6.5 3 6.5"/>';

  var fab=document.createElement('button');
  fab.className='a11yx-fab';fab.type='button';
  fab.setAttribute('aria-label','Abrir painel de acessibilidade (Alt+A)');
  fab.setAttribute('aria-expanded','false');fab.setAttribute('aria-controls','a11yx-panel');
  fab.innerHTML=svg(PERSON,28)+'<span class="a11yx-fab__badge" hidden></span>';

  var panel=document.createElement('div');
  panel.className='a11yx-panel';panel.id='a11yx-panel';panel.hidden=true;
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','a11yx-title');
  function build(){
    fab.setAttribute('aria-label',T('Abrir painel de acessibilidade (Alt+A)','Open accessibility panel (Alt+A)'));
    var rows=OPTS.map(function(o){
      return '<li><button type="button" class="a11yx-row" data-id="'+o.id+'" aria-pressed="false"><span class="oi">'+svg(o.icon)+'</span><span class="t"><b>'+tx(o.label)+'</b><small>'+tx(o.desc)+'</small></span>'+(o.type==='level'?'<span class="a11yx-dots" aria-hidden="true"></span>':'<span class="a11yx-sw" aria-hidden="true"></span>')+'</button></li>';
    }).join('');
    panel.innerHTML='<header><span class="ic">'+svg(PERSON,20)+'</span><div><h2 id="a11yx-title">'+T('Acessibilidade do site','Site accessibility')+'</h2><p aria-live="polite" id="a11yx-count"></p></div><div class="x"><button type="button" class="a11yx-ib" data-act="reset" aria-label="'+T('Restaurar padrões','Restore defaults')+'">'+svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',16)+'</button><button type="button" class="a11yx-ib" data-act="close" aria-label="'+T('Fechar','Close')+'">'+svg('<path d="M6 6l12 12M18 6 6 18"/>',16)+'</button></div></header>'+
     '<p class="a11yx-note">'+T('Estas 6 opções ajustam este site. Para experimentar as 30 opções do plugin, use a réplica do painel na seção Experimente.','These 6 options adjust this website. To try all 30 plugin options, use the panel replica in the Try it section.')+'</p>'+
     '<ul class="a11yx-list">'+rows+'</ul><footer><span>'+T('Desenvolvido com ❤️ pela <strong>UFPel</strong>.','Made with ❤️ by <strong>UFPel</strong>.')+'</span><kbd>Alt+A</kbd></footer>';
  }
  build();
  document.addEventListener('langchange',function(){var was=!panel.hidden;build();apply();if(was)panel.hidden=false;});

  var guide=document.createElement('div');guide.className='a11yx-guide';guide.hidden=true;guide.setAttribute('aria-hidden','true');

  function mount(){document.body.appendChild(guide);document.body.appendChild(panel);document.body.appendChild(fab);apply();}
  if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount);

  function apply(){
    var h=document.documentElement;
    h.classList.toggle('a11yx-font',!!state.font);
    h.classList.toggle('a11yx-contrast',!!state.contrast);
    h.classList.toggle('a11yx-links',!!state.links);
    h.classList.toggle('a11yx-pause',!!state.pause);
    h.style.fontSize=state.size?(100+state.size*12.5)+'%':'';
    guide.hidden=!state.guide;
    var n=0;
    OPTS.forEach(function(o){
      var v=state[o.id]||0;if(v)n++;
      var b=panel.querySelector('[data-id="'+o.id+'"]');
      b.setAttribute('aria-pressed',v?'true':'false');
      if(o.type==='level'){
        b.querySelector('.a11yx-dots').innerHTML=(v?T('Nível ','Level ')+v+' ':T('Padrão ','Default '))+Array.from({length:o.max},function(_,i){return '<i class="'+(i<v?'on':'')+'"></i>'}).join('');
        b.setAttribute('aria-label',tx(o.label)+': '+(v?T('nível '+v+' de '+o.max,'level '+v+' of '+o.max):T('padrão','default')));
      }
    });
    document.getElementById('a11yx-count').textContent=n===0?T('Nenhuma opção ativa','No options active'):n===1?T('1 opção ativa','1 option active'):n+T(' opções ativas',' options active');
    var badge=fab.querySelector('.a11yx-fab__badge');badge.hidden=!n;badge.textContent=n;
    try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
    document.dispatchEvent(new CustomEvent('a11yx:change',{detail:state}));
  }
  window.A11YX={state:function(){return state}};

  var last=null;
  function open(){last=document.activeElement;panel.hidden=false;fab.setAttribute('aria-expanded','true');panel.querySelector('.a11yx-row').focus();}
  function close(){panel.hidden=true;fab.setAttribute('aria-expanded','false');(last&&last!==document.body?fab:fab).focus();}
  fab.addEventListener('click',function(){panel.hidden?open():close()});
  panel.addEventListener('click',function(e){
    var act=e.target.closest('[data-act]');
    if(act){if(act.dataset.act==='close')close();else{state={};apply();}return;}
    var r=e.target.closest('.a11yx-row');if(!r)return;
    var o=OPTS.find(function(x){return x.id===r.dataset.id});
    if(o.type==='level'){state[o.id]=((state[o.id]||0)+1)%(o.max+1);}else{state[o.id]=!state[o.id];}
    apply();
  });
  document.addEventListener('keydown',function(e){
    if(e.altKey&&(e.key==='a'||e.key==='A')){e.preventDefault();panel.hidden?open():close();return;}
    if(panel.hidden)return;
    if(e.key==='Escape'){e.preventDefault();close();}
    if(e.key==='Tab'){
      var f=panel.querySelectorAll('button');var first=f[0],lastEl=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();lastEl.focus();}
      else if(!e.shiftKey&&document.activeElement===lastEl){e.preventDefault();first.focus();}
    }
  });
  document.addEventListener('pointermove',function(e){if(state.guide)guide.style.transform='translateY('+(e.clientY+14)+'px)';},{passive:true});
})();
