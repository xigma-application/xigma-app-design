// others
import { CONTROL_PRIMARY_KEY } from 'constant/mainKeys';

// types
import { KeyboardKeys } from 'types/enums';
import { ToolName } from 'types/design/enums';
import { TShortcut } from './types';

export const shortcuts = {
  [ToolName.arrow]: { primaryKeys: ['shift'], secondaryKey: KeyboardKeys.l },
  [ToolName.comment]: { secondaryKey: KeyboardKeys.c },
  [ToolName.cut]: { secondaryKey: KeyboardKeys.x },
  [ToolName.default]: { secondaryKey: KeyboardKeys.v },
  [ToolName.ellipse]: { secondaryKey: KeyboardKeys.o },
  [ToolName.frame]: { secondaryKey: KeyboardKeys.f },
  [ToolName.hand]: { secondaryKey: KeyboardKeys.h },
  [ToolName.lasso]: { secondaryKey: KeyboardKeys.q },
  [ToolName.line]: { secondaryKey: KeyboardKeys.l },
  [ToolName.media]: { primaryKeys: [CONTROL_PRIMARY_KEY, 'shift'], secondaryKey: KeyboardKeys.k },
  [ToolName.paint]: { primaryKeys: ['shift'], secondaryKey: KeyboardKeys.b },
  [ToolName.pen]: { secondaryKey: KeyboardKeys.p },
  [ToolName.pencil]: { primaryKeys: ['shift'], secondaryKey: KeyboardKeys.p },
  [ToolName.rectangle]: { secondaryKey: KeyboardKeys.r },
  [ToolName.scale]: { secondaryKey: KeyboardKeys.k },
  [ToolName.section]: { primaryKeys: ['shift'], secondaryKey: KeyboardKeys.s },
  [ToolName.shapeBuilder]: { secondaryKey: KeyboardKeys.m },
  [ToolName.slice]: { secondaryKey: KeyboardKeys.s },
  [ToolName.text]: { secondaryKey: KeyboardKeys.t },
  [ToolName.variableWidth]: { primaryKeys: ['shift'], secondaryKey: KeyboardKeys.w },
  escape: { secondaryKey: KeyboardKeys.escape },
  redo: { primaryKeys: [CONTROL_PRIMARY_KEY, 'shift'], secondaryKey: KeyboardKeys.z },
  undo: { primaryKeys: [CONTROL_PRIMARY_KEY], secondaryKey: KeyboardKeys.z },
} satisfies Partial<Record<ToolName, TShortcut>> & { escape: TShortcut; redo: TShortcut; undo: TShortcut };
