// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getMaskCandidateId } from '../getMaskCandidateId';

const buildNode = (id: string, type: NodeType): TSceneNode =>
  ({
    fill: '#ff0000',
    height: 10,
    id,
    name: 'Node',
    parentId: null,
    rotation: 0,
    type,
    width: 10,
    x: 0,
    y: 0,
  }) as unknown as TSceneNode;

describe('getMaskCandidateId', () => {
  it('should return the last child when it is not a layout container', () => {
    const nodes = { a: buildNode('a', NodeType.rectangle), b: buildNode('b', NodeType.ellipse) };

    expect(getMaskCandidateId(['a', 'b'], nodes)).toBe('b');
  });

  it('should skip a trailing frame and return the last non-container child', () => {
    const nodes = { a: buildNode('a', NodeType.rectangle), b: buildNode('b', NodeType.frame) };

    expect(getMaskCandidateId(['a', 'b'], nodes)).toBe('a');
  });

  it('should skip a trailing section too', () => {
    const nodes = { a: buildNode('a', NodeType.rectangle), b: buildNode('b', NodeType.section) };

    expect(getMaskCandidateId(['a', 'b'], nodes)).toBe('a');
  });

  it('should fall back to the last child when every child is a layout container', () => {
    const nodes = { a: buildNode('a', NodeType.frame), b: buildNode('b', NodeType.section) };

    expect(getMaskCandidateId(['a', 'b'], nodes)).toBe('b');
  });

  it('should return the only child for a single-item list', () => {
    const nodes = { a: buildNode('a', NodeType.rectangle) };

    expect(getMaskCandidateId(['a'], nodes)).toBe('a');
  });
});
