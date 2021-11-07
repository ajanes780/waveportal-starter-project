import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Warning } from './components/Alert'
import { Button, Container, Row, Col, Spinner, Form } from 'react-bootstrap'
import abi from './utils/WavePortal.json'
import video from './video/current.mp4'
// import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [error, setError] = useState('')
  const [spinner, setSpinner] = useState(false)
  const [allWaves, setAllWaves] = useState([])
  const [message, setMessage] = useState({ userName: '', message: '' })

  const contractAddress = '0x5065C4D4d74Fa1904B989Bbd82A32dE5790Ad705'
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
    let wavePortalContract

    const onNewWave = (from, timestamp, message, userName) => {
      console.log('NewWave', from, timestamp, message, userName)
      setAllWaves((prev) => [
        ...prev,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
          userName: userName,
        },
      ])
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)
      wavePortalContract.on('NewWave', onNewWave)
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave)
      }
    }
  }, [])

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

        const waveTxn = await wavePortalContract.wave(message.message, message.userName, { gasLimit: 300000 })
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
        setSpinner(false)

        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      setSpinner(false)
      // setError(error)
      console.log(error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setMessage((prev) => ({ ...prev, [name]: value }))
    console.log(`message`, message)
  }

  return (
    // <video style={{ position: 'fixed', zIndex: '-1', width: '100%' }} className='videoTag' autoPlay loop muted>
    //   <source src={video} type='video/mp4' />
    <Container fluid='md' className='mt-4' style={{}}>
      <Row>
        <Col className='m-8' md={12}>
          <h1 style={{ color: 'white', textAlign: 'center' }}> ⧫ Ethereum Powered ⧫ </h1>
        </Col>
      </Row>

      <Row>
        <Col md={{ span: 8, offset: 2 }} className='header' style={{ textAlign: 'center' }}>
          <h2> 👋 Hey there! </h2> <h4>Im Aaron and React + Solidity is amazing </h4>{' '}
          <h4>Send me a message and I might send you some Ether</h4>
          {error && <Warning error={error} />}
        </Col>
      </Row>

      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <Form
            style={{
              border: '5px solid white',
              padding: '8px',
              margin: '16px',
              padding: '16px',
              borderRadius: '5px',
            }}
          >
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

      <Row className='justify-content-md-center'>
        {allWaves && <h2 style={{ color: 'white', textAlign: 'Center', margin: '16px' }}> Previous Messages</h2>}
        <Col md={{ span: 8 }} style={{ borderRadius: '5px', padding: '16px' }}>
          {allWaves.map((wave, index) => {
            console.log(`wave`, wave)
            return (
              <div
                key={index}
                style={{
                  backgroundColor: 'OldLace',
                  marginTop: '16px',
                  padding: '8px',
                  color: 'black',
                  borderRadius: '5px',
                }}
              >
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
    // </video>
  )
}

export default App
