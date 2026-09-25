import { Mock } from 'vitest';

export type TGlProxy = WebGL2RenderingContext & Record<string, Mock>;

const NON_GL_KEYS = new Set(['$$typeof', 'asymmetricMatch', 'constructor', 'nodeType', 'then', 'toJSON']);

export const createGlProxy = (overrides: Record<string, unknown> = {}): TGlProxy =>
  new Proxy({ ...overrides } as Record<string | symbol, unknown>, {
    get: (target, key) => {
      if (typeof key !== 'string' || NON_GL_KEYS.has(key)) {
        return target[key];
      }

      if (!(key in target)) {
        target[key] = key === key.toUpperCase() ? key : vi.fn(() => ({}));
      }

      return target[key];
    },
  }) as unknown as TGlProxy;
