import styled from '@emotion/styled'

export default styled.button`
  display: flex;
  margin-right: 1em;
  padding: 1em;

  font-size: unset;
  font-family: unset;
  background: transparent;
  color: var(--red);
  border: 3px solid var(--red);
  border-radius: 0.25em;
  outline: none;
  cursor: pointer;
  user-select: none;

  :disabled {
    opacity: 0.15;
    cursor: default;
  }
`
