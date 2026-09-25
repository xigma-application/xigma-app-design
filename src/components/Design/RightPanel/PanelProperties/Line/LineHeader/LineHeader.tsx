import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import LineMoreActionsButton from './LineMoreActionsButton/LineMoreActionsButton';
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import PanelHeaderBooleanButton from '../../Common/PanelHeader/PanelHeaderBooleanButton';
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';
import PanelHeaderMaskButton from '../../Common/PanelHeader/PanelHeaderMaskButton';
import PanelHeaderMatchingLayersButton from '../../Common/PanelHeader/PanelHeaderMatchingLayersButton';

// store
import { selectSelectedIds, selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TSceneNode } from 'types/design/types';

// utils
import { getLineHeaderLabel } from './utils/getLineHeaderLabel';
import { isArrowLine } from './utils/isArrowLine';

const LineHeader: FC = () => {
  const { t } = useTranslation();
  const isMultiple = useAppSelector(selectSelectedIds).length > 1;
  const lines = useAppSelector(selectSelectedNodes).filter(
    (node: TSceneNode | undefined): node is TLineNode => node?.type === NodeType.line,
  );

  return (
    <PanelHeader
      buttons={
        <Fragment>
          <PanelHeaderMatchingLayersButton />
          {!isMultiple && <PanelHeaderComponentButton />}
          <PanelHeaderMaskButton />
          <PanelHeaderBooleanButton />
          <LineMoreActionsButton />
        </Fragment>
      }
      e2eValue="line"
      label={getLineHeaderLabel(t, lines.length, lines.filter(isArrowLine).length)}
    />
  );
};

export default LineHeader;
