import { MouseEvent, useState } from 'react';

// others
import { SEPARATOR } from '../constants';

// types
import { TActiveCell } from '../types';

const EMPTY_CELL: TActiveCell = { columns: 0, rows: 0 };

const parseCell = (target: EventTarget): TActiveCell | null => {
  const dataValue = (target as HTMLElement).getAttribute?.('data-value');

  if (!dataValue) {
    return null;
  }

  const [columns, rows] = dataValue.split(SEPARATOR);

  return { columns: parseInt(columns, 10), rows: parseInt(rows, 10) };
};

export type TUseCellsInput = {
  activeCell: TActiveCell;
  onClick: TFunc<[MouseEvent]>;
  onMouseLeave: TFunc;
  onMouseMove: TFunc<[MouseEvent]>;
};

export const useCellsInput = (onClickCell: TFunc<[TActiveCell]>, close: TFunc): TUseCellsInput => {
  const [activeCell, setActiveCell] = useState<TActiveCell>(EMPTY_CELL);

  const onMouseMove = (event: MouseEvent): void => {
    const cell = parseCell(event.target);

    if (cell) {
      setActiveCell(cell);
    }
  };

  const onMouseLeave = (): void => {
    setActiveCell(EMPTY_CELL);
  };

  const onClick = (event: MouseEvent): void => {
    const cell = parseCell(event.target);

    if (cell) {
      onClickCell(cell);
      close();
    }
  };

  return { activeCell, onClick, onMouseLeave, onMouseMove };
};
