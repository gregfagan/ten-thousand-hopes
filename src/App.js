import React, { Component } from 'react'
import './App.css'

import initialState from './game/state'

const Status = ({ time, ship: { crew, food, embryos } }) => (
  <div className="status">
    <div>Week: {time}</div>
    <div>Crew: {crew}</div>
    <div>Food: {food}</div>
    <div>Embryos: {embryos}</div>
  </div>
)

const Event = ({ description, options, dispatch }) => (
  <div className="event">
    <p>{description}</p>
    {options.map(({ text, effect }, i) => (
      <button key={i} onClick={() => dispatch(effect)}>
        {text}
      </button>
    ))}
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
        <Status {...state} />
        <Event {...state.currentEvent} dispatch={dispatch} />
      </div>
    )
  }
}

export default App
