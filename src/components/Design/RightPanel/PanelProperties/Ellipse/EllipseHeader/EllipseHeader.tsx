import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import PanelHeaderBooleanButton from '../../Common/PanelHeader/PanelHeaderBooleanButton';
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';
import PanelHeaderEditObjectButton from '../../Common/PanelHeader/PanelHeaderEditObjectButton';
import PanelHeaderMaskButton from '../../Common/PanelHeader/PanelHeaderMaskButton';
import PanelHeaderMatchingLayersButton from '../../Common/PanelHeader/PanelHeaderMatchingLayersButton';
import PanelHeaderMoreActionsButton from '../../Common/PanelHeader/PanelHeaderMoreActionsButton';

// others
import { translationNameSpace } from './constants';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

const EllipseHeader: FC = () => {
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
          {isMultiple ? <PanelHeaderMoreActionsButton /> : <PanelHeaderEditObjectButton />}
        </Fragment>
      }
      e2eValue="ellipse"
      label={t(`${translationNameSpace}.label`)}
    />
  );
};

export default EllipseHeader;
