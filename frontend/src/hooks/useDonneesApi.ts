import { useEffect, useState } from 'react'

/**
 * Données locales d'abord (contenu.json), puis celles de l'API si elle répond.
 * La section s'affiche donc tout de suite et reste complète si l'API est hors ligne :
 * en cas d'erreur, on garde simplement le repli.
 */
export function useDonneesApi<T>(charger: () => Promise<T>, repli: T): T {
  const [donnees, setDonnees] = useState<T>(repli)

  useEffect(() => {
    let actif = true
    charger()
      .then((resultat) => {
        if (actif) setDonnees(resultat)
      })
      .catch(() => {
        // API indisponible ou réponse inattendue : le repli local reste affiché
      })
    return () => {
      actif = false
    }
  }, [charger])

  return donnees
}
