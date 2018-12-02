import { nextEvent } from './sim'
import events from './events'
import { FULL_POWER } from './power'

export default nextEvent({
  time: 0, // weeks

  ship: {
    crew: 50,
    waste: 0,
    food: 800,
    embryos: 10000,

    // Power allocations as quarters, i.e. 4/4 is 100%
    power: {
      lifeSupport: FULL_POWER,
      hydroponics: FULL_POWER,
      cryoStorage: FULL_POWER,
    },
  },

  currentEvent: undefined,
  possibleEvents: events,
})
