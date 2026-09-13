import { useCallback, useRef } from 'react';

const isWithinViewport = (rect: DOMRect): boolean => rect.bottom > 0 && rect.top < window.innerHeight;

export const useFreezePositionOnGrow = (enabled: boolean): TFunc<[HTMLDivElement | null]> => {
  const observerRef = useRef<MutationObserver | null>(null);
  const frozenTransformRef = useRef<string | null>(null);

  return useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      frozenTransformRef.current = null;

      if (!enabled || !node) {
        return;
      }

      const wrapper = node.parentElement;

      if (!wrapper) {
        return;
      }

      const handleStyleChange = (): void => {
        if (frozenTransformRef.current !== null) {
          if (wrapper.style.transform !== frozenTransformRef.current) {
            wrapper.style.transform = frozenTransformRef.current;
          }

          return;
        }

        if (isWithinViewport(wrapper.getBoundingClientRect())) {
          frozenTransformRef.current = wrapper.style.transform;
        }
      };

      observerRef.current = new MutationObserver(handleStyleChange);
      observerRef.current.observe(wrapper, { attributeFilter: ['style'], attributes: true });
      handleStyleChange();
    },
    [enabled],
  );
};

export default useFreezePositionOnGrow;
