// utils
import { groupAutoLayoutChildrenIntoLines } from '../groupAutoLayoutChildrenIntoLines';

describe('groupAutoLayoutChildrenIntoLines', () => {
  it('should return an empty array for no children', () => {
    expect(groupAutoLayoutChildrenIntoLines(true, 10, 100, [])).toEqual([]);
  });

  it('should keep everything on one line when it all fits', () => {
    const children = [
      { height: 20, id: 'a', width: 30 },
      { height: 20, id: 'b', width: 40 },
    ];

    expect(groupAutoLayoutChildrenIntoLines(true, 10, 100, children)).toEqual([children]);
  });

  it('should start a new line once the next child would overflow the available primary space', () => {
    const a = { height: 20, id: 'a', width: 60 };
    const b = { height: 20, id: 'b', width: 60 };

    // a alone fits (60 <= 100); a + gap(10) + b = 130 > 100, so b wraps
    expect(groupAutoLayoutChildrenIntoLines(true, 10, 100, [a, b])).toEqual([[a], [b]]);
  });

  it('should never leave a line empty — an over-sized lone child still gets its own line', () => {
    const oversized = { height: 20, id: 'a', width: 500 };

    expect(groupAutoLayoutChildrenIntoLines(true, 10, 100, [oversized])).toEqual([[oversized]]);
  });

  it('should measure against height, not width, on the vertical axis', () => {
    const a = { height: 60, id: 'a', width: 20 };
    const b = { height: 60, id: 'b', width: 20 };

    expect(groupAutoLayoutChildrenIntoLines(false, 10, 100, [a, b])).toEqual([[a], [b]]);
  });

  it('should pack multiple children per line across several wrapped lines', () => {
    const a = { height: 20, id: 'a', width: 30 };
    const b = { height: 20, id: 'b', width: 30 };
    const c = { height: 20, id: 'c', width: 30 };

    // a+gap+b = 70 <= 100 (fits); a+gap+b+gap+c = 110 > 100, so c wraps alone
    expect(groupAutoLayoutChildrenIntoLines(true, 10, 100, [a, b, c])).toEqual([[a, b], [c]]);
  });
});
