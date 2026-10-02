(function(){
  var D=window.A11Y_DATA,I=window.svgI,L=function(p,e){return I18N.L(p,e)},ix=function(){return I18N.lang==='en'?1:0};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var imgDir=function(){return I18N.lang==='en'?'img/en/':'img/'};

  /* ================= PERFIS ================= */
  var tabs=document.getElementById('pf-tabs'),info=document.getElementById('pf-info'),pfx=document.getElementById('pfx'),
      imA=document.getElementById('pfx-a'),imB=document.getElementById('pfx-b'),tb=document.getElementById('pfx-tb'),ta=document.getElementById('pfx-ta'),
      tap=document.getElementById('pfx-tap'),play=document.getElementById('pf-play'),pf=document.getElementById('pf');
  /* autoplay ligado por padrão; só para quando a pessoa pausa (ou pede menos movimento no sistema) */
  var cur=0,auto=!reduce,timer=null,inView=false,DUR=7000,startAt=0,left=DUR;
  function setTone(el,p){var t=D.TONES[p.tone];el.style.setProperty('--tb',t[0]);el.style.setProperty('--tt',t[1]);el.style.setProperty('--ti',t[2]);el.style.setProperty('--tbr',t[3])}
  function buildTabs(){
    tabs.innerHTML=D.PROFILES.map(function(p,i){return '<button type="button" role="tab" class="ptab" id="ptab-'+p.id+'" aria-controls="pf-panel" aria-selected="'+(i===cur)+'" tabindex="'+(i===cur?0:-1)+'"><span class="pi">'+I(p.icon,16)+'</span>'+p.l[ix()]+'<span class="prog"></span></button>'}).join('');
    tabs.querySelectorAll('.ptab').forEach(function(b,i){setTone(b,D.PROFILES[i])});
  }
  function preload(i){var p=D.PROFILES[(i+D.PROFILES.length)%D.PROFILES.length];var im=new Image();im.src=imgDir()+'profile-'+p.id+'.webp'}
  function show(i,mode){
    cur=(i+D.PROFILES.length)%D.PROFILES.length;var p=D.PROFILES[cur],k=ix();
    tabs.querySelectorAll('.ptab').forEach(function(b,j){b.setAttribute('aria-selected',j===cur);b.tabIndex=j===cur?0:-1;b.querySelector('.prog').classList.remove('run')});
    var active=tabs.children[cur];
    if(mode!=='init'){var tl=tabs.getBoundingClientRect(),al=active.getBoundingClientRect();if(al.left<tl.left||al.right>tl.right)tabs.scrollTo({left:active.offsetLeft-24,behavior:reduce?'auto':'smooth'})}
    setTone(pfx,p);setTone(info,p);
    imB.src=imgDir()+'profile-none.webp';imA.src=imgDir()+'profile-'+p.id+'.webp';
    imA.alt=L('O mesmo curso do Moodle com o perfil ','The same Moodle course with the ')+p.l[k]+L(' aplicado: ',' profile applied: ')+p.d[k]+'.';
    tb.textContent=L('Sem perfil','No profile');ta.textContent=p.l[k];
    tap.querySelector('.ico').innerHTML=I(p.icon,15);tap.querySelector('b').textContent=p.l[k];
    pfx.classList.remove('play');void pfx.offsetWidth;if(mode!=='still')pfx.classList.add('play');
    var opts=D.describe(p.apply,I18N.lang);
    info.innerHTML='<span class="big">'+I(p.icon,28)+'</span><h3>'+p.l[k]+'</h3><p>'+p.d[k]+'.</p>'+
      '<p class="k">'+L('Liga '+opts.length+' opções','Turns on '+opts.length+' options')+'</p><ul class="pills">'+opts.map(function(o){return '<li>'+o.label+(o.value?' <b>'+o.value+'</b>':'')+'</li>'}).join('')+'</ul>'+
      '<div class="pf__step"><span>'+(cur+1)+' / '+D.PROFILES.length+'</span><span class="bar"><i id="pf-bar"></i></span></div>';
    tabs.setAttribute('aria-label',L('Perfis','Profiles'));
    document.getElementById('pf-panel').setAttribute('aria-labelledby','ptab-'+p.id);
    preload(cur+1);
    left=DUR;schedule();
  }
  function bars(run){
    var pr=tabs.children[cur]&&tabs.children[cur].querySelector('.prog'),bar=document.getElementById('pf-bar');
    [pr,bar].forEach(function(el){if(!el)return;el.classList.remove('run');el.style.animationPlayState='';
      if(run){el.style.setProperty('--dur',DUR+'ms');el.style.animationDelay=-(DUR-left)+'ms';void el.offsetWidth;el.classList.add('run')}});
    if(bar&&!auto)bar.classList.add('done');
  }
  function schedule(){
    clearTimeout(timer);
    if(auto&&inView){startAt=Date.now();bars(true);timer=setTimeout(function(){show(cur+1)},left)}
    else{bars(false)}
    renderPlay();
  }
  function hold(){ /* fora da tela: congela onde está, sem desligar o autoplay */
    if(timer){clearTimeout(timer);timer=null;left=Math.max(300,left-(Date.now()-startAt))}
    [tabs.children[cur]&&tabs.children[cur].querySelector('.prog'),document.getElementById('pf-bar')].forEach(function(el){if(el)el.style.animationPlayState='paused'});
  }
  function renderPlay(){
    play.innerHTML=auto?'<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>':I('play',16);
    play.setAttribute('aria-label',auto?L('Pausar a troca automática de perfis','Pause the automatic profile changes'):L('Retomar a troca automática de perfis','Resume the automatic profile changes'));
    play.setAttribute('aria-pressed',auto?'false':'true');
  }
  play.addEventListener('click',function(){if(auto){auto=false;hold();schedule()}else{auto=true;show(cur+1)}});
  tabs.addEventListener('click',function(e){var b=e.target.closest('.ptab');if(b)show([].indexOf.call(tabs.children,b))});
  tabs.addEventListener('keydown',function(e){
    var n=null;if(e.key==='ArrowRight')n=cur+1;if(e.key==='ArrowLeft')n=cur-1;if(e.key==='Home')n=0;if(e.key==='End')n=D.PROFILES.length-1;
    if(n!==null){e.preventDefault();show(n);tabs.children[cur].focus()}
  });
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v===inView)return;inView=v;
      if(!v)hold();else if(auto){pfx.classList.remove('play');void pfx.offsetWidth;pfx.classList.add('play');left=DUR;schedule()}},{threshold:.35}).observe(pf)}
  else{inView=true}
  buildTabs();show(0,'init');

  /* ================= CARROSSEL ================= */
  var track=document.getElementById('car-track'),dots=document.getElementById('car-dots'),prev=document.getElementById('car-prev'),next=document.getElementById('car-next');
  var SL=[
    {img:'panel',c:null,tone:'#6d28d9',w:760,h:1059},{img:'cat-0',c:'typography',tone:'#1d4ed8',w:760,h:2218},{img:'cat-1',c:'color',tone:'#c2410c',w:760,h:1471},
    {img:'cat-2',c:'media',tone:'#15803d',w:760,h:1463},{img:'cat-3',c:'navigation',tone:'#0e7490',w:760,h:1625},{img:'cat-4',c:'advanced',tone:'#334155',w:760,h:1393}
  ];
  var TX={
    null:[['Perfis de acessibilidade','Nove combinações prontas no topo do painel. Um toque liga as opções do perfil e desliga as outras.'],['Accessibility profiles','Nine ready-made combinations at the top of the panel. One tap turns on the profile\'s options and turns off the rest.']],
    typography:[['Texto e Tipografia','Fontes pensadas para leitura, destaques e controle fino do tamanho e dos espaçamentos.'],['Text & Typography','Fonts designed for reading, highlights and fine control over size and spacing.']],
    color:[['Cores e Contraste','Três modos de contraste, inversão, filtros para daltonismo, saturação e filtro de luz azul.'],['Color & Contrast','Three contrast modes, inversion, color-blindness filters, saturation and a blue light filter.']],
    media:[['Mídia e Animação','Menos estímulo na tela: imagens, animações e som sob controle. Com a integração VLibras, também Libras.'],['Media & Motion','Less on-screen stimulus: images, animation and sound under control. With the VLibras integration, Brazilian Sign Language too.']],
    navigation:[['Foco e Navegação','Guia, máscara e lupa para a leitura; cursor maior, modo foco e coluna de conteúdo mais larga.'],['Focus & Navigation','Guide, mask and magnifier for reading; a bigger cursor, focus mode and a wider content column.']],
    advanced:[['Recursos Avançados','Leitor de tela, teclado virtual, comandos por voz e navegação por face.'],['Advanced','Screen reader, virtual keyboard, voice commands and face navigation.']]
  };
  var active=0;
  function buildCar(){
    var k=ix();
    track.innerHTML=SL.map(function(s,i){
      var t=TX[s.c][k],items=s.c?D.OPTS.filter(function(o){return o.c===s.c}).map(function(o){return o.l[k]}):D.PROFILES.map(function(p){return p.l[k]});
      if(s.c==='media')items.push(L('Libras (VLibras)*','Sign Language (VLibras)*'));
      var n=s.c?D.OPTS.filter(function(o){return o.c===s.c}).length:9;
      return '<article class="slide'+(i===active?' is-active':'')+'" style="--sl:'+s.tone+'" role="group" aria-roledescription="'+L('slide','slide')+'" aria-label="'+(i+1)+' '+L('de','of')+' '+SL.length+': '+t[0]+'">'+
        '<div class="slide__text"><div class="slide__head"><span class="slide__n">'+n+'</span><h3>'+t[0]+'</h3></div><p>'+t[1]+'</p><ul class="chips">'+items.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'+
        (s.c==='media'?'<p style="font-size:.8rem">'+L('* Só quando a integração com o VLibras está ativa.','* Only when the VLibras integration is on.')+'</p>':'')+'</div>'+
        '<div class="slide__media"><img src="'+imgDir()+s.img+'.webp" width="'+s.w+'" height="'+s.h+'" loading="lazy" alt="'+L('Painel com ','Panel with ')+t[0]+L(' aberto',' open')+'"></div></article>';
    }).join('');
    dots.innerHTML=SL.map(function(s,i){return '<button type="button" aria-label="'+L('Ir para ','Go to ')+TX[s.c][k][0]+'" aria-current="'+(i===active)+'"></button>'}).join('');
    syncCar();
  }
  function go(i){var s=track.children[i];if(!s)return;track.scrollTo({left:s.offsetLeft-(track.clientWidth-s.clientWidth)/2,behavior:reduce?'auto':'smooth'})}
  function syncCar(){
    var c=track.scrollLeft+track.clientWidth/2,best=0,bd=1e9;
    [].forEach.call(track.children,function(s,i){var d=Math.abs(s.offsetLeft+s.clientWidth/2-c);if(d<bd){bd=d;best=i}});
    active=best;
    [].forEach.call(track.children,function(s,i){s.classList.toggle('is-active',i===best)});
    [].forEach.call(dots.children,function(d,i){d.setAttribute('aria-current',i===best?'true':'false')});
    prev.disabled=best===0;next.disabled=best===SL.length-1;
  }
  var raf;track.addEventListener('scroll',function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(syncCar)},{passive:true});
  prev.onclick=function(){go(active-1)};next.onclick=function(){go(active+1)};
  dots.addEventListener('click',function(e){var b=e.target.closest('button');if(b)go([].indexOf.call(dots.children,b))});
  document.getElementById('car').addEventListener('keydown',function(e){if(e.target.closest('input,textarea'))return;if(e.key==='ArrowRight'){e.preventDefault();go(active+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(active-1)}});
  track.addEventListener('click',function(e){var s=e.target.closest('.slide');if(s&&!s.classList.contains('is-active'))go([].indexOf.call(track.children,s))});
  buildCar();

  /* ================= NAVEGAÇÃO POR FACE (avatar) ================= */
  (function(){
    var svg=document.getElementById('fscene');if(!svg)return;
    var $=function(id){return document.getElementById(id)};
    var head=$('fhead'),feat=$('ffeat'),hair=$('fhair'),face=$('fface'),eL=$('fearL'),eR=$('fearR'),eyes=$('feyes'),mouth=$('fmouth'),
        cur=$('fcur'),ring=$('fring'),rip=$('frip'),cap=$('fcap'),tiles=svg.querySelectorAll('.ft');
    var T=[{x:250,y:80,how:'mouth'},{x:366,y:80,how:'blink'},{x:308,y:144,how:'mouth'}];
    var cx=307,cy=100,pos={x:250,y:80},from={x:250,y:80},seg=0,phase='move',t0=0,running=false,raf=0,inView=false;
    var MOVE=1500,DWELL=1100,AFTER=900,C=94.25;
    function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
    function pose(x,y,jaw,blink){
      var yaw=Math.max(-1,Math.min(1,(x-cx)/68)),pitch=Math.max(-1,Math.min(1,(y-112)/42));
      /* a pessoa aparece espelhada como numa webcam: virar para a direita da tela move o rosto para a esquerda da imagem */
      var my=-yaw;
      head.setAttribute('transform','translate('+(84+my*7)+' '+(110+pitch*5)+') rotate('+(my*9)+')');
      feat.setAttribute('transform','translate('+(my*13)+' '+(pitch*10)+')');
      hair.setAttribute('transform','translate('+(my*4)+' '+(pitch*2)+')');
      face.setAttribute('rx',36-Math.abs(my)*4);
      eL.setAttribute('transform','translate('+(my*5)+' 0)');eL.style.opacity=my>0.5?0.4:1;
      eR.setAttribute('transform','translate('+(my*5)+' 0)');eR.style.opacity=my<-0.5?0.4:1;
      mouth.setAttribute('ry',2.2+jaw*9);mouth.setAttribute('rx',10-jaw*2);
      eyes.setAttribute('transform','translate(0 -2) scale(1 '+(1-blink*0.92)+') translate(0 2)');
      cur.setAttribute('transform','translate('+x+' '+y+')');
    }
    function L2(p,e){return I18N.L(p,e)}
    function tick(now){
      if(!running)return;
      var tg=T[seg],dt=now-t0;
      if(phase==='move'){
        var k=Math.min(1,dt/MOVE),e=ease(k);
        pos.x=from.x+(tg.x-from.x)*e;pos.y=from.y+(tg.y-from.y)*e;
        /* um leve balanço de cabeça a caminho do alvo */
        var wob=Math.sin(k*Math.PI)*8;
        pose(pos.x,pos.y-wob,0,0);
        if(k>=1){phase='dwell';t0=now;cap.textContent=tg.how==='mouth'?L2('Abre a boca para clicar…','Opening the mouth to click…'):L2('Pisca os dois olhos para clicar…','Blinking both eyes to click…')}
      }else if(phase==='dwell'){
        var k2=Math.min(1,dt/DWELL);
        ring.setAttribute('stroke-dashoffset',C*(1-k2));
        pose(pos.x,pos.y,tg.how==='mouth'?Math.min(1,k2*3):0,tg.how==='blink'?Math.min(1,k2*4):0);
        if(k2>=1){phase='after';t0=now;ring.setAttribute('stroke-dashoffset',C);
          tiles.forEach(function(el,i){el.classList.toggle('hit',i===seg)});
          cap.textContent=L2('Clique!','Click!');}
      }else{
        var k3=Math.min(1,dt/AFTER);
        rip.setAttribute('r',8+k3*22);rip.setAttribute('opacity',(1-k3).toFixed(2));
        pose(pos.x,pos.y,0,0);
        if(k3>=1){phase='move';t0=now;from={x:pos.x,y:pos.y};seg=(seg+1)%T.length;cap.textContent=L2('Movendo a cabeça…','Moving the head…')}
      }
      raf=requestAnimationFrame(tick);
    }
    function start(){if(running||reduce)return;running=true;t0=performance.now();raf=requestAnimationFrame(tick)}
    function stop(){running=false;cancelAnimationFrame(raf)}
    pose(250,80,0,0);
    if(reduce){tiles[0].classList.add('hit');cap.textContent='';return}
    cap.textContent=L2('Movendo a cabeça…','Moving the head…');
    if('IntersectionObserver' in window){new IntersectionObserver(function(es){inView=es[0].isIntersecting;inView?start():stop()},{threshold:.2}).observe(svg)}else{inView=true;start()}
    document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else if(inView)start()});
  })();

  /* o botão do site sai de cena enquanto a janela do Moodle (com o próprio botão) está visível */
  (function(){var pg=document.getElementById('pg');if(!pg||!('IntersectionObserver' in window))return;
    new IntersectionObserver(function(es){var v=es[0].isIntersecting;document.documentElement.classList.toggle('a11yx-away',v);
      var pnl=document.getElementById('a11yx-panel');if(v&&pnl&&!pnl.hidden){pnl.hidden=true;var f=document.querySelector('.a11yx-fab');if(f)f.setAttribute('aria-expanded','false')}},{threshold:.15}).observe(pg)})();

  /* ================= LEITOR DE TELA (demo) ================= */
  var srb=document.getElementById('sr-demo'),wave=document.getElementById('wave');
  srb.addEventListener('click',function(){
    var txt=L('Acessibilidade para Moodle. Trinta opções, nove perfis, um clique.','Accessibility for Moodle. Thirty options, nine profiles, one click.');
    try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(txt);u.lang=I18N.lang==='en'?'en-US':'pt-BR';
      u.onstart=function(){wave.classList.remove('idle')};u.onend=u.onerror=function(){wave.classList.add('idle')};speechSynthesis.speak(u);
      if(!reduce){wave.classList.remove('idle');setTimeout(function(){if(!speechSynthesis.speaking)wave.classList.add('idle')},4000)}}
    catch(e){wave.classList.remove('idle');setTimeout(function(){wave.classList.add('idle')},3000)}
  });

  /* ================= CONFIGURADOR ================= */
  var pv=document.getElementById('pv'),pvfab=document.getElementById('pvfab'),pvp=document.getElementById('pv-panel'),warn=document.getElementById('warn'),custom=document.getElementById('ac-custom');
  var ICONS={def:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">'+window.A11Y_ICONS.person+'</svg>',
    un:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="6.3" r="1.5" fill="currentColor" stroke="none"/><path d="M6.5 9.3c1.8.5 3.6.7 5.5.7s3.7-.2 5.5-.7M12 10v3.5m0 0-2.4 5m2.4-5 2.4 5M10 10.2l-.2 3.3M14 10.2l.2 3.3"/></svg>'};
  function lum(h){var c=[1,3,5].map(function(i){var v=parseInt(h.substr(i,2),16)/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
  function buildPv(){
    var r=[[L('Fonte Legível','Readable Font'),L('Aplica Atkinson Hyperlegible','Applies Atkinson Hyperlegible'),1],[L('Destacar Links','Highlight Links'),'',0],[L('Guia de Leitura','Reading Guide'),'',1],[L('Pausar Animações','Pause Animations'),'',0]];
    pvp.innerHTML='<div class="ph"><span></span>'+L('Acessibilidade','Accessibility')+'</div>'+r.map(function(x){return '<div class="r'+(x[2]?' on':'')+'"><div>'+x[0]+(x[1]?'<small>'+x[1]+'</small>':'')+'</div><s></s></div>'}).join('');
  }
  var studio=document.getElementById('studio');
  var NAMES={pos:{br:['Inferior direita','Bottom right'],bl:['Inferior esquerda','Bottom left'],mr:['Meio direita','Middle right'],ml:['Meio esquerda','Middle left']},
    fmt:{popover:['Popover','Popover'],drawer:['Gaveta','Drawer'],modal:['Modal','Modal']}};
  function upd(){
    var f=new FormData(document.getElementById('cfg')),k=ix();
    pv.dataset.pos=f.get('pos');pv.dataset.shape=f.get('shape');pv.dataset.fmt=f.get('fmt');pv.dataset.density=f.get('density');
    pvfab.innerHTML=ICONS[f.get('icon')];
    var ac=f.get('ac')||custom.value;pv.style.setProperty('--ac',ac);studio.style.setProperty('--pick',ac);
    document.getElementById('v-pos').textContent=NAMES.pos[f.get('pos')][k];
    document.getElementById('v-fmt').textContent=NAMES.fmt[f.get('fmt')][k];
    document.getElementById('v-ac').textContent=ac.toUpperCase();
    var ratio=1.05/(lum(ac)+.05),rs=ratio.toFixed(1),ok=ratio>=3,chip=document.getElementById('cchip');
    var rtxt=I18N.lang==='en'?rs:rs.replace('.',',');
    chip.className='cchip '+(ok?'ok':'bad');
    chip.innerHTML='<i style="background:'+ac+'"></i>'+L('Contraste com o branco: ','Contrast against white: ')+'<b>'+rtxt+':1</b> · '+(ok?L('passa no mínimo de 3:1','meets the 3:1 minimum'):L('abaixo de 3:1','below 3:1'));
    if(!ok){warn.hidden=false;warn.textContent=L('O plugin mostra este mesmo aviso ao salvar uma cor abaixo do mínimo da WCAG 1.4.11.','The plugin shows this same warning when you save a color below the WCAG 1.4.11 minimum.');}else warn.hidden=true;
  }
  document.getElementById('cfg').addEventListener('change',upd);
  custom.addEventListener('input',function(){document.querySelectorAll('input[name=ac]').forEach(function(r){r.checked=false});upd()});
  buildPv();upd();

  document.addEventListener('langchange',function(){buildTabs();show(cur,'still');buildCar();buildPv();upd();});
})();
