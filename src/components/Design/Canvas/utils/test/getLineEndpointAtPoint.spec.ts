// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode } from 'types/design/types';

// utils
import { getLineEndpointAtPoint } from '../getLineEndpointAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const line: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 0,
  x2: 100,
  y1: 0,
  y2: 0,
};

describe('getLineEndpointAtPoint', () => {
  it('should return endpoint "a" when the point is near the first endpoint', () => {
    // result
    expect(getLineEndpointAtPoint({ x: 1, y: 1 }, [line], IDENTITY_VIEWPORT)).toEqual({ endpoint: 'a', nodeId: 'line-1' });
  });

  it('should return endpoint "b" when the point is near the second endpoint', () => {
    // result
    expect(getLineEndpointAtPoint({ x: 99, y: 1 }, [line], IDENTITY_VIEWPORT)).toEqual({ endpoint: 'b', nodeId: 'line-1' });
  });

  it('should return null when the point is near the middle of the line, away from both endpoints', () => {
    // result
    expect(getLineEndpointAtPoint({ x: 50, y: 0 }, [line], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when nothing is selected', () => {
    // result
    expect(getLineEndpointAtPoint({ x: 0, y: 0 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when more than one node is selected', () => {
    // result
    expect(getLineEndpointAtPoint({ x: 0, y: 0 }, [line, line], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should return null when the selected node is not a line', () => {
    // mock
    const frame: TFrameNode = {
      fill: '#fff',
      height: 10,
      id: 'frame-1',
      name: 'Frame',
      parentId: null,
      rotation: 0,
      childIds: [], clipContent: true, type: NodeType.frame,
      width: 10,
      x: 0,
      y: 0,
    };

    // result
    expect(getLineEndpointAtPoint({ x: 0, y: 0 }, [frame], IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should widen the hit radius in world units as the viewport zooms out', () => {
    // result — LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX is 6, so 10 world units off endpoint "a" misses
    // at zoom 1 but hits at zoom 0.5 (12px radius covers more world space)
    expect(getLineEndpointAtPoint({ x: 10, y: 0 }, [line], IDENTITY_VIEWPORT)).toBeNull();
    expect(getLineEndpointAtPoint({ x: 10, y: 0 }, [line], { x: 0, y: 0, zoom: 0.5 })).toEqual({ endpoint: 'a', nodeId: 'line-1' });
  });
});
