import { RefObject, useEffect, useRef, useState } from 'react';

// store
import { cancelCommentDraft } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useCommentDraftOutsideDismissal = (
  contentRef: RefObject<HTMLElement | null>,
  value: string,
): { animationActive: boolean; onFocus: () => void } => {
  const [warned, setWarned] = useState(false);
  const [animationActive, setAnimationActive] = useState(false);
  const dispatch = useAppDispatch();
  const valueRef = useRef(value);
  const warnedRef = useRef(warned);

  valueRef.current = value;
  warnedRef.current = warned;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent): void => {
      const content = contentRef.current;
      const isOutsidePrimaryClick = event.button === 0 && content && !content.contains(event.target as Node);

      if (isOutsidePrimaryClick) {
        if (valueRef.current && !warnedRef.current) {
          setWarned(true);
          setAnimationActive(true);
        } else {
          dispatch(cancelCommentDraft());
        }
      }
    };

    const timeoutId = window.setTimeout(() => {
      document.addEventListener('pointerdown', handlePointerDown);
    }, 0);

    return (): void => {
      window.clearTimeout(timeoutId);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [contentRef, dispatch]);

  return {
    animationActive,
    onFocus: (): void => {
      setWarned(false);
      setAnimationActive(false);
    },
  };
};
