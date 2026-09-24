// others
import { SECTION_FILL } from 'components/Design/Canvas/constants';

// types
import { NodeType } from 'types/design/enums';
import { TGroupNode } from 'types/design/types';

// utils
import { convertGroupToSection } from '../convertGroupToSection';

const group: TGroupNode = {
  childIds: ['a'],
  height: 100,
  hidden: true,
  id: 'group-1',
  locked: true,
  name: 'Group',
  parentId: 'parent-1',
  rotation: 0,
  type: NodeType.group,
  width: 200,
  x: 10,
  y: 20,
};

describe('convertGroupToSection', () => {
  it('should keep the id, children, box and flags and give the section its default fill', () => {
    expect(convertGroupToSection(group)).toEqual({
      childIds: ['a'],
      fill: SECTION_FILL,
      height: 100,
      hidden: true,
      id: 'group-1',
      locked: true,
      name: 'Group',
      parentId: 'parent-1',
      rotation: 0,
      type: NodeType.section,
      width: 200,
      x: 10,
      y: 20,
    });
  });
});
