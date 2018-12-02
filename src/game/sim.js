import {
  __,
  assoc,
  inc,
  evolve,
  pipe,
  findIndex,
  nth,
  subtract,
  lensPath,
  chain,
  converge,
  add,
  curry,
  over,
  compose,
  set,
  multiply,
  when,
  is,
  applyTo,
  view,
  negate,
} from 'ramda'
import { removeUnlessLast, rand, clamp } from '../ramda-ext'
import { power } from './power'

const START_DATE = new Date(Date.UTC(2085, 11, 2))
const WASTE_BUILDUP_RATE = 0.25
const FOOD_GROWTH_RATE = (100 * 2) / 3
const EMBRYO_THAW_RATE = 385

const formatDate = date =>
  date.toLocaleDateString('en-us', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

const weeksLater = (weeks, randomDayOfWeek = true) => {
  const newDate = new Date(START_DATE)
  const dayOfWeek = randomDayOfWeek ? Math.round(Math.random() * 6) : 0
  const days = 7 * weeks + dayOfWeek
  newDate.setUTCDate(newDate.getUTCDate() + days)
  return newDate
}

export const formatTime = compose(
  formatDate,
  weeksLater,
)

const log = curry((time, supplemental = false) => description =>
  `Commander's log, ${
    supplemental ? 'supplemental' : 'earth date: ' + formatTime(time)
  }.\n\n${description.trim()}`,
)

const passTime = evolve({ time: inc })

const crew = lensPath(['ship', 'crew'])
export const kill = count => over(crew, subtract(__, count))

const waste = lensPath(['ship', 'waste'])
const recycleWaste = chain(
  set(waste),
  compose(
    clamp(0, 1),
    converge(add, [
      view(waste),
      compose(
        rand(0.2),
        multiply(2 * WASTE_BUILDUP_RATE),
        subtract(0.55),
        power('lifeSupport'),
      ),
    ]),
  ),
)

const food = lensPath(['ship', 'food'])
const growFood = chain(
  over(food),
  compose(
    add,
    Math.round,
    multiply(FOOD_GROWTH_RATE),
    power('hydroponics'),
  ),
)

const eatFood = chain(
  over(food),
  compose(
    add,
    negate,
    view(crew),
  ),
)

const embryos = lensPath(['ship', 'embryos'])
const refridgerateEmbryos = chain(
  set(embryos),
  compose(
    clamp(0, Infinity),
    converge(add, [
      view(embryos),
      compose(
        negate,
        Math.round,
        rand(0.05),
        multiply(EMBRYO_THAW_RATE),
        subtract(1),
        power('cryoStorage'),
      ),
    ]),
  ),
)

export const nextEvent = state => {
  const eventIdx = findIndex(event => event.condition(state))(
    state.possibleEvents,
  )

  const rawEvent = compose(nth(eventIdx))(state.possibleEvents)
  const appendHeader = log(state.time, rawEvent.isOutcome)
  const processedEvent = compose(
    evolve({ description: appendHeader }),
    evolve({ description: when(is(Function), applyTo(state)) }),
  )(rawEvent)

  return pipe(
    assoc('currentEvent', processedEvent),
    evolve({ possibleEvents: removeUnlessLast(eventIdx) }),
  )(state)
}

// Step the simulation
export default pipe(
  passTime,
  recycleWaste,
  growFood,
  eatFood,
  refridgerateEmbryos,
  nextEvent,
)
