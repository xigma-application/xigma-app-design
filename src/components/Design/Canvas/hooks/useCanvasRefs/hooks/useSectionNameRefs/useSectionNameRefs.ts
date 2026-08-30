import { useRef } from 'react';

// types
import { TSectionNameRefs } from 'types/design/canvas/types';

export const useSectionNameRefs = (): TSectionNameRefs => {
  const editingLabelRef = useRef<string | null>(null);
  const sectionNameRefsRef = useRef<TSectionNameRefs | null>(null);

  if (sectionNameRefsRef.current === null) {
    sectionNameRefsRef.current = { editingLabelRef };
  }

  return sectionNameRefsRef.current;
};
