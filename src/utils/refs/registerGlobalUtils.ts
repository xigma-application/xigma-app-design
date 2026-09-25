// utils
import { setRef } from './setRef';

export const registerGlobalUtils = (): void => {
  Object.assign(globalThis, { setRef });
};
