/* Dados do local_a11y 1.0.0, transcritos de classes/options.php, classes/profiles.php
   (= amd/src/profiles.js) e lang/{pt_br,en}/local_a11y.php. Mesmos ids, ordem e presets. */
window.A11Y_DATA=(function(){
  var LV={
    level:[['Padrão','Default'],['Pequeno','Small'],['Médio','Medium'],['Grande','Large'],['Máximo','Max']],
    spacing:[['Padrão','Default'],['Leve','Light'],['Médio','Medium'],['Amplo','Wide']],
    align:[['Padrão','Default'],['Esquerda','Left'],['Centralizado','Center'],['Direita','Right'],['Justificado','Justify']],
    lineheight:[['Padrão','Default'],['1.5×','1.5×'],['1.8×','1.8×'],['2.2×','2.2×']],
    cursor:[['Padrão','Default'],['Grande preto','Big black'],['Grande branco','Big white']],
    contrast:[['Padrão','Default'],['Escuro','Dark'],['Claro','Light'],['Alto','High']],
    colorchange:[['Padrão','Default'],['Protanopia','Protanopia'],['Deuteranopia','Deuteranopia'],['Tritanopia','Tritanopia']],
    saturation:[['Normal','Normal'],['Alta','High'],['Baixa','Low'],['Mono','Mono']],
    bluelight:[['Desligado','Off'],['Sutil','Subtle'],['Médio','Medium'],['Forte','Strong']],
    focus:[['Padrão','Default'],['Sem distrações','Distraction-free'],['Leitura confortável','Comfortable reading'],['Somente texto','Text only']],
    font:[['Desligado','Off'],['Lexend','Lexend'],['OpenDyslexic','OpenDyslexic']],
    width:[['Padrão','Default'],['Ampla','Wide'],['Mais ampla','Wider'],['Máxima','Maximum']]
  };
  var CATS=[
    {id:'typography',l:['Texto e Tipografia','Text & Typography'],icon:'type',open:true},
    {id:'color',l:['Cores e Contraste','Color & Contrast'],icon:'palette'},
    {id:'media',l:['Mídia e Animação','Media & Motion'],icon:'image'},
    {id:'navigation',l:['Foco e Navegação','Focus & Navigation'],icon:'nav'},
    {id:'advanced',l:['Recursos Avançados','Advanced'],icon:'wrench'}
  ];
  /* k: toggle | stepper; max; lv: chave de LV; d: descrição curta; h: tem ajuda "?" */
  var OPTS=[
    {id:'readableFont',c:'typography',k:'toggle',icon:'type',l:['Fonte Legível','Readable Font'],d:['Aplica Atkinson Hyperlegible','Applies Atkinson Hyperlegible']},
    {id:'fontVariant',c:'typography',k:'stepper',max:2,lv:'font',icon:'book',l:['Fonte para Dislexia','Dyslexia-Friendly Font']},
    {id:'highlightTitles',c:'typography',k:'toggle',icon:'heading',l:['Destacar Títulos','Highlight Titles']},
    {id:'highlightLinks',c:'typography',k:'toggle',icon:'link',l:['Destacar Links','Highlight Links']},
    {id:'highlightButtons',c:'typography',k:'toggle',icon:'square',l:['Destacar Botões','Highlight Buttons']},
    {id:'textSize',c:'typography',k:'stepper',max:4,lv:'level',icon:'textsize',l:['Tamanho do Texto','Text Size']},
    {id:'lineHeight',c:'typography',k:'stepper',max:3,lv:'lineheight',icon:'lines',l:['Altura da Linha','Line Height']},
    {id:'textSpacing',c:'typography',k:'stepper',max:3,lv:'spacing',icon:'spacing',l:['Espaçamento do Texto','Text Spacing']},
    {id:'wordSpacing',c:'typography',k:'stepper',max:3,lv:'spacing',icon:'hspace',l:['Espaçamento entre Palavras','Word Spacing']},
    {id:'textAlign',c:'typography',k:'stepper',max:4,lv:'align',icon:'align',l:['Alinhamento do Texto','Text Alignment']},
    {id:'bionicReading',c:'typography',k:'toggle',icon:'bold',h:1,l:['Leitura Biônica','Bionic Reading']},
    {id:'contrast',c:'color',k:'stepper',max:3,lv:'contrast',icon:'contrast',l:['Contraste','Contrast']},
    {id:'invertColors',c:'color',k:'toggle',icon:'invert',l:['Inverter Cores','Invert Colors']},
    {id:'colorChange',c:'color',k:'stepper',max:3,lv:'colorchange',icon:'pipette',l:['Mudar Cores','Color Adjustment'],d:['Filtros para daltonismo','Color-blindness filters']},
    {id:'saturation',c:'color',k:'stepper',max:3,lv:'saturation',icon:'drop',l:['Saturação','Saturation']},
    {id:'blueLightFilter',c:'color',k:'stepper',max:3,lv:'bluelight',icon:'moon',l:['Filtro de Luz Azul','Blue Light Filter']},
    {id:'hideImages',c:'media',k:'toggle',icon:'imageoff',h:1,l:['Ocultar Imagens','Hide Images']},
    {id:'pauseAnimations',c:'media',k:'toggle',icon:'pause',h:1,l:['Pausar Animações','Pause Animations']},
    {id:'silenceMedia',c:'media',k:'toggle',icon:'mute',h:1,l:['Silenciar Mídia','Silence Media']},
    {id:'tooltips',c:'media',k:'toggle',icon:'tip',h:1,l:['Dicas de Ferramentas','Tooltips']},
    {id:'readingGuide',c:'navigation',k:'toggle',icon:'guide',h:1,l:['Guia de Leitura','Reading Guide']},
    {id:'readingMask',c:'navigation',k:'toggle',icon:'mask',h:1,l:['Máscara de Leitura','Reading Mask']},
    {id:'magnifier',c:'navigation',k:'toggle',icon:'zoom',h:1,l:['Lupa','Magnifier']},
    {id:'cursor',c:'navigation',k:'stepper',max:2,lv:'cursor',icon:'cursor',l:['Cursor','Cursor']},
    {id:'focusMode',c:'navigation',k:'stepper',max:3,lv:'focus',icon:'focus',l:['Modo Foco','Focus Mode'],d:['Simplifica a página','Simplifies the page']},
    {id:'contentWidth',c:'navigation',k:'stepper',max:3,lv:'width',icon:'maximize',l:['Ampliar Conteúdo','Widen Content'],d:['Amplia a coluna de leitura','Widens the reading column']},
    {id:'screenReader',c:'advanced',k:'toggle',icon:'volume',h:1,l:['Leitor de Tela','Screen Reader'],d:['Texto para fala','Text-to-speech']},
    {id:'virtualKeyboard',c:'advanced',k:'toggle',icon:'keyboard',h:1,l:['Teclado Virtual','Virtual Keyboard']},
    {id:'voiceCommands',c:'advanced',k:'toggle',icon:'mic',h:1,l:['Comandos por Voz','Voice Commands']},
    {id:'faceNavigation',c:'advanced',k:'toggle',icon:'face',h:1,l:['Navegação por Face','Face Navigation'],d:['Controle o cursor com movimentos da cabeça','Control cursor with head movements']}
  ];
  var TONES={blue:['#eff6ff','#1d4ed8','#3b82f6','#dbeafe'],amber:['#fffbeb','#b45309','#f59e0b','#fef3c7'],violet:['#f5f3ff','#6d28d9','#8b5cf6','#ede9fe'],pink:['#fdf2f8','#be185d','#ec4899','#fce7f3'],green:['#f0fdf4','#15803d','#22c55e','#dcfce7'],red:['#fef2f2','#b91c1c','#ef4444','#fee2e2'],cyan:['#ecfeff','#0e7490','#06b6d4','#cffafe'],teal:['#f0fdfa','#0f766e','#14b8a6','#ccfbf1'],slate:['#f1f5f9','#334155','#475569','#e2e8f0']};
  var PROFILES=[
    {id:'lowVision',tone:'blue',icon:'eyelow',l:['Baixa Visão','Low Vision'],d:['Texto maior, alto contraste, cursor destacado','Larger text, high contrast, big cursor'],apply:{textSize:3,contrast:3,cursor:1,highlightLinks:true,highlightButtons:true}},
    {id:'colorBlind',tone:'amber',icon:'droplets',l:['Daltonismo','Color Blind'],d:['Filtro de cores e links destacados','Color filter and highlighted links'],apply:{colorChange:2,highlightLinks:true,saturation:1}},
    {id:'dyslexia',tone:'violet',icon:'bookp',l:['Dislexia','Dyslexia'],d:['Fonte amigável, espaçamento e guia de leitura','Friendly font, spacing, reading guide'],apply:{fontVariant:1,textSpacing:2,lineHeight:2,readingGuide:true}},
    {id:'adhd',tone:'pink',icon:'zap',l:['TDAH / Foco','ADHD / Focus'],d:['Máscara de leitura, modo foco e animações pausadas','Reading mask, focus mode, no motion'],apply:{readingMask:true,focusMode:2,pauseAnimations:true}},
    {id:'senior',tone:'green',icon:'user',l:['Idoso / Sênior','Senior'],d:['Fonte legível, texto maior, botões destacados','Readable font, large text, highlighted buttons'],apply:{readableFont:true,textSize:2,highlightButtons:true,cursor:1,lineHeight:1}},
    {id:'epilepsy',tone:'red',icon:'alert',l:['Epilepsia','Epilepsy'],d:['Sem movimento, saturação baixa, ambiente calmo','No motion, low saturation, calm environment'],apply:{pauseAnimations:true,saturation:2,contrast:1}},
    {id:'motor',tone:'cyan',icon:'hand',l:['Deficiência Motora','Motor Impairment'],d:['Cursor grande, botões destacados e dicas','Big cursor, highlighted buttons, tooltips'],apply:{cursor:1,highlightButtons:true,tooltips:true,focusMode:0}},
    {id:'cognitive',tone:'teal',icon:'brain',l:['Cognitivo','Cognitive'],d:['Modo foco, fonte legível, sem distrações','Focus mode, readable font, no distractions'],apply:{focusMode:2,pauseAnimations:true,readableFont:true,lineHeight:2,hideImages:false}},
    {id:'night',tone:'slate',icon:'moonp',l:['Modo Noturno','Night Mode'],d:['Contraste escuro e baixa saturação','Dark contrast and low saturation'],apply:{contrast:1,saturation:2}}
  ];
  var HELP={
    bionicReading:[['Escurece as primeiras letras de cada palavra, proporcionalmente ao tamanho dela.','Não altera o texto: leitores de tela continuam lendo cada palavra inteira.','A eficácia para velocidade ou compreensão de leitura não é comprovada de forma consistente.'],['Bolds the first letters of each word, in proportion to its length.','Does not change the text: screen readers still read every word whole.','Its effect on reading speed or comprehension is not consistently backed by evidence.']],
    hideImages:[['Oculta todas as imagens e vídeos da página, inclusive vídeos incorporados.','Vale para todas, inclusive as que carregam informação, como gráficos.'],['Hides every image and video on the page, including embedded videos.','This applies to all of them, including ones that carry information, like charts.']],
    pauseAnimations:[['Pausa animações e transições CSS, GIFs animados e vídeos em reprodução.','Vídeos que tentarem começar sozinhos também são pausados.'],['Pauses CSS animations and transitions, animated GIFs and playing video.','Any video that tries to start on its own is paused too.']],
    silenceMedia:[['Silencia áudios e vídeos da página.','Desligar a opção não religa o som sozinho.'],['Mutes audio and video on the page.','Turning it off does not unmute on its own.']],
    tooltips:[['Troca a dica nativa do navegador por uma bolha maior e mais fácil de ler.','Também aparece ao navegar pelo teclado.'],['Replaces the browser\'s native tooltip with a larger, easier-to-read bubble.','It also appears when navigating by keyboard.']],
    readingGuide:[['Uma linha acompanha o ponteiro e ajuda a não perder a linha de leitura.'],['A line follows the pointer so you don\'t lose your place.']],
    readingMask:[['Escurece a tela e deixa visível só a faixa em volta do ponteiro.'],['Dims the screen and keeps only the band around the pointer visible.']],
    magnifier:[['Uma lupa circular acompanha o ponteiro e amplia o conteúdo sob ela.','No plugin, as setas movem a lupa e + e − mudam o zoom (2x, 3x, 4x).'],['A round magnifier follows the pointer and enlarges the content under it.','In the plugin, arrow keys move it and + and − change the zoom (2x, 3x, 4x).']],
    screenReader:[['Passe o mouse sobre um texto para destacá-lo.','Clique no texto destacado para ouvi-lo em voz alta.'],['Hover any text to highlight it.','Click the highlighted text to hear it read aloud.']],
    virtualKeyboard:[['Clique em um campo de texto e digite pelas teclas na tela.'],['Click a text field and type with the on-screen keys.']],
    voiceCommands:[['Diga, por exemplo: "aumentar texto", "alto contraste", "modo escuro" ou "restaurar".','Nesta demonstração, toque nos comandos em vez de falar.'],['Say, for example: "increase text", "high contrast", "dark mode" or "reset".','In this demo, tap the commands instead of speaking.']],
    faceNavigation:[['Olhe para a câmera e clique em Calibrar. Mova a cabeça para mover o cursor.','Para clicar, abra a boca ou pisque os dois olhos por cerca de 1 segundo.'],['Look at the camera and click Calibrate. Move your head to move the cursor.','To click, open your mouth or blink both eyes for about 1 second.']]
  };
  function defaults(){var o={};OPTS.forEach(function(x){o[x.id]=x.k==='toggle'?false:0});return o}
  function levelLabel(opt,v,lang){var i=lang==='en'?1:0;return LV[opt.lv][v][i]}
  /* lista legível do que um preset liga: [{label, value}] */
  function describe(apply,lang){
    var i=lang==='en'?1:0,out=[];
    OPTS.forEach(function(o){var v=apply[o.id];if(!v)return;
      out.push({label:o.l[i],value:o.k==='stepper'?LV[o.lv][v][i]:null});});
    return out;
  }
  return {LV:LV,CATS:CATS,OPTS:OPTS,PROFILES:PROFILES,TONES:TONES,HELP:HELP,defaults:defaults,levelLabel:levelLabel,describe:describe};
})();

/* Ícones (traço 1.8, 24×24), no estilo do painel */
window.A11Y_ICONS={
  type:'<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  book:'<path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  heading:'<path d="M6 12h12M6 20V4M18 20V4"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  square:'<rect x="3" y="7" width="18" height="10" rx="3"/><path d="M8 12h8"/>',
  textsize:'<path d="M3 19 8 6l5 13M4.8 15h6.4M15 19l3-8 3 8M15.9 16.7h4.2"/>',
  lines:'<path d="M3 6h18M3 12h18M3 18h18"/>',
  spacing:'<path d="M3 8h4M17 8h4M7 8l-2 8M7 8l2 8M5.5 13.5h3M14 16V8h2.5a2 2 0 0 1 0 4H14m0 0h3a2 2 0 0 1 0 4h-3"/>',
  hspace:'<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M4 12h16"/>',
  align:'<path d="M3 6h18M3 12h12M3 18h16"/>',
  bold:'<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>',
  contrast:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>',
  invert:'<path d="M12 3v18M5 5l14 14"/><circle cx="12" cy="12" r="9"/>',
  pipette:'<path d="m2 22 1-1h3l9-9M3 21v-3l9-9M15 6l3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3z"/>',
  drop:'<path d="M12 2.7s6 6.3 6 11.3a6 6 0 0 1-12 0c0-5 6-11.3 6-11.3z"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  imageoff:'<path d="m2 2 20 20M10.4 5H19a2 2 0 0 1 2 2v8.6M21 21H5a2 2 0 0 1-2-2V7M8.5 13.5 5 17M14 14l7 7"/>',
  pause:'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  mute:'<path d="M11 5 6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6"/>',
  tip:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  guide:'<path d="M3 12h18M3 6h10M3 18h14"/>',
  mask:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 14h18"/>',
  zoom:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
  cursor:'<path d="m4 4 7 17 2.5-7.5L21 11z"/>',
  focus:'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/>',
  maximize:'<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  volume:'<path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  keyboard:'<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5"/>',
  face:'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M9 15.5c1.8 1.3 4.2 1.3 6 0"/>',
  palette:'<circle cx="13.5" cy="6.5" r="1.2" fill="currentColor"/><circle cx="17.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="8.5" cy="7.5" r="1.2" fill="currentColor"/><circle cx="6.5" cy="12.5" r="1.2" fill="currentColor"/><path d="M12 2a10 10 0 0 0 0 20c1 0 1.6-.8 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7H16a6 6 0 0 0 6-6c0-4.4-4.5-8.4-10-8.4z"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3-3-9 9"/>',
  nav:'<path d="M3 11 22 2l-9 19-2-8z"/>',
  wrench:'<path d="M14.7 6.3a4 4 0 0 0 5 5l-9.4 9.4a2.1 2.1 0 0 1-3-3z"/>',
  eyelow:'<path d="M9.9 4.2A10 10 0 0 1 12 4c7 0 10 8 10 8a13 13 0 0 1-1.7 2.7M6.6 6.6A13 13 0 0 0 2 12s3 8 10 8a9.7 9.7 0 0 0 5.4-1.6M2 2l20 20M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  droplets:'<path d="M7 16.3c2.2 0 4-1.8 4-4.1 0-1.2-.6-2.3-1.8-3.3S7.2 6.4 7 5.3c-.3 1.1-1 2.6-2.2 3.6S3 11 3 12.2c0 2.3 1.8 4.1 4 4.1zM12.6 6.6A11 11 0 0 0 14 3.5c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.9 4.9"/>',
  bookp:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  alert:'<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3zM12 9v4M12 17h.01"/>',
  hand:'<path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
  brain:'<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18zM12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18zM12 5v13"/>',
  moonp:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  person:'<circle cx="12" cy="4.5" r="2" fill="currentColor" stroke="none"/><path d="M5 8.5c2.3.7 4.6 1 7 1s4.7-.3 7-1M12 9.5v4.5m0 0-3 6.5m3-6.5 3 6.5"/>',
  sparkles:'<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2zM19 3v4M21 5h-4"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',
  chev:'<path d="m6 9 6 6 6-6"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  play:'<path d="M7 4v16l13-8z" fill="currentColor" stroke="none"/>',
  prev:'<path d="m15 18-6-6 6-6"/>',
  next:'<path d="m9 18 6-6-6-6"/>'
};
window.svgI=function(name,size,sw){return '<svg width="'+(size||18)+'" height="'+(size||18)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||1.8)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(window.A11Y_ICONS[name]||'')+'</svg>'};
