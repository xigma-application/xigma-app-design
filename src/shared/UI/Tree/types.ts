export type TTreeItem = {
  id: string;
};

export type TTreeRow<T extends TTreeItem> = {
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  item: T;
  parentItem: T | null;
};

export type TDropDepthRange = {
  max: number;
  min: number;
};

export type TToggleExpandOptions = {
  recursive?: boolean;
};

export type TToggleExpand = (options?: TToggleExpandOptions) => void;

export type TExpandedIdsControl = {
  expandedIds: Set<string>;
  onExpandedIdsChange: (next: Set<string>) => void;
};
