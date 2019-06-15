import React from "react";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import Grid from "@material-ui/core/Grid"
import LoginForm from "./Login.js"
import ChallengeList from "./ChallengeList.js"

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      // Value to tell if the user has logged in or not.
      auth: false,
      // Email of the user that is logged in.
      user: "",
      // JSON web token
      token: ""
    };
    this.setAuthenticate = this.setAuthenticate.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }
  // Method that is called after login. Sets token and other important information to state.
  // Toggles MainMenu by setting auth => true.
  setAuthenticate = (auth_user, token) => {
    // Check that the user is not guest.
    console.log(auth_user)
      this.setState({
        user: auth_user,
        auth: true,
        token: token
      });
    }
  
  // Function to logout.
  handleLogout = () => {
    // If role is not unregistered user, log out. Otherwise just set auth to false.
    if (this.state.user.role !== 2) {
      fetch("http://localhost:3000/logout", {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-type": "application/json",
          Authorization: "Bearer " + this.state.token
        },
        cache: "no-cache"
      }).then(
        this.setState({
          token: null,
          auth: false
        })
      );
    } else {
      this.setState({
        auth: false
      });
    }
  };

  render() {
    return (
      <div className="App">
        <MuiThemeProvider>
          {this.state.auth ? (
            
              <ChallengeList
                user={this.state.user}
                token={this.state.token}
                onLogout={this.handleLogout}
              />
           
          ) : (
            <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: "100vh" }}
          >
            <Grid item xs={3}>
              <LoginForm onAuthenticate={this.setAuthenticate} />
            </Grid>
          </Grid>
          )}
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
