import { Component } from '@angular/core';
import { BigNumber, ethers } from 'ethers';
import { environment } from '../environments/environment'
import  MyToken from '../assets/MyToken.json' 
import  Ballot  from '../assets/Ballot.json'
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  wallet: ethers.Wallet | undefined;
   provider: ethers.providers.AlchemyProvider | undefined
 // provider: ethers.providers.BaseProvider | undefined;
  etherBalance: number | undefined;
  tokenContract: ethers.Contract | undefined;
  tokenContractAddress: string | undefined;
  tokenBalance: number | undefined;
  voteBalance: number | undefined;
  ballotContract: ethers.Contract | undefined;
  
  // attempt to add mm wallet
  MMaddress: string | undefined;
  constructor(private http: HttpClient){
    this.http.get<any>("http://localhost:3000/token-address").subscribe((ans) => {
      console.log(ans)
      this.tokenContractAddress = ans.result;
    });
  }

  updateInfo() {
    this.tokenContract = new ethers.Contract(environment.tokenContract, MyToken.abi, this.wallet)
    // get eth balance in wallet
    if (this.tokenContractAddress) {
    this.wallet?.getBalance().then((balanceBn) => {
      this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn))
    })
    // get token balance
    this.tokenContract['balanceOf'](this.wallet?.address).then((tokenBalanceBn: BigNumber) => {
      this.tokenBalance = parseFloat(ethers.utils.formatEther(tokenBalanceBn))
    })
    // get voting power balance
    this.tokenContract['getVotes'](this.wallet?.address).then((voteBalanceBn: BigNumber) => {
      this.voteBalance = parseFloat(ethers.utils.formatEther(voteBalanceBn))
    })
    // define ballot contract
    this.ballotContract = new ethers.Contract(environment.ballotContract, Ballot.abi, this.wallet)

  }
}

  createWallet() {
    // add your provider api key here
    this.provider = new ethers.providers.AlchemyProvider("goerli", environment.alchemyAPI)
   //this.provider = ethers.providers.getDefaultProvider("goerli");
    this.wallet = ethers.Wallet.createRandom().connect(this.provider); 
    this.updateInfo();
    setInterval(this.updateInfo, 1000);
    
}
  // this needs to hook up to the ballot contract somehow
  vote(voteId: string){
    console.log(`vote for ${voteId}`)
  //  await this.ballotContract["vote"](voteId)
  }
  // this needs to mint tokens from our token contract somehow
  request(mintAmount: string) {
    this.http.post<any>("http://localhost:3000/request-tokens", {address: this.wallet?.address, amount: mintAmount }).subscribe((ans) => {
      console.log(ans)
     ;})
  }
  
  async connectWallet() {
    // A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page
const MetaMaskprovider = new ethers.providers.Web3Provider(window.ethereum)
// MetaMask requires requesting permission to connect users accounts
await MetaMaskprovider.send("eth_requestAccounts", []);
// The MetaMask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
  const signer = await MetaMaskprovider.getSigner();
  await signer.getAddress().then((address) => {;
  console.log(address);
  this.tokenContract = new ethers.Contract(environment.tokenContract, MyToken.abi, this.wallet)
    // get eth balance in wallet
    if (this.tokenContractAddress) {
      
    signer.getBalance().then((balanceBn) => {
      this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn))
    })
    // get token balance
   this.tokenContract['balanceOf'](address).then((tokenBalanceBn: BigNumber) => {
      this.tokenBalance = parseFloat(ethers.utils.formatEther(tokenBalanceBn))
    })
    // get voting power balance
    this.tokenContract['getVotes'](address).then((voteBalanceBn: BigNumber) => {
      this.voteBalance = parseFloat(ethers.utils.formatEther(voteBalanceBn))
    })}
    })
  }
}