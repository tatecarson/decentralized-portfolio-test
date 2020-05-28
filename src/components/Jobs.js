import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';

import {
  Button,
  Form,
  Card,
  CardBody,
  Label,
  FormGroup,
  TabContent,
  TabPane,
  Container,
  Row,
  Col,
  Spinner,
  Input,
  NavItem,
  NavLink,
  Nav
} from 'reactstrap';
//import * as Box from '3box';
import {Link} from 'react-router-dom';

import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';
import UserPage from './UserPage.js';
import classnames from "classnames";

const Box = require('3box');


const Config = require('../config.js');
const AppName = Config.AppName
const jobsThread = Config.jobsThread;
const admin = Config.admin



class Jobs extends Component {
  state = {
    posts: null,
    box: null,
    coinbase: null,
    tabs: 'Jobs'
  }

  constructor(props){
    super(props);
    this.renderUserPage = this.renderUserPage.bind(this);
    this.filterJobs = this.filterJobs.bind(this);
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }

  componentDidMount = async () => {

    await this.setState({
      box: this.props.box,
      coinbase: this.props.coinbase,
      space: this.props.space
    });

    let posts
    if(!this.state.space){
      posts = await Box.getThread(AppName, jobsThread, admin,false)
      this.setState({
        posts:posts
      });
      return
    }
    //await this.state.space.syncDone;
    const thread = await this.state.space.joinThread(jobsThread,{firstModerator:admin,members: false});
    await this.setState({
      thread: thread
    })
    posts = await this.state.thread.getPosts();

    await this.setState({posts});

    this.state.thread.onUpdate(async()=> {
       const posts = await this.state.thread.getPosts();
       this.setState({posts});
     });
    return;


  };



  renderUserPage = async(profile) => {
    const removed = ReactDOM.unmountComponentAtNode(document.getElementById("userPage"))

    console.log(profile);

    ReactDOM.render(
      <UserPage box={this.state.box} coinbase={this.state.coinbase} profile={profile} />,
      document.getElementById('userPage')
    );

    return
  };

  filterJobs = async function(){
    try{
      if(!$("#input_filter").val().replace(/\s/g, '')){
        $(".div_job").show();
        return
      }
      const values = $("#input_filter").val().replace(/\s/g, '').toLowerCase().split(',');

      $(".div_job").hide();
      console.log(values)
      const posts = this.state.posts;
      const filteredPosts = [];
      for(var i=posts.length-1;i>=0;i--){
        const post = posts[i];
        console.log(post)
        const techs = post.message.techs;
        const allTrue = [];
        if(techs){
          const treatedTechs = techs.toLowerCase().replace(/\s/g, '').split(',');
          console.log(treatedTechs)
          for(const value of values){
            if(treatedTechs.includes(value)){
                allTrue.push(true);
            } else {
                allTrue.push(false)
            }

          }
        }
        if(allTrue.length>0){
          const isFiltered = allTrue.every(function(isTrue){
              return isTrue == true
          });
          console.log(isFiltered)
          if(isFiltered){
            filteredPosts.push(post.postId);
          }

        }
      }
      console.log(filteredPosts);
      if(filteredPosts.length>0){
        for(const filteredPost of filteredPosts){
            $(".div_job.div_"+filteredPost).show();
        }
      }


    } catch(err){
      console.log(err)
      $(".div_job").show();
    }


    return
  };
  addItem = async function(){
    const profile = await this.state.space.public.all();
    const  item = {
        from: profile,
        name: $("#item_name").val(),
        description: $("#item_description").val(),
        techs: $("#item_techs").val()
    }
    await this.state.thread.post(item);
    alert('Item saved');
    return;
  };
  removeItem = async function(postId){
    try{
      await this.state.thread.deletePost(postId);
      alert("removed");
    } catch(err){
      alert(err)
    }

  };
  toggleNavs = (e,tab) => {
    e.preventDefault();
    this.setState({
      tabs: tab
    });
  };
  render(){
    const that = this;
    console.log(this.state)
    if(!this.state.posts){
      return(
        <center>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
          <p>Loading ...</p>
        </center>
      );
    }
    let jobs_offer =
      <div>
        No Job offers
      </div>
    if(this.state.posts.length > 0){
      jobs_offer =
        <div>
          <Row>
            <h4>Jobs offers</h4>
          </Row>
          <Row>
            <FormGroup>
              <Label>Techs</Label>
              <Input className="form-control-alternative" type="text" placeholder="Techs" id='input_filter' onChange={this.filterJobs}/>
            </FormGroup>
          </Row>
          <Row>

              {
                this.state.posts.map(function(post){
                  const postId = post.postId;
                  const job = post.message;
                  const from = job.from;
                  let div_job = <div></div>
                  if(job.name && job.description){
                    div_job = <div>
                                          <p><small>Job description</small></p>
                                          <p>Name: {job.name}</p>
                                          <p>Description: {job.description}</p>
                                          <p>Techs: {job.techs}</p>
                                        </div>
                  }
                  return(
                        <Col className={"div_job div_"+postId}
                              lg={4}
                              style={{
                                display:'flex',
                                flexDirection:'column',
                                justifyContent:'space-between',
                                paddingBottom: '100px'
                              }}>
                          <div>
                            <ProfileHover
                              address={from.address}
                              orientation="bottom"
                              noCoverImg
                            />
                          </div>
                          <Col lg={12}>
                            {div_job}
                            <Link to={"/user/"+from.address} style={{all: 'unset'}}>
                              <Button variant="primary">Contact</Button>
                            </Link>
                          </Col>
                        </Col>
                  )
                })
              }
          </Row>
        </div>

    }

    if(!this.state.box){
      return(jobs_offer)
    }
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
                aria-selected={this.state.tabs === 'Jobs'}
                className={classnames("mb-sm-6 mb-md-0", {
                  active: this.state.tabs === 'Jobs'
                })}
                onClick={e => this.toggleNavs(e, 'Jobs')}
                href="#Jobs"
                role="tab"
              >
                <i className="ni ni-cloud-upload-96 mr-2" />
                Jobs
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                aria-selected={this.state.tabs === 'AddJob'}
                className={classnames("mb-sm-6 mb-md-0", {
                  active: this.state.tabs === 'AddJob'
                })}
                onClick={e => this.toggleNavs(e,'AddJob')}
                href="#AddJob"
                role="tab"
              >
                <i className="ni ni-bell-55 mr-2" />
                Add job
              </NavLink>
            </NavItem>
          </Nav>
        </div>
        <Card className="shadow">
          <CardBody>
            <TabContent activeTab={this.state.tabs}>
              <TabPane tabId="Jobs">
                {jobs_offer}
              </TabPane>

              <TabPane tabId="AddJob">
                <div>
                  <FormGroup>
                      <Label>Name</Label>
                      <Input className="form-control-alternative" type="text" placeholder="Name" id='item_name'/>
                  </FormGroup>
                  <FormGroup>
                      <Label>Description</Label>
                      <Input className="form-control-alternative" type="text" placeholder="Description" id='item_description'/>
                  </FormGroup>
                  <FormGroup>
                      <Label>Techs</Label>
                      <Input className="form-control-alternative" type="text" placeholder="Techs" id='item_techs'/>
                  </FormGroup>
                  <Button onClick={this.addItem} variant="primary">Add item</Button>
                  <hr/>
                  <h4>Jobs posted by you</h4>
                  {
                    this.state.posts.map(function(post){
                      const postId = post.postId;
                      const job = post.message;
                      const from = job.from;
                      if(from.address==that.state.coinbase){
                        return(
                          <div>
                            <p><small>Job description</small></p>
                            <p>Name: {job.name}</p>
                            <p>Description: {job.description}</p>
                            <p>Techs: {job.techs}</p>
                            <Button onClick={()=>{that.removeItem(postId)}}>Remove</Button>
                            <hr/>
                          </div>
                        )
                      }
                    })
                  }
                </div>
              </TabPane>

            </TabContent>
          </CardBody>
        </Card>




      </div>
    )
  }
}

export default Jobs;
