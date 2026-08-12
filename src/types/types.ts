import { TFunction } from 'i18next';

declare global {
  type T2DCoordinates = {
    y: number;
    x: number;
  };
  type T3DCoordinates = T2DCoordinates & {
    z: number;
  };
  type TObjectWithRequiredKeys<T, K = keyof T> = K extends keyof T ? { [key: string]: T } : { [key in keyof K]: T };
  type TObjectWithOptionalKeys<T, K> = { [key in keyof K]?: T };
  type TObject<T, K = keyof T, O extends 'optional' | 'required' = 'required'> = O extends 'optional'
    ? TObjectWithOptionalKeys<T, K>
    : TObjectWithRequiredKeys<T, K>;
  type TObjectArray<T> = Array<keyof T>;
  type TFunc<A extends any[] = [], T = void> = (...args: A) => T;
  type TPickValues<T, K extends keyof T> = T[K];
  type TT = TFunction;
}

export {};
