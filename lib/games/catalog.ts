import { BASE_KEYMAP, type KeyMap } from '../engine/input'
import type { Action } from '../engine/types'

export type GameSlug =
  | 'parkour-rush'
  | 'survival-zone'
  | 'mini-warfare'
  | 'zombie-escape'
  | 'street-escape'
  | 'shadow-assassin'

export interface TouchButton {
  action: Action
  label: string
}

export interface TouchLayout {
  /** Analog stick on the left side. */
  moveStick?: boolean
  /** Analog aim stick on the right side; aiming also fires. */
  aimStick?: boolean
  /** Directional buttons on the left side. */
  arrows?: Action[]
  buttons: TouchButton[]
}

export interface GameMeta {
  slug: GameSlug
  name: string
  genre: string
  tagline: string
  description: string
  objective: string
  accent: string
  featured: boolean
  keyboard: string[]
  touch: string[]
  keymap: KeyMap
  touchLayout: TouchLayout
}

export const GAMES: GameMeta[] = [
  {
    slug: 'parkour-rush',
    name: 'Parkour Rush',
    genre: 'Parkour e ação',
    tagline: 'Corra, pule e deslize até a linha de chegada.',
    description:
      'Atravesse a pista de telhados pulando obstáculos, deslizando sob barreiras e coletando energia. Passe pelos checkpoints e chegue ao fim com o melhor tempo.',
    objective: 'Chegue à linha de chegada com vidas sobrando. Checkpoints salvam seu progresso.',
    accent: '#22d3ee',
    featured: true,
    keyboard: ['Espaço, W ou seta para cima: pular', 'S ou seta para baixo: deslizar', 'A/D ou setas laterais: frear e acelerar'],
    touch: ['Botão Pular e botão Deslizar', 'Setas laterais para frear e acelerar'],
    keymap: { ...BASE_KEYMAP, Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', ArrowDown: 'slide', KeyS: 'slide' },
    touchLayout: {
      arrows: ['left', 'right'],
      buttons: [
        { action: 'slide', label: 'Deslizar' },
        { action: 'jump', label: 'Pular' },
      ],
    },
  },
  {
    slug: 'survival-zone',
    name: 'Survival Zone',
    genre: 'Sobrevivência em arena',
    tagline: 'Resista a ondas de inimigos cada vez mais fortes.',
    description:
      'Uma arena fechada, ondas sem fim. Mova-se, mire e atire, colete kits médicos, munição e armas novas para sobreviver o máximo possível.',
    objective: 'Sobreviva ao maior número de ondas. Cada onda traz inimigos mais rápidos e resistentes.',
    accent: '#a3e635',
    featured: true,
    keyboard: ['WASD ou setas: mover', 'Mouse: mirar e clicar para atirar', 'R: recarregar'],
    touch: ['Analógico esquerdo: mover', 'Analógico direito: mirar e atirar', 'Botão Recarregar'],
    keymap: { ...BASE_KEYMAP, KeyR: 'reload', Space: 'fire' },
    touchLayout: { moveStick: true, aimStick: true, buttons: [{ action: 'reload', label: 'Recarregar' }] },
  },
  {
    slug: 'mini-warfare',
    name: 'Mini Warfare',
    genre: 'Shooter de arena',
    tagline: 'Partidas de 2 minutos contra bots táticos.',
    description:
      'Combate rápido em uma arena com coberturas. Os bots se movem e atiram de volta. Elimine o máximo que puder antes de o tempo acabar.',
    objective: 'Faça mais eliminações que mortes antes do fim do cronômetro.',
    accent: '#fb923c',
    featured: false,
    keyboard: ['WASD ou setas: mover', 'Mouse: mirar e clicar para atirar', 'R: recarregar'],
    touch: ['Analógico esquerdo: mover', 'Analógico direito: mirar e atirar', 'Botão Recarregar'],
    keymap: { ...BASE_KEYMAP, KeyR: 'reload', Space: 'fire' },
    touchLayout: { moveStick: true, aimStick: true, buttons: [{ action: 'reload', label: 'Recarregar' }] },
  },
  {
    slug: 'zombie-escape',
    name: 'Zombie Escape',
    genre: 'Fuga e sobrevivência',
    tagline: 'Ache a chave, abra a porta e fuja da horda.',
    description:
      'Um complexo escuro infestado. Encontre a chave para destrancar as portas, economize munição, colete suprimentos e alcance a saída antes que os zumbis te alcancem.',
    objective: 'Pegue a chave amarela, destranque as portas e chegue à saída verde.',
    accent: '#4ade80',
    featured: true,
    keyboard: ['WASD ou setas: mover', 'Mouse: mirar e clicar para atirar', 'R: recarregar'],
    touch: ['Analógico esquerdo: mover', 'Analógico direito: mirar e atirar', 'Botão Recarregar'],
    keymap: { ...BASE_KEYMAP, KeyR: 'reload', Space: 'fire' },
    touchLayout: { moveStick: true, aimStick: true, buttons: [{ action: 'reload', label: 'Recarregar' }] },
  },
  {
    slug: 'street-escape',
    name: 'Street Escape',
    genre: 'Corrida arcade',
    tagline: 'Costure o trânsito e solte o nitro.',
    description:
      'Fuja pela avenida trocando de faixa, desviando de carros, cones e óleo. Junte moedas, encha o nitro e vá o mais longe possível.',
    objective: 'Percorra a maior distância sem perder todas as vidas.',
    accent: '#f472b6',
    featured: false,
    keyboard: ['A/D ou setas laterais: trocar de faixa', 'W/seta para cima: acelerar, S/seta para baixo: frear', 'Espaço ou Shift: nitro'],
    touch: ['Setas laterais para trocar de faixa', 'Botões Frear e Nitro'],
    keymap: { ...BASE_KEYMAP, Space: 'nitro', ShiftLeft: 'nitro', ShiftRight: 'nitro' },
    touchLayout: {
      arrows: ['left', 'right'],
      buttons: [
        { action: 'down', label: 'Frear' },
        { action: 'nitro', label: 'Nitro' },
      ],
    },
  },
  {
    slug: 'shadow-assassin',
    name: 'Shadow Assassin',
    genre: 'Stealth 2D',
    tagline: 'Pegue o documento e saia sem ser visto.',
    description:
      'Infiltre-se em fases de plataforma vigiadas. Evite os cones de visão, esconda-se nas sombras agachado, distraia guardas com pedras e elimine quem estiver de costas.',
    objective: 'Pegue o documento dourado de cada fase e alcance a saída sem ser detectado.',
    accent: '#c084fc',
    featured: false,
    keyboard: ['A/D ou setas: andar', 'W, seta para cima ou Espaço: pular', 'S ou seta para baixo: agachar (silencioso)', 'E: eliminar guarda de costas ou atirar pedra'],
    touch: ['Setas para andar', 'Botões Pular, Agachar e Ação'],
    keymap: { ...BASE_KEYMAP, Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', ArrowDown: 'crouch', KeyS: 'crouch', KeyE: 'interact', KeyF: 'interact' },
    touchLayout: {
      arrows: ['left', 'right'],
      buttons: [
        { action: 'crouch', label: 'Agachar' },
        { action: 'interact', label: 'Ação' },
        { action: 'jump', label: 'Pular' },
      ],
    },
  },
]

export function getGame(slug: string) {
  return GAMES.find((game) => game.slug === slug)
}
