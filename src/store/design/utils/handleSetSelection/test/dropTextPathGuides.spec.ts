// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { dropTextPathGuides } from '../dropTextPathGuides';

const node = (id: string, type: NodeType, extra: Record<string, unknown> = {}): TSceneNode =>
  ({ id, name: id, parentId: null, rotation: 0, type, x: 0, y: 0, ...extra }) as unknown as TSceneNode;

describe('dropTextPathGuides', () => {
  it('should return the selection untouched, without scanning, when no selected node can be a guide', () => {
    // mock
    const nodes = { a: node('a', NodeType.rectangle), b: node('b', NodeType.rectangle) };
    const selectedIds = ['a', 'b', 'missing'];
    const values = vi.spyOn(Object, 'values');

    // before
    const result = dropTextPathGuides(selectedIds, nodes);

    // result
    expect(result).toBe(selectedIds);
    expect(values).not.toHaveBeenCalled();

    values.mockRestore();
  });

  it.each([NodeType.path, NodeType.vector])('should drop a selected %s that a text node is bound to', (type) => {
    // mock
    const nodes = {
      guide: node('guide', type),
      other: node('other', NodeType.rectangle),
      text: node('text', NodeType.text, { pathId: 'guide' }),
    };

    // before
    const result = dropTextPathGuides(['guide', 'other'], nodes);

    // result
    expect(result).toEqual(['other']);
  });

  it('should keep a selected path that no text node is bound to', () => {
    // mock
    const nodes = { free: node('free', NodeType.path), text: node('text', NodeType.text, { pathId: null }) };

    // before
    const result = dropTextPathGuides(['free'], nodes);

    // result
    expect(result).toEqual(['free']);
  });
});
