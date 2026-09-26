// types
import { EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';
import { TVectorNodeDragSnapshot, TVectorNodeResizeSnapshot, TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { createVectorSnapshotsRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorSnapshotsRefs/createVectorSnapshotsRefs';
import { getSceneVectorEffectShape } from '../getSceneVectorEffectShape';
import { getVectorNodeEffectShape } from '../getVectorNodeEffectShape';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const effects = [{ type: EffectType.dropShadow } as TEffect];
const vector = makeSquareVector({ effects });
const layers = [
  {
    fillRule: 'evenOdd' as const,
    polygons: [
      [
        { x: 10, y: 10 },
        { x: 20, y: 10 },
        { x: 20, y: 20 },
      ],
    ],
  },
];

describe('getSceneVectorEffectShape', () => {
  it('should skip a vector without a shadow or noise', () => {
    // result
    expect(getSceneVectorEffectShape(makeSquareVector(), createVectorSnapshotsRefs())).toBeNull();
  });

  it('should use the effect shape of the vector itself without a snapshot', () => {
    // result
    expect(getSceneVectorEffectShape(vector, createVectorSnapshotsRefs())).toBe(getVectorNodeEffectShape(vector));
  });

  it('should move the shape with a dragged vector and keep its key so the shadow texture is reused', () => {
    // mock
    const refs = createVectorSnapshotsRefs();
    const own = getVectorNodeEffectShape(vector);

    refs.draggedVectorNodeSnapshotsRef.current = new Map([
      [vector.id, { deltaX: 5, deltaY: -3, effectLayers: own.layers } as TVectorNodeDragSnapshot],
    ]);

    // before
    const shape = getSceneVectorEffectShape(vector, refs);

    // result
    expect(shape?.key).toBe(own.key);
    expect(shape?.bounds).toEqual({ ...own.bounds, x: own.bounds.x + 5, y: own.bounds.y - 3 });
  });

  it('should scale the snapshot shape of a resized vector', () => {
    // mock
    const refs = createVectorSnapshotsRefs();
    const snapshot = { anchorX: 10, anchorY: 10, effectLayers: layers, rotation: 0, scaleX: 2, scaleY: 1 } as TVectorNodeResizeSnapshot;

    refs.resizedVectorNodeSnapshotsRef.current = new Map([[vector.id, snapshot]]);

    // result
    expect(getSceneVectorEffectShape(vector, refs)?.bounds).toEqual({ height: 10, width: 20, x: 10, y: 10 });
  });

  it('should turn the snapshot shape of a rotated vector around its pivot', () => {
    // mock
    const refs = createVectorSnapshotsRefs();
    const snapshot = { deltaDegrees: 180, effectLayers: layers, pivot: { x: 10, y: 10 } } as TVectorNodeRotateSnapshot;

    refs.rotatedVectorNodeSnapshotsRef.current = new Map([[vector.id, snapshot]]);

    // before
    const bounds = getSceneVectorEffectShape(vector, refs)?.bounds;

    // result
    expect(bounds?.x).toBeCloseTo(0);
    expect(bounds?.width).toBeCloseTo(10);
  });

  it('should draw nothing for snapshots taken before the vector had effects', () => {
    // mock
    const refs = createVectorSnapshotsRefs();

    refs.resizedVectorNodeSnapshotsRef.current = new Map([[vector.id, { rotation: 0 } as TVectorNodeResizeSnapshot]]);

    // result
    expect(getSceneVectorEffectShape(vector, refs)?.polygons).toEqual([]);

    // action
    refs.resizedVectorNodeSnapshotsRef.current = null;
    refs.draggedVectorNodeSnapshotsRef.current = new Map([[vector.id, { deltaX: 0, deltaY: 0 } as TVectorNodeDragSnapshot]]);

    // result
    expect(getSceneVectorEffectShape(vector, refs)?.polygons).toEqual([]);

    // action
    refs.draggedVectorNodeSnapshotsRef.current = null;
    refs.rotatedVectorNodeSnapshotsRef.current = new Map([
      [vector.id, { deltaDegrees: 0, pivot: { x: 0, y: 0 } } as TVectorNodeRotateSnapshot],
    ]);

    // result
    expect(getSceneVectorEffectShape(vector, refs)?.polygons).toEqual([]);
  });
});
