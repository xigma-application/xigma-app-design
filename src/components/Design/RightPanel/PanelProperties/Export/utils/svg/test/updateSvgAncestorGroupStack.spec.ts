// utils
import { updateSvgAncestorGroupStack } from '../updateSvgAncestorGroupStack';

describe('updateSvgAncestorGroupStack', () => {
  it('should open every group when nothing was open before', () => {
    const elements: string[] = [];
    const groups = [
      { id: 'a', markup: '<g transform="rotate(1, 0, 0)">' },
      { id: 'b', markup: '<g transform="rotate(2, 0, 0)">' },
    ];

    const openGroups = updateSvgAncestorGroupStack(elements, [], groups);

    expect(elements).toEqual([groups[0].markup, groups[1].markup]);
    expect(openGroups).toBe(groups);
  });

  it('should close every open group when the new list is empty', () => {
    const elements: string[] = [];
    const openGroups = [
      { id: 'a', markup: '<g transform="rotate(1, 0, 0)">' },
      { id: 'b', markup: '<g transform="rotate(2, 0, 0)">' },
    ];

    const result = updateSvgAncestorGroupStack(elements, openGroups, []);

    expect(elements).toEqual(['</g>', '</g>']);
    expect(result).toEqual([]);
  });

  it('should keep a shared prefix open and only close/open the diverging suffix', () => {
    const elements: string[] = [];
    const shared = { id: 'a', markup: '<g transform="rotate(1, 0, 0)">' };
    const oldTail = { id: 'old', markup: '<g transform="rotate(2, 0, 0)">' };
    const newTail = { id: 'new', markup: '<g transform="rotate(3, 0, 0)">' };

    const result = updateSvgAncestorGroupStack(elements, [shared, oldTail], [shared, newTail]);

    expect(elements).toEqual(['</g>', newTail.markup]);
    expect(result).toEqual([shared, newTail]);
  });

  it('should do nothing when the new list is identical to the currently open one', () => {
    const elements: string[] = [];
    const groups = [{ id: 'a', markup: '<g transform="rotate(1, 0, 0)">' }];

    const result = updateSvgAncestorGroupStack(elements, groups, [...groups]);

    expect(elements).toEqual([]);
    expect(result).toEqual(groups);
  });

  it('should only open the new, deeper entries when extending an already-open prefix', () => {
    const elements: string[] = [];
    const shared = { id: 'a', markup: '<g transform="rotate(1, 0, 0)">' };
    const deeper = { id: 'b', markup: '<g transform="rotate(2, 0, 0)">' };

    const result = updateSvgAncestorGroupStack(elements, [shared], [shared, deeper]);

    expect(elements).toEqual([deeper.markup]);
    expect(result).toEqual([shared, deeper]);
  });
});
