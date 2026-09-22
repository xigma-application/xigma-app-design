// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSvgElementId } from '../getSvgElementId';

const rect = (name: string): TSceneNode =>
  ({ fills: [], height: 10, id: 'x', name, parentId: null, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }) as TSceneNode;

describe('getSvgElementId', () => {
  it('should use the node name unchanged when it is already a valid id', () => {
    expect(getSvgElementId(rect('Icon'), new Map())).toBe('Icon');
  });

  it('should replace invalid characters with underscores', () => {
    expect(getSvgElementId(rect('My Icon #1'), new Map())).toBe('My_Icon__1');
  });

  it('should prefix a name that starts with a digit', () => {
    expect(getSvgElementId(rect('1st Layer'), new Map())).toBe('_1st_Layer');
  });

  it('should disambiguate duplicate names with a numeric suffix', () => {
    const usedIds = new Map<string, number>();

    expect(getSvgElementId(rect('Icon'), usedIds)).toBe('Icon');
    expect(getSvgElementId(rect('Icon'), usedIds)).toBe('Icon_2');
    expect(getSvgElementId(rect('Icon'), usedIds)).toBe('Icon_3');
  });

  it('should track separate sanitized names independently', () => {
    const usedIds = new Map<string, number>();

    expect(getSvgElementId(rect('Icon'), usedIds)).toBe('Icon');
    expect(getSvgElementId(rect('Frame'), usedIds)).toBe('Frame');
    expect(getSvgElementId(rect('Icon'), usedIds)).toBe('Icon_2');
  });
});
