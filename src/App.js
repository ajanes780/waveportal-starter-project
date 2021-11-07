import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Warning } from './components/Alert'
import { Button, Container, Row, Col, Spinner, Form } from 'react-bootstrap'
import abi from './utils/WavePortal.json'
// import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [error, setError] = useState('')
  const [spinner, setSpinner] = useState(false)
  const [allWaves, setAllWaves] = useState([])
  const [message, setMessage] = useState({ userName: '', message: '' })

  const contractAddress = '0x64FaAc685c88db0f7f8c149A64b6Ff5B2598e6Dc'
  const contractABI = abi.abi

  const getAllWaves = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves()

        let wavesCleaned = []
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
            userName: wave.userName,
          })
        })

        setAllWaves(wavesCleaned)
      } else {
        setError("Ethereum object doesn't exist!")
        // console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

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
        getAllWaves()
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
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Connected', accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    connectWallet()
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {
    getAllWaves()
  }, [spinner])

  const wave = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)
        setSpinner(true)

        let count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())

        const waveTxn = await wavePortalContract.wave(message.message, message.userName)
        console.log('Mining...', waveTxn.hash)
        //  set loading spiner
        await waveTxn.wait()
        console.log('Mined -- ', waveTxn.hash)
        //  set loading to false
        setSpinner(false)
        setMessage({ username: '', message: '' })
        count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setMessage((prev) => ({ ...prev, [name]: value }))
    console.log(`message`, message)
  }

  return (
    <Container fluid='md' className='mt-4'>
      <Row>
        <Col className='m-8' md={12}>
          <h1 style={{ color: 'white', textAlign: 'center' }}> ⧫ Ethereum Powered ⧫ </h1>
        </Col>
      </Row>

      <Row>
        <Col md={{ span: 8, offset: 2 }} className='header' style={{ textAlign: 'center' }}>
          <h2> 👋 Hey there! </h2> <h4>Im Aaron and React + Solidity is Amazing </h4>{' '}
          <h4>Send me a message and I might send you some Ether</h4>
          {error && <Warning error={error} />}
        </Col>
      </Row>

      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <Form>
            <Form.Group className='mb-3' controlId='formBasicEmail'>
              <Form.Label style={{ color: 'white' }}>Enter a user name</Form.Label>
              <Form.Control
                type='text'
                placeholder='User name'
                value={message.userName}
                name='userName'
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className='mb-3' controlId='formBasicPassword'>
              <Form.Label style={{ color: 'white' }}>Your Message</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                placeholder='Enter your message'
                name='message'
                value={message.message}
                onChange={handleChange}
              />
            </Form.Group>
            <Col>
              {!currentAccount && (
                <Button className=' btn mb-2 btn-block col-12' variant='info' onClick={connectWallet}>
                  Connect To Wallet
                </Button>
              )}
              <Button className='btn m-auto btn-block col-12' variant='info' onClick={wave}>
                {spinner && <Spinner role='status' size='md' animation='border' />}
                <span>Send me a message </span>
              </Button>
            </Col>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          {allWaves.map((wave, index) => {
            console.log(`wave`, wave)
            return (
              <div key={index} style={{ backgroundColor: 'OldLace', marginTop: '16px', padding: '8px' }}>
                <div> Name: {wave.userName} </div>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
            )
          })}
        </Col>
      </Row>
    </Container>
  )
}

export default App
