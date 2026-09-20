// others
import {
  DEFAULT_GLASS_DEPTH,
  DEFAULT_GLASS_DISPERSION,
  DEFAULT_GLASS_FROST,
  DEFAULT_GLASS_LIGHT_ANGLE,
  DEFAULT_GLASS_LIGHT_INTENSITY,
  DEFAULT_GLASS_REFRACTION,
  DEFAULT_GLASS_SPLAY,
} from 'constant/effect';

// types
import { TEffect } from 'types/design/types';

export type TEffectGlass = {
  depth: number;
  dispersion: number;
  frost: number;
  lightAngle: number;
  lightIntensity: number;
  refraction: number;
  splay: number;
};

export const getEffectGlass = (effect: TEffect): TEffectGlass => ({
  depth: effect.depth ?? DEFAULT_GLASS_DEPTH,
  dispersion: effect.dispersion ?? DEFAULT_GLASS_DISPERSION,
  frost: effect.frost ?? DEFAULT_GLASS_FROST,
  lightAngle: effect.lightAngle ?? DEFAULT_GLASS_LIGHT_ANGLE,
  lightIntensity: effect.lightIntensity ?? DEFAULT_GLASS_LIGHT_INTENSITY,
  refraction: effect.refraction ?? DEFAULT_GLASS_REFRACTION,
  splay: effect.splay ?? DEFAULT_GLASS_SPLAY,
});
