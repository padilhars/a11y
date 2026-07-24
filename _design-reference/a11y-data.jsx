// a11y-data.jsx — options, profiles, icons, i18n strings

/* ===========================================================================
   ICON REGISTRY — inline SVG paths from Lucide @ 0.453, stroke 1.75
   =========================================================================== */
const ICON_PATHS = {
  // Brand / FAB / panel chrome
  accessibility: '<circle cx="12" cy="4" r="2"/><path d="M19 13v-2a7 7 0 0 0-14 0v2"/><path d="m12 12 4 10"/><path d="m12 12-4 10"/><path d="M8 16h8"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  // Categories
  typography: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2A10 10 0 0 0 2 12c0 5.5 4.5 10 10 10a3 3 0 0 0 3-3 1.7 1.7 0 0 0-.4-1.1 1.7 1.7 0 0 1-.4-1.1 3 3 0 0 1 3-3h2.5a4.5 4.5 0 0 0 4.5-4.5c0-5.5-4.5-9.3-10-9.3z"/>',
  media: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  tools: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  profile: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  // Profile presets
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eyeLow: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
  droplets: '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  alertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  brain: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  // Content / typography
  type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
  bookOpen: '<path d="M12 7v14"/><path d="M16 12h2"/><path d="M16 8h2"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/><path d="M6 12h2"/><path d="M6 8h2"/>',
  heading: '<path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  squareButton: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 12h6"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  imageOff: '<line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/><path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/>',
  tooltip: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  textSize: '<path d="M21 6V4H3v2"/><path d="M7 18h10"/><path d="M12 4v14"/>',
  lineHeight: '<path d="M3 8 7 4l4 4"/><path d="M7 4v16"/><path d="m3 16 4 4 4-4"/><path d="M15 4h7"/><path d="M15 12h7"/><path d="M15 20h7"/>',
  textSpacing: '<path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/>',
  // Color & contrast
  contrast: '<circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z" fill="currentColor"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  contrastHigh: '<circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/>',
  invertColors: '<path d="M12 22A10 10 0 0 1 5 5l7 7Z"/><path d="M12 2a10 10 0 0 1 7 17l-7-7Z"/>',
  pipette: '<path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>',
  saturation: '<path d="M5.5 5 7 2h10l1.5 3"/><path d="M5.5 19 7 22h10l1.5-3"/><path d="M2 12h20"/><circle cx="12" cy="12" r="6"/>',
  blackAndWhite: '<circle cx="12" cy="12" r="10"/><path d="M12 2v20"/>',
  // Navigation
  ruler: '<path d="M21.3 8.7 8.7 21.3a2.41 2.41 0 0 1-3.4 0l-2.6-2.6a2.41 2.41 0 0 1 0-3.4L15.3 2.7a2.41 2.41 0 0 1 3.4 0l2.6 2.6a2.41 2.41 0 0 1 0 3.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/>',
  mask: '<path d="M3 7v8a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4z"/><path d="M7 11h.01"/><path d="M17 11h.01"/><path d="M7 15h10"/>',
  mousePointer: '<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/>',
  mousePointer2: '<path d="M4 4l7.07 17 2.51-7.39 7.39-2.51L4 4z"/>',
  focus: '<circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',
  // Advanced
  volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
  keyboard: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/>',
  mic: '<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  // Moodle page icons
  moodleLogo: '<path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z"/>',
  menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  fileText: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/>',
  video: '<rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><polygon points="10 9 15 12 10 15 10 9"/>',
  edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  messageSquare: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
  award: '<circle cx="12" cy="8" r="6"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  graduationCap: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  dot: '<circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
};

function Icon({ name, size = 18, stroke = 1.75, style = {}, className = '' }) {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
}

/* ===========================================================================
   i18n STRINGS
   =========================================================================== */
const STRINGS = {
  'pt-BR': {
    panelTitle: 'Acessibilidade',
    panelSubtitle: 'Personalize sua experiência',
    profilesTitle: 'Perfis de Acessibilidade',
    profilesSubtitle: 'Ative configurações otimizadas com um clique',
    activeCount: (n) => `${n} ${n === 1 ? 'opção ativa' : 'opções ativas'}`,
    noneActive: 'Nenhuma opção ativa',
    reset: 'Restaurar padrões',
    close: 'Fechar',
    search: 'Buscar opção…',
    activeProfile: 'Perfil ativo',
    on: 'Ativo',
    off: 'Inativo',
    levels: ['Padrão', 'Pequeno', 'Médio', 'Grande', 'Máximo'],
    spacingLevels: ['Padrão', 'Leve', 'Médio', 'Amplo'],
    lineHeightLevels: ['Padrão', '1.5×', '1.8×', '2.2×'],
    cursorLevels: ['Padrão', 'Grande preto', 'Grande branco'],
    contrastLevels: ['Padrão', 'Escuro', 'Claro', 'Alto'],
    colorChangeLevels: ['Padrão', 'Protanopia', 'Deuteranopia', 'Tritanopia'],
    saturationLevels: ['Normal', 'Alta', 'Baixa', 'Mono'],
    saveTitle: 'Preferências salvas',
    saveSubtitle: 'Suas configurações são lembradas em todas as páginas do Moodle.',
    keyboardHint: 'Atalho: Alt + A',
    categories: {
      profiles: 'Perfis',
      typography: 'Texto e Tipografia',
      color: 'Cores e Contraste',
      media: 'Mídia e Animação',
      navigation: 'Foco e Navegação',
      advanced: 'Recursos Avançados',
    },
  },
  'en': {
    panelTitle: 'Accessibility',
    panelSubtitle: 'Customize your experience',
    profilesTitle: 'Accessibility Profiles',
    profilesSubtitle: 'Enable optimized settings with one click',
    activeCount: (n) => `${n} ${n === 1 ? 'option active' : 'options active'}`,
    noneActive: 'No options active',
    reset: 'Reset all',
    close: 'Close',
    search: 'Search option…',
    activeProfile: 'Active profile',
    on: 'On',
    off: 'Off',
    levels: ['Default', 'Small', 'Medium', 'Large', 'Max'],
    spacingLevels: ['Default', 'Light', 'Medium', 'Wide'],
    lineHeightLevels: ['Default', '1.5×', '1.8×', '2.2×'],
    cursorLevels: ['Default', 'Big black', 'Big white'],
    contrastLevels: ['Default', 'Dark', 'Light', 'High'],
    colorChangeLevels: ['Default', 'Protanopia', 'Deuteranopia', 'Tritanopia'],
    saturationLevels: ['Normal', 'High', 'Low', 'Mono'],
    saveTitle: 'Preferences saved',
    saveSubtitle: 'Your settings are remembered across all Moodle pages.',
    keyboardHint: 'Shortcut: Alt + A',
    categories: {
      profiles: 'Profiles',
      typography: 'Text & Typography',
      color: 'Color & Contrast',
      media: 'Media & Motion',
      navigation: 'Focus & Navigation',
      advanced: 'Advanced',
    },
  },
};

/* ===========================================================================
   ACCESSIBILITY OPTIONS — full definition
   =========================================================================== */
// kind: 'toggle' | 'stepper' (multi-phase button)
// level: for steppers, the active index (0 = default/off)
const OPTIONS = [
  // — Typography —
  { id: 'readableFont',    cat: 'typography', kind: 'toggle',  icon: 'type',          label: { 'pt-BR': 'Fonte Legível',         'en': 'Readable Font' },        desc: { 'pt-BR': 'Aplica Atkinson Hyperlegible',  'en': 'Applies Atkinson Hyperlegible' } },
  { id: 'dyslexicFont',    cat: 'typography', kind: 'toggle',  icon: 'bookOpen',      label: { 'pt-BR': 'Fonte para Dislexia',   'en': 'Dyslexia-Friendly Font' },desc: { 'pt-BR': 'Fonte otimizada Lexend',        'en': 'Lexend optimized font' } },
  { id: 'highlightTitles', cat: 'typography', kind: 'toggle',  icon: 'heading',       label: { 'pt-BR': 'Destacar Títulos',      'en': 'Highlight Titles' } },
  { id: 'highlightLinks',  cat: 'typography', kind: 'toggle',  icon: 'link',          label: { 'pt-BR': 'Destacar Links',        'en': 'Highlight Links' } },
  { id: 'highlightButtons',cat: 'typography', kind: 'toggle',  icon: 'squareButton',  label: { 'pt-BR': 'Destacar Botões',       'en': 'Highlight Buttons' } },
  { id: 'textSize',        cat: 'typography', kind: 'stepper', max: 4, icon: 'textSize',  label: { 'pt-BR': 'Tamanho do Texto',  'en': 'Text Size' },          stringsKey: 'levels' },
  { id: 'lineHeight',      cat: 'typography', kind: 'stepper', max: 3, icon: 'lineHeight',label: { 'pt-BR': 'Altura da Linha',   'en': 'Line Height' },        stringsKey: 'lineHeightLevels' },
  { id: 'textSpacing',     cat: 'typography', kind: 'stepper', max: 3, icon: 'textSpacing',label:{ 'pt-BR': 'Espaçamento do Texto','en':'Text Spacing' },       stringsKey: 'spacingLevels' },

  // — Color & contrast —
  { id: 'contrast',        cat: 'color', kind: 'stepper', max: 3, icon: 'contrast',  label: { 'pt-BR': 'Contraste',           'en': 'Contrast' },         stringsKey: 'contrastLevels' },
  { id: 'invertColors',    cat: 'color', kind: 'toggle',          icon: 'invertColors', label:{ 'pt-BR': 'Inverter Cores',      'en': 'Invert Colors' } },
  { id: 'colorChange',     cat: 'color', kind: 'stepper', max: 3, icon: 'pipette',    label:{ 'pt-BR': 'Mudar Cores',          'en': 'Color Adjustment' }, stringsKey: 'colorChangeLevels', desc: { 'pt-BR': 'Filtros para daltonismo', 'en': 'Color-blindness filters' } },
  { id: 'saturation',      cat: 'color', kind: 'stepper', max: 3, icon: 'saturation', label:{ 'pt-BR': 'Saturação',            'en': 'Saturation' },       stringsKey: 'saturationLevels' },

  // — Media & motion —
  { id: 'hideImages',      cat: 'media', kind: 'toggle', icon: 'imageOff', label: { 'pt-BR': 'Ocultar Imagens',  'en': 'Hide Images' } },
  { id: 'pauseAnimations', cat: 'media', kind: 'toggle', icon: 'pause',    label: { 'pt-BR': 'Pausar Animações', 'en': 'Pause Animations' } },
  { id: 'tooltips',        cat: 'media', kind: 'toggle', icon: 'tooltip',  label: { 'pt-BR': 'Dicas de Ferramentas', 'en': 'Tooltips' } },

  // — Focus & navigation —
  { id: 'readingGuide',    cat: 'navigation', kind: 'toggle', icon: 'ruler', label: { 'pt-BR': 'Guia de Leitura',  'en': 'Reading Guide' } },
  { id: 'readingMask',     cat: 'navigation', kind: 'toggle', icon: 'mask',  label: { 'pt-BR': 'Máscara de Leitura', 'en': 'Reading Mask' } },
  { id: 'cursor',          cat: 'navigation', kind: 'stepper', max: 2, icon: 'mousePointer', label: { 'pt-BR': 'Cursor', 'en': 'Cursor' }, stringsKey: 'cursorLevels' },
  { id: 'focusMode',       cat: 'navigation', kind: 'toggle', icon: 'focus', label: { 'pt-BR': 'Modo Foco', 'en': 'Focus Mode' }, desc: { 'pt-BR': 'Esconde elementos não essenciais', 'en': 'Hide non-essential UI' } },

  // — Advanced —
  { id: 'screenReader',    cat: 'advanced', kind: 'toggle', icon: 'volume',   label: { 'pt-BR': 'Leitor de Tela', 'en': 'Screen Reader' },   desc: { 'pt-BR': 'Texto para fala', 'en': 'Text-to-speech' } },
  { id: 'virtualKeyboard', cat: 'advanced', kind: 'toggle', icon: 'keyboard', label: { 'pt-BR': 'Teclado Virtual', 'en': 'Virtual Keyboard' } },
  { id: 'voiceCommands',   cat: 'advanced', kind: 'toggle', icon: 'mic',      label: { 'pt-BR': 'Comandos por Voz', 'en': 'Voice Commands' } },
];

/* ===========================================================================
   PROFILES — preset bundles of options
   =========================================================================== */
const PROFILES = [
  {
    id: 'lowVision',
    icon: 'eyeLow',
    tone: 'blue',
    label: { 'pt-BR': 'Baixa Visão',              'en': 'Low Vision' },
    desc:  { 'pt-BR': 'Texto maior, alto contraste, cursor destacado', 'en': 'Larger text, high contrast, big cursor' },
    apply: { textSize: 3, contrast: 3, cursor: 1, highlightLinks: true, highlightButtons: true },
  },
  {
    id: 'colorBlind',
    icon: 'droplets',
    tone: 'amber',
    label: { 'pt-BR': 'Daltonismo',                'en': 'Color Blind' },
    desc:  { 'pt-BR': 'Filtro de cores e links destacados', 'en': 'Color filter and highlighted links' },
    apply: { colorChange: 2, highlightLinks: true, saturation: 1 },
  },
  {
    id: 'dyslexia',
    icon: 'book',
    tone: 'violet',
    label: { 'pt-BR': 'Dislexia',                  'en': 'Dyslexia' },
    desc:  { 'pt-BR': 'Fonte amigável, espaçamento e guia de leitura', 'en': 'Friendly font, spacing, reading guide' },
    apply: { dyslexicFont: true, textSpacing: 2, lineHeight: 2, readingGuide: true },
  },
  {
    id: 'adhd',
    icon: 'zap',
    tone: 'pink',
    label: { 'pt-BR': 'TDAH / Foco',               'en': 'ADHD / Focus' },
    desc:  { 'pt-BR': 'Máscara de leitura, modo foco e animações pausadas', 'en': 'Reading mask, focus mode, no motion' },
    apply: { readingMask: true, focusMode: true, pauseAnimations: true },
  },
  {
    id: 'senior',
    icon: 'user',
    tone: 'green',
    label: { 'pt-BR': 'Idoso / Sênior',            'en': 'Senior' },
    desc:  { 'pt-BR': 'Fonte legível, texto maior, botões destacados', 'en': 'Readable font, large text, highlighted buttons' },
    apply: { readableFont: true, textSize: 2, highlightButtons: true, cursor: 1, lineHeight: 1 },
  },
  {
    id: 'epilepsy',
    icon: 'alertTriangle',
    tone: 'red',
    label: { 'pt-BR': 'Epilepsia',                 'en': 'Epilepsy' },
    desc:  { 'pt-BR': 'Sem movimento, saturação baixa, ambiente calmo', 'en': 'No motion, low saturation, calm environment' },
    apply: { pauseAnimations: true, saturation: 2, contrast: 1 },
  },
  {
    id: 'motor',
    icon: 'hand',
    tone: 'cyan',
    label: { 'pt-BR': 'Deficiência Motora',        'en': 'Motor Impairment' },
    desc:  { 'pt-BR': 'Cursor grande, botões destacados e dicas', 'en': 'Big cursor, highlighted buttons, tooltips' },
    apply: { cursor: 1, highlightButtons: true, tooltips: true, focusMode: false },
  },
  {
    id: 'cognitive',
    icon: 'brain',
    tone: 'teal',
    label: { 'pt-BR': 'Cognitivo',                 'en': 'Cognitive' },
    desc:  { 'pt-BR': 'Modo foco, fonte legível, sem distrações', 'en': 'Focus mode, readable font, no distractions' },
    apply: { focusMode: true, pauseAnimations: true, readableFont: true, lineHeight: 2, hideImages: false },
  },
  {
    id: 'night',
    icon: 'moon',
    tone: 'slate',
    label: { 'pt-BR': 'Modo Noturno',              'en': 'Night Mode' },
    desc:  { 'pt-BR': 'Contraste escuro e baixa saturação',  'en': 'Dark contrast and low saturation' },
    apply: { contrast: 1, saturation: 2 },
  },
];

/* ===========================================================================
   DEFAULT SETTINGS
   =========================================================================== */
const DEFAULT_SETTINGS = {
  readableFont: false,
  dyslexicFont: false,
  highlightTitles: false,
  highlightLinks: false,
  highlightButtons: false,
  hideImages: false,
  tooltips: false,
  pauseAnimations: false,
  textSize: 0,
  lineHeight: 0,
  textSpacing: 0,
  contrast: 0,
  invertColors: false,
  colorChange: 0,
  saturation: 0,
  readingGuide: false,
  readingMask: false,
  cursor: 0,
  focusMode: false,
  screenReader: false,
  virtualKeyboard: false,
  voiceCommands: false,
};

// Helper — count non-default options
function countActive(settings) {
  let n = 0;
  for (const k in DEFAULT_SETTINGS) {
    if (settings[k] !== DEFAULT_SETTINGS[k]) n++;
  }
  return n;
}

// Tone colors for profile chips
const TONE_COLORS = {
  blue:   { bg: '#eff6ff', text: '#1d4ed8', icon: '#3b82f6', border: '#dbeafe' },
  amber:  { bg: '#fffbeb', text: '#b45309', icon: '#f59e0b', border: '#fef3c7' },
  violet: { bg: '#f5f3ff', text: '#6d28d9', icon: '#8b5cf6', border: '#ede9fe' },
  pink:   { bg: '#fdf2f8', text: '#be185d', icon: '#ec4899', border: '#fce7f3' },
  green:  { bg: '#f0fdf4', text: '#15803d', icon: '#22c55e', border: '#dcfce7' },
  red:    { bg: '#fef2f2', text: '#b91c1c', icon: '#ef4444', border: '#fee2e2' },
  cyan:   { bg: '#ecfeff', text: '#0e7490', icon: '#06b6d4', border: '#cffafe' },
  teal:   { bg: '#f0fdfa', text: '#0f766e', icon: '#14b8a6', border: '#ccfbf1' },
  slate:  { bg: '#f1f5f9', text: '#334155', icon: '#475569', border: '#e2e8f0' },
};

// Apply profile — merge into current settings
function applyProfile(currentSettings, profile) {
  // Reset first, then layer profile
  return { ...DEFAULT_SETTINGS, ...profile.apply };
}

// Expose everything globally for other babel scripts
Object.assign(window, {
  Icon,
  ICON_PATHS,
  STRINGS,
  OPTIONS,
  PROFILES,
  DEFAULT_SETTINGS,
  TONE_COLORS,
  countActive,
  applyProfile,
});
