import { FC } from 'react';

// components
import GuideContextMenu from './GuideContextMenu';
import RulerContextMenu from './RulerContextMenu';

// hooks
import { useGuideTool } from '../hooks/useGuideTool/useGuideTool';

// pages
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { toggleRulers } from 'store/design/slice';
import { selectAllGuideLines } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

const GuideContextMenuPanel: FC = () => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();
  const { anchorRef, isMenuOpen, onMenuOpenChange, removeAllGuides, removeSelectedGuide, rulerMenu, selectedGuide } = useGuideTool(refs);
  const guideLines = useAppSelector(selectAllGuideLines);

  if (selectedGuide) {
    return <GuideContextMenu anchorRef={anchorRef} isOpen={isMenuOpen} onOpenChange={onMenuOpenChange} onRemove={removeSelectedGuide} />;
  }

  if (rulerMenu) {
    return (
      <RulerContextMenu
        anchorRef={anchorRef}
        axis={rulerMenu.axis}
        hasGuides={guideLines.some((guide) => guide.axis === rulerMenu.axis)}
        isOpen={isMenuOpen}
        onHideRulers={(): void => {
          dispatch(toggleRulers());
        }}
        onOpenChange={onMenuOpenChange}
        onRemoveAllGuides={removeAllGuides}
      />
    );
  }

  return null;
};

export default GuideContextMenuPanel;
