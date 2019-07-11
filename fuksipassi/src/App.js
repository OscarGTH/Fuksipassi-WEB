import React from "react";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import Grid from "@material-ui/core/Grid";
import LoginForm from "./Login.js";
import ToolBar from "@material-ui/core/AppBar";
import Settings from "./Settings.js";
import LogoutIcon from "@material-ui/icons/Input";
import UndoIcon from "@material-ui/icons/Undo";
import RedoIcon from "@material-ui/icons/Redo";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import MenuItem from "@material-ui/core/MenuItem";
import UserList from "./UserList";
import { Typography } from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ProfileDialog from "./ProfileDialog.js";
import IconButton from "@material-ui/core/IconButton";
import ChallengeList from "./ChallengeList.js";


class App extends React.Component {
  constructor() {
    super();
    this.state = {
      // Value to tell if the user has logged in or not.
      auth: false,
      //  user that is logged in.
      user: "",
      // JSON web token
      token: "",
      // Color theme of the app bar
      barColor: "#7CB9E8",
      // Toggle boolean for editing profile.
      editProfile: false,
      // Toggle boolean for viewing settings view.
      showSettings: false,
      // Toggle boolean for viewing settings view.
      showUsers: false,
      // Toggle for drawer opening
      openDrawer: false
    };
    this.setAuthenticate = this.setAuthenticate.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }
  componentDidMount() {

    if(localStorage.getItem("color") !== null){
      this.setState({
        barColor: localStorage.getItem("color")
      })
    }
    // Check if the user has already logged in.
    if (localStorage.getItem("session") !== null) {
      var session_obj = JSON.parse(localStorage.getItem("session"));
      var login_time = new Date(session_obj.timestamp);
      var then = new Date(login_time.setMinutes(login_time.getMinutes() + 15));
      var now = new Date();

      if (now.getTime() < then.getTime()) {
        this.setState({
          auth: true,
          token: localStorage.getItem("token"),
          user: JSON.parse(localStorage.getItem("user"))
        });
      }
    }
  
  }

  // Method that is called after login. Sets token and other important information to state.
  // Toggles MainMenu by setting auth => true.
  setAuthenticate = (auth_user, token) => {
    // Check that the user is not guest.
    this.setState({
      user: auth_user,
      auth: true,
      token: token
    });
    // Set token and user into local storage.
    // Set timestamp to know when the data was saved into local storage.
    localStorage.setItem("user", JSON.stringify(auth_user));
    localStorage.setItem("token", token);
    var session_obj = { timestamp: new Date().getTime() };
    localStorage.setItem("session", JSON.stringify(session_obj));
  };

  // Function to logout.
  handleLogout = () => {
    fetch("http://localhost:3000/api/logout", {
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
        auth: false,
        editProfile: false
      })
    );

    localStorage.clear();
  };
  // Toggles the profile editing dialog.
  handleProfile = () => {
    this.setState({
      editProfile: !this.state.editProfile
    });
  };
  // Changes the email of the user to the updated email.
  handleEdit = email => {
    var updatedUser = this.state.user;
    updatedUser.email = email;
    this.setState({
      user: updatedUser
    });
  };
  // Toggles the drawer open and close.
  handleDrawerToggle = () => {
    this.setState({
      openDrawer: !this.state.openDrawer
    });
  };
  // Handles the toggle of settings menu
  handleSettings = () => {
    this.setState({
      showSettings: !this.state.showSettings
    });
  };
  // Handles the toggle of user list.
  handleUserList = () => {
    this.setState({
      showUsers: !this.state.showUsers
    });
  };
  // Handles the theme color changing from settings view
  handleColorChange = hex => {
    // Save color into local storage, so it doesn't get lost when refreshing page.
    localStorage.setItem("color", hex);
    this.setState({
      barColor: hex
    })
    this.handleSettings();
  };

  render() {
    return (
      <div className="App">
        <MuiThemeProvider>
          {this.state.auth ? (
            <div>
              {this.state.showSettings || this.state.showUsers ? (
                <div>
                  {this.state.showSettings && (
                    <Settings onClose={this.handleSettings} onSave={this.handleColorChange}/>
                  )}
                  {this.state.showUsers && (
                    <UserList onClose={this.handleUserList} token={this.state.token} user={this.state.user} />
                  )}
                </div>
              ) : (
                <div>
                  <ToolBar position="static" style={{backgroundColor: this.state.barColor}}>
                    <Drawer
                      onClick={this.handleDrawerToggle}
                      width={300}
                      open={this.state.openDrawer}
                      docked={false}
                    >
                      <MenuItem onClick={this.handleSettings}>
                        Settings
                      </MenuItem>
                      {this.state.user.role ? (
                        <MenuItem onClick={this.handleUserList}>
                          List of users
                        </MenuItem>
                      ) : null}
                    </Drawer>
                    <div style={{ display: "flex" }}>
                      <IconButton onClick={this.handleDrawerToggle}>
                        <MenuIcon />
                      </IconButton>
                      <Typography style={{ margin: 20 }}>
                        Logged in as {this.state.user.email}
                      </Typography>
                      <Typography style={{ margin: 20 }}>
                        Current area: <b> {this.state.user.area}</b>
                      </Typography>
                      <IconButton onClick={this.handleLogout}>
                        <LogoutIcon />
                      </IconButton>
                      <IconButton onClick={this.handleProfile}>
                        <AccountCircleIcon />
                      </IconButton>
                      <IconButton>
                        <RedoIcon />
                      </IconButton>
                      <IconButton>
                        <UndoIcon />
                      </IconButton>
                    </div>
                  </ToolBar>
                  <ChallengeList
                    user={this.state.user}
                    token={this.state.token}
                    onLogout={this.handleLogout}
                    color={this.state.barColor}
                  />
                  {this.state.editProfile && (
                    <ProfileDialog
                      targetUser={this.state.user}
                      currentUser={this.state.user}
                      token={this.state.token}
                      onClose={this.handleProfile}
                      onDelete={this.handleLogout}
                      onEdit={this.handleEdit}
                    />
                  )}
                </div>
              )}
            </div>
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
