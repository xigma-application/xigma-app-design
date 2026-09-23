import debounce from 'lodash/debounce';
import { useEffect, useRef, useState } from 'react';

// others
import { NODE_SHAPE_ICON_REDRAW_DEBOUNCE_MS } from '../constants';

// types
import { TSceneNode } from 'types/design/types';
import { TNodeOutline } from '../types';

// utils
import { getNodeOutlinePath } from '../utils/getNodeOutlinePath';

export type TNodeOutlineState = {
  isOutlinePending: boolean;
  outline: TNodeOutline | null;
};

export const useNodeOutlineState = (node: TSceneNode): TNodeOutlineState => {
  const [outline, setOutline] = useState(() => getNodeOutlinePath(node));
  const [isOutlinePending, setIsOutlinePending] = useState(false);
  const previousNodeIdRef = useRef<string | null>(null);

  useEffect(() => {
    const isSameNode = node.id === previousNodeIdRef.current;
    previousNodeIdRef.current = node.id;

    if (isSameNode) {
      setIsOutlinePending(true);

      const debouncedSetOutline = debounce(() => {
        setOutline(getNodeOutlinePath(node));
        setIsOutlinePending(false);
      }, NODE_SHAPE_ICON_REDRAW_DEBOUNCE_MS);

      debouncedSetOutline();

      return (): void => debouncedSetOutline.cancel();
    }

    setIsOutlinePending(false);
    setOutline(getNodeOutlinePath(node));
  }, [node]);

  return { isOutlinePending, outline };
};
