/* Documentação: busca, índice lateral, "Neste capítulo", links de seção e download do PDF. */
(function(){
  var L=function(p,e){return window.I18N&&I18N.lang==='en'?e:p};
  function norm(s){return (s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()}
  var toastEl;
  function toast(msg){
    if(!toastEl){toastEl=document.createElement('div');toastEl.className='toast';toastEl.setAttribute('role','status');document.body.appendChild(toastEl)}
    toastEl.textContent=msg;toastEl.hidden=false;clearTimeout(toastEl._t);toastEl._t=setTimeout(function(){toastEl.hidden=true},3600);
  }
  var IDX=window.DOC_INDEX||[],SET=window.DOC_SET||{};

  /* ---------- download do PDF ----------
     No site final é um link comum. Dentro do visualizador de artifacts, o download passa pelo recurso
     "downloads" da plataforma (a pessoa confirma antes de salvar). */
  var dlP=null;
  function getDl(){if(!dlP)dlP=(window.claude&&window.claude.use)?window.claude.use('downloads').catch(function(){return null}):Promise.resolve(null);return dlP}
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-dl]');if(!a)return;
    if(!(window.claude&&window.claude.use))return; /* fora do visualizador: o link normal resolve */
    e.preventDefault();
    var path=a.getAttribute('data-dl'),name=path.split('/').pop();
    getDl().then(function(dl){
      if(!dl){window.open(a.href,'_blank','noopener');return}
      toast(L('Preparando o PDF…','Preparing the PDF…'));
      return fetch(path).then(function(r){if(!r.ok)throw new Error('http');return r.blob()}).then(function(b){return dl.save({filename:name,data:b})})
        .then(function(){toast(L('PDF salvo.','PDF saved.'))})
        .catch(function(err){var c=err&&err.code;if(c==='declined')return;toast(L('Não foi possível baixar o PDF agora.','The PDF could not be downloaded right now.'))});
    });
  });

  /* ---------- busca (página inicial da documentação) ---------- */
  var q=document.getElementById('q'),res=document.getElementById('results');
  if(q&&res){
    var run=function(){
      var v=norm(q.value.trim());
      if(!v){res.hidden=true;res.innerHTML='';return}
      var terms=v.split(/\s+/);
      var hits=IDX.filter(function(it){var t=norm(it.t+' '+it.c);return terms.every(function(w){return t.indexOf(w)>-1})}).slice(0,12);
      res.hidden=false;
      res.innerHTML=hits.length?hits.map(function(h){var d=SET[h.d];return '<li><a href="'+h.d+'.html#'+h.id+'">'+h.t.replace(/</g,'&lt;')+'<small>'+L(d.pt,d.en)+(h.c?' · '+h.c.replace(/</g,'&lt;'):'')+'</small></a></li>'}).join(''):'<li class="empty">'+L('Nada encontrado para','Nothing found for')+' "'+q.value.replace(/</g,'&lt;')+'".</li>';
    };
    q.addEventListener('input',run);document.addEventListener('langchange',function(){if(q.value)run()});
  }

  /* ---------- páginas de documento ---------- */
  var TOC=window.DOC_TOC;
  if(TOC){
    var sideLinks=[].slice.call(document.querySelectorAll('.side .chapters a')),tocList=document.getElementById('toc-list');
    var curId=null;
    function setChapter(id){
      if(id===curId)return;curId=id;
      sideLinks.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+id)});
      var c=TOC.find(function(x){return x.id===id});
      if(tocList)tocList.innerHTML=c&&c.sub.length?c.sub.map(function(s){return '<li><a href="#'+s.id+'">'+s.t.replace(/</g,'&lt;')+'</a></li>'}).join(''):'<li><a href="#'+(c?c.id:'conteudo')+'">'+(c?c.t.replace(/</g,'&lt;'):'')+'</a></li>';
    }
    var heads=TOC.map(function(c){return document.getElementById(c.id)}).filter(Boolean);
    function onScroll(){var id=heads.length?heads[0].id:null;heads.forEach(function(h){if(h.getBoundingClientRect().top<=140)id=h.id});setChapter(id)}
    window.addEventListener('scroll',function(){cancelAnimationFrame(onScroll.r);onScroll.r=requestAnimationFrame(onScroll)},{passive:true});
    onScroll();
    /* âncora "#" ao lado de cada título, para copiar o link */
    document.querySelectorAll('.doc-body h2[id],.doc-body h3[id],.doc-body h4[id]').forEach(function(h){
      var a=document.createElement('a');a.className='anchor';a.href='#'+h.id;a.textContent='#';
      a.setAttribute('aria-label',L('Copiar link para esta seção','Copy link to this section'));
      a.addEventListener('click',function(){try{navigator.clipboard.writeText(location.href.split('#')[0]+'#'+h.id).then(function(){toast(L('Link da seção copiado.','Section link copied.'))},function(){})}catch(err){}});
      h.appendChild(a);
    });
    /* aviso de idioma */
    var pt=document.querySelector('.ptonly');
    function lang(){if(pt)pt.hidden=!(window.I18N&&I18N.lang==='en')}
    document.addEventListener('langchange',lang);lang();
  }

  /* filtro do índice lateral */
  var sq=document.getElementById('sq');
  if(sq){sq.addEventListener('input',function(){var v=norm(sq.value.trim());
    document.querySelectorAll('.side ol li').forEach(function(li){li.hidden=v&&norm(li.textContent).indexOf(v)<0});});}

  /* menu lateral recolhível no celular */
  var side=document.querySelector('.side'),tg=document.querySelector('.side-toggle');
  if(side&&tg){
    function setOpen(o){side.dataset.open=o;tg.setAttribute('aria-expanded',o)}
    setOpen(!matchMedia('(max-width:820px)').matches);
    tg.addEventListener('click',function(){setOpen(side.dataset.open!=='true')});
    side.addEventListener('click',function(e){if(e.target.closest('.chapters a')&&matchMedia('(max-width:820px)').matches)setOpen(false)});
  }
})();
