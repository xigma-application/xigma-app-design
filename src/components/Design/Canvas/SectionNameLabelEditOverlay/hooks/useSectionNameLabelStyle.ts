// others
import { SECTION_NAME_LABEL_DARK_STYLE } from 'utils/canvas/sectionNameLabel/constants';

// store
import { selectBackgroundPaint, selectNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSectionNameLabelStyle } from 'utils/canvas/sectionNameLabel/types';

// utils
import { getSectionNameLabelStyle } from 'utils/canvas/sectionNameLabel/getSectionNameLabelStyle';

export const useSectionNameLabelStyle = (nodeId: string | undefined): TSectionNameLabelStyle => {
  const node = useAppSelector(selectNodes)[nodeId ?? ''];
  const backgroundColor = useAppSelector(selectBackgroundPaint).color;

  if (node?.type === NodeType.section) {
    return getSectionNameLabelStyle(node, backgroundColor);
  }

  return SECTION_NAME_LABEL_DARK_STYLE;
};
