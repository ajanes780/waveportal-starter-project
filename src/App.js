import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Warning } from './components/Alert'
import { Button, Container, Row, Col, Spinner } from 'react-bootstrap'
import abi from './utils/WavePortal.json'
// import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [error, setError] = useState('')
  const contractAddress = '0xd62aAC594D3f29E82b479Cd77707964a310E044d'
  const contractABI = abi.abi
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

  const [spinner, setSpinner] = useState(false)
  const wave = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        let count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())

        const waveTxn = await wavePortalContract.wave()
        console.log('Mining...', waveTxn.hash)
        //  set loading spiner
        setSpinner(true)
        await waveTxn.wait()
        console.log('Mined -- ', waveTxn.hash)
        //  set loading to false
        setSpinner(false)
        count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Container fluid className='m-2'>
      <Row>
        <Col md={2}> </Col>
        <Col md={8} className='header' style={{ textAlign: 'center' }}>
          <h2> 👋 Hey there! </h2> <h4>Im Aaron and React + Solidity is Amazing </h4>{' '}
          <h4>Wave at me and I might send you some Ether</h4>
          {error && <Warning error={error} />}
          {spinner && <Spinner animation='border' variant='danger' />}
          <Col>
            {!currentAccount && (
              <Button className=' btn  btn-block col-8' variant='info' onClick={connectWallet}>
                Connect To Wallet
              </Button>
            )}
            <Button className='btn btn-block col-8 ' variant='info' onClick={wave}>
              Wave at Me
            </Button>
          </Col>
        </Col>
        <Col md={2}> </Col>
      </Row>
    </Container>
  )
}

export default App
