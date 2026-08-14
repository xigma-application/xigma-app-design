// types
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';

// utils
import { getPathTextOffsetHandleAtPoint } from '../getPathTextOffsetHandleAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const buildPathText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 200,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: 'ellipse-1',
  pathStartOffset: 0,
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getPathTextOffsetHandleAtPoint', () => {
  it('should return null when nothing is selected', () => {
    // result
    expect(getPathTextOffsetHandleAtPoint({ x: 200, y: 100 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when more than one node is selected', () => {
    // result
    expect(
      getPathTextOffsetHandleAtPoint({ x: 200, y: 100 }, [buildPathText(), buildPathText({ id: 'text-2' })], IDENTITY_VIEWPORT),
    ).toBeNull();
  });

  it('should return null for a selected node that is not a path-text node', () => {
    // result
    expect(getPathTextOffsetHandleAtPoint({ x: 200, y: 100 }, [buildPathText({ pathId: null })], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return the node id when the point lands on the handle', () => {
    // result
    expect(getPathTextOffsetHandleAtPoint({ x: 200, y: 100 }, [buildPathText()], IDENTITY_VIEWPORT)?.nodeId).toBe('text-1');
  });

  it('should return null when the point is far from the handle', () => {
    // result
    expect(getPathTextOffsetHandleAtPoint({ x: 9000, y: 9000 }, [buildPathText()], IDENTITY_VIEWPORT)).toBeNull();
  });
});
