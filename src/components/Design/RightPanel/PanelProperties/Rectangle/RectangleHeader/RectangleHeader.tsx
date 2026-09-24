import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import PanelHeaderBooleanButton from '../../Common/PanelHeader/PanelHeaderBooleanButton';
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';
import PanelHeaderEditObjectButton from '../../Common/PanelHeader/PanelHeaderEditObjectButton';
import PanelHeaderMaskButton from '../../Common/PanelHeader/PanelHeaderMaskButton';
import PanelHeaderMatchingLayersButton from '../../Common/PanelHeader/PanelHeaderMatchingLayersButton';

// others
import { translationNameSpace } from './constants';

const RectangleHeader: FC = () => {
  const { t } = useTranslation();

  return (
    <PanelHeader
      buttons={
        <Fragment>
          <PanelHeaderMatchingLayersButton />
          <PanelHeaderComponentButton />
          <PanelHeaderMaskButton />
          <PanelHeaderBooleanButton />
          <PanelHeaderEditObjectButton />
        </Fragment>
      }
      e2eValue="rectangle"
      label={t(`${translationNameSpace}.label`)}
    />
  );
};

export default RectangleHeader;
