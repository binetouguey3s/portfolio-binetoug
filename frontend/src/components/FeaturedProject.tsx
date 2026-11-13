import { useState } from 'react'
import Button from './Button'
import Chip from './Chip'
import Rings from './Rings'
import VideoModal from './VideoModal'
import { LIEN_EXTERNE, lienValide } from '../lib/liens'
import type { ProjetVedette } from '../types/content'
import Image from './Image'

/**
 * Carte vedette Sen Suivi (captures 01-…-04 et 03-…-04).
 * Gauche : badge, nom, description validée, rôle, stack, boutons.
 * Droite : fond --surface, cernes, logo monochrome (sombre / clair), devise, piliers.
 * « Voir l'application » est masqué tant que le lien n'est pas renseigné.
 * Pas de capture d'écran ni d'étude de cas (règle du projet).
 */
export default function FeaturedProject({ vedette }: { vedette: ProjetVedette }) {
  const [videoOuverte, setVideoOuverte] = useState(false)

  return (
    <article className="flex flex-col overflow-hidden rounded-panel border border-border bg-bg lg:flex-row">
      <div className="flex min-w-0 flex-col gap-[22px] p-7 md:p-12 lg:flex-[1_1_460px]">
        <Chip variant="accent" className="self-start tracking-[1px] max-md:text-[11px]">
          {vedette.badge}
        </Chip>
        <h3 className="m-0 font-display text-[34px] leading-[1.05] font-normal tracking-[-1px] md:text-[46px]">
          {/* Le nom mène à l'application en ligne (si son lien est renseigné) */}
          {lienValide(vedette.lienApplication) ? (
            <a
              href={vedette.lienApplication}
              {...LIEN_EXTERNE}
              className="text-current no-underline decoration-glow decoration-1 underline-offset-[6px] transition-colors hover:text-accent hover:underline"
            >
              {vedette.nom}
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          ) : (
            vedette.nom
          )}
        </h3>
        <p className="m-0 text-base leading-[1.7] text-text/85 md:text-[17px]">{vedette.description}</p>
        <p className="m-0 text-[14px] text-accent">{vedette.role}</p>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {vedette.stack.map((techno) => (
            <li key={techno}>
              <Chip className="px-[11px]">{techno}</Chip>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3 pt-1.5">
          {lienValide(vedette.lienApplication) ? (
            <Button href={vedette.lienApplication} {...LIEN_EXTERNE} className="px-6">
              {vedette.boutonApplication}
            </Button>
          ) : null}
          <Button
            id="video-sen-suivi"
            variant="secondary"
            onClick={() => setVideoOuverte(true)}
            aria-haspopup="dialog"
            className="px-[22px]"
          >
            {vedette.boutonVideo}
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-[340px] min-w-0 items-center justify-center bg-surface md:min-h-[420px] lg:flex-[1_1_460px]">
        <Rings variant="angle" />
        <div className="relative flex flex-col items-center gap-[22px] p-10 text-center">
          <Image
            src={vedette.logo.sombre}
            sizes="150px"
            alt="Logo Sen Suivi"
            width={474}
            height={633}
            loading="lazy"
            className="seulement-sombre h-auto w-[150px]"
          />
          <Image
            src={vedette.logo.clair}
            sizes="150px"
            alt="Logo Sen Suivi"
            width={474}
            height={633}
            loading="lazy"
            className="seulement-clair h-auto w-[150px]"
          />
          <p className="m-0 max-w-[340px] font-display text-[22px] leading-[1.3] font-light text-text italic md:text-[26px]">
            {vedette.devise}
          </p>
          <p className="m-0 font-mono text-[12px] tracking-[2px] text-accent">{vedette.piliers}</p>
        </div>
      </div>

      <VideoModal
        ouverte={videoOuverte}
        surFermeture={() => setVideoOuverte(false)}
        titre={vedette.nom}
        paysage={{ video: vedette.video, affiche: vedette.videoAffiche }}
        portrait={{ video: vedette.videoMobile, affiche: vedette.videoAfficheMobile }}
      />
    </article>
  )
}
