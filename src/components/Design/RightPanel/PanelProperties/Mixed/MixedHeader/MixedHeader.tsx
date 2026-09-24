import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import PanelHeaderBooleanButton from '../../Common/PanelHeader/PanelHeaderBooleanButton';
import PanelHeaderComponentSplitButton from '../../Common/PanelHeader/PanelHeaderComponentSplitButton';
import PanelHeaderMaskButton from '../../Common/PanelHeader/PanelHeaderMaskButton';
import PanelHeaderMatchingLayersButton from '../../Common/PanelHeader/PanelHeaderMatchingLayersButton';
import PanelHeaderMoreActionsButton from '../../Common/PanelHeader/PanelHeaderMoreActionsButton';
import PanelHeaderWrapInSectionButton from '../../Common/PanelHeader/PanelHeaderWrapInSectionButton';

// hooks
import { useIsBooleanOperandSelection } from '../../Common/PanelHeader/hooks/useIsBooleanOperandSelection';
import { useIsSelectionFromOneParent } from '../../Common/PanelHeader/hooks/useIsSelectionFromOneParent';

// others
import { translationNameSpace } from '../constants';

export type TMixedHeaderProps = {
  count: number;
};

const MixedHeader: FC<TMixedHeaderProps> = ({ count }) => {
  const { t } = useTranslation();
  const isFromOneParent = useIsSelectionFromOneParent();
  const isBooleanOperandSelection = useIsBooleanOperandSelection();

  return (
    <PanelHeader
      buttons={
        isBooleanOperandSelection ? (
          <Fragment>
            <PanelHeaderMaskButton />
            <PanelHeaderBooleanButton />
            <PanelHeaderMoreActionsButton withEditObjects={false} />
          </Fragment>
        ) : (
          <Fragment>
            <PanelHeaderMatchingLayersButton />
            <PanelHeaderComponentSplitButton />
            {isFromOneParent && <PanelHeaderWrapInSectionButton />}
          </Fragment>
        )
      }
      e2eValue="mixed"
      label={t(`${translationNameSpace}.header.label`, { count })}
    />
  );
};

export default MixedHeader;
