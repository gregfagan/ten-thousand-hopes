import {
  __,
  identity,
  assoc,
  assocPath,
  inc,
  dec,
  evolve,
  pipe,
  findIndex,
  nth,
  subtract,
  lensPath,
  equals,
  chain,
  divide,
  min,
  mathMod,
  converge,
  add,
  curry,
  over,
  compose,
  multiply,
  prop,
  sum,
  values,
  both,
  when,
  is,
  applyTo,
  T,
  lt,
  gt,
  cond,
  view,
} from 'ramda'

const allocations = lensPath(['ship', 'power'])

const allocation = system =>
  compose(
    prop(system),
    view(allocations),
  )

export const power = system =>
  compose(
    divide(__, 4),
    allocation(system),
  )

export const reallocate = curry((system, amount) =>
  over(allocations)(assoc(system, amount)),
)

const incAllocation = system => over(allocations)(evolve({ [system]: inc }))
const decAllocation = system => over(allocations)(evolve({ [system]: dec }))

export const divertTo = system => state => {
  const otherSystem = system === 'hydroponics' ? 'cryoStorage' : 'hydroponics'
  const current = allocation(system)
  const other = allocation(otherSystem)
  const lifeSupport = allocation('lifeSupport')

  const willOverflow = compose(
    equals(4),
    current,
  )
  const surplus = converge(add, [other, lifeSupport])
  const overflow = compose(
    reallocate('lifeSupport', 4),
    chain(
      reallocate(otherSystem),
      compose(
        min(4),
        surplus,
      ),
    ),
    chain(
      reallocate(system),
      compose(
        mathMod(__, 4),
        surplus,
      ),
    ),
  )

  const canDivertFrom = source =>
    both(
      compose(
        lt(__, 4),
        current,
      ),
      compose(
        gt(__, 0),
        source,
      ),
    )

  const divertFrom = sourceSystem =>
    compose(
      incAllocation(system),
      decAllocation(sourceSystem),
    )

  return cond([
    [willOverflow, overflow],
    [canDivertFrom(lifeSupport), divertFrom('lifeSupport')],
    [canDivertFrom(other), divertFrom(otherSystem)],
    [T, identity],
  ])(state)
}

export const needsPowerManagement = compose(
  lt(__, 12),
  sum,
  values,
  view(allocations),
)
