import React,{Component} from 'react';

import {Link} from 'react-router-dom';
import {
  Button,
  Form,
  Table,
  Tabs,
  Tab,
  Container,
  Row,
  Col,
  Alert,
  Card,
  Modal,
  Collapse,
  UncontrolledCollapse,
  Nav,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink
} from 'reactstrap';
class Menu extends Component {
  state = {
    box: null,
    space: null,
    hasWeb3: null,
    isLoggedIn: null
  }

  constructor(props){
    super(props)
    this.setLoginItem = this.setLoginItem.bind(this);
    this.logout = this.logout.bind(this);
  }
  componentDidMount = function(){
    this.setState({
      box: this.props.box,
      space: this.props.space,
      hasWeb3: this.props.hasWeb3,
      doingLogin: this.props.doingLogin
    })
  }

  setLoginItem = function(){
    if(!this.state.hasWeb3){
      return(
        <Link to={"/loginNoWeb3"} >
          <NavLink>
            Login
          </NavLink>
        </Link>
      )
    }
    return(

      <Link to={"/login"}>
        <NavLink>
          Login
        </NavLink>
      </Link>
    )
  }
  logout = async function(){
    await this.state.box.logout();
    this.setState({
      box: null,
      space: null,
      hasWeb3: this.props.hasWeb3,
      isLoggedIn: null
    })
    return;
  }

  render(){
    
    return(
      <Navbar
        className="navbar-horizontal navbar-dark bg-primary mt-4"
        expand="lg"
      >
        <Container>
          <NavbarBrand href="#DecentralizedPortfolio">
              DecentralizedPortfolio
          </NavbarBrand>
          <button
            aria-controls="navbar-primary"
            aria-expanded={false}
            aria-label="Toggle navigation"
            className="navbar-toggler"
            data-target="#navbar-primary"
            data-toggle="collapse"
            id="navbar-primary"
            type="button"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <UncontrolledCollapse navbar toggler="#navbar-primary">
            <div className="navbar-collapse-header">
              <Row>
                <Col className="collapse-brand" xs="6">
                  <NavbarBrand href="#DecentralizedPortfolio">
                      DecentralizedPortfolio
                  </NavbarBrand>
                </Col>
                <Col className="collapse-close" xs="6">
                  <button
                    aria-controls="navbar-primary"
                    aria-expanded={false}
                    aria-label="Toggle navigation"
                    className="navbar-toggler"
                    data-target="#navbar-primary"
                    data-toggle="collapse"
                    id="navbar-primary"
                    type="button"
                  >
                    <span />
                    <span />
                  </button>
                </Col>
              </Row>
            </div>

            {
              (
                !this.state.box &&
                (
                  <Nav className="ml-lg-auto" navbar>
                    <NavItem>
                      <Link to={"/home"}>
                        <NavLink>
                          Home
                        </NavLink>
                      </Link>
                    </NavItem>
                    <NavItem>
                      <Link to={"/users"}>
                        <NavLink>
                          Users
                        </NavLink>
                      </Link>
                    </NavItem>
                    <NavItem>
                      <Link to={"/jobs"}>
                        <NavLink>
                          Jobs
                        </NavLink>
                      </Link>
                    </NavItem>
                    <NavItem>
                      <Link to={"/comments"}>
                        <NavLink>
                          Comments
                        </NavLink>
                      </Link>
                    </NavItem>
                    <NavItem>
                    {
                      this.setLoginItem()
                    }
                    </NavItem>
                  </Nav>
                )
              )
            }
            {
              (
                this.state.box &&
                (
                  <Nav className="ml-lg-auto" navbar>
                    <NavItem>
                       <Link to={"/home"}>
                         <NavLink>
                           Home
                         </NavLink>
                       </Link>
                     </NavItem>
                     <NavItem>
                       <Link to={"/profile"}>
                         <NavLink>
                           Profile
                         </NavLink>
                       </Link>
                     </NavItem>
                     <NavItem>
                       <Link to={"/portfolio"}>
                         <NavLink>
                           Portfolio
                         </NavLink>
                       </Link>
                     </NavItem>
                     <NavItem>
                       <Link to={"/users"}>
                         <NavLink>
                           Users
                         </NavLink>
                       </Link>
                     </NavItem>
                     <NavItem>
                       <Link to={"/jobs"}>
                         <NavLink>
                           Jobs
                         </NavLink>
                       </Link>
                     </NavItem>
                     <NavItem>
                       <Link to={"/comments"}>
                         <NavLink>
                           Comments
                         </NavLink>
                       </Link>
                     </NavItem>
                     <NavItem>
                         <Link to={"/logout"} onClick={this.logout}>
                           <NavLink>
                             Logout
                           </NavLink>
                         </Link>
                     </NavItem>
                  </Nav>

                )
              )
            }

          </UncontrolledCollapse>
        </Container>
      </Navbar>
    )
  }
}
export default Menu;
