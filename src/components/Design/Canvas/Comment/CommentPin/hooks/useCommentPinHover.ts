import { useState } from 'react';

export const useCommentPinHover = (): { onMouseEnter: () => void; onMouseLeave: () => void; visible: boolean } => {
  const [visible, setVisible] = useState(false);

  return {
    onMouseEnter: (): void => setVisible(true),
    onMouseLeave: (): void => setVisible(false),
    visible,
  };
};
