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
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
const styles = theme => ({
  appbar: {
    color: "#000000"
  }
});
class ChallengeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      barColor: this.props.color,
      user: this.props.user,
      // Contains challenges that haven't been completed
      undoneChall: [],
      // Contains  challenges that have been completed and verified by admin
      doneChall: [],
      // Contains all pending challenges for the area (Admin view only)
      pendingChall:[],
      // Contains user specific challenges which he has completed but not yet gotten verified
      unverifiedChall: [],
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
    if (this.state.user.role == 0) {
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
      fetch(this.state.url + "challenge/pending/" + this.state.user.userId, {
        method: "GET",
        headers: {
          "Content-type": "application/json"
        },
        cache: "no-cache"
      }).then(res => {
        res.json().then(body => {
          // Set the current user as the user that was returned as response.
          this.setState({
            unverifiedChall: body.data
          });
        });
      });
    } else {
      // Fetch challenges that haven't been completed.
      fetch(this.state.url + "challenge/pending", {
        method: "GET",
        headers: {
          "Content-type": "application/json"
        },
        cache: "no-cache"
      }).then(res => {
        res.json().then(body => {
          // Set the current user as the user that was returned as response.
          this.setState({
            pendingChall: body.data
          });
        });
      });
    }

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

  handleVerification = (userId, challengeId) => {
    fetch(this.state.url + "challenge/verify/" + userId + "/" + challengeId, {
      method: "PATCH",
      cache: "no-cache"
    }).then(res => {
      if (res.ok) {
        this.getChallenges();
      }
    });
  };
  handleEntryDeletion = (userId, challengeId) => {
    fetch(this.state.url + "entry/" + userId + "/" + challengeId, {
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
          <ExpandableCard challenge={challenge[0]} type="3" />
        </div>
      </li>
    ));
  }
  // Returns the cards for challenges that are pending.
  unverifiedContent() {
    return this.state.unverifiedChall.map(challenge => (
      <li
        key={challenge[0].image.date}
        style={{ margin: "30px", listStyleType: "none" }}
      >
        <div>
          <ExpandableCard challenge={challenge[0]} type="1" userId={this.state.user.userId} onDelete={this.handleEntryDeletion}/>
        </div>
      </li>
    ));
  }
  // Returns the cards for challenges that are pending.
  pendingContent() {
    console.log(this.state.pendingChall[0])
    if (
      typeof this.state.pendingChall !== "undefined" &&
      this.state.pendingChall.length > 0
    ) {
      console.log("Meni läpi");

      return this.state.pendingChall.map(challenge => (
        <li
          key={challenge.date}
          style={{ margin: "30px", listStyleType: "none" }}
        >
          <div>
            <ExpandableCard challenge={challenge[0]} onDelete={this.handleEntryDeletion} onVerify={this.handleVerification} type="2" />
          </div>
        </li>
      ));
    }
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
    const { classes } = this.props;
    const { tabValue } = this.state;
    return (
      <div>
        <AppBar
          className={classes.appbar}
          style={{ backgroundColor: this.state.barColor }}
          position="static"
        >
          <Tabs
            TabIndicatorProps={{
              style: { backgroundColor: "#000", height: "3px" }
            }}
            centered
            value={tabValue}
            onChange={this.handleTabChange}
          >
            <Tab label="Incompleted" />

            <Tab label="Pending" />
            {this.state.user.role == 0 && <Tab label="Completed" />}
          </Tabs>
        </AppBar>
        {tabValue == 0 && this.undoneContent()}
        {this.state.user.role == 1 ? (
          <div>{tabValue == 1 && this.pendingContent()}</div>
        ) : (
          <div>
            {tabValue == 1 && this.unverifiedContent()}
            {tabValue == 2 && this.doneContent()}
          </div>
        )}

        {this.state.user.role == 1 ? (
          <Fab
            color="primary"
            aria-label="Add"
            style={{
              bottom: "5%",
              right: "5%",
              position: "absolute",
              backgroundColor: this.state.barColor
            }}
            onClick={this.handleCreationClick}
          >
            <AddIcon />
          </Fab>
        ) : null}
        {this.state.showCreatDialog && (
          <CreationDialog onClose={this.handleCreationClick} />
        )}
      </div>
    );
  }
}
ChallengeList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ChallengeList);
