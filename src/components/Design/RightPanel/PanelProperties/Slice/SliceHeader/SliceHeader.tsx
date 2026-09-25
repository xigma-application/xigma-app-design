import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';

// others
import { translationNameSpace } from './constants';

const SliceHeader: FC = () => {
  const { t } = useTranslation();
  return <PanelHeader buttons={<PanelHeaderComponentButton />} e2eValue="slice" label={t(`${translationNameSpace}.label`)} />;
};

export default SliceHeader;
