import React, { Component } from 'react'
import styled from '@emotion/styled'
import Status from './ui/Status'
import Event from './ui/Event'

import initialState from './game/state'

const Container = styled.div`
  --foreground: #cbcdd2;
  --blue: #4fb4d8;
  --green: #78bd65;
  --orange: #ef7c2a;
  --red: #eb3d54;
  --yellow: #e5cd52;

  color: var(--foreground);
  padding: 1em;
  font-size: 20px;
  white-space: pre-wrap;
  flex-direction: row;
`

class App extends Component {
  state = initialState

  dispatch = event => {
    this.setState(state => event(state))
  }

  render() {
    const { state, dispatch } = this
    return (
      <Container>
        <Status state={state} dispatch={dispatch} />
        <Event {...state.currentEvent} dispatch={dispatch} />
      </Container>
    )
  }
}

export default App
