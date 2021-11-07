import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Warning } from './components/Alert'
import { Button, Container, Row, Col } from 'react-bootstrap'
// import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [error, setError] = useState('')
  console.log(`error`, error)
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        console.log('Make sure you have metamask')
        return
      } else {
        console.log('We have the ethereum object ', ethereum)
      }

      //  --- Lets check if the user authorized us --- //
      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account:', account)
        setCurrentAccount(account)
      } else {
        console.log('No authorized account found')
      }
    } catch (error) {
      console.log(error)
    }
  }

  //  --- Connect your wallet function --- //

  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        setError('Get Meta Mask to use this site ')
        // alert('Get Meta Mask')
      }
    } catch (error) {}
  }

  useEffect(() => {
    connectWallet()
    checkIfWalletIsConnected()
  }, [])

  const wave = () => {}

  return (
    <Container fluid className='m-2'>
      <Row>
        <Col md={2}> </Col>
        <Col md={8} className='header' style={{ textAlign: 'center' }}>
          <h2> 👋 Hey there! </h2> <h4>Im Aaron and React + Solidity is Amazing </h4>{' '}
          <h4>Wave at me and I might send you some Ether</h4>
          {error && <Warning error={error} />}
          <Button className='btn m-2btn-block col-8 ' variant='info' onClick={wave}>
            Wave at Me
          </Button>
        </Col>
        <Col md={2}> </Col>
      </Row>
    </Container>
  )
}

export default App
