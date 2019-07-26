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
import HelpIcon from "@material-ui/icons/Help";
import Drawer from "@material-ui/core/Drawer";
import MenuItem from "@material-ui/core/MenuItem";
import UserList from "./UserList";
import { Typography } from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ProfileDialog from "./ProfileDialog.js";
import IconButton from "@material-ui/core/IconButton";
import ChallengeList from "./ChallengeList.js";
import Tutorial from "./Tutorial.js";

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
      barColor: "#FFBB4C",
      // Color of the challenge card
      cardColor: "#FFFF88",
      // Previous color theme
      previousColor: "",
      //Boolean to toggle redo button
      redo: false,
      //Boolean to toggle undo button
      undo: false,
      // Toggle boolean for editing profile.
      editProfile: false,
      // Toggle boolean for viewing settings view.
      showSettings: false,
      // Toggle boolean for viewing settings view.
      showUsers: false,
      // Toggle for drawer opening
      openDrawer: false,
      // Toggle for opening help menu
      showHelp: false,
      // Sorting type for challenges
      sortingType: 1
    };
   
  }
  componentDidMount() {
    // Add a key listener
    window.addEventListener("keydown", this.handleHotkey);
    // Check local storage for saved color
    if (localStorage.getItem("color") !== null) {
      this.setState({
        barColor: localStorage.getItem("color")
      });
    }
    if (localStorage.getItem("cardColor") !== null) {
      this.setState({
        cardColor: localStorage.getItem("cardColor")
      });
    }
    // Check local storage for sorting type for challenges.
    if (localStorage.getItem("sortingType") !== null) {
      this.setState({
        sortingType: localStorage.getItem("sortingType")
      });
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
  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleHotkey);
  }

  // Handles the hotkey presses
  handleHotkey = e => {
    // On Home
    if (e.keyCode == 36) {
      this.handleProfile();
      // On End
    } else if (e.keyCode == 35) {
      this.handleLogout();
      // On Delete
    } else if (e.keyCode == 46 && this.state.user.role == 1) {
      this.handleUserList();
      //  On Insert
    } else if (e.keyCode == 45) {
      this.handleSettings();
    }
  };

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
  handleHelp = () => {
    this.setState({
      showHelp: !this.state.showHelp
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
  // Handles the undo button press
  handleUndo = () => {
    this.setState({
      previousColor: this.state.barColor,
      barColor: this.state.previousColor,
      undo: false,
      redo: true
    });
  };
  // Handles the redo button press
  handleRedo = () => {
    this.setState({
      previousColor: this.state.barColor,
      barColor: this.state.previousColor,
      redo: false,
      undo: true
    });
  };
  // Handles the theme color changing from settings view
  handleSettingsSave = (sorting,barColor,cardColor) => {
    let setUndo = false;
    // See if color was changed at all or if it was the same as it used to be. Only undo if it was changed.
    if (localStorage.getItem("color") != barColor && barColor != this.state.barColor) {
      setUndo = true;
    }
    if (localStorage.getItem("cardColor") != cardColor && cardColor != this.state.cardColor) {
      setUndo = true;
    }
    // Save color into local storage, so it doesn't get lost when refreshing page.
    localStorage.setItem("color", barColor);
    localStorage.setItem("cardColor", cardColor);
    localStorage.setItem("sortingType", sorting);
    this.setState({
      redo: false,
      undo: setUndo,
      previousColor: this.state.barColor,
      barColor: barColor,
      cardColor: cardColor,
      sortingType: sorting
    });
    this.handleSettings();
  };

  render() {
    return (
      <div className="App">
        
          {this.state.auth ? (
            <div>
              {this.state.showSettings ||
              this.state.showUsers ||
              this.state.showHelp ? (
                <div>
                  {this.state.showSettings && (
                    <div style={{ display: " flex", justifyContent: "center" }}>
                      <Settings
                        barColor={this.state.barColor}
                        cardColor={this.state.cardColor}
                        sorting={this.state.sortingType}
                        onClose={this.handleSettings}
                        onSave={this.handleSettingsSave}
                      />
                    </div>
                  )}
                  {this.state.showUsers && (
                    <div style={{ display: " flex", justifyContent: "center" }}>
                      <UserList
                        onClose={this.handleUserList}
                        token={this.state.token}
                        user={this.state.user}
                      />
                    </div>
                  )}
                  {this.state.showHelp && (
                    <div style={{ display: " flex", justifyContent: "center" }}>
                      <Tutorial onClose={this.handleHelp} />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <ToolBar
                    position="static"
                    style={{ backgroundColor: this.state.barColor }}
                  >
                    <Drawer
                      onClick={this.handleDrawerToggle}
                      width={300}
                      open={this.state.openDrawer}
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
                      <IconButton
                        disabled={!this.state.undo}
                        onClick={this.handleUndo}
                      >
                        <UndoIcon />
                      </IconButton>
                      <IconButton
                        disabled={!this.state.redo}
                        onClick={this.handleRedo}
                      >
                        <RedoIcon />
                      </IconButton>
                      <IconButton onClick={this.handleHelp}>
                        <HelpIcon/>
                      </IconButton>
                    </div>
                  </ToolBar>
                  <ChallengeList
                    sortingType={this.state.sortingType}
                    user={this.state.user}
                    token={this.state.token}
                    onLogout={this.handleLogout}
                    color={this.state.barColor}
                    cardColor={this.state.cardColor}
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
        
      </div>
    );
  }
}

export default App;
