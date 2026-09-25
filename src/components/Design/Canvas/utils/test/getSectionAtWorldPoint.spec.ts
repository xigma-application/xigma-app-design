// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSectionNode } from 'types/design/types';

// utils
import { getSectionAtWorldPoint } from '../getSectionAtWorldPoint';

const section = (id: string, x: number, childIds: string[] = []): TSectionNode => ({
  childIds,
  fills: [{ color: '#444444', opacity: 100, type: 'solid' }],
  height: 200,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 200,
  x,
  y: 0,
});

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fills: [],
  height: 200,
  id: 'frame',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 500,
  y: 0,
};

describe('getSectionAtWorldPoint', () => {
  it('should return the topmost section under the point', () => {
    // mock
    const outer = section('outer', 0);
    const inner = section('inner', 50);

    // action / result
    expect(getSectionAtWorldPoint({ x: 100, y: 100 }, [outer, inner])?.id).toBe('inner');
  });

  it('should ignore a frame under the point', () => {
    // action / result
    expect(getSectionAtWorldPoint({ x: 600, y: 100 }, [frame])).toBeNull();
  });

  it('should return null over empty canvas', () => {
    // action / result
    expect(getSectionAtWorldPoint({ x: 1000, y: 1000 }, [section('outer', 0)])).toBeNull();
  });
});
