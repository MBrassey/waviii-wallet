import React, { Component } from 'react';
import waviiiLogo from '../../src/iiiWallet.png';
import Web3 from 'web3';
import waviii from '../abis/waviii.json'

document.body.style = 'background: #BDC3C7;';

class App extends Component {
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
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const TokenAddress = "0xBA00868912Af1a409F11E9c2B5d3a9376Cb3C2E2" // waviii Token Contract Address
    const waviiiToken = new web3.eth.Contract(waviii.abi, TokenAddress)
    this.setState({ waviiiToken: waviiiToken })
    const balance = await waviiiToken.methods.balanceOf(this.state.account).call()
    this.setState({ balance: web3.utils.fromWei(balance.toString(), 'Ether') })
    const transactions = await waviiiToken.getPastEvents('Transfer', { fromBlock: 0, toBlock: 'latest', filter: { from: this.state.account } })
    this.setState({ transactions: transactions })
    console.log(transactions)
    var etherscanaddress = this.state.account
  }

  transfer(recipient, amount) {
    this.state.waviiiToken.methods.transfer(recipient, amount).send({ from: this.state.account })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      waviiiToken: null,
      balance: 0,
      transactions: []
    }

    this.transfer = this.transfer.bind(this)
  }

  render() {
    return (
      <div>

        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="https://github.com/luc1dLife/iiiWallet"
            target="_blank"
            rel="noopener noreferrer"
          >
            iiiWallet
          </a>
          
          <a
            className="navbar-brand px-3"
            href={`https://etherscan.io/address/${this.state.account}`}
            target="_blank"
            rel="noopener noreferrer"
          >
          <span>{this.state.account}</span>
          
          </a>
        </nav>

        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto" style={{ width: "500px" }}>
                  <img src={waviiiLogo} width="150" />
                <h1>{this.state.balance} waviii</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const recipient = this.recipient.value
                  const amount = window.web3.utils.toWei(this.amount.value, 'Ether')
                  this.transfer(recipient, amount)
                }}>
                  <div className="form-group mr-sm-2">
                    <input
                      id="recipient"
                      type="text"
                      ref={(input) => { this.recipient = input }}
                      className="form-control"
                      placeholder="Recipient Address"
                      required />
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="amount"
                      type="text"
                      ref={(input) => { this.amount = input }}
                      className="form-control"
                      placeholder="Amount"
                      required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block"><strong>Send</strong></button>
                </form>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Recipient</th>
                      <th scope="col">value</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.state.transactions.map((tx, key) => {
                      return (
                        <tr key={key} >
                          <td>{tx.returnValues.to}</td>
                          <td>{window.web3.utils.fromWei(tx.returnValues.value.toString(), 'Ether')}</td>
                        </tr>
                      )
                    }) }
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
