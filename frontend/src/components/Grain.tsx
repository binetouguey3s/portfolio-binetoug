/**
 * Texture de grain sur toute la page (bruit feTurbulence, comme la maquette).
 * Fixe, transparente aux clics ; l'opacité suit le mode (--grain-opacity).
 * Les styles sont dans src/styles/index.css (classe .grain).
 */
export default function Grain() {
  return <div aria-hidden="true" className="grain" />
}
