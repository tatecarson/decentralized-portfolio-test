import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import {
  Button,
  Container,
  Row,
  Col,
  Spinner,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Label
} from 'reactstrap';//import getWeb3 from "./components/getWeb3.js";
//import * as Box from '3box';
import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';

const Box = require('3box');

const Config = require('../config.js');
const AppName = Config.AppName
const usersRegistered = Config.usersRegistered
const admin = Config.admin



class PrivateChat extends Component {
  state = {
    space: null,
    thread: null,
    posts: []
  }

  constructor(props){
    super(props);
    this.addMsg = this.addMsg.bind(this);
  }


  componentDidMount = async ()  => {
    const thread = await this.props.space.joinThreadByAddress(this.props.threadAddress);

    this.setState({
      thread: thread,
      space: this.props.space
    })
    await this.state.syncDone;
    const posts = await this.state.thread.getPosts();
    this.setState({posts});
    console.log(posts)
     await this.state.thread.onUpdate(async()=> {
       const posts = await this.state.thread.getPosts();
       this.setState({posts});
     });
  };
  addMsg = async function(){
    const msg = {
      from: this.props.coinbase,
      content: $("#input_msg").val()
    };
    await this.state.thread.post(msg);
    $("#input_msg").val("");
    $("#input_msg").html("");
    return;
  };



  fileUpload = function(){
    try{
      var file = $("#input_file")[0].files[0];
      var reader  = new FileReader();
      var fileName = file.name;
      var fileType = file.type;
      console.log(file)
      reader.onload = function(e) {
        // The file's text will be printed here
        console.log(e.target.result);
        $("#item_img").html(JSON.stringify({
          fileName: fileName,
          fileType: fileType,
          content: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    } catch(err){
      console.log(err)
      $("#item_img").html("");
    }
  }
  render(){
    const that = this;
    if(this.state.thread){
      return(
        <div>
                <h4>Messages</h4>
                <div style={{height: '300px',overflowY:'scroll'}}>
                  {
                    this.state.posts.map(function(post){
                      const msg = post.message;
                      const from = msg.from;
                      const content = msg.content;
                      return(
                        <div>
                          <Row>
                            <Col lg={4}>
                              <ProfileHover
                                      address={from}
                                      orientation="bottom"
                                      noCoverImg
                              />

                            </Col>
                            <Col lg={8}>
                              {content}
                            </Col>

                          </Row>
                        </div>
                      )

                    })
                  }
                </div>
                <div>
                  <FormGroup>
                    <InputGroup className="input-group-alternative mb-4">
                    <Label>Message</Label>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="ni ni-zoom-split-in" />
                        </InputGroupText>
                      </InputGroupAddon>

                      <Input
                        className="form-control-alternative"
                        placeholder="Message"
                        type="text"
                        id='input_msg'
                      />
                    </InputGroup>
                    <Button onClick={this.addMsg}>Send</Button>
                  </FormGroup>

                </div>
        </div>
      )
    }
    return(
      <center style={{paddingTop:'40px'}}>
        <Spinner color="primary" />
        <p>Loading ...</p>
      </center>
    )
  }

}

export default PrivateChat;
