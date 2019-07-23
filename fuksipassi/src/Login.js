import RegisterForm from "./RegisterDialog.js";
import CollectionForm from "./CollectionCreation.js";
import React from "react";

import { TextField, Button, Paper, Typography } from "@material-ui/core/";

// Component to display login
class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // User's email
      email: " ",
      // User's password
      password: "",
      // Toggle for user registration dialog
      showUserReg: false,
      // Toggle for adming registration dialog
      showAdminReg: false,
      // Shows a message to user, for example indicating a failure or success
      message: "",
      // Indicates which component if selected
      focus: 0
    };
    this.emailInput = React.createRef();
    this.passwordInput = React.createRef();
    this.loginInput = React.createRef();
    this.handleRegister = this.handleRegister.bind(this);
  }
  componentDidMount() {
    this.emailInput.current.focus();
    // Add event listener to listen for enter key presses.
    window.addEventListener("keydown", this.handleKeypress);
  }
  componentWillUnmount() {
    // Removing event listener when unmounting.
    window.removeEventListener("keydown", this.handleKeypress);
  }
  // Handles Enter key press and logs the user in.
  handleKeypress = e => {
    if (
      e.keyCode == 13 &&
      this.state.email != "" &&
      this.state.password != ""
    ) {
      this.login();
      // Happens when up arrow is pressed
    } else if (e.keyCode == 38) {
      // Check which element is focused and don't let the number go negative
      if (this.state.focus > 0) {
        this.setState({ focus: this.state.focus - 1 });
        this.focus(this.state.focus);
       
      }
      // Happens when down arrow is pressed
    } else if (e.keyCode == 40) {
      // Limits from going out of bounds
      if (this.state.focus < 2) {
        this.setState({ focus: this.state.focus + 1 });
        // Call focusing method
        this.focus(this.state.focus);
      }
    }
  };
  
  // Focuses element according to the given value
  focus = value => {
    // If value is 0, focus on email field
    if (value == 0) {
      this.emailInput.current.focus();
      // If value is 1, focus on password field
    } else if (value == 1) {
      this.passwordInput.current.focus();
      // Focus on login button
    } else {
      this.loginInput.current.focus();
    } 
  };
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
      <Paper style={{ width: 350, padding: 20 }}>
        <div>
          <h1> Fuksipassi </h1>
          <h3> Sign in </h3>
          <Typography>{this.state.message}</Typography>

          <div>
            <TextField
              inputRef={this.emailInput}
              label="Email"
              style={{ width: 300 }}
              type="email"
              autoComplete="email"
              variant="outlined"
              margin="normal"
              value={this.state.email}
              onChange={this.handleChange("email")}
            />
          </div>
          <TextField
            inputRef={this.passwordInput}
            label="Password"
            style={{ width: 300, justifyContent: "center" }}
            type="password"
            margin="normal"
            variant="outlined"
            value={this.state.password}
            onChange={this.handleChange("password")}
          />

          <div>
            <Button
              onClick={this.login}
              style={{ backgroundColor: "Lavender" }}
              variant="contained"
              buttonRef={this.loginInput}
            >
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
