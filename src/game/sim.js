import {
  __,
  divide,
  gte,
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
  o,
  set,
  multiply,
  when,
  is,
  applyTo,
  ifElse,
  view,
  negate,
  lensProp,
  lt,
  gt,
  always,
  max,
} from 'ramda'
import { removeUnlessLast, rand, clamp, lensSatisfies } from '../ramda-ext'
import { power } from './power'

const START_DATE = new Date(Date.UTC(2085, 11, 2))
const WASTE_BUILDUP_RATE = 0.25
const FOOD_GROWTH_RATE = (100 * 2) / 3
const EMBRYO_THAW_RATE = 385
const HUNGER_BEFORE_DEATH = 4

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

export const time = lensProp('time')
const passTime = evolve({ time: inc })

export const crew = lensPath(['ship', 'crew'])
export const kill = count =>
  compose(
    over(crew, subtract(__, count)),
    when(
      hungry,
      over(food, chain(add, o(max(count * HUNGER_BEFORE_DEATH), hunger))),
    ),
  )

export const waste = lensPath(['ship', 'waste'])
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

export const food = lensPath(['ship', 'food'])
const growFood = chain(
  over(food),
  compose(
    add,
    Math.round,
    multiply(FOOD_GROWTH_RATE),
    power('hydroponics'),
  ),
)

const eatFood = state => {
  const people = view(crew)(state)

  return chain(
    set(food),
    compose(
      clamp(people * -1 * HUNGER_BEFORE_DEATH, Infinity),
      subtract(__, people),
      view(food),
    ),
  )(state)
}

const hunger = ifElse(
  lensSatisfies(lt(__, 0), food),
  pipe(
    view(food),
    Math.abs,
  ),
  always(0),
)

const hungry = o(gt(__, 0), hunger)
export const hungerLevel = converge(divide, [
  hunger,
  o(multiply(HUNGER_BEFORE_DEATH), view(crew)),
])
// const logHunger = state => {
//   console.log(hunger(state), hungerLevel(state))
//   return state
// }
// const logDeath = deaths => state => {
//   console.log(deaths + ' dead')
//   return state
// }
const crewStarving = o(gte(__, 1), hungerLevel)
const starve = state => {
  const deaths = Math.round(Math.random() * 4)
  return pipe(
    // logHunger,
    when(crewStarving, kill(deaths)),
  )(state)
}

export const embryos = lensPath(['ship', 'embryos'])
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
export const destroyEmbryos = n =>
  chain(
    set(embryos),
    compose(
      clamp(0, Infinity),
      add(-n),
      view(embryos),
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
  starve,
  refridgerateEmbryos,
  nextEvent,
)
