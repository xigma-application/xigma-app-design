// types
import { StrokeAlign, StrokeMode } from 'types/design/enums';
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

export const getEffectiveStrokeAlign = (node: TAppearanceNode): StrokeAlign =>
  (node.strokeMode ?? StrokeMode.basic) === StrokeMode.basic ? (node.strokeAlign ?? StrokeAlign.inside) : StrokeAlign.center;
