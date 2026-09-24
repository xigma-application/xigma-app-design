import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AlignmentGrid from '../AlignmentGrid/AlignmentGrid';
import Field from 'shared/UITools/Field/Field';
import PatternField from '../PatternField/PatternField';
import ToggleButtonGroup from 'shared/UITools/ToggleButtonGroup/ToggleButtonGroup';

// hooks
import { TUsePatternPanelResult } from '../hooks/usePatternPanel';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './pattern-settings.module.scss';

// types
import { TPatternDirection, TPatternTileType } from 'types/design/paint/types';

// utils
import { buildDirectionButtons } from '../utils/buildDirectionButtons';
import { buildTileTypeButtons } from '../utils/buildTileTypeButtons';

const OFFSET_MAX = 1000;
const OFFSET_MIN = -1000;

export type TPatternSettingsProps = { onDragEnd?: TFunc; onDragStart?: TFunc; patternPanel: TUsePatternPanelResult };

export const PatternSettings: FC<TPatternSettingsProps> = ({ onDragEnd, onDragStart, patternPanel }) => {
  const { t } = useTranslation();
  const {
    alignmentIndex,
    direction,
    offsetX,
    offsetY,
    scale,
    setAlignmentIndex,
    setDirection,
    setOffsetX,
    setOffsetY,
    setScale,
    setSpacingX,
    setSpacingY,
    setTileType,
    spacingX,
    spacingY,
    tileType,
  } = patternPanel;

  return (
    <div className={styles.PatternSettings}>
      <div className={styles.PatternSettings__rows}>
        <Field
          Component={ToggleButtonGroup}
          controlWidth={136}
          label={t(`${translationNameSpace}.tileTypeLabel`)}
          onChange={(value): void => setTileType(value as TPatternTileType)}
          toggleButtons={buildTileTypeButtons(t)}
          value={tileType}
        />
        {tileType === 'hexagonal' && (
          <Field
            Component={ToggleButtonGroup}
            controlWidth={136}
            label={t(`${translationNameSpace}.directionLabel`)}
            onChange={(value): void => setDirection(value as TPatternDirection)}
            toggleButtons={buildDirectionButtons(t)}
            value={direction}
          />
        )}
        <Field
          Component={PatternField}
          controlWidth={136}
          label={t(`${translationNameSpace}.scaleLabel`)}
          ariaLabel={t(`${translationNameSpace}.scaleLabel`)}
          e2eValue="pattern-scale"
          icon="ScaleTool"
          onChange={setScale}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          value={scale}
        />
        <Field
          Component={PatternField}
          controlWidth={136}
          label={t(`${translationNameSpace}.spacingLabel`)}
          ariaLabel={`${t(`${translationNameSpace}.spacingLabel`)} X`}
          e2eValue="pattern-spacing-x"
          adornmentLabel="X"
          onChange={setSpacingX}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          value={spacingX}
        />
        <Field
          Component={PatternField}
          controlWidth={136}
          ariaLabel={`${t(`${translationNameSpace}.spacingLabel`)} Y`}
          e2eValue="pattern-spacing-y"
          adornmentLabel="Y"
          onChange={setSpacingY}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          value={spacingY}
        />
        <Field
          Component={PatternField}
          controlWidth={136}
          label={t(`${translationNameSpace}.offsetLabel`)}
          ariaLabel={`${t(`${translationNameSpace}.offsetLabel`)} X`}
          e2eValue="pattern-offset-x"
          adornmentLabel="X"
          max={OFFSET_MAX}
          min={OFFSET_MIN}
          onChange={setOffsetX}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          suffix="px"
          value={offsetX}
        />
        <Field
          Component={PatternField}
          controlWidth={136}
          ariaLabel={`${t(`${translationNameSpace}.offsetLabel`)} Y`}
          e2eValue="pattern-offset-y"
          adornmentLabel="Y"
          max={OFFSET_MAX}
          min={OFFSET_MIN}
          onChange={setOffsetY}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          suffix="px"
          value={offsetY}
        />
        <div className={styles['PatternSettings__aligment-wrapper']}>
          <div className={styles.PatternSettings__label}>{t(`${translationNameSpace}.alignmentLabel`)}</div>
          <AlignmentGrid onChange={setAlignmentIndex} selectedIndex={alignmentIndex} />
        </div>
      </div>
    </div>
  );
};

export default PatternSettings;
