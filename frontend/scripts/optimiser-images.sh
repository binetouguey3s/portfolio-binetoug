#!/bin/sh
# Génère les images responsives du site (WebP + AVIF, plusieurs largeurs) à partir des
# originaux de assets/ (source unique). À relancer si une photo ou un logo change.
#   sh scripts/optimiser-images.sh      (depuis frontend/)
# Outils : sips (macOS), cwebp et avifenc (brew install webp libavif).
# Les largeurs doivent correspondre à src/lib/images.ts.
set -e
cd "$(dirname "$0")/.."
ASSETS=../assets
TMP=$(mktemp -d)

generer() { # source destination_sans_extension largeurs...
  source=$1; dest=$2; shift 2
  mkdir -p "$(dirname "$dest")"
  for largeur in "$@"; do
    sips --resampleWidth "$largeur" -s format png "$source" --out "$TMP/image.png" >/dev/null
    cwebp -quiet -q 80 -alpha_q 90 "$TMP/image.png" -o "$dest-$largeur.webp"
    avifenc -q 55 -s 6 "$TMP/image.png" "$dest-$largeur.avif" >/dev/null
    echo "  $dest-$largeur : $(wc -c < "$dest-$largeur.webp" | tr -d ' ') o (webp), $(wc -c < "$dest-$largeur.avif" | tr -d ' ') o (avif)"
  done
}

generer "$ASSETS/photos/portrait-accueil.jpg" public/images/portrait-accueil 360 540 720
generer "$ASSETS/photos/portrait-apropos.jpg" public/images/portrait-apropos 400 600 880
generer "$ASSETS/projets/sensuivi-logo-sombre.png" public/images/projets/sensuivi-logo-sombre 150 300 450
generer "$ASSETS/projets/sensuivi-logo-clair.png" public/images/projets/sensuivi-logo-clair 150 300 450
rm -rf "$TMP"
