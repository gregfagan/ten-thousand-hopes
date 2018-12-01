import { propEq, pipe, identity, map, T } from 'ramda'
import { assocDefaultForProp } from '../ramda-ext'
import initialState from './state'
import step from './sim'

const option = (text, effect = identity, stepAfter = true) => ({
  text,
  effect: pipe(
    effect,
    stepAfter ? step : identity,
  ),
})

const addDefaults = pipe(
  map(assocDefaultForProp('condition', T)),
  map(assocDefaultForProp('options', [option('Continue')])),
)

export default addDefaults([
  {
    description: 'Your rocket has left for Mars.',
  },
  {
    condition: propEq('time', 1),
    description:
      'One of your solar panels was damaged by space junk during the launch...',
    options: [option('Try to repair'), option('Ignore')],
  },
  {
    condition: propEq('time', 5),
    description: 'You have arrived at Mars.',
    options: [option('Start over', () => initialState, false)],
  },
  {
    description: 'A week passes without major incident',
  },
])
