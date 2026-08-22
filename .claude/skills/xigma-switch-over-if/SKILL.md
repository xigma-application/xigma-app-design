---
name: xigma-switch-over-if
description: When a chain of `if` statements branches on more than 2 conditions of the same value, convert it to a `switch`. Load before writing or reviewing a function with 3+ sequential `if` checks on the same variable/expression.
---

# xigma: switch over if for 3+ branches

If a function branches on more than 2 `if` conditions testing the same value (typically
`node.type`, a `NodeType`/enum discriminant, or similar), rewrite it as a `switch` on that value
instead of a chain of separate `if` blocks. Two conditions can stay as `if`/`else if`; three or
more should be a `switch`.

Avoid:

```ts
const hit = [...nodes].reverse().find((node) => {
  if (node.type === NodeType.ellipse) {
    return isPointInEllipse(point, node);
  }

  if (node.type === NodeType.polygon) {
    return isPointInPolygon(point, node);
  }

  if (node.type === NodeType.line) {
    return isPointNearLine(point, node, lineTolerance);
  }

  return isPointInRect(point, node);
});
```

Prefer:

```ts
const hit = [...nodes].reverse().find((node) => {
  switch (node.type) {
    case NodeType.ellipse:
      return isPointInEllipse(point, node);
    case NodeType.polygon:
      return isPointInPolygon(point, node);
    case NodeType.line:
      return isPointNearLine(point, node, lineTolerance);
    default:
      return isPointInRect(point, node);
  }
});
```

The `switch` makes the fact that every branch discriminates on the same single value visible at a
glance, and lets TypeScript narrow the type per `case` the same way it would per `if`. The trailing
unconditional branch (e.g. treating every other `NodeType` as a rect) becomes the `default` case.

Keep `case` blocks flush against each other — no blank line between one `case` and the next. A
`switch`'s cases are read as one contiguous list of branches on the same value; blank lines between
them re-introduce the visual separation a `switch` was meant to remove (that separation belongs to
the `if`-chain form this rule replaces).

See `components/Design/Canvas/utils/getNodeAtPoint.ts` for this rule applied.

## Related

[[xigma-function-style]] — once a function's branching gets heavy enough that even a `switch`
case body carries multiple concerns, that skill's "ifologia" rule covers splitting each branch out
into its own named function. For many branches that do *not* share one discriminant value (e.g. an
ordered chain of independent hit-tests, or a fan-out over several independent refs), see that
skill's resolver-chain and self-guarding-fan-out sections instead — a `switch` doesn't apply there.
