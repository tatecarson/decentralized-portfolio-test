import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import Authereum from 'authereum'
import $ from 'jquery';
import {
  Button,
  Container,
  Row,
  Col,
  Alert,
  Card,
  Modal,
  Spinner} from 'reactstrap';
import {
  HashRouter as Router,
  Link,
  Route,
  Switch,
  Redirect,
  withRouter
} from 'react-router-dom';
import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';

import Home from './components/Home.js';
import Menu from './components/Menu.js';
import Footer from './components/Footers/AdminFooter.js'
import Profile from './components/Profile.js';
import Portfolio from './components/Portfolio.js';
import Users from './components/Users.js';
import UserPage from './components/UserPage.js';
import Jobs from './components/Jobs.js';
import "./assets/plugins/nucleo/css/nucleo.css";
import "./assets/scss/argon-dashboard-react.scss";
import "./App.css";

const Box = require('3box');
const Config = require('./config.js');
const AppName = Config.AppName
const usersRegistered = Config.usersRegistered
const admin = Config.admin


class App extends Component {
  state = {
    hasWeb3:false,
    web3: null,
    coinbase: null,
    box: null,
    space: null,
    doingLogin:false
   };
  constructor(props){
    super(props)

    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);


    this.openSpace = this.openSpace.bind(this);


    this.setRedirect = this.setRedirect.bind(this);
    this.renderRedirect = this.renderRedirect.bind(this);
    this.chatBox = this.chatBox.bind(this);
  }
  componentDidMount = async () => {

    if(window.ethereum){
      this.setState({
        hasWeb3:true
      })
      await this.login();

    }

  };

  login = async function(){
    try {
      // Get network provider and web3 instance.
      let web3;
      if(window.ethereum){
        await window.ethereum.enable();
        web3 = new Web3(window.ethereum);
      } else {
        const authereum = new Authereum('mainnet');
        const provider = await authereum.getProvider()
        web3 = new Web3(provider);
        await provider.enable()
      }

      await this.setState({
        doingLogin: true
      });

      // Use web3 to get the user's coinbase.
      const coinbase = await web3.eth.getCoinbase();
      console.log(coinbase);
      ReactDOM.render(
        <div>
          <Spinner color="secondary" />
          <p>Aprove access to your 3Box account</p>
        </div>,
        document.getElementById("loading_status")
      );
      const box = await Box.openBox(coinbase,window.ethereum);
      //const space = await box.openSpace(AppName);
      ReactDOM.render(
        <div>
          <Spinner color="secondary" />
          <p>Syncing your profile</p>
        </div>,
        document.getElementById("loading_status")
      );
      await box.syncDone;

      await this.setState({
        web3:web3,
        coinbase:coinbase,
        box: box
      });
      await this.openSpace();
    } catch (error) {
      // Catch any errors for any of the above operations.

      this.setState({
        doingLogin: false
      });
      console.error(error);
    }
  }
  logout = function(){
    this.setState({
      coinbase: null,
      box: null,
      space: null
    })
    return
  };


  loginPageNoWeb3 = function(){
    this.setState({
      page: <div>
               <p>Use <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a> or login with <a href="#auth_login" onClick={this.login}>authereum</a></p>
            </div>
    });
    return
  }

  openSpace = async function(){
    const coinbase = this.state.coinbase;
    const box = this.state.box;

    ReactDOM.render(
      <div>
      <Spinner color="secondary" />
      <p>Aprove access to open your Decentralized Portfolio Space</p>
      </div>,
      document.getElementById("loading_status")
    );
    const space = await box.openSpace(AppName);

    ReactDOM.render(
      <div>
      <Spinner color="secondary" />
      <p>Opening your profile</p>
      </div>,
      document.getElementById("loading_status")
    );
    await space.syncDone;
    const profile = await space.public.all();
    await space.public.set('address',this.state.coinbase);
    this.setRedirect();
    this.setState({
      profile: profile,
      space: space,
      doingLogin: false
    });
    return;
  }


  setRedirect = () => {
    this.setState({
      redirect: true
    })
  }
  renderRedirect = () => {
    if (this.state.redirect) {
      return(
        <Redirect to={'/home'} />
      );
    }
  }
  chatBox = function(){
    if(!this.state.space){
      return
    }
    return(
      <ChatBox
          // required
          spaceName={AppName}
          threadName="chat"


          // Required props for context A) & B)
          box={this.state.box}
          currentUserAddr={this.state.coinbase}

          // optional
          userProfileURL={address => `user/${address}`}
          mute={false}
          popupChat
      />
    )
  }
  render() {


    return (
      <div>
        <Router>

          {
            (
              this.state.doingLogin &&
               (
                <Menu box={null}
                      space={null}
                      hasWeb3={this.state.hasWeb3}
                      doingLogin={this.state.doingLogin} />
               )
            )
          }
          {
            (
              !this.state.doingLogin &&
              (
                <Menu box={this.state.box}
                      space={this.state.space}
                      hasWeb3={this.state.hasWeb3}
                      doingLogin={this.state.doingLogin} />
              )
            )
          }
          <div className="themed-container" fluid={true}>
            {
              (this.state.doingLogin &&
                (
                  <Container className="themed-container" fluid={false} style={{display: this.state.doingLogin}}>
                          <Alert color="info" style={{textAlign: "center",
                                                marginTop:'20px'}}>
                              <h2 style={{color: 'white'}}>Loading dapp ...</h2>
                              <div id="loading_status"></div>
                          </Alert>
                  </Container>
                )
              )
             }

            <Switch>
                  <Route path={"/home"} component={Home} />

                  <Route path={"/profile"} render={() => {
                    if(!this.state.space){
                      return(
                        <Redirect to={"/home"} />
                      )
                    }
                    return(
                      <Container fluid={false}>
                        <Profile web3={this.state.web3}
                                 box={this.state.box}
                                 space={this.state.space}
                                 coinbase={this.state.coinbase} />
                      </Container>
                    )
                  }} />

                  <Route path={"/portfolio"} render={() => {
                    if(!this.state.space){
                      return(
                        <Redirect to={"/home"} />
                      )
                    }
                    return(
                      <Container fluid={false}>
                        <Portfolio
                                   web3 = {this.state.web3}
                                   coinbase = {this.state.coinbase}
                                   box = {this.state.box}
                                   space = {this.state.space}
                             />
                      </Container>

                    )
                  }} />

                  <Route path={"/users"} render={() => {

                    return(
                      <Container fluid={false}>
                        <Users box={this.state.box} space={this.state.space} coinbase={this.state.coinbase} />
                      </Container>
                    )
                    }} />

                  <Route path={"/user/:addr"} render={(props) => {

                      if(!this.state.space){
                        return(
                          <Container fluid={false}>
                            <UserPage {...props} />
                          </Container>
                        )
                      }
                      return(
                        <Container fluid={false}>
                          <UserPage box={this.state.box}
                                    space={this.state.space}
                                    coinbase={this.state.coinbase}
                                    {...props} />
                        </Container>
                      )
                  }} />

                  <Route path={"/jobs"} render={() => {
                    if(!this.state.space){
                      return(
                        <Container fluid={false}>
                          <Jobs/>
                        </Container>
                      )
                    }

                    return(
                        <Container fluid={false}>
                          <Jobs box={this.state.box} coinbase={this.state.coinbase} space={this.state.space} />
                        </Container>
                    )
                  }} />
                  <Route path={"/comments"} render={() => {
                    if(!this.state.space){
                      return(
                        <Container fluid={false}>
                           <h4>Comments</h4>
                           <p>Feedbacks or suggestion for nexts versions of this dapp</p>
                           <hr/>
                           <ThreeBoxComments
                                   // required
                                   spaceName={AppName}
                                   threadName={"job_offers"}
                                   adminEthAddr={admin}


                                   // Required props for context A) & B)
                                   //box={this.state.box}
                                   //currentUserAddr={this.state.coinbase}

                                   // Required prop for context B)
                                   //loginFunction={handleLogin}

                                   // Required prop for context C)
                                   ethereum={null}

                                   // optional
                                   members={false}
                               />


                         </Container>
                      );
                    }

                    return(
                      <Container fluid={false}>
                         <h4>Comments</h4>
                         <p>Use this space to give feedback or suggestion for nexts versions of this dapp</p>
                         <hr/>
                                       <ThreeBoxComments
                                            // required
                                            spaceName={AppName}
                                            threadName={"job_offers"}
                                            adminEthAddr={admin}


                                            // Required props for context A) & B)
                                            box={this.state.box}
                                            currentUserAddr={this.state.coinbase}

                                            // Required prop for context B)
                                            //loginFunction={handleLogin}

                                            // Required prop for context C)
                                            //ethereum={ethereum}

                                            // optional
                                            members={false}
                                        />
                       </Container>

                    );
                  }} />
                  <Route path={"/loginNoWeb3"} render={() => {
                    return(
                      <Container fluid={false}>
                        <center style={{paddingTop: '50px'}}>
                           <p>Use <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a> or login with <a href="#auth_login" onClick={this.login}>authereum</a></p>
                        </center>
                      </Container>
                    )
                  }} />
                  <Route path={"/login"} render={() => {
                    if(!this.state.hasWeb3){
                      return(
                        <Redirect to={"/loginNoWeb3"} />
                      );
                    }

                    return(
                      <Container fluid={false}>
                        <Row style={{paddingTop: '50px'}}>
                            <Col lg={3}>
                              <Button variant="primary" onClick={this.login}>Login with injected web3</Button>
                            </Col>
                        </Row>
                      </Container>
                    )
                  }} />
                  <Route path={"/logout"} render={() => {
                    if(!this.state.space){
                      return(
                        <Redirect to={"/home"} />
                      );
                    }
                    return(
                      this.logout()
                    );
                  }}/>

                  <Route render={() => {
                    return(
                      <Redirect to={"/home"} />
                    );
                  }} />
            </Switch>

          </div>
        </Router>
        {
          this.chatBox()

        }
        <Container fluid={false}>
          <Footer style={{maeginTop: '20px'}}/>
        </Container>
      </div>
    );


  }
}

export default App;
