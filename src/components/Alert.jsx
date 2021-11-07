import React from 'react'
import Alert from 'react-bootstrap/Alert'
export const Warning = ({ error }) => {
  return (
    <Alert variant='info'>
      {' '}
      {error}
      <a href='https://metamask.io/'> Here </a>
    </Alert>
  )
}
