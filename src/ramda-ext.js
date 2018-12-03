import {
  compose,
  equals,
  unless,
  remove,
  curry,
  assoc,
  length,
  defaultTo,
  prop,
  multiply,
  min,
  max,
  identity,
  add,
  converge,
  pipe,
  view,
  curryN,
} from 'ramda'

export const isLast = index =>
  compose(
    equals(index + 1),
    length,
  )

export const removeUnlessLast = index => unless(isLast(index), remove(index, 1))

export const defaultForProp = (p, d) =>
  compose(
    defaultTo(d),
    prop(p),
  )

export const assocDefaultForProp = curry((p, d, obj) =>
  assoc(p, defaultForProp(p, d)(obj))(obj),
)

export const rand = variance =>
  converge(multiply, [
    pipe(
      Math.random,
      multiply(variance),
      add(1 - variance / 2),
    ),
    identity,
  ])

export const clamp = (lower, upper) =>
  compose(
    min(upper),
    max(lower),
  )

// from the cookbook
export const lensEq = curryN(3, (lens, val, data) =>
  pipe(
    view(lens),
    equals(val),
  )(data),
)
export const lensSatisfies = curryN(3, (predicate, lens, data) =>
  pipe(
    view(lens),
    predicate,
    equals(true),
  )(data),
)
