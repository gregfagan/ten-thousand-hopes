import { nextEvent } from './sim'
import events from './events'

export default nextEvent({
  time: 0, // what is the unit

  ship: {
    crew: 50,
    food: 100,
    embryos: 10000,

    power: {
      capacity: 3,
      allocation: {
        hydroponics: 1,
        cryoStorage: 1,
        lifeSupport: 1,
      },
    },
  },

  currentEvent: undefined,
  possibleEvents: events,
})
