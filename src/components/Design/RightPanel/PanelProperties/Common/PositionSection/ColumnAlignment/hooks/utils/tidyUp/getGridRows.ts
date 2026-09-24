// types
import { TDraftRect } from 'types/canvas';

export const getGridRows = (rects: TDraftRect[]): number[][] => {
  const order = rects.map((_, index) => index).sort((a, b) => rects[a].y - rects[b].y || rects[a].x - rects[b].x);
  const rows: number[][] = [];

  order.forEach((index) => {
    const row = rows.at(-1);
    const rowBottom = row ? Math.min(...row.map((member) => rects[member].y + rects[member].height)) : -Infinity;

    if (row && rects[index].y < rowBottom) {
      row.push(index);
    } else {
      rows.push([index]);
    }
  });

  return rows.map((row) => row.sort((a, b) => rects[a].x - rects[b].x));
};
