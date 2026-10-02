/* Playground: réplica do painel do local_a11y aplicando as 30 opções em um Moodle simulado. */
(function(){
  var D=window.A11Y_DATA, I=window.svgI, L=function(p,e){return window.I18N?I18N.L(p,e):p}, li=function(){return window.I18N&&I18N.lang==='en'?1:0};
  var root=document.getElementById('pg');if(!root)return;
  var mdl=document.getElementById('mdl'), panel=document.getElementById('pgpanel');
  var S=D.defaults(), openCats={typography:true}, profilesOpen=true, query='', helpOpen=null, fieldText='', vkTarget=false, srUtter=null;

  /* ---------- Moodle simulado ---------- */
  function mock(){
    var en=li()===1;
    var t=en?{
      nav:['Home','Dashboard','My courses'],crumb:'My courses › Digital Accessibility',title:'Digital Accessibility: Fundamentals and Good Practice',
      idx:[['General',['Announcements']],['Module 1 — Fundamentals',['What is digital accessibility?','WCAG 2.1 — Quick reference','Introductions forum','Quiz — Key concepts']],['Module 2 — Inclusive design',['Contrast, color and type','Practical activity']]],
      banner:'Welcome to the course',mod:'Module 1 — Fundamentals of Digital Accessibility',
      p1:'Digital accessibility means that people with disabilities can perceive, understand, navigate and interact with websites and online learning. In this module you will learn the four WCAG principles and the main barriers found in course pages.',
      p2:'Read the material carefully before the activity. Each lesson takes about twenty minutes.',
      fig:'Figure 1. The same content can be used in different ways: seeing, hearing or touching.',
      acts:[['pg1','Page','What is digital accessibility?','Read'],['pg2','URL','WCAG 2.1 — Quick reference (W3C)','Open'],['pg3','Forum','Introductions forum','2 new posts'],['pg4','Quiz','Quiz — Key concepts','Due Friday, 23:59']],
      done:'Mark as done',video:'Video lesson: the 4 principles',sound:'Sound',muted:'Muted',reply:'Reply to the forum',ph:'Write your message…',post:'Post to forum',draft:'Save draft',
      ev:'Upcoming events',evs:[['OCT','03','Quiz — Key concepts'],['OCT','08','Live class: screen readers']],prog:'Course progress',progt:'38% complete',
      tips:{bell:'Notifications',chat:'Messages',av:'Your profile',page:'Page',url:'External link',forum:'Forum',quiz:'Quiz'}
    }:{
      nav:['Página inicial','Painel','Meus cursos'],crumb:'Meus cursos › Acessibilidade Digital',title:'Acessibilidade Digital: Fundamentos e Boas Práticas',
      idx:[['Geral',['Avisos']],['Módulo 1 — Fundamentos',['O que é Acessibilidade Digital?','WCAG 2.1 — Referência rápida','Fórum de apresentação','Quiz — Conceitos']],['Módulo 2 — Design inclusivo',['Contraste, cores e tipografia','Atividade prática']]],
      banner:'Boas-vindas ao curso',mod:'Módulo 1 — Fundamentos de Acessibilidade Digital',
      p1:'Acessibilidade digital significa que pessoas com deficiência conseguem perceber, entender, navegar e interagir com sites e com o ensino a distância. Neste módulo você vai conhecer os quatro princípios do WCAG e as principais barreiras encontradas em páginas de curso.',
      p2:'Leia o material com atenção antes da atividade. Cada aula leva cerca de vinte minutos.',
      fig:'Figura 1. O mesmo conteúdo pode ser usado de jeitos diferentes: vendo, ouvindo ou tocando.',
      acts:[['pg1','Página','O que é Acessibilidade Digital?','Ler'],['pg2','URL','WCAG 2.1 — Referência rápida (W3C)','Abrir'],['pg3','Fórum','Fórum de apresentação','2 novas mensagens'],['pg4','Questionário','Quiz — Conceitos fundamentais','Entrega sexta, 23:59']],
      done:'Marcar como feita',video:'Videoaula: os 4 princípios',sound:'Som',muted:'Mudo',reply:'Responder ao fórum',ph:'Escreva sua mensagem…',post:'Publicar no fórum',draft:'Salvar rascunho',
      ev:'Próximos eventos',evs:[['OUT','03','Quiz — Conceitos fundamentais'],['OUT','08','Aula ao vivo: leitores de tela']],prog:'Progresso no curso',progt:'38% concluído',
      tips:{bell:'Notificações',chat:'Mensagens',av:'Seu perfil',page:'Página',url:'Link externo',forum:'Fórum',quiz:'Questionário'}
    };
    var aicon={pg1:'bookp',pg2:'link',pg3:'tip',pg4:'check'},tipk={pg1:'page',pg2:'url',pg3:'forum',pg4:'quiz'};
    var idx=t.idx.map(function(s,i){return '<b>'+s[0]+'</b>'+s[1].map(function(x,j){return '<span class="'+(i===1&&j===0?'on':'')+'">'+x+'</span>'}).join('')}).join('');
    var acts=t.acts.map(function(a){return '<li><span class="ai '+a[0]+'" data-tip="'+t.tips[tipk[a[0]]]+'">'+I(aicon[a[0]],18)+'</span><span class="grow"><a href="#experimente" tabindex="-1" data-noop>'+a[2]+'</a><small>'+a[1]+' · '+a[3]+'</small></span><button type="button" class="m-btn" tabindex="-1">'+I('check',14,2.2)+t.done+'</button></li>'}).join('');
    return '<div class="mdl__inner" id="mdl-inner">'+
      '<div class="mdl__top"><span class="mdl__logo">moodle</span><nav class="mdl__nav">'+t.nav.map(function(n,i){return '<span class="'+(i===2?'on':'')+'">'+n+'</span>'}).join('')+'</nav>'+
      '<div class="mdl__right"><button type="button" class="mdl__ic" tabindex="-1" data-tip="'+t.tips.bell+'" aria-label="'+t.tips.bell+'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg></button><button type="button" class="mdl__ic" tabindex="-1" data-tip="'+t.tips.chat+'" aria-label="'+t.tips.chat+'">'+I('tip',18)+'</button><span class="mdl__av" data-tip="'+t.tips.av+'">RP</span></div></div>'+
      '<div class="mdl__body"><aside class="mdl__index">'+idx+'</aside>'+
      '<div class="mdl__scroll" id="mdl-scroll"><div class="mdl__col">'+
        '<p class="mdl__crumb">'+t.crumb+'</p><h1 class="m-h1">'+t.title+'</h1>'+
        '<div class="m-banner" role="img" aria-label="'+t.banner+'"><i></i><i></i><i></i><b>'+t.banner+'</b></div>'+
        '<section class="m-card"><h2 class="m-h2">'+t.mod+'</h2><p class="bt">'+t.p1+'</p>'+
          '<figure class="m-fig"><div class="m-img" role="img" aria-label="'+t.fig+'"></div><figcaption class="bt">'+t.fig+'</figcaption></figure>'+
          '<p class="bt">'+t.p2+'</p><ul class="m-acts">'+acts+'</ul></section>'+
        '<section class="m-card"><h3 class="m-h3">'+t.video+'</h3><div class="m-video"><div class="m-img2"></div><span class="play">'+I('play',20)+'</span>'+
          '<div class="bar"><span>04:12</span><span class="trk"><i></i></span><span class="snd"><span class="eq"><i></i><i></i><i></i></span>'+t.sound+'</span><span class="snd muted">'+I('mute',14,2)+t.muted+'</span></div></div></section>'+
        '<section class="m-card"><div class="m-field"><label for="mdl-reply">'+t.reply+'</label><textarea id="mdl-reply" tabindex="-1" placeholder="'+t.ph+'"></textarea></div>'+
          '<div class="m-row"><button type="button" class="m-btn solid" tabindex="-1">'+t.post+'</button><button type="button" class="m-btn" tabindex="-1">'+t.draft+'</button></div></section>'+
      '</div></div>'+
      '<aside class="mdl__blocks"><div class="m-card"><h3 class="m-h3">'+t.ev+'</h3>'+t.evs.map(function(e){return '<div class="m-ev"><time>'+e[0]+'<br>'+e[1]+'</time><span>'+e[2]+'</span></div>'}).join('')+'</div>'+
        '<div class="m-card"><h3 class="m-h3">'+t.prog+'</h3><div class="m-prog"><i></i></div><small>'+t.progt+'</small></div></aside>'+
      '</div></div>'+
      '<div class="ov ov-blue" id="ov-blue"></div><div class="ov ov-m1" id="ov-m1"></div><div class="ov ov-m2" id="ov-m2"></div><div class="ov ov-guide" id="ov-guide"></div>'+
      '<div class="ov ov-lens" id="ov-lens"></div><div class="ov ov-tip" id="ov-tip" role="tooltip"></div>'+
      '<div class="ov-bar top" id="ov-sr"></div><div class="ov-bar bot" id="ov-vc"></div><div class="ov-face" id="ov-face"></div><div class="ov-vk" id="ov-vk"></div>';
  }
  function bionicify(on){
    mdl.querySelectorAll('.bt').forEach(function(el){
      if(!el.dataset.raw)el.dataset.raw=el.textContent;
      el.innerHTML=on?el.dataset.raw.split(/(\s+)/).map(function(w){if(!/\S/.test(w))return w;var n=Math.ceil(w.length*0.45);return '<span class="bio"><b>'+w.slice(0,n)+'</b>'+w.slice(n)+'</span>'}).join(''):el.dataset.raw;
    });
  }
  function renderMock(){
    mdl.innerHTML=mock();
    var ta=document.getElementById('mdl-reply');ta.value=fieldText;
    ta.addEventListener('input',function(){fieldText=ta.value});
    ta.addEventListener('focus',function(){vkTarget=true;renderVK()});
    mdl.querySelectorAll('[data-noop]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault()})});
    applyEffects();
  }

  /* ---------- Efeitos ---------- */
  function attr(name,val){if(val)mdl.setAttribute(name,val===true?'':val);else mdl.removeAttribute(name)}
  function applyEffects(){
    var fs=[15,16.8,18.75,21,24][S.textSize], lh=[1.55,1.5,1.8,2.2][S.lineHeight];
    mdl.style.setProperty('--fs',fs+'px');mdl.style.setProperty('--lh',lh);
    mdl.style.setProperty('--ls',['normal','.03em','.06em','.1em'][S.textSpacing]);
    mdl.style.setProperty('--ws',['normal','.12em','.24em','.38em'][S.wordSpacing]);
    attr('data-readable',S.readableFont);attr('data-font',S.fontVariant?String(S.fontVariant):'');
    attr('data-ht',S.highlightTitles);attr('data-hl',S.highlightLinks);attr('data-hb',S.highlightButtons);
    attr('data-align',S.textAlign?String(S.textAlign):'');
    attr('data-contrast',S.contrast?String(S.contrast):'');
    attr('data-hideimg',S.hideImages||S.focusMode===3);attr('data-pause',S.pauseAnimations);attr('data-mute',S.silenceMedia);
    attr('data-focus',S.focusMode?String(S.focusMode):'');attr('data-cw',S.contentWidth?String(S.contentWidth):'');
    attr('data-cursor',S.cursor?String(S.cursor):'');attr('data-sr',S.screenReader);attr('data-vk',S.virtualKeyboard);
    var f=[];
    if(S.invertColors)f.push('invert(1) hue-rotate(180deg)');
    if(S.colorChange)f.push('url(#pg-cb'+S.colorChange+')');
    if(S.saturation)f.push(['','saturate(1.7)','saturate(.45)','grayscale(1)'][S.saturation]);
    var inner=document.getElementById('mdl-inner');if(inner)inner.style.filter=f.join(' ');
    var blue=document.getElementById('ov-blue');if(blue)blue.style.opacity=[0,.13,.24,.36][S.blueLightFilter];
    if(mdl.dataset.bio!==String(!!S.bionicReading)){mdl.dataset.bio=String(!!S.bionicReading);bionicify(S.bionicReading);}
    var g=document.getElementById('ov-guide');if(g)g.style.display=S.readingGuide?'block':'none';
    ['ov-m1','ov-m2'].forEach(function(id){var e=document.getElementById(id);if(e)e.style.display=S.readingMask?'block':'none'});
    var lens=document.getElementById('ov-lens');if(lens){lens.style.display='none';lens.innerHTML='';}
    if(!S.screenReader)stopSpeech();
    renderSR();renderVK();renderVC();renderFace();
    if(!S.tooltips)hideTip();
    positionOverlays(lastY,lastX);
  }

  /* ponteiro: guia, máscara, lupa */
  var lastY=200,lastX=300;
  function positionOverlays(y,x){
    var h=mdl.clientHeight;
    var g=document.getElementById('ov-guide');if(g)g.style.transform='translateY('+(y+16)+'px)';
    var m1=document.getElementById('ov-m1'),m2=document.getElementById('ov-m2');
    if(m1){m1.style.height=Math.max(0,y-34)+'px';m2.style.height=Math.max(0,h-y-34)+'px';}
  }
  function updateLens(x,y){
    var lens=document.getElementById('ov-lens');if(!lens)return;
    if(!S.magnifier){lens.style.display='none';return}
    var inner=document.getElementById('mdl-inner');
    if(!lens.firstChild){var c=document.createElement('div');c.className='lens-c';c.setAttribute('aria-hidden','true');
      var cl=inner.cloneNode(true);cl.removeAttribute('id');cl.querySelectorAll('[id]').forEach(function(n){n.removeAttribute('id')});
      var sc=cl.querySelector('.mdl__scroll');c.appendChild(cl);lens.appendChild(c);
      c.style.width=mdl.clientWidth+'px';c.style.height=mdl.clientHeight+'px';cl.style.position='absolute';
      if(sc){var real=document.getElementById('mdl-scroll');requestAnimationFrame(function(){sc.scrollTop=real?real.scrollTop:0})}}
    lens.style.display='block';var R=100,Z=2;
    lens.style.left=(x-R)+'px';lens.style.top=(y-R)+'px';
    lens.firstChild.style.transform='translate('+(R-x*Z)+'px,'+(R-y*Z)+'px) scale('+Z+')';
  }
  mdl.addEventListener('pointermove',function(e){var r=mdl.getBoundingClientRect();lastX=e.clientX-r.left;lastY=e.clientY-r.top;positionOverlays(lastY,lastX);updateLens(lastX,lastY)});
  mdl.addEventListener('pointerleave',function(){var l=document.getElementById('ov-lens');if(l)l.style.display='none';hideTip()});
  mdl.addEventListener('scroll',function(){},true);
  mdl.addEventListener('scroll',function(e){if(e.target.id==='mdl-scroll'){var l=document.getElementById('ov-lens');if(l){l.innerHTML='';l.style.display='none'}}},true);

  /* dicas */
  function hideTip(){var t=document.getElementById('ov-tip');if(t)t.style.display='none'}
  mdl.addEventListener('pointerover',function(e){
    if(!S.tooltips)return;var el=e.target.closest('[data-tip]');var t=document.getElementById('ov-tip');if(!el||!t){hideTip();return}
    var r=el.getBoundingClientRect(),m=mdl.getBoundingClientRect();t.textContent=el.dataset.tip;t.style.display='block';
    var left=Math.min(m.width-t.offsetWidth-8,Math.max(8,r.left-m.left+r.width/2-t.offsetWidth/2));
    t.style.left=left+'px';t.style.top=(r.bottom-m.top+8)+'px';
  });

  /* leitor de tela */
  function stopSpeech(){try{speechSynthesis.cancel()}catch(e){}mdl.querySelectorAll('.sr-reading').forEach(function(n){n.classList.remove('sr-reading')});srUtter=null;}
  function renderSR(){
    var b=document.getElementById('ov-sr');if(!b)return;
    b.style.display=S.screenReader?'flex':'none';if(!S.screenReader)return;
    b.innerHTML=I('volume',16)+'<span class="msg">'+(srUtter?L('Lendo…','Reading…'):L('Leitor de tela ativo — clique em qualquer texto para ouvir','Screen reader active — click any text to hear it'))+'</span>'+(srUtter?'<button type="button" data-sr-stop>'+L('Parar','Stop')+'</button>':'');
  }
  mdl.addEventListener('click',function(e){
    if(e.target.closest('[data-sr-stop]')){stopSpeech();renderSR();return}
    if(e.target.closest('[data-face-off]')){set('faceNavigation',false);return}
    var vc=e.target.closest('[data-vc]');if(vc){voiceCmd(vc.dataset.vc);return}
    var k=e.target.closest('[data-key]');if(k){typeKey(k.dataset.key);return}
    if(!S.screenReader)return;
    var el=e.target.closest('.mdl__col :is(p,h1,h2,h3,li,figcaption,label)');if(!el)return;
    e.preventDefault();stopSpeech();
    var txt=el.innerText.trim();el.classList.add('sr-reading');
    try{var u=new SpeechSynthesisUtterance(txt);u.lang=li()===1?'en-US':'pt-BR';u.onend=function(){stopSpeech();renderSR()};srUtter=u;speechSynthesis.speak(u)}
    catch(err){srUtter={};setTimeout(function(){stopSpeech();renderSR()},2500)}
    renderSR();
  });

  /* teclado virtual */
  function renderVK(){
    var v=document.getElementById('ov-vk');if(!v)return;
    v.style.display=S.virtualKeyboard?'flex':'none';if(!S.virtualKeyboard){mdl.style.setProperty('--vkh','0px');return}
    var rows=['qwertyuiop','asdfghjkl','zxcvbnm'];
    v.innerHTML='<div class="vk-h">'+(vkTarget?L('Campo de texto','Text field')+': '+L('Responder ao fórum','Reply to the forum'):L('Clique em um campo de texto','Click a text field'))+'</div>'+
      rows.map(function(r,i){return '<div class="row">'+r.split('').map(function(c){return '<button type="button" tabindex="-1" data-key="'+c+'">'+c+'</button>'}).join('')+(i===2?'<button type="button" class="m" tabindex="-1" data-key="bksp" aria-label="Backspace">⌫</button>':'')+'</div>'}).join('')+
      '<div class="row"><button type="button" class="m" tabindex="-1" data-key=",">,</button><button type="button" class="w" tabindex="-1" data-key=" ">'+L('espaço','space')+'</button><button type="button" class="m" tabindex="-1" data-key=".">.</button></div>';
    mdl.style.setProperty('--vkh',v.offsetHeight+'px');
  }
  function typeKey(k){
    var ta=document.getElementById('mdl-reply');if(!ta)return;
    if(!vkTarget){vkTarget=true;renderVK()}
    fieldText=k==='bksp'?fieldText.slice(0,-1):fieldText+k;ta.value=fieldText;
    var sc=document.getElementById('mdl-scroll');if(sc&&ta.getBoundingClientRect().bottom>mdl.getBoundingClientRect().bottom-190){sc.scrollTop+=ta.getBoundingClientRect().bottom-mdl.getBoundingClientRect().bottom+210}
  }

  /* comandos por voz (simulados) */
  var VC=[['increase','aumentar texto','increase text'],['decrease','diminuir texto','decrease text'],['contrast','alto contraste','high contrast'],['dark','modo escuro','dark mode'],['widen','ampliar conteúdo','widen content'],['reset','restaurar','reset']];
  var vcMsg='';
  function renderVC(){
    var b=document.getElementById('ov-vc');if(!b)return;
    b.style.display=S.voiceCommands?'flex':'none';if(!S.voiceCommands)return;
    b.innerHTML='<span class="dot" aria-hidden="true"></span><span class="msg">'+(vcMsg||L('Ouvindo… (simulação: toque em um comando)','Listening… (demo: tap a command)'))+'</span>'+
      VC.map(function(c){return '<button type="button" data-vc="'+c[0]+'">“'+L(c[1],c[2])+'”</button>'}).join('');
  }
  function voiceCmd(c){
    var cmd=VC.find(function(x){return x[0]===c});
    if(c==='increase')S.textSize=Math.min(4,S.textSize+1);
    if(c==='decrease')S.textSize=Math.max(0,S.textSize-1);
    if(c==='contrast')S.contrast=3;
    if(c==='dark')S.contrast=1;
    if(c==='widen')S.contentWidth=Math.min(3,S.contentWidth+1);
    if(c==='reset'){var keep=S.voiceCommands;S=D.defaults();S.voiceCommands=keep;}
    vcMsg=L('Comando reconhecido: ','Command recognized: ')+'“'+L(cmd[1],cmd[2])+'”';
    clearTimeout(voiceCmd.t);voiceCmd.t=setTimeout(function(){vcMsg='';renderVC()},2600);
    update();
  }

  /* navegação por face (explicação; a demonstração não usa câmera) */
  function renderFace(){
    var b=document.getElementById('ov-face');if(!b)return;
    b.style.display=S.faceNavigation?'block':'none';if(!S.faceNavigation)return;
    b.innerHTML='<svg class="mesh" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><ellipse cx="60" cy="58" rx="34" ry="42"/><path opacity=".5" d="M26 58h68M60 16v84"/><g fill="currentColor" stroke="none"><circle cx="46" cy="50" r="3"/><circle cx="74" cy="50" r="3"/><circle cx="60" cy="66" r="2.4"/><circle cx="50" cy="80" r="2"/><circle cx="60" cy="83" r="2"/><circle cx="70" cy="80" r="2"/></g></svg>'+
      '<b>'+L('Navegação por Face','Face Navigation')+'</b>'+
      L('No Moodle, o navegador pede acesso à câmera e você calibra olhando para o centro da tela. Depois, a cabeça move o cursor; abrir a boca ou piscar os dois olhos clica.','In Moodle, the browser asks for the camera and you calibrate by looking at the center of the screen. Then your head moves the cursor; opening your mouth or blinking both eyes clicks.')+
      '<br><br><small>'+L('Esta demonstração não liga a sua câmera.','This demo does not turn on your camera.')+'</small><button type="button" data-face-off>'+L('Parar','Stop')+'</button>';
  }

  /* ---------- Painel ---------- */
  function matchProfile(){
    var def=D.defaults();
    var p=D.PROFILES.find(function(pr){var a=Object.assign({},def,pr.apply);return Object.keys(def).every(function(k){return a[k]===S[k]})});
    return p?p.id:null;
  }
  function activeCount(){return D.OPTS.filter(function(o){return S[o.id]}).length}
  function countLabel(n){return n===0?L('Nenhuma opção ativa','No options active'):n===1?L('1 opção ativa','1 option active'):L(n+' opções ativas',n+' options active')}
  function rowHTML(o){
    var i=li(),v=S[o.id],forced=(o.id==='hideImages'&&S.focusMode===3);
    var on=!!v||forced, help=o.h?'<button type="button" class="hbtn" data-help="'+o.id+'" aria-expanded="'+(helpOpen===o.id)+'" aria-label="'+L('Ajuda','Help')+': '+o.l[i]+'">?</button>':'';
    var desc=forced?'<em>'+L('Ativado automaticamente pelo Modo Foco (nível 3 — Somente texto)','Automatically enabled by Focus Mode (level 3 — Text only)')+'</em>':(o.d?'<small>'+o.d[i]+'</small>':'');
    var h='';
    if(o.k==='toggle'){
      h='<div class="pgo'+(on?' on':'')+'" data-opt="'+o.id+'"><span class="oi">'+I(o.icon,17)+'</span><span class="ot"><b id="lb-'+o.id+'">'+o.l[i]+'</b>'+desc+'</span>'+help+
        '<button type="button" class="sw" role="switch" aria-checked="'+on+'" aria-labelledby="lb-'+o.id+'" data-sw="'+o.id+'"'+(forced?' disabled':'')+'></button></div>';
    }else{
      var lvl=D.levelLabel(o,v,I18N.lang),dots='';for(var k=1;k<=o.max;k++)dots+='<i class="'+(k<=v?'on':'')+'"></i>';
      h='<div class="pgo'+(v?' on':'')+'" data-opt="'+o.id+'" data-step="'+o.id+'" role="button" tabindex="0" aria-label="'+o.l[i]+': '+lvl+'"><span class="oi">'+I(o.icon,17)+'</span><span class="ot"><b>'+o.l[i]+'</b>'+desc+'</span><span class="stp'+(v?' on':'')+'" aria-hidden="true">'+lvl+' '+dots+'</span></div>';
    }
    if(helpOpen===o.id){var hp=D.HELP[o.id][i];h+='<div class="hbox" id="help-'+o.id+'"><ul>'+hp.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'+(o.id==='voiceCommands'?'':'')+'</div>';}
    return h;
  }
  function renderPanel(keepFocus){
    var i=li(),prof=matchProfile(),n=activeCount(),q=query.trim().toLowerCase();
    var focusSel=null,ae=document.activeElement;
    if(keepFocus&&ae&&panel.contains(ae)){
      focusSel=ae.dataset.sw?'[data-sw="'+ae.dataset.sw+'"]':ae.dataset.step?'[data-step="'+ae.dataset.step+'"]':ae.dataset.prof?'[data-prof="'+ae.dataset.prof+'"]':ae.dataset.cat?'[data-cat="'+ae.dataset.cat+'"]':ae.dataset.help?'[data-help="'+ae.dataset.help+'"]':ae.id==='pg-q'?'#pg-q':ae.dataset.act?'[data-act="'+ae.dataset.act+'"]':ae.dataset.sec?'[data-sec]':null;
    }
    var body='';
    if(!q){
      body+='<button type="button" class="pgp__sec" data-sec aria-expanded="'+profilesOpen+'"><span class="ci">'+I('sparkles',16)+'</span><span class="lab"><b>'+L('Perfis de Acessibilidade','Accessibility Profiles')+'</b><small>'+L('Ative configurações otimizadas com um clique','Enable optimized settings with one click')+'</small></span><span class="chev">'+I('chev',16)+'</span></button>';
      if(profilesOpen){body+='<div class="pgp__grid">'+D.PROFILES.map(function(p){var t=D.TONES[p.tone];
        return '<button type="button" class="pcard" data-prof="'+p.id+'" aria-pressed="'+(prof===p.id)+'" title="'+p.d[i]+'" style="--tb:'+t[0]+';--tt:'+t[1]+';--ti:'+t[2]+';--tbr:'+t[3]+'"><span class="pi">'+I(p.icon,17)+'</span>'+p.l[i]+'<span class="ck">'+I('check',11,3)+'</span></button>'}).join('')+'</div>';}
    }
    var any=false;
    D.CATS.forEach(function(c){
      var opts=D.OPTS.filter(function(o){return o.c===c.id&&(!q||o.l[i].toLowerCase().indexOf(q)>-1||o.l[0].toLowerCase().indexOf(q)>-1)});
      if(!opts.length)return;any=true;
      var open=q?true:!!openCats[c.id],cnt=D.OPTS.filter(function(o){return o.c===c.id&&S[o.id]}).length;
      body+='<div class="pgp__cat"><button type="button" class="pgp__sec" data-cat="'+c.id+'" aria-expanded="'+open+'"><span class="ci">'+I(c.icon,16)+'</span><span class="lab"><b>'+c.l[i]+'</b></span>'+(cnt?'<span class="pgp__cnt">'+cnt+'</span>':'')+'<span class="chev">'+I('chev',16)+'</span></button>'+
        (open?'<div class="pgp__rows">'+opts.map(rowHTML).join('')+'</div>':'')+'</div>';
    });
    if(!any)body+='<p class="pgp__empty">'+L('Nenhuma opção encontrada.','No options found.')+'</p>';
    var scroll=panel.querySelector('.pgp__body');var st=scroll?scroll.scrollTop:0;
    panel.innerHTML='<div class="pgp__head"><span class="pgp__badge">'+I('person',22,2)+'</span><div><h3 class="pgp__title">'+L('Acessibilidade','Accessibility')+'</h3><p class="pgp__count" aria-live="polite">'+countLabel(n)+'</p></div>'+
      '<span class="pgp__x"><button type="button" class="pgp__ib" data-act="reset" aria-label="'+L('Restaurar padrões','Restore defaults')+'"'+(n?'':' disabled')+'>'+I('reset',16)+'</button>'+
      '<button type="button" class="pgp__ib" data-act="close" aria-label="'+L('Fechar','Close')+'">'+I('x',16)+'</button></span></div>'+
      '<div class="pgp__body"><div class="pgp__search"><label class="visually-hidden" for="pg-q">'+L('Buscar opção','Search option')+'</label>'+I('search',16)+'<input id="pg-q" type="search" autocomplete="off" placeholder="'+L('Buscar opção…','Search option…')+'" value="'+query.replace(/"/g,'&quot;')+'"></div>'+body+'</div>'+
      '<div class="pgp__foot"><span>'+L('Desenvolvido com ❤️ pela <strong>UFPel</strong> para você.','Made with ❤️ by <strong>UFPel</strong>, for you.')+'</span><kbd>Alt+A</kbd></div>';
    panel.querySelector('.pgp__body').scrollTop=st;
    if(focusSel){var f=panel.querySelector(focusSel);if(f){f.focus({preventScroll:true});if(f.id==='pg-q'){var l=f.value.length;f.setSelectionRange(l,l)}}}
  }
  var win=document.getElementById('pgwin'),fab=document.getElementById('pgfab'),isOpen=true;
  function renderFab(){
    var n=activeCount();
    fab.innerHTML=I('person',28,2)+(n?'<span class="pgfab__b">'+n+'</span>':'');
    fab.setAttribute('aria-label',(isOpen?L('Fechar painel de acessibilidade','Close accessibility panel'):L('Abrir painel de acessibilidade','Open accessibility panel'))+(n?' ('+countLabel(n)+')':''));
    fab.setAttribute('aria-expanded',String(isOpen));
    win.setAttribute('data-open',String(isOpen));
  }
  function setOpen(o,focus){isOpen=o;renderFab();if(o&&focus){var f=panel.querySelector('.pcard,.pgp__sec');if(f)f.focus({preventScroll:true})}else if(!o&&focus)fab.focus({preventScroll:true})}
  fab.addEventListener('click',function(){setOpen(!isOpen,true)});
  panel.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();setOpen(false,true)}});
  function update(){applyEffects();renderPanel(true);renderFab();}
  function set(id,v){S[id]=v;if(id==='voiceCommands'&&!v)vcMsg='';if(id==='virtualKeyboard'&&!v)vkTarget=false;update()}
  function step(id){var o=D.OPTS.find(function(x){return x.id===id});set(id,(S[id]+1)%(o.max+1))}

  panel.addEventListener('click',function(e){
    var t;
    if((t=e.target.closest('[data-act="reset"]'))){S=D.defaults();vcMsg='';update();return}
    if((t=e.target.closest('[data-act="close"]'))){setOpen(false,true);return}
    if((t=e.target.closest('[data-sec]'))){profilesOpen=!profilesOpen;renderPanel(true);return}
    if((t=e.target.closest('[data-cat]'))){openCats[t.dataset.cat]=!openCats[t.dataset.cat];renderPanel(true);return}
    if((t=e.target.closest('[data-prof]'))){var id=t.dataset.prof;
      if(matchProfile()===id){S=D.defaults()}else{S=Object.assign(D.defaults(),D.PROFILES.find(function(p){return p.id===id}).apply)}
      update();return}
    if((t=e.target.closest('[data-help]'))){helpOpen=helpOpen===t.dataset.help?null:t.dataset.help;renderPanel(true);return}
    if((t=e.target.closest('[data-step]'))){step(t.dataset.step);return}
    if((t=e.target.closest('[data-sw]'))){if(!t.disabled)set(t.dataset.sw,!S[t.dataset.sw]);return}
    if((t=e.target.closest('.pgo[data-opt]'))){var o=t.dataset.opt,sw=t.querySelector('.sw');if(sw&&!sw.disabled)set(o,!S[o]);}
  });
  panel.addEventListener('keydown',function(e){
    var t=e.target.closest('[data-step]');
    if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();step(t.dataset.step)}
  });
  panel.addEventListener('input',function(e){if(e.target.id==='pg-q'){query=e.target.value;renderPanel(true)}});

  document.addEventListener('langchange',function(){mdl.dataset.bio='';renderMock();renderPanel(false);renderFab()});
  renderMock();renderPanel(false);renderFab();
})();
