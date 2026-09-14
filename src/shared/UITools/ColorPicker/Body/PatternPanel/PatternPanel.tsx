import { FC } from 'react';

// components
import PatternSettings from './PatternSettings/PatternSettings';
import PatternSourcePreview from './PatternSourcePreview/PatternSourcePreview';

// styles
import styles from './pattern-panel.module.scss';

// types
import { TUsePatternPanelResult } from './hooks/usePatternPanel';
import { TUsePatternSourcePickingResult } from '../../hooks/usePatternSourcePicking';

export type TPatternPanelProps = {
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  patternPanel: TUsePatternPanelResult;
  patternSourcePicking: TUsePatternSourcePickingResult;
};

export const PatternPanel: FC<TPatternPanelProps> = ({ onDragEnd, onDragStart, patternPanel, patternSourcePicking }) => (
  <div className={styles.PatternPanel}>
    <PatternSourcePreview patternSourcePicking={patternSourcePicking} />
    <PatternSettings onDragEnd={onDragEnd} onDragStart={onDragStart} patternPanel={patternPanel} />
  </div>
);

export default PatternPanel;
