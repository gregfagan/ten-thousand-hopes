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
  multiply,
  when,
  min,
  is,
  applyTo,
  view,
  negate,
} from 'ramda'
import { removeUnlessLast, rand } from '../ramda-ext'
import { power } from './power'

const START_DATE = new Date(Date.UTC(2085, 11, 2))
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
  over(embryos),
  compose(
    add,
    negate,
    converge(min, [
      view(embryos),
      compose(
        Math.round,
        rand(0.1),
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
  refridgerateEmbryos,
  growFood,
  eatFood,
  nextEvent,
)
