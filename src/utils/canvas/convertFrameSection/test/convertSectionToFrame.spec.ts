// types
import { NodeType } from 'types/design/enums';
import { TSectionNode } from 'types/design/types';

// utils
import { convertSectionToFrame } from '../convertSectionToFrame';

const buildSection = (overrides: Partial<TSectionNode> = {}): TSectionNode => ({
  fill: '#ff0000',
  height: 100,
  id: 'section-1',
  name: 'Section',
  parentId: 'parent-1',
  rotation: 0,
  type: NodeType.section,
  width: 200,
  x: 10,
  y: 20,
  ...overrides,
});

describe('convertSectionToFrame', () => {
  it('should carry over id, position, size, rotation, name and parent, switching only the type', () => {
    const section = buildSection();

    expect(convertSectionToFrame(section)).toEqual({
      fill: '#ff0000',
      height: 100,
      hidden: undefined,
      id: 'section-1',
      isMask: undefined,
      locked: undefined,
      name: 'Section',
      parentId: 'parent-1',
      rotation: 0,
      childIds: [], clipContent: true, type: NodeType.frame,
      width: 200,
      x: 10,
      y: 20,
    });
  });

  it('should carry over hidden, locked and isMask when set', () => {
    const section = buildSection({ hidden: true, isMask: true, locked: true });

    expect(convertSectionToFrame(section)).toMatchObject({ hidden: true, isMask: true, locked: true });
  });
});
