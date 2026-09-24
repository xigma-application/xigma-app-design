import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import PanelHeaderBooleanButton from '../../Common/PanelHeader/PanelHeaderBooleanButton';
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';
import PanelHeaderEditObjectButton from '../../Common/PanelHeader/PanelHeaderEditObjectButton';
import PanelHeaderMaskButton from '../../Common/PanelHeader/PanelHeaderMaskButton';
import PanelHeaderMatchingLayersButton from '../../Common/PanelHeader/PanelHeaderMatchingLayersButton';
import PanelHeaderWrapInSectionButton from '../../Common/PanelHeader/PanelHeaderWrapInSectionButton';

// others
import { translationNameSpace } from '../constants';

// types
import { TPanelHeaderButton } from '../types';

export type TMixedHeaderProps = {
  buttons: TPanelHeaderButton[];
  count: number;
};

const MixedHeader: FC<TMixedHeaderProps> = ({ buttons, count }) => {
  const { t } = useTranslation();

  return (
    <PanelHeader
      buttons={
        <Fragment>
          {buttons.includes('matchingLayers') && <PanelHeaderMatchingLayersButton />}
          {buttons.includes('component') && <PanelHeaderComponentButton />}
          {buttons.includes('mask') && <PanelHeaderMaskButton />}
          {buttons.includes('boolean') && <PanelHeaderBooleanButton />}
          {buttons.includes('editObject') && <PanelHeaderEditObjectButton />}
          {buttons.includes('wrapInSection') && <PanelHeaderWrapInSectionButton />}
        </Fragment>
      }
      e2eValue="mixed"
      label={t(`${translationNameSpace}.header.label`, { count })}
    />
  );
};

export default MixedHeader;
