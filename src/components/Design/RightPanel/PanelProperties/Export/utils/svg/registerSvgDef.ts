export const registerSvgDef = (defs: string[], prefix: string, buildDef: (id: string) => string): string => {
  const id = `${prefix}${defs.length}`;
  defs.push(buildDef(id));

  return id;
};
