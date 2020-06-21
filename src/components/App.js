import React, { Component } from 'react';
import waviiiLogo from '../../src/iiiWallet.png';
import Web3 from 'web3';
import waviii from '../abis/waviii.json'
import CountUp from 'react-countup'
import { WaveTopBottomLoading } from 'react-loadingg';
import './App.css'

// reactstrap components
import { Card, CardHeader, CardBody, Row, Col } from "reactstrap";

class App extends React.Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
      this.setState({ loading: true })
      this.setState({ noEth: true })
    }
  }


  async loadBlockchainData() {
    if(this.state.loading) {
      return false; 
    } else {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const TokenAddress = "0xBA00868912Af1a409F11E9c2B5d3a9376Cb3C2E2" // waviii Token Contract Address
    // const TokenAddress = "0x345d08120c55C34bE5cF52a28464bbe54164d330" // local waviii Token Contract Address
    //const TokenAddress = "0x9cc6754d16b98a32ec9137df6453ba84597b9965" // new waviii Token Contract Address
    const waviiiToken = new web3.eth.Contract(waviii.abi, TokenAddress)
    this.setState({ waviiiToken: waviiiToken })
    const balance = await waviiiToken.methods.balanceOf(this.state.account).call()
    this.setState({ balance: web3.utils.fromWei(balance.toString(), 'Ether') })
    const transactions = (await Promise.all([
      waviiiToken.getPastEvents('Transfer', { fromBlock: 0, toBlock: 'latest', filter: { from: this.state.account } }), 
      waviiiToken.getPastEvents('Transfer', { fromBlock: 0, toBlock: 'latest', filter: { to: this.state.account } })])).flat()
    this.setState({ transactions: transactions })
    console.log(transactions)
  }}

  transfer(recipient, amount) {
    this.state.waviiiToken.methods.transfer(recipient, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
    this.setState({ loading: true })
    }).on('confirmation', (reciept) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      waviiiToken: null,
      balance: 0,
      transactions: [],
      loading: undefined
    }

    this.transfer = this.transfer.bind(this)
  }


  render() {
    let content
    if(this.state.loading) {
      if(this.state.noEth) {
        content = <div className="content mr-auto ml-auto" style={{ width: "90%" }}><div className="card mb-4"><div className="card-body" style={{ width: "90%" }}><p id="loader" ><WaveTopBottomLoading color={"#2c91c7"} /><a href="https://metamask.io/"><h5><strong>Install MetaMask!</strong></h5><img alt="MetaMask" width="100%" height="auto" src={require("../mm.png")} /></a></p></div></div></div>
      } else {
      content = <p id="loader" className="text-center"><WaveTopBottomLoading /></p>
      }
    } else {
      content = 
      <div className="mt-3">
    <div className="row">
      <main role="main" className="col-lg-12 d-flex text-center">
        <div className="content mr-auto ml-auto" style={{ width: "90%" }}><img src={waviiiLogo} width="150" /><br /><br />
          <h1><strong><CountUp duration={2.7} start={0} separator="" decimals="2" decimal="." end={this.state.balance} /> waviii</strong></h1>
          <div className="card mb-4" >
            <div className="card-body">
              

          <form className="mb-3" onSubmit={(event) => {
            event.preventDefault()
            const recipient = this.recipient.value
            const amount = window.web3.utils.toWei(this.amount.value, 'Ether')
            this.transfer(recipient, amount)
          }}>

            <div className="form-group">
              <input
                id="recipient"
                type="text"
                ref={(input) => { this.recipient = input }}
                className="form-control form-control-lg"
                placeholder="Recipient Address"
                required />
            </div>
            <div className="form-group">
              <input
                id="amount"
                type="text"
                ref={(input) => { this.amount = input }}
                className="form-control form-control-lg"
                placeholder="Amount"
                required />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg"><strong>Send</strong></button>
          </form>

          <table className="table">
            <thead>
              <tr>
                <th scope="col">Recipient</th>
                <th scope="col">value</th>
              </tr>
            </thead>
            <tbody>
              { this.state.transactions.sort((a, b) => a.blockNumber < b.blockNumber).map((tx, key) => {
                return (
                  <tr key={key} >
                    <td>                
                    <a  
                    className="title right"
                    href={`https://etherscan.io/address/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                      <span class="text-muted">{tx.returnValues.to}</span>  
                  </a></td>
                  {tx.returnValues.to !== this.state.account &&
                    <td><span class="waviii">-<CountUp duration={2.7} start={0} separator="" decimals="2" decimal="." end={window.web3.utils.fromWei(tx.returnValues.value.toString(), 'Ether')} /></span></td>
                   }
                  {tx.returnValues.to === this.state.account &&
                    <td><span class="waviii2">+<CountUp duration={2.7} start={0} separator="" decimals="2" decimal="." end={window.web3.utils.fromWei(tx.returnValues.value.toString(), 'Ether')} /></span></td>
                   }

                  </tr>
                )
              }) }

            </tbody>
          </table> 
          </div> </div></div>
          </main>    
          </div></div>
    }

    return (
      <>
        <div className="content">
          <Row>
            <Col md="12">
              <Card>
                <CardHeader>

                <a  
                    className="title right"
                    href={`https://etherscan.io/address/${this.state.account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                      <span><center>{this.state.account}</center></span>  
                  </a>
                </CardHeader>
                <CardBody className="all-icons">

                <div>
                {content}
                </div>     
                
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default App;
