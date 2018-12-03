import React from 'react'
import styled from '@emotion/styled'
import Button from './Button'

const Container = styled.div`
  flex: 1 1 auto;
  max-width: 1000px;
  p {
    margin-top: 0;
    margin-bottom: 1.25em;
  }
`

const Options = styled.div`
  flex-direction: row;
`

export default ({ description, options, dispatch }) => (
  <Container>
    <p>{description}</p>
    <Options>
      {options.map(({ text, effect }, i) => (
        <Button key={i} onClick={() => dispatch(effect)}>
          {text}
        </Button>
      ))}
    </Options>
  </Container>
)
