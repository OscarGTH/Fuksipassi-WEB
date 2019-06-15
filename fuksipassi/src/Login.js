  // Component to display login
  class LoginForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        email: " ",
        password: "",
        showRegister: false,
        message: ""
      };
      this.handleRegister = this.handleRegister.bind(this);
    }
    // Calls parent component method to when the user has logged in.
    auth = (status, user, token) => {
      this.props.onAuthenticate(status, user, token);
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
          if (res.status == 200) {
            this.auth(res.status, body.message, body.token);
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
    handleRegister = (email, message) => {
      this.setState({
        message: message,
        showRegister: false
      });
    };
    // Handles the opening and closing of registration tab.
    toggleRegister = event => {
      this.setState({
        showRegister: !this.state.showRegister
      });
    };
    // Calls the parent component method to login, but with incomplete information.
    handleGuestlogin = () => {
      var user = { email: "Guest", role: 2 };
      this.props.onAuthenticate(undefined, user, undefined);
    };

    render() {
      return (
        <MuiThemeProvider>
          <Paper className="loginform">
            <h1> Movie club </h1>
            <h3> Sign in </h3>
            <div>{this.state.message}</div>
            <div>
              <TextField
                label="Email"
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
              type="password"
              margin="normal"
              variant="outlined"
              value={this.state.password}
              onChange={this.handleChange("password")}
            />

            <div className="buttonDiv">
              <Button
                onClick={this.login}
                style={{ backgroundColor: "Lavender" }}
              >
                Login
              </Button>
            </div>
            <div className="buttonDiv">
              <Button
                onClick={this.handleGuestlogin}
                style={{ backgroundColor: "Lavender" }}
              >
                Continue as guest
              </Button>
              <div>
                <p>
                  Create an account?
                  <a id="signup" onClick={this.toggleRegister}>
                    Sign up
                  </a>
                </p>
                {this.state.showRegister && (
                  <RegisterForm onClose={this.handleRegister} />
                )}
              </div>
            </div>
          </Paper>
        </MuiThemeProvider>
      );
    }
  }