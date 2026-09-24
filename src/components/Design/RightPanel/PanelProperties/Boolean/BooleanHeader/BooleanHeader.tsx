import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import PanelHeaderBooleanButton from '../../Common/PanelHeader/PanelHeaderBooleanButton';
import PanelHeaderComponentButton from '../../Common/PanelHeader/PanelHeaderComponentButton';
import PanelHeaderMaskButton from '../../Common/PanelHeader/PanelHeaderMaskButton';

// hooks
import { useBooleanOperation } from '../../Common/PanelHeader/hooks/useBooleanOperation';

// others
import { BOOLEAN_OPERATION_LABEL_KEY } from '../../Common/PanelHeader/constants';

const BooleanHeader: FC = () => {
  const { t } = useTranslation();
  const { operation } = useBooleanOperation();

  return (
    <PanelHeader
      buttons={
        <Fragment>
          <PanelHeaderMaskButton />
          <PanelHeaderBooleanButton />
          <PanelHeaderComponentButton />
        </Fragment>
      }
      e2eValue="boolean"
      label={t(BOOLEAN_OPERATION_LABEL_KEY[operation])}
    />
  );
};

export default BooleanHeader;
