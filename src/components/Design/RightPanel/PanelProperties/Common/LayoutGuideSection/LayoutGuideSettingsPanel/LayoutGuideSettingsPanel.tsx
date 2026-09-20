import { FC, ReactElement } from 'react';

// components
import LayoutGuideColumnsFields from './LayoutGuideColumnsFields/LayoutGuideColumnsFields';
import LayoutGuideGridFields from './LayoutGuideGridFields/LayoutGuideGridFields';
import LayoutGuideRowsFields from './LayoutGuideRowsFields/LayoutGuideRowsFields';
import LayoutGuideSettingsHeader from './LayoutGuideSettingsHeader/LayoutGuideSettingsHeader';

// hooks
import {
  TUseLayoutGuideSettingsPanelResult,
  useLayoutGuideSettingsPanel,
} from './hooks/useLayoutGuideSettingsPanel/useLayoutGuideSettingsPanel';

// styles
import styles from './layout-guide-settings-panel.module.scss';

// types
import { LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

export type TLayoutGuideSettingsPanelProps = {
  guide: TLayoutGuide;
  onChange: TFunc<[TLayoutGuide]>;
  onClose: TFunc;
  onDragEnd: TFunc;
  onDragStart: TFunc;
};

const renderTypeFields = (
  guide: TLayoutGuide,
  onChange: TFunc<[TLayoutGuide]>,
  onDragEnd: TFunc,
  onDragStart: TFunc,
  panel: TUseLayoutGuideSettingsPanelResult,
): ReactElement => {
  const { onBlur, onCommitAlpha, onCommitHex, onPickerChange, onScrub } = panel;

  switch (guide.type) {
    case LayoutGuideType.columns:
      return (
        <LayoutGuideColumnsFields
          guide={guide}
          onBlur={onBlur}
          onChange={onChange}
          onCommitAlpha={onCommitAlpha}
          onCommitHex={onCommitHex}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onPickerChange={onPickerChange}
          onScrub={onScrub}
        />
      );
    case LayoutGuideType.rows:
      return (
        <LayoutGuideRowsFields
          guide={guide}
          onBlur={onBlur}
          onChange={onChange}
          onCommitAlpha={onCommitAlpha}
          onCommitHex={onCommitHex}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onPickerChange={onPickerChange}
          onScrub={onScrub}
        />
      );
    default:
      return (
        <LayoutGuideGridFields
          guide={guide}
          onBlur={onBlur}
          onCommitAlpha={onCommitAlpha}
          onCommitHex={onCommitHex}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onPickerChange={onPickerChange}
          onScrub={onScrub}
        />
      );
  }
};

export const LayoutGuideSettingsPanel: FC<TLayoutGuideSettingsPanelProps> = ({ guide, onChange, onClose, onDragEnd, onDragStart }) => {
  const panel = useLayoutGuideSettingsPanel(guide, onChange);

  return (
    <div className={styles.LayoutGuideSettingsPanel}>
      <LayoutGuideSettingsHeader onClose={onClose} onTypeChange={(type): void => onChange({ ...guide, type })} type={guide.type} />
      <div className={styles.LayoutGuideSettingsPanel__body}>{renderTypeFields(guide, onChange, onDragEnd, onDragStart, panel)}</div>
    </div>
  );
};

export default LayoutGuideSettingsPanel;
