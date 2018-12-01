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
