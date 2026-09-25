import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnAlignment from './ColumnAlignment/ColumnAlignment';
import ColumnPosition from './ColumnPosition/ColumnPosition';
import ColumnRotation from './ColumnRotation/ColumnRotation';
import IgnoreAutoLayoutToggle from './IgnoreAutoLayoutToggle/IgnoreAutoLayoutToggle';
import { UITools } from 'shared';

// hooks
import { useColumnPosition } from './ColumnPosition/hooks/useColumnPosition';

// others
import { translationNameSpace } from './constants';

type TPositionSectionProps = {
  withRotation?: boolean;
};

const PositionSection: FC<TPositionSectionProps> = ({ withRotation = true }) => {
  const { t } = useTranslation();
  const { ignoresAutoLayout, onToggleIgnoreAutoLayout, showIgnoreAutoLayoutToggle } = useColumnPosition();

  return (
    <UITools.Section
      component={
        <IgnoreAutoLayoutToggle active={ignoresAutoLayout} onToggle={onToggleIgnoreAutoLayout} show={showIgnoreAutoLayoutToggle} />
      }
      e2eValue="position"
      label={t(`${translationNameSpace}.label`)}
    >
      <ColumnAlignment />
      <ColumnPosition />
      {withRotation && <ColumnRotation />}
    </UITools.Section>
  );
};

export default PositionSection;
