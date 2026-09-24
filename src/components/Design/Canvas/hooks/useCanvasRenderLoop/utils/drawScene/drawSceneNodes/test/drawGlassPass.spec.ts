// types
import { EffectType, NodeType } from 'types/design/enums';
import { TMaskRenderer } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { drawGlassPass } from '../drawGlassPass';

const getBooleanGlassSdfMock = vi.fn();

vi.mock('../getGlassProgram', () => ({ getGlassProgram: (): unknown => ({ buffer: {}, program: {} }) }));
vi.mock('../getBooleanGlassSdf', () => ({ getBooleanGlassSdf: (...args: unknown[]): unknown => getBooleanGlassSdfMock(...args) }));

const createRenderer = (): { floats: Map<string, number>; renderer: TMaskRenderer; vec2: Map<string, number[]> } => {
  const floats = new Map<string, number>();
  const vec2 = new Map<string, number[]>();
  const gl = new Proxy(
    {
      getUniformLocation: (_program: unknown, name: string): string => name,
      uniform1f: (name: string, value: number): Map<string, number> => floats.set(name, value),
      uniform2f: (name: string, x: number, y: number): Map<string, number[]> => vec2.set(name, [x, y]),
    } as Record<string, unknown>,
    { get: (target, key: string): unknown => target[key] ?? (key === key.toUpperCase() ? key : vi.fn()) },
  );
  const renderer = {
    context: { canvasHeight: 100, canvasWidth: 100, viewport: { x: 0, y: 0, zoom: 1 } },
    gl,
  } as unknown as TMaskRenderer;

  return { floats, renderer, vec2 };
};

describe('drawGlassPass', () => {
  it("should shape a boolean's glass from its distance texture, centred on its result and unrotated", () => {
    // mock
    const { floats, renderer, vec2 } = createRenderer();
    const node = { id: 'b', rotation: 30, type: NodeType.boolean } as TSceneNode;

    getBooleanGlassSdfMock.mockReturnValueOnce({
      bounds: { height: 40, width: 20, x: 10, y: 20 },
      origin: { x: 2, y: 12 },
      size: { height: 56, width: 36 },
      texture: {},
    });

    // action
    drawGlassPass(renderer, node, createEffect(EffectType.glass), { height: 1, width: 1 } as never, { height: 1, width: 1 });

    // result
    expect(floats.get('u_useSdf')).toBe(1);
    expect(floats.get('u_rotation')).toBe(0);
    expect(vec2.get('u_center')).toEqual([20, 40]);
    expect(vec2.get('u_sdfOrigin')).toEqual([2, 12]);
    expect(vec2.get('u_sdfSize')).toEqual([36, 56]);
  });

  it('should keep the rounded box, rotated with the node, for other nodes', () => {
    // mock
    const { floats, renderer, vec2 } = createRenderer();
    const node = { height: 10, id: 'r', rotation: 90, type: NodeType.rectangle, width: 10, x: 0, y: 0 } as TSceneNode;

    // action
    drawGlassPass(renderer, node, createEffect(EffectType.glass), { height: 1, width: 1 } as never, { height: 1, width: 1 });

    // result
    expect(floats.get('u_useSdf')).toBe(0);
    expect(floats.get('u_rotation')).toBeCloseTo(Math.PI / 2);
    expect(vec2.get('u_sdfOrigin')).toBeUndefined();
  });
});
