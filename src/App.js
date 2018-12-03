import React, { Component } from 'react'
import './App.css'

import initialState from './game/state'
import { hungerLevel } from './game/sim'

import {
  needsPowerManagement,
  power,
  canDivertTo,
  divertTo,
  canDivertFrom,
  divertFrom,
} from './game/power'

const Status = ({ state, dispatch }) => {
  const {
    ship: { crew, waste, food, embryos },
  } = state
  return (
    <div className="status">
      <div>Crew: {crew}</div>
      <div>Waste: {waste.toFixed(2)}</div>
      {food > 0 ? (
        <div>Food: {food}</div>
      ) : (
        <div>Hunger: {hungerLevel(state)}</div>
      )}
      <div>Embryos: {embryos}</div>
      {needsPowerManagement(state) && (
        <div className="power">
          Power
          <div className="row">
            <div className="spacer" />
            Life Support: {power('lifeSupport')(state)}
          </div>
          <div className="row">
            <button
              disabled={!canDivertFrom('hydroponics')(state)}
              onClick={() => dispatch(divertFrom('hydroponics'))}
            >
              {'<'}
            </button>
            <button
              disabled={!canDivertTo('hydroponics')(state)}
              onClick={() => dispatch(divertTo('hydroponics'))}
            >
              {'>'}
            </button>
            Hydroponics: {power('hydroponics')(state)}
          </div>
          <div className="row">
            <button
              disabled={!canDivertFrom('cryoStorage')(state)}
              onClick={() => dispatch(divertFrom('cryoStorage'))}
            >
              {'<'}
            </button>
            <button
              disabled={!canDivertTo('cryoStorage')(state)}
              onClick={() => dispatch(divertTo('cryoStorage'))}
            >
              {'>'}
            </button>
            Cryo Storage: {power('cryoStorage')(state)}
          </div>
        </div>
      )}
    </div>
  )
}

const Event = ({ description, options, dispatch }) => (
  <div className="event">
    <p>{description}</p>
    <div className="row">
      {options.map(({ text, effect }, i) => (
        <button key={i} onClick={() => dispatch(effect)}>
          {text}
        </button>
      ))}
    </div>
  </div>
)

class App extends Component {
  state = initialState

  dispatch = event => {
    this.setState(state => event(state))
  }

  render() {
    const { state, dispatch } = this
    return (
      <div className="app">
        <Status state={state} dispatch={dispatch} />
        <Event {...state.currentEvent} dispatch={dispatch} />
      </div>
    )
  }
}

export default App
