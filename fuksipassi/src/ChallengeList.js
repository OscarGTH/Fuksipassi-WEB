import React from "react";
import ExpandableCard from "./Card.js";
import LogoutIcon from "@material-ui/icons/Input";
import UndoIcon from "@material-ui/icons/Undo";
import RedoIcon from "@material-ui/icons/Redo";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import IconButton from "@material-ui/core/IconButton";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { Typography } from "@material-ui/core";
import CreationDialog from "./ChallengeCreationDialog.js";
class ChallengeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
      undoneChall: [],
      doneChall: [],
      url: "http://localhost:3000/api/",
      tabValue: 0,
      showCreatDialog: false,
      message: ""
    };
  }

  async componentDidMount() {
    await this.getChallenges();
  }

  // Fetches all challenges and sets them into state.
  getChallenges = () => {
    fetch(this.state.url + "challenge/done/" + this.state.user.userId, {
      method: "GET",
      headers: {
        "Content-type": "application/json"
      },
      cache: "no-cache"
    }).then(res => {
      res.json().then(body => {
        // Set the current user as the user that was returned as response.
        this.setState({
          doneChall: body.data
        });
      });
    });
    // Fetch challenges that haven't been completed.
    fetch(this.state.url + "challenge/undone/" + this.state.user.userId, {
      method: "GET",
      headers: {
        "Content-type": "application/json"
      },
      cache: "no-cache"
    }).then(res => {
      res.json().then(body => {
        // Set the current user as the user that was returned as response.
        this.setState({
          undoneChall: body.data
        });
      });
    });
    return true;
  };
  // Handles the clicks of the floating action button. Opens up the dialog.
  handleCreationClick = () => {
    if (this.state.showCreatDialog != false) {
      this.getChallenges();
    }
    this.setState({
      showCreatDialog: !this.state.showCreatDialog
    });
  };

  // Handles the logging out
  handleLogout = () => {
    this.props.onLogout();
  };
  // Deletes the selected challenge.
  handleDeletion = challengeId => {
    fetch(this.state.url + "challenge/" + challengeId, {
      method: "DELETE",
      cache: "no-cache"
    }).then(res => {
      if (res.ok) {
        this.getChallenges();
      }
    });
  };

  handleCompletion = (challengeId, image) => {
    var entry_object = {
      userId: this.state.user.userId,
      challengeId: challengeId,
      file: image[0]
    };
    var form_data = new FormData();
    for (var name in entry_object) {
      form_data.append(name, entry_object[name]);
    }

    fetch(this.state.url + "entry", {
      method: "POST",
      cache: "no-cache",
      body: form_data
    }).then(res => {
      if (res.ok) {
        this.getChallenges();
      }
    });
  };
  // Returns the cards for challenges that are done.
  doneContent() {
    return this.state.doneChall.map(challenge => (
      <li
        key={challenge[0].image.date}
        style={{ margin: "30px", listStyleType: "none" }}
      >
        <div>
          <ExpandableCard challenge={challenge[0]} type="1" />
        </div>
      </li>
    ));
  }
  // Returns the cards for challenges that are not done.
  undoneContent() {
    if (typeof this.state.undoneChall !== "undefined") {
      return this.state.undoneChall.map(challenge => (
        <li
          key={challenge.challengeId}
          style={{ margin: "30px", listStyleType: "none" }}
        >
          <div>
            <ExpandableCard
              challenge={challenge}
              type="0"
              onCompletion={this.handleCompletion}
              onDeletion={this.handleDeletion}
              admin={this.state.user.role}
            />
          </div>
        </li>
      ));
    }
  }
  // Handles the changing of tabs.
  handleTabChange = (event, newValue) => {
    this.setState({
      tabValue: newValue
    });
  };
  render() {
    const { tabValue } = this.state;
    return (
      <div>
        <AppBar position="static">
          <div style={{ display: "flex" }}>
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
        </AppBar>

        <AppBar position="static">
          <Tabs centered value={tabValue} onChange={this.handleTabChange}>
            <Tab label="Incompleted" />
            <Tab label="Completed" />
          </Tabs>
        </AppBar>
        {tabValue == 0 && this.undoneContent()}
        {tabValue == 1 && this.doneContent()}
        {this.state.user.role == 1 ? (
          <Fab
            color="primary"
            aria-label="Add"
            style={{ bottom: "5%", right: "5%", position: "absolute" }}
            onClick={this.handleCreationClick}
          >
            <AddIcon />
          </Fab>
        ):null}
        {this.state.showCreatDialog && (
          <CreationDialog onClose={this.handleCreationClick} />
        )}
      </div>
    );
  }
}
export default ChallengeList;
