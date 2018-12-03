import React from 'react'
import styled from '@emotion/styled'
import { range, cond, equals, gt, always, o, __ } from 'ramda'
import BaseButton from './Button'

import { hungerLevel } from '../game/sim'

import {
  needsPowerManagement,
  power,
  canDivertTo,
  divertTo,
  canDivertFrom,
  divertFrom,
} from '../game/power'

const describeHunger = cond([
  [equals(1), always('starving')],
  [gt(__, 0.75), always('critical')],
  [gt(__, 0.5), always('dire')],
  [gt(__, 0.25), always('severe')],
  [gt(__, 0), always('bad')],
])

export default function Status({ state, dispatch }) {
  const {
    ship: { crew, waste, food, embryos },
  } = state

  return (
    <Container>
      <Crew count={crew} />
      <Oxygen percent={1 - waste} />
      {food > 0 ? (
        <Emphasized label="food">{food}</Emphasized>
      ) : (
        <Emphasized label="hunger">
          {o(describeHunger, hungerLevel)(state)}
        </Emphasized>
      )}
      <Emphasized label="embryos">{embryos}</Emphasized>
      <Power>
        <SystemReadout level={power('lifeSupport')(state)} color="red">
          life support
        </SystemReadout>
        <SystemReadout level={power('hydroponics')(state)} color="green">
          hydroponics
        </SystemReadout>
        <SystemReadout level={power('cryoStorage')(state)} color="blue">
          cryo storage
        </SystemReadout>
        <div className="spacer" />
        {needsPowerManagement(state) && (
          <>
            <PowerControls
              system="hydroponics"
              state={state}
              dispatch={dispatch}
            />
            <PowerControls
              system="cryoStorage"
              state={state}
              dispatch={dispatch}
            />
          </>
        )}
      </Power>
    </Container>
  )
}

const Container = styled.div`
  min-width: 200px;
  font-size: 16px;
  margin-right: 2em;
  align-items: flex-end;
`

const Frame = styled.div`
  border: 2px solid var(--foreground);
  border-radius: 0.25em;
`

const CrewContainer = styled.div`
  align-items: flex-end;
`

const CrewFrame = styled(Frame)`
  margin: 0.25em 0em;
  padding: 0.25em;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
`
const CrewMember = styled.div`
  background-color: var(--yellow);
  opacity: ${props => (props.dead ? 0 : 1)};
  border-radius: 0.1em;
  width: 0.5em;
  height: 0.5em;
  margin: 0.25em;
  :first-of-type {
    background-color: var(--red);
  }
`

const Crew = ({ count }) => (
  <CrewContainer>
    crew
    <CrewFrame>
      {range(0, 50).map(i => (
        <CrewMember key={i} dead={i >= count} />
      ))}
    </CrewFrame>
  </CrewContainer>
)

const OxygenContainer = styled.div`
  margin: 0.5em 0;
  margin-left: 1.8em;
  align-self: stretch;
`

const OxygenFrame = styled(Frame)`
  margin: 0.25em 0;
  padding: 0.4em;
  flex-direction: row;
`
const Oxygen = ({ percent }) => (
  <OxygenContainer>
    <span style={{ alignSelf: 'flex-end' }}>oxygen</span>
    <OxygenFrame>
      <OxygenBar ratio={percent} color="blue" />
    </OxygenFrame>
  </OxygenContainer>
)

const EmphasizedContainer = styled.div`
  flex-direction: row;
  align-items: baseline;
  margin: 0.25em 0;
`
const EmphasizedLabel = styled.span`
  margin-right: 0.5em;
`
const EmphasizedValue = styled.span`
  font-size: 30px;
  color: var(--orange);
`

const Emphasized = ({ label, children: value }) => (
  <EmphasizedContainer>
    <EmphasizedLabel>{label}</EmphasizedLabel>
    <EmphasizedValue>{value}</EmphasizedValue>
  </EmphasizedContainer>
)

const Power = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 1em;
`

const SystemReadout = ({ children: label, level, color }) => (
  <System>
    <Label>{label}</Label>
    <BarFrame>
      <Bar ratio={level} color={color} />
    </BarFrame>
  </System>
)

const System = styled.div`
  flex-direction: row;
  position: relative;
`

const Label = styled.div`
  font-size: 14px;
  white-space: nowrap;
  align-self: flex-end;
  transform-origin: 0% 0%;
  transform: rotate(-90deg) translate(-10%, 75%);
  position: absolute;
`

const PowerControls = ({ system, state, dispatch }) => (
  <Controls>
    <Button
      disabled={!canDivertTo(system)(state)}
      onClick={() => dispatch(divertTo(system))}
    >
      {'▲'}
    </Button>
    <Button
      disabled={!canDivertFrom(system)(state)}
      onClick={() => dispatch(divertFrom(system))}
    >
      {'▼'}
    </Button>
  </Controls>
)

const Controls = styled.div`
  padding-top: 0.25em;
  align-items: flex-end;
`

const Button = styled(BaseButton)`
  color: var(--foreground);
  padding: 0.3em 0.65em;
  margin: unset;
  border: none;
`

const BarFrame = styled(Frame)`
  margin-left: 2em;
  padding: 0.5em;
  align-items: stretch;
  height: 200px;
  min-width: 2em;
  justify-content: flex-end;
`

const Bar = styled.div`
  background-color: ${props => 'var(--' + props.color + ')'};
  border-radius: 0.25em;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: ${props => props.ratio * 100}%;
`

const OxygenBar = styled(Bar)`
  height: 1.5em;
`
