import { head, tail } from 'ramda'
import events from './events'

export default {
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

  currentEvent: head(events),
  possibleEvents: tail(events),
}
