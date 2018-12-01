import {
  identity,
  assoc,
  assocPath,
  inc,
  evolve,
  pipe,
  findIndex,
  nth,
} from 'ramda'
import { removeUnlessLast } from '../ramda-ext'

const FOOD_GROWTH_RATE = 40

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

const nextEvent = state => {
  const eventIdx = findIndex(event => event.condition(state))(
    state.possibleEvents,
  )
  return pipe(
    assoc('currentEvent', nth(eventIdx, state.possibleEvents)),
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
