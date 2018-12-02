import { nextEvent } from './sim'
import events from './events'

export default nextEvent({
  time: 0, // weeks

  ship: {
    crew: 50,
    food: 800,
    embryos: 10000,
    waste: 0,

    // Power allocations as quarters, i.e. 4/4 is 100%
    power: {
      hydroponics: 4,
      cryoStorage: 4,
      lifeSupport: 4,
    },
  },

  currentEvent: undefined,
  possibleEvents: events,
})
