/**
 * Point d'entrée unique de GSAP.
 * Les plugins sont enregistrés une seule fois ici ; les composants
 * importent toujours gsap, ScrollTrigger, SplitText et useGSAP depuis ce fichier.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

export { gsap, ScrollTrigger, SplitText, useGSAP }
