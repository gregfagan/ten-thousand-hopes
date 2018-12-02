import {
  identity,
  assoc,
  assocPath,
  inc,
  evolve,
  pipe,
  findIndex,
  nth,
  __,
  subtract,
  lensPath,
  curry,
  over,
  compose,
  prop,
  when,
  is,
  applyTo,
} from 'ramda'
import { removeUnlessLast } from '../ramda-ext'

const FOOD_GROWTH_RATE = 40
const START_DATE = new Date(Date.UTC(2085, 11, 2))
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

const growFood = state =>
  assocPath(
    ['ship', 'food'],
    state.ship.food +
      Math.round(state.ship.power.allocation.hydroponics * FOOD_GROWTH_RATE),
  )(state)

const eatFood = state =>
  assocPath(['ship', 'food'], state.ship.food - state.ship.crew)(state)

const refridgerateEmbryos = identity

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

const crew = lensPath(['ship', 'crew'])
export const kill = count => over(crew, subtract(__, count))

// Step the simulation
export default pipe(
  passTime,
  refridgerateEmbryos,
  growFood,
  eatFood,
  nextEvent,
)
