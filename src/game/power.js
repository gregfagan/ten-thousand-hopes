import {
  __,
  identity,
  assoc,
  inc,
  dec,
  evolve,
  lensPath,
  divide,
  not,
  curry,
  over,
  compose,
  prop,
  sum,
  values,
  omit,
  both,
  T,
  lt,
  gt,
  cond,
  view,
} from 'ramda'

export const FULL_POWER = 4

export const allocations = lensPath(['ship', 'power'])

export const allocation = system =>
  compose(
    prop(system),
    view(allocations),
  )

export const power = system =>
  compose(
    divide(__, FULL_POWER),
    allocation(system),
  )

export const reallocate = curry((system, amount) =>
  over(allocations)(assoc(system, amount)),
)

const incAllocation = system => over(allocations)(evolve({ [system]: inc }))
const decAllocation = system => over(allocations)(evolve({ [system]: dec }))
const otherSystem = system =>
  system === 'hydroponics' ? 'cryoStorage' : 'hydroponics'

export const canDivertFrom = source =>
  both(
    compose(
      gt(__, 0),
      allocation(source),
    ),
    compose(
      lt(__, 2 * FULL_POWER),
      sum,
      values,
      omit([source]),
      view(allocations),
    ),
  )

export const canDivertTo = destination =>
  compose(
    lt(__, 4),
    allocation(destination),
  )

const divert = (source, destination) =>
  compose(
    incAllocation(destination),
    decAllocation(source),
  )

export const divertTo = system =>
  cond([
    [
      compose(
        not,
        canDivertTo(system),
      ),
      identity,
    ],
    [canDivertFrom('lifeSupport'), divert('lifeSupport', system)],
    [canDivertFrom(otherSystem(system)), divert(otherSystem(system), system)],
    [T, identity],
  ])

export const divertFrom = system =>
  cond([
    [
      compose(
        not,
        canDivertFrom(system),
      ),
      identity,
    ],
    [canDivertTo('lifeSupport'), divert(system, 'lifeSupport')],
    [canDivertTo(otherSystem(system)), divert(system, otherSystem(system))],
    [T, identity],
  ])

export const needsPowerManagement = compose(
  lt(__, 3 * FULL_POWER),
  sum,
  values,
  view(allocations),
)
