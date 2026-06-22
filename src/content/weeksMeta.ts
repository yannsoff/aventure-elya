// Display metadata for each of the 8 islands (one per week).
export interface WeekMeta {
  name: string;
  focus: string;
  color: string;
}

export const WEEK_META: WeekMeta[] = [
  { name: 'Île du Départ', focus: 'On consolide !', color: '#36d39a' },
  { name: 'Île des Étoiles', focus: 'On consolide !', color: '#43c6f0' },
  { name: 'Île des Mots', focus: 'On renforce !', color: '#7c5cff' },
  { name: 'Île des Nombres', focus: 'On renforce !', color: '#ff7eb6' },
  { name: "Île de l'Aventure", focus: 'Cap sur Year 2 !', color: '#ff8a5c' },
  { name: 'Île du Trésor', focus: 'Cap sur Year 2 !', color: '#ffc83d' },
  { name: 'Île des Héros', focus: 'On solidifie !', color: '#36d39a' },
  { name: 'Île du Château', focus: 'Prête pour septembre !', color: '#7c5cff' },
];

export const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
export const DAY_SHORT = ['LUN', 'MAR', 'MER', 'JEU', 'VEN'];
