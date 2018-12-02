import { nextEvent } from './sim'
import events from './events'

export default nextEvent({
  time: 0, // weeks

  ship: {
    crew: 50,
    waste: 0,
    food: 800,
    embryos: 10000,

    // Power allocations as quarters, i.e. 4/4 is 100%
    power: {
      lifeSupport: 4,
      hydroponics: 4,
      cryoStorage: 4,
    },
  },

  currentEvent: undefined,
  possibleEvents: events,
})
