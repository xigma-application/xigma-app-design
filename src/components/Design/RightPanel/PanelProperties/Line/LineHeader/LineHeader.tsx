import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import LineMoreActionsButton from './LineMoreActionsButton/LineMoreActionsButton';
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import PanelHeaderBooleanButton from '../../Common/PanelHeader/PanelHeaderBooleanButton';
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';
import PanelHeaderMaskButton from '../../Common/PanelHeader/PanelHeaderMaskButton';
import PanelHeaderMatchingLayersButton from '../../Common/PanelHeader/PanelHeaderMatchingLayersButton';

// others
import { translationNameSpace } from './constants';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

const LineHeader: FC = () => {
  const { t } = useTranslation();
  const isMultiple = useAppSelector(selectSelectedIds).length > 1;

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
      label={t(`${translationNameSpace}.label`)}
    />
  );
};

export default LineHeader;
