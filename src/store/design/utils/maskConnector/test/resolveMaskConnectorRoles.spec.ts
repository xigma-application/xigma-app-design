// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { resolveMaskConnectorRoles } from '../resolveMaskConnectorRoles';

const rectangle = (id: string, parentId: string | null, x = 0): TSceneNode =>
  ({ height: 10, id, name: id, parentId, rotation: 0, type: NodeType.rectangle, width: 10, x, y: 0 }) as unknown as TSceneNode;

const mask = (id: string, childIds: string[]): TSceneNode =>
  ({
    childIds,
    height: 10,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.mask,
    width: 10,
    x: 0,
    y: 0,
  }) as unknown as TSceneNode;

const group = (id: string, childIds: string[]): TSceneNode =>
  ({
    childIds,
    height: 10,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.group,
    width: 10,
    x: 0,
    y: 0,
  }) as unknown as TSceneNode;

describe('resolveMaskConnectorRoles', () => {
  it('should give the children of a mask their connector roles and leave plain roots without any', () => {
    // mock
    const nodes = {
      content: rectangle('content', 'm'),
      m: mask('m', ['content', 'shape']),
      plain: rectangle('plain', null),
      shape: rectangle('shape', 'm'),
    };

    // before
    const roles = resolveMaskConnectorRoles(nodes);

    // result
    expect(roles.has('content')).toBe(true);
    expect(roles.has('shape')).toBe(true);
    expect(roles.has('plain')).toBe(false);
  });

  it('should return the same roles for the same nodes', () => {
    // mock
    const nodes = { a: rectangle('a', null) };

    // before
    const roles = resolveMaskConnectorRoles(nodes);

    // result
    expect(resolveMaskConnectorRoles(nodes)).toBe(roles);
  });

  it('should keep the previous roles when only a plain node changed', () => {
    // mock
    const m = mask('m', ['content', 'shape']);
    const content = rectangle('content', 'm');
    const shape = rectangle('shape', 'm');
    const first = { content, m, plain: rectangle('plain', null, 0), shape };
    const second = { content, m, plain: rectangle('plain', null, 5), shape };

    // before
    const roles = resolveMaskConnectorRoles(first);

    // result
    expect(resolveMaskConnectorRoles(second)).toBe(roles);
  });

  it('should rebuild the roles when a mask or a group changed', () => {
    // mock
    const first = { a: rectangle('a', 'g'), b: rectangle('b', 'g'), g: group('g', ['a', 'b']) };
    const second = { a: rectangle('a', 'g'), b: rectangle('b', 'g'), g: group('g', ['b', 'a']) };

    // before
    const roles = resolveMaskConnectorRoles(first);

    // result
    expect(resolveMaskConnectorRoles(second)).not.toBe(roles);
  });

  it('should rebuild the roles when too many nodes changed to track', () => {
    // mock
    const many = (x: number): Record<string, TSceneNode> =>
      Object.fromEntries(Array.from({ length: 100 }, (_, index) => [`n${index}`, rectangle(`n${index}`, null, x)]));
    const roles = resolveMaskConnectorRoles(many(0));

    // result
    expect(resolveMaskConnectorRoles(many(1))).not.toBe(roles);
  });
});
