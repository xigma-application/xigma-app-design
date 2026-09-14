import { useEffect, useRef, useState } from 'react';

// others
import { DEFAULT_PATTERN_PANEL_STATE } from '../constants';

// types
import { TInitialPattern, TPatternPanelChange, TPatternPanelState } from '../types';
import { TPatternDirection, TPatternTileType } from 'types/design/paint/types';

export type TUsePatternPanelResult = TPatternPanelState & {
  reset: TFunc;
  setAlignmentIndex: TFunc<[number]>;
  setDirection: TFunc<[TPatternDirection]>;
  setScale: TFunc<[number]>;
  setSpacingX: TFunc<[number]>;
  setSpacingY: TFunc<[number]>;
  setTileType: TFunc<[TPatternTileType]>;
};

export const usePatternPanel = (
  onChange?: TFunc<[TPatternPanelChange]>,
  initialPattern?: TInitialPattern,
  resetKey?: number,
): TUsePatternPanelResult => {
  const [state, setState] = useState<TPatternPanelState>(initialPattern ?? DEFAULT_PATTERN_PANEL_STATE);
  const initialPatternRef = useRef(initialPattern);
  const isFirstRunRef = useRef(true);

  initialPatternRef.current = initialPattern;

  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
    } else {
      setState(initialPatternRef.current ?? DEFAULT_PATTERN_PANEL_STATE);
    }
  }, [resetKey]);

  const commit = (next: TPatternPanelState): void => {
    setState(next);
    onChange?.(next);
  };

  return {
    ...state,
    reset: (): void => setState(DEFAULT_PATTERN_PANEL_STATE),
    setAlignmentIndex: (alignmentIndex): void => commit({ ...state, alignmentIndex }),
    setDirection: (direction): void => commit({ ...state, direction }),
    setScale: (scale): void => commit({ ...state, scale }),
    setSpacingX: (spacingX): void => commit({ ...state, spacingX }),
    setSpacingY: (spacingY): void => commit({ ...state, spacingY }),
    setTileType: (tileType): void => commit({ ...state, tileType }),
  };
};
