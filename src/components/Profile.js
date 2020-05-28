import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import {
  Button,
  Card,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  FormGroup,
  Input,
  Label,
  TabContent,
  TabPane,
  Container,
  Row,
  Col,
  Spinner
} from 'reactstrap';
//import getWeb3 from "./components/getWeb3.js";
//import * as Box from '3box';
import {Link} from 'react-router-dom';
import EditProfile from '3box-profile-edit-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';
import UserPage from './UserPage.js';
import classnames from "classnames";
const Box = require('3box');

const Config = require('../config.js');
const AppName = Config.AppName
const usersRegistered = Config.usersRegistered
const admin = Config.admin


class Profile extends Component {
  state = {
    box: null,
    space: null,
    coinbase: null,
    web3:null,
    did : null,
    linkedAddrs: [],
    threadContacts: null,
    threadViews: null,
    tabs: "Profile",
    fields: [
      { // for a field with a text input
        inputType: 'text',
        key: 'techs', // the key used to save the value
        field: 'Techs' // how to display the key in the UI
      },
      { // for a field with a text input
        inputType: 'text',
        key: 'gitcoin', // the key used to save the value
        field: 'Gitcoin' // how to display the key in the UI
      },
      { // for a field with a text input
        inputType: 'text',
        key: 'pinterest', // the key used to save the value
        field: 'Pinterest' // how to display the key in the UI
      },
      { // for a field with a text input
        inputType: 'text',
        key: 'instagram', // the key used to save the value
        field: 'Instagram' // how to display the key in the UI
      }
    ]
  }
  constructor(props){
    super(props)
    this.profileSaved = this.profileSaved.bind(this);

    this.getContacts = this.getContacts.bind(this);
    this.getViews = this.getViews.bind(this);

    this.didAddAddr = this.didAddAddr.bind(this);
    this.removeLinkedAddr = this.removeLinkedAddr.bind(this);
  }

  componentDidMount = async function(){
    await this.setState({
      box: this.props.box,
      space: this.props.space,
      did: this.props.box.DID,
      coinbase: this.props.coinbase,
      web3: this.props.web3
    });
    console.log(this.state)
    await this.state.space.syncDone;
    const linkedAddrs = await this.state.box.listAddressLinks();
    console.log(linkedAddrs)
    await this.setState({
      linkedAddrs: linkedAddrs
    })
    await this.getContacts();
    await this.getViews();
    await this.setState({
      loaded: true
    });
    return;
  }

  getContacts = async function(){
    const coinbase = this.state.coinbase;
    const threadContacts = await this.state.space.joinThread("contactsAdded_"+coinbase,{firstModerator:coinbase})
    await this.setState({
      threadContacts: threadContacts
    })
    const contacts = await this.state.threadContacts.getPosts();
    console.log(contacts)
    this.setState({contacts});
    this.state.threadContacts.onUpdate(async () => {
       const contacts = await this.state.threadContacts.getPosts();
       this.setState({contacts});
    });
    return;
  }

  getViews = async function(){

    const coinbase = this.state.coinbase
    console.log("contacts_"+coinbase)
    const threadViews = await this.state.space.joinThread("contacts_"+coinbase,{firstModerator:coinbase});
    await this.setState({
      threadViews: threadViews
    })
    const views = await threadViews.getPosts();
    console.log(views)
    this.setState({views});
    this.state.threadViews.onUpdate(async()=> {
       const views = await this.state.threadViews.getPosts();
       this.setState({views});
    });
    return;
  }

  profileSaved = async function() {
    await this.props.space.syncDone;
    const profile = await this.state.space.public.all();
    console.log(profile)
    const thread = await this.state.space.joinThread(usersRegistered,{firstModerator:admin});
    let oldPostId = await this.state.space.private.get('registration');
    if(oldPostId){
      await thread.deletePost(oldPostId);
    }
    const postProfile = {
      name: profile.name,
      emoji: profile.emoji,
      description: profile.description,
      techs: profile.techs,
      address: profile.address ,
      pinterest: profile.pinterest,
      github: profile.github,
      instagram: profile.instagram
    }
    const postId = await thread.post(postProfile);
    await this.state.space.private.set('registration',postId);
    alert("saved");
  };


  didAddAddr = async function(){
    const addr = $("#wallet_addr").val();
    if(!(await this.state.box.isAddressLinked({addres:addr}))){
      await this.state.box.linkAddress(addr);
      await this.state.syncDone;
      const linkedAddrs = await this.state.box.listAddressLinks();
      await this.setState({
        linkedAddrs: linkedAddrs
      })
      alert("Address linked to did");
    } else {
      alert("Address already linked to did");
    }

  };

  removeLinkedAddr = async function(addr){
    if(addr == this.state.coinbase){
      alert(`Cant't remove own address`);
      return;
    }
    if(this.state.box.isAddressLinked(addr)){
      await this.state.box.box.removeAddressLink(addr);
      alert('Address removed from did');
      return;
    }

  }

  toggleNavs = (e,tab) => {
    e.preventDefault();
    this.setState({
      tabs: tab
    });
  };


  render() {
    if(!this.state.loaded){
      return(
        <center style={{paddingTop:'40px'}}>
          <Spinner color="primary" />
          <p>Loading ...</p>
        </center>
      )
    }
    const that = this;
    return(

      <div>
        <div className="nav-wrapper">
          <Nav
            className="nav-fill flex-column flex-md-row"
            id="tabs-icons-text"
            pills
            role="tablist"
          >
            <NavItem>
              <NavLink
                aria-selected={this.state.tabs === 'Profile'}
                className={classnames("mb-sm-3 mb-md-0", {
                  active: this.state.tabs === 'Profile'
                })}
                onClick={e => this.toggleNavs(e, 'Profile')}
                href="#Profile"
                role="tab"
              >
                <i className="ni ni-cloud-upload-96 mr-2" />
                Profile
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                aria-selected={this.state.tabs === 'Identity'}
                className={classnames("mb-sm-3 mb-md-0", {
                  active: this.state.tabs === 'Identity'
                })}
                onClick={e => this.toggleNavs(e, 'Identity')}
                href="#Identity"
                role="tab"
              >
                <i className="ni ni-cloud-upload-96 mr-2" />
                Identity
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                aria-selected={this.state.tabs === 'Views'}
                className={classnames("mb-sm-3 mb-md-0", {
                  active: this.state.tabs === 'Views'
                })}
                onClick={e => this.toggleNavs(e,'Views')}
                href="#Views"
                role="tab"
              >
                <i className="ni ni-bell-55 mr-2" />
                Views
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                aria-selected={this.state.tabs === 'Contacts'}
                className={classnames("mb-sm-3 mb-md-0", {
                  active: this.state.tabs === 'Contacts'
                })}
                onClick={e => this.toggleNavs(e,'Contacts')}
                href="#Contacts"
                role="tab"
              >
                <i className="ni ni-calendar-grid-58 mr-2" />
                Contacts
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                aria-selected={this.state.tabs === 'Comments'}
                className={classnames("mb-sm-3 mb-md-0", {
                  active: this.state.tabs === 'Comments'
                })}
                onClick={e => this.toggleNavs(e,'Comments')}
                href="#Comments"
                role="tab"
              >
                <i className="ni ni-calendar-grid-58 mr-2" />
                Comments
              </NavLink>
            </NavItem>
          </Nav>
        </div>
        <Card className="shadow">
          <CardBody>
            <TabContent activeTab={this.state.tabs}>
              <TabPane tabId="Profile">
                <EditProfile
                        // required
                        box={this.state.box}
                        space={this.state.space}
                        currentUserAddr={this.state.coinbase}

                        // optional
                        customFields={this.state.fields}
                        redirectFn={this.profileSaved}
                    />
              </TabPane>
              <TabPane tabId="Identity">
                <h4>Your decentralized identity</h4>
                <p>{this.state.did}</p>
                <h5>Link wallet</h5>
                <FormGroup>
                    <Label>Address</Label>
                    <Input className="form-control-alternative" type="text" placeholder="Address" id='wallet_addr'/>
                </FormGroup>
                <Button onClick={this.didAddAddr}>Add</Button>
                <h5>Wallet addresses linked</h5>
                {
                  this.state.linkedAddrs.map(function(item){
                    const addr = item.address;
                    let button = <Button variant="danger" onClick={()=>that.removeLinkedAddr(addr)}>Remove</Button>
                    if(addr == that.state.coinbase){
                      button = <p></p>
                    }
                    return(
                      <Row>
                        <Col lg={8}>
                          <p>{addr}</p>
                        </Col>
                        <Col lg={4}>
                          {button}
                        </Col>
                      </Row>
                    );
                  })
                }
              </TabPane>
              <TabPane tabId="Views">
                <Row>

                    {
                      this.state.views.map(function(post){
                        const addr = post.message
                        return(
                          <Col lg={4}
                               style={{
                                 display:'flex',
                                 flexDirection:'column',
                                 justifyContent:'space-between',
                                 paddingBottom: '100px'
                               }}>
                              <div>
                                  <ProfileHover
                                    address={addr}
                                    orientation="bottom"
                                    noCoverImg
                                  />
                              </div>
                              <div>
                                <Link to={"/user/"+addr} style={{all: 'unset'}}>
                                  <Button variant="primary">Portfolio</Button>
                                </Link>
                              </div>
                          </Col>
                        );
                      })
                    }
                </Row>
              </TabPane>
              <TabPane tabId="Contacts">
                <Row>
                  {/*<Col lg={4} style={{height: '500px',overflowY:'scroll'}}>*/}
                    {
                      this.state.contacts.map(function(post){
                        const addr = post.message
                        console.log(addr);
                        return(
                          <Col lg={4}
                               style={{
                                 display:'flex',
                                 flexDirection:'column',
                                 justifyContent:'space-between',
                                 paddingBottom: '100px'
                               }}>
                              <div>
                                  <ProfileHover
                                    address={addr}
                                    orientation="bottom"
                                    noCoverImg
                                  />
                              </div>
                              <div>
                                <Link to={"/user/"+addr} style={{all: 'unset'}}>
                                  <Button variant="primary">Portfolio</Button>
                                </Link>
                              </div>
                          </Col>
                        )
                        /*return(
                          <Row>
                            <Col lg={8} >
                              <ProfileHover
                                address={addr}
                                orientation="bottom"
                                noCoverImg
                              />
                            </Col>
                            <Col lg={4}>
                              <Link to={"/user/"+addr} style={{all: 'unset'}}>
                                <Button variant="primary">Messages</Button>
                              </Link>
                            </Col>
                          </Row>
                        );*/
                      })
                    }
                  {/*</Col>*/}
                </Row>
              </TabPane>
              <TabPane tabId="Comments">
                <ThreeBoxComments
                                      // required
                                      spaceName={AppName}
                                      threadName={"job_offers_"+this.state.coinbase}
                                      adminEthAddr={this.state.coinbase}


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
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </div>

      );


  }
}



export default Profile;
