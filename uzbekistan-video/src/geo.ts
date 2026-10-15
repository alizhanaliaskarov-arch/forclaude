import {feature} from 'topojson-client';
import type {Feature, FeatureCollection, Geometry} from 'geojson';
import world from 'world-atlas/countries-50m.json';

type Props = {name: string};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const topo = world as any;
export const countries = (feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, Props>)
  .features;

export const byName = (name: string): Feature<Geometry, Props> => {
  const c = countries.find((x) => x.properties.name === name);
  if (!c) throw new Error(`no country ${name}`);
  return c;
};

export const NEIGHBOURS: [string, string][] = [
  ['Kazakhstan', 'Казах'],
  ['Kyrgyzstan', 'Кыргыз'],
  ['Tajikistan', 'Таджики'],
  ['Afghanistan', 'Афгани'],
  ['Turkmenistan', 'Туркмени'],
];

// [lon, lat]
export const PLACES = {
  tashkent: [69.24, 41.31] as [number, number],
  samarkand: [66.96, 39.65] as [number, number],
  bukhara: [64.42, 39.77] as [number, number],
  khiva: [60.36, 41.38] as [number, number],
  andijan: [72.34, 40.78] as [number, number],
  muynak: [59.03, 43.77] as [number, number],
  kashgar: [75.99, 39.47] as [number, number],
  karachi: [67.0, 24.86] as [number, number],
  liechtenstein: [9.55, 47.15] as [number, number],
};

// Aral Sea, schematic outlines (lon, lat). 1960 shoreline vs. today's remnants.
export const ARAL_1960: [number, number][] = [
  [60.05, 46.8], [60.7, 46.78], [61.25, 46.62], [61.7, 46.35], [61.55, 46.1], [61.1, 46.02],
  [60.85, 45.92], [61.15, 45.75], [61.6, 45.7], [61.8, 45.35], [61.55, 45.05], [61.75, 44.8],
  [61.45, 44.5], [61.2, 44.2], [60.95, 44.05], [60.7, 43.7], [60.3, 43.6], [59.95, 43.5],
  [59.6, 43.62], [59.3, 43.55], [58.95, 43.75], [58.6, 44.05], [58.35, 44.5], [58.25, 45.0],
  [58.3, 45.5], [58.55, 45.95], [59.0, 46.2], [59.5, 46.3], [59.8, 46.2], [60.15, 46.05],
  [60.35, 46.15], [60.0, 46.4], [59.85, 46.62],
];
export const BARSAKELMES: [number, number][] = [
  [60.05, 45.78], [60.3, 45.7], [60.35, 45.55], [60.15, 45.5], [59.98, 45.62],
];
export const ARAL_NORTH_NOW: [number, number][] = [
  [60.3, 46.65], [61.0, 46.6], [61.45, 46.4], [61.6, 46.15], [61.2, 46.0], [60.7, 45.95], [60.25, 46.15],
];
export const ARAL_WEST_NOW: [number, number][] = [
  [58.55, 45.55], [58.8, 45.45], [58.85, 45.0], [58.75, 44.55], [58.55, 44.35], [58.4, 44.6], [58.38, 45.1],
];

/** Project a lon/lat ring with any d3 projection into an SVG path. */
export const ringPath = (pts: [number, number][], proj: (p: [number, number]) => [number, number] | null) => {
  const xy = pts.map((p) => proj(p)).filter((p): p is [number, number] => p !== null);
  return `M${xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z`;
};
