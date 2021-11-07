import React from 'react'
import Alert from 'react-bootstrap/Alert'
export const Warning = ({ error }) => {
  return (
    <Alert variant='warning'>
      {' '}
      {error}
      <a href='https://metamask.io/'> here </a>
    </Alert>
  )
}
