import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';
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
        </Fragment>
      }
      e2eValue="rectangle"
      label={t(`${translationNameSpace}.label`)}
    />
  );
};

export default RectangleHeader;
