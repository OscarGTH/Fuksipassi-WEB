import RegisterForm from "./RegisterDialog.js";
import CollectionForm from "./CollectionCreation.js";
import React from "react";

import {TextField,
 Button, Paper, Typography} from "@material-ui/core/";

// Component to display login
class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: " ",
      password: "",
      showUserReg: false,
      showAdminReg: false,
      message: ""
    };
    this.handleRegister = this.handleRegister.bind(this);
  }
  componentDidMount(){
    // Add event listener to listen for enter key presses.
    window.addEventListener("keydown", this.handleKeypress)
  }
  componentWillUnmount(){
    // Removing event listener when unmounting.
    window.removeEventListener("keydown",this.handleKeypress)
  }
  // Handles Enter key press and logs the user in.
  handleKeypress = (e) =>{
    if(e.keyCode == 13 && this.state.email != "" && this.state.password != ""){
      this.login()
    }
  }
  // Calls parent component method to when the user has logged in.
  auth = (user, token) => {
    this.props.onAuthenticate(user, token);
  };

  // Logs the user in.
  login = event => {
    // Create an user object
    var user = {
      email: this.state.email,
      password: this.state.password
    };
    // Send ajax call to server with username and password.
    fetch("http://localhost:3000/api/login", {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(user)
    }).then(res => {
      res.json().then(body => {
        if (res.status === 200) {
          this.auth(body.user, body.token);
        } else {
          this.setState({
            message: body.message
          });
        }
      });
    });
  };
  // Handle text field changes
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };
  // Called when registration is done. Update state of message and close registration tab.
  handleRegister = message => {
    this.setState({
      message: message,
      showUserReg: false,
      showAdminReg: false
    });
  };
  // Handles the opening and closing of registration tab.
  toggleUserRegister = event => {
    this.setState({
      showUserReg: !this.state.showUserReg
    });
  };
  // Handles the opening and closing of registration tab.
  toggleAdminRegister = event => {
    this.setState({
      showAdminReg: !this.state.showAdminReg
    });
  };
  render() {
    return (
      <Paper style={{width: 350, padding: 20}}>
      <div>
        <h1> Fuksipassi </h1>
        <h3> Sign in </h3>
        <Typography>{this.state.message}</Typography>
        <div>
          <TextField
            label="Email"
            style={{width: 300}}
            type="email"
            autoComplete="email"
            variant="outlined"
            margin="normal"
            value={this.state.email}
            onChange={this.handleChange("email")}
          />
        </div>
        <TextField
          label="Password"
          style={{width: 300, justifyContent: "center"}}
          type="password"
          margin="normal"
          variant="outlined"
          value={this.state.password}
          onChange={this.handleChange("password")}
        />

        <div>
          <Button onClick={this.login} style={{ backgroundColor: "Lavender" }} variant="contained">
            Login
          </Button>
        </div>
        <div>
          <div> 
            <p
              id="signup"
              onClick={this.toggleUserRegister}
              style={{ color: "blue" }}
            >
             Create an account?
            </p>
            {this.state.showUserReg && (
              <RegisterForm onClose={this.handleRegister} />
            )}
          </div>
          <div>
            <p
              id="signup"
              onClick={this.toggleAdminRegister}
              style={{ color: "blue" }}
            >
              Create an area?
            </p>
            {this.state.showAdminReg && (
              <CollectionForm onClose={this.handleRegister} />
            )}
          </div>
        </div>
      </div>
      </Paper>
    );
  }
}
export default LoginForm;
