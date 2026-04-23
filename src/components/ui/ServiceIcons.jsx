// Icônes SVG custom — S.E Garage
// viewBox 0 0 32 32 — stroke="currentColor" — fill="none" sur root SVG

/* ─── IconCarrosserie ───────────────────────────────────────────────────────
   Silhouette voiture de profil + ligne de dommage + goutte de peinture
──────────────────────────────────────────────────────────────────────────── */
export function IconCarrosserie({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Carrosserie / toit */}
      <path
        d="M9 18 L11 12 Q12 10 14 10 L19 10 Q21 10 22 12 L24 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bas de caisse */}
      <path
        d="M5 18 L27 18 Q28 18 28 19 L28 20 Q28 21 27 21 L5 21 Q4 21 4 20 L4 19 Q4 18 5 18 Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Roue arrière */}
      <circle cx="9" cy="21" r="3" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="9" cy="21" r="1.2" fill="currentColor" fillOpacity="0.35" />
      {/* Roue avant */}
      <circle cx="23" cy="21" r="3" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="23" cy="21" r="1.2" fill="currentColor" fillOpacity="0.35" />
      {/* Ligne de dommage / rayure sur le flanc */}
      <path
        d="M13 16 L15.5 14.5 L14.5 16.5 L17 15"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.75"
      />
      {/* Goutte de peinture */}
      <path
        d="M26.5 9 C26.5 9 25 11 25 12 A1.5 1.5 0 0 0 28 12 C28 11 26.5 9 26.5 9 Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.2"
      />
    </svg>
  )
}

/* ─── IconMecanique ─────────────────────────────────────────────────────────
   Clé à molette à 45° + engrenage partiel en arrière-plan
──────────────────────────────────────────────────────────────────────────── */
export function IconMecanique({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Engrenage partiel (arc bas-droit) — arrière-plan */}
      <path
        d="M20 22 A8 8 0 0 0 27.5 14"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeOpacity="0.18"
      />
      <path
        d="M20 22 A8 8 0 0 0 27.5 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.45"
        strokeDasharray="2.2 2.2"
      />
      {/* Corps principal de la clé — manche */}
      <path
        d="M6.5 25.5 L19.5 12.5"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M6.5 25.5 L19.5 12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Tête de la clé à molette (fourche) */}
      <path
        d="M19.5 12.5 C19.5 12.5 18 9 20 7.5 C22 6 25 7 25.5 9.5 C24 9 22.5 9.5 22 11 L24 13 C22.5 13.5 21.5 13.5 19.5 12.5 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Encoche bas de manche */}
      <path
        d="M7.5 23.5 Q6 25 7 26.5 Q8 28 9.5 27"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ─── IconFreinage ──────────────────────────────────────────────────────────
   Disque de frein ventilé + étrier visible sur le côté gauche
──────────────────────────────────────────────────────────────────────────── */
export function IconFreinage({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Disque extérieur */}
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.75" />
      {/* Zone de friction (anneau intérieur) */}
      <circle
        cx="16"
        cy="16"
        r="7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      {/* Moyeu central */}
      <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16" cy="16" r="1.3" fill="currentColor" fillOpacity="0.4" />
      {/* Ailettes de ventilation (4 lignes radiales dans l'anneau) */}
      <line x1="16" y1="8.5" x2="16" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="20.5" y1="10.1" x2="18.7" y2="13.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="23.5" y1="13.5" x2="20.5" y2="14.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="16" y1="23.5" x2="16" y2="20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6" />
      {/* Étrier — rectangle arrondi sur le côté gauche */}
      <rect
        x="2"
        y="11.5"
        width="5.5"
        height="9"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.75"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Pistons de l'étrier */}
      <line x1="2" y1="14" x2="7.5" y2="14" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.55" />
      <line x1="2" y1="18" x2="7.5" y2="18" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.55" />
    </svg>
  )
}

/* ─── IconPareBrise ─────────────────────────────────────────────────────────
   Trapèze arrondi (forme pare-brise) + bras essuie-glace + gouttes
──────────────────────────────────────────────────────────────────────────── */
export function IconPareBrise({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cadre du pare-brise — trapèze aux coins arrondis */}
      <path
        d="M5 23 Q4 23 4 22 L6 11 Q6.5 9 8.5 9 L23.5 9 Q25.5 9 26 11 L28 22 Q28 23 27 23 Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.07"
      />
      {/* Montants latéraux (pilier A) */}
      <line x1="8" y1="9" x2="5" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.4" />
      <line x1="24" y1="9" x2="27" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.4" />
      {/* Bras d'essuie-glace — arc */}
      <path
        d="M8 21 Q16 11 25 17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        fill="none"
      />
      {/* Balai de l'essuie-glace — ligne sur l'arc */}
      <path
        d="M8.5 20.3 Q16.3 10.5 24.5 16.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.15"
        fill="none"
      />
      {/* Pivot essuie-glace */}
      <circle cx="8" cy="21" r="1.2" fill="currentColor" fillOpacity="0.55" />
      {/* Gouttes de pluie */}
      <line x1="13" y1="5" x2="12" y2="7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="18" y1="4" x2="17" y2="6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="23" y1="5.5" x2="22" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
  )
}

/* ─── IconNettoyage ─────────────────────────────────────────────────────────
   Lance à eau avec jet en éventail + gouttelettes
──────────────────────────────────────────────────────────────────────────── */
export function IconNettoyage({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Corps de la lance / pistolet */}
      <path
        d="M4 22 L14 12 L17 12 L18 10 L20 10 L20 14 L17 14 L17 15 L15 17 L15 22 Q15 23 14 23 L5 23 Q4 23 4 22 Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Gâchette */}
      <path
        d="M10 17 L9 21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Tuyau d'alimentation */}
      <path
        d="M20 12 Q24 12 24 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.5"
      />
      {/* Jets d'eau en éventail depuis la buse */}
      <path
        d="M14 12 L22 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />
      <path
        d="M14.5 11 L25 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      <path
        d="M14.5 13 L23 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
      {/* Gouttelettes dispersées */}
      <circle cx="23" cy="4.5" r="1" fill="currentColor" fillOpacity="0.55" />
      <circle cx="27" cy="8" r="1" fill="currentColor" fillOpacity="0.4" />
      <circle cx="26.5" cy="13" r="1.1" fill="currentColor" fillOpacity="0.35" />
      <circle cx="28" cy="5.5" r="0.8" fill="currentColor" fillOpacity="0.3" />
    </svg>
  )
}

/* ─── IconPieces ────────────────────────────────────────────────────────────
   Écrou hexagonal avec boulon traversant au centre
──────────────────────────────────────────────────────────────────────────── */
export function IconPieces({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hexagone extérieur (écrou) */}
      <path
        d="M16 3 L27.5 9.5 L27.5 22.5 L16 29 L4.5 22.5 L4.5 9.5 Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.07"
      />
      {/* Hexagone intérieur (alésage de l'écrou) */}
      <path
        d="M16 9 L22.2 12.5 L22.2 19.5 L16 23 L9.8 19.5 L9.8 12.5 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeOpacity="0.55"
      />
      {/* Boulon — tige verticale traversant */}
      <line
        x1="16"
        y1="7"
        x2="16"
        y2="25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.0"
      />
      {/* Tête du boulon (hexagone petit en haut) */}
      <path
        d="M13 7 L16 5 L19 7 L19 10 L16 11.5 L13 10 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* Tige du boulon */}
      <line x1="16" y1="11.5" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Filetage (petits tirets sur la tige) */}
      <line x1="14.2" y1="14" x2="17.8" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4" />
      <line x1="14.2" y1="17" x2="17.8" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4" />
      <line x1="14.2" y1="20" x2="17.8" y2="20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4" />
      {/* Écrou inférieur */}
      <path
        d="M13 22 L16 20.5 L19 22 L19 25 L16 27 L13 25 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.2"
      />
    </svg>
  )
}
