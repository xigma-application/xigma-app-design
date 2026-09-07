import { FC, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnConstraints from '../ColumnConstraints/ColumnConstraints';
import ColumnPositionConstraints from './ColumnPositionConstraints';
import ColumnPositionField from './ColumnPositionField/ColumnPositionField';
import { UITools } from 'shared';

// hooks
import { useColumnAlignment } from '../ColumnAlignment/hooks/useColumnAlignment';
import { useColumnPosition } from './hooks/useColumnPosition';

// others
import { translationNameSpace } from './constants';

const ColumnPosition: FC = () => {
  const { t } = useTranslation();
  const [showConstraints, setShowConstraints] = useState(false);
  const { disabled: noParent, horizontal, vertical } = useColumnAlignment();
  const { disabledX, disabledY, onBlurX, onBlurY, onDragEnd, onDragStart, onScrubX, onScrubY, x, y } = useColumnPosition();

  return (
    <Fragment>
      <UITools.SectionColumn
        buttonsIcon={ColumnPositionConstraints(noParent, showConstraints, horizontal, vertical, () =>
          setShowConstraints((value) => !value),
        )}
        gridColumnType={UITools.GridColumnType.twoInputs}
        labels={[t(`${translationNameSpace}.label`)]}
        withBottomMargin
      >
        <ColumnPositionField
          ariaLabel={t(`${translationNameSpace}.ariaLabelX`)}
          disabled={disabledX}
          e2eValue="x"
          label="X"
          onBlur={onBlurX}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onScrub={onScrubX}
          tooltip={t(`${translationNameSpace}.tooltipX`)}
          value={x}
        />
        <ColumnPositionField
          ariaLabel={t(`${translationNameSpace}.ariaLabelY`)}
          disabled={disabledY}
          e2eValue="y"
          label="Y"
          onBlur={onBlurY}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onScrub={onScrubY}
          tooltip={t(`${translationNameSpace}.tooltipY`)}
          value={y}
        />
      </UITools.SectionColumn>
      {showConstraints && !noParent ? <ColumnConstraints /> : null}
    </Fragment>
  );
};

export default ColumnPosition;
