import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import PanelHeaderBooleanButton from '../../Common/PanelHeader/PanelHeaderBooleanButton';
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';
import PanelHeaderMaskButton from '../../Common/PanelHeader/PanelHeaderMaskButton';
import PanelHeaderMatchingLayersButton from '../../Common/PanelHeader/PanelHeaderMatchingLayersButton';
import PanelHeaderMoreActionsButton from '../../Common/PanelHeader/PanelHeaderMoreActionsButton';
import PanelHeaderShapeMoreActionsButton from '../../Common/PanelHeader/PanelHeaderShapeMoreActionsButton';

// others
import { translationNameSpace } from './constants';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

const PolygonHeader: FC = () => {
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
          {isMultiple ? <PanelHeaderMoreActionsButton /> : <PanelHeaderShapeMoreActionsButton />}
        </Fragment>
      }
      e2eValue="polygon"
      label={t(`${translationNameSpace}.label`)}
    />
  );
};

export default PolygonHeader;
