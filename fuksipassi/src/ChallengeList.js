import React from "react";
import ExpandableCard from "./Card.js";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import CreationDialog from "./ChallengeCreationDialog.js";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
const styles = theme => ({
  appbar: {
    color: "#ffffff"
  }
});
class ChallengeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Color of the tabs and fab
      barColor: this.props.color,
      // Current user
      user: this.props.user,
      // Contains challenges that haven't been completed
      undoneChall: [],
      // Contains  challenges that have been completed and verified by admin
      doneChall: [],
      // Contains all pending challenges for the area (Admin view only)
      pendingChall: [],
      // Contains user specific challenges which he has completed but not yet gotten verified
      unverifiedChall: [],
      url: "http://localhost:3000/api/",
      tabValue: 0,
      showCreatDialog: false,
      message: "",
      mounted: false,
      sortingType: this.props.sortingType
    };
  }
  componentDidUpdate(prevProps) {
    // Check if color has been updated in props
    if (prevProps.color !== this.props.color) {
      this.setState({ barColor: this.props.color });
      //Check if sorting type has been changed.
    } else if (prevProps.sortingType !== this.props.sortingType) {
      this.setState({ sortingType: this.props.sortingType });
    }
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleHotkey);
    this.setState({
      mounted: false
    });
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleHotkey);
    this.setState({
      mounted: true
    });
    this.getChallenges();
  }

  handleHotkey = e => {
    // If left arrow key is pressed, decrease tab value by one.
    if (e.keyCode == 37) {
      var tabVal = this.state.tabValue;
      if (tabVal > 0) {
        tabVal--;
      }
      this.setState({ tabValue: tabVal });
      //If right arrow key is pressed, increase tab value by one.
    } else if (e.keyCode == 39) {
      var tabVal = this.state.tabValue;
      if (
        (tabVal < 2 && this.state.user.role == 0) ||
        (tabVal < 1 && this.state.user.role)
      ) {
        tabVal++;
      }
      this.setState({ tabValue: tabVal });
    }
  };

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
          if (this.state.mounted && typeof body.data !== "undefined") {
            // Sort challenges into the given order
            var challenges = this.sortByName(this.state.sortingType, body.data);
            this.setState({
              doneChall: challenges
            });
          }
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
          if (this.state.mounted && typeof body.data !== "undefined") {
            // Sort challenges into the given order
            var challenges = this.sortByName(this.state.sortingType, body.data);
            this.setState({
              unverifiedChall: challenges
            });
          }
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
          // Check if component is mounted and if body is not undefined
          if (this.state.mounted && typeof body.data !== "undefined") {
            // Sort challenges into the given order
            
            this.setState({
              pendingChall: body.data
            });
          }
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
        // Check if component is mounted and if body is not undefined
        if (this.state.mounted && typeof body.data !== "undefined") {
          // Sort challenges into the given order
          var challenges = this.sortByName(this.state.sortingType, body.data);
          this.setState({
            undoneChall: challenges
          });
        }
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

  handleVerification = (userId, challengeId, name) => {
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

  // Sorts the challenges by their name in alphabetical order.
  sortByName = (type, challenges) => {
    // Copy the array from state.
    let sorted = challenges.slice();
    if (type === 1) {
      // Sort into ascending order.
      sorted.sort((a, b) => {
        return ("" + a.title).localeCompare(b.title);
      });
    } else {
      // Sort into descending order.
      sorted.sort((a, b) => {
        return ("" + b.title).localeCompare(a.title);
      });
    }
    return sorted;
  };
  // Returns the cards for challenges that are done.
  doneContent() {
    return this.state.doneChall.map(challenge => (
      <li
        key={challenge[0].image.date}
        style={{ margin: "30px", listStyleType: "none" }}
      >
        <div style={{ display: " flex", justifyContent: "center" }}>
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
        <div style={{ display: " flex", justifyContent: "center" }}>
          <ExpandableCard
            challenge={challenge[0]}
            type="1"
            userId={this.state.user.userId}
            onDelete={this.handleEntryDeletion}
          />
        </div>
      </li>
    ));
  }
  // Returns the cards for challenges that are pending.
  pendingContent() {
    if (
      typeof this.state.pendingChall !== "undefined" &&
      this.state.pendingChall.length > 0
    ) {
      return this.state.pendingChall.map(challenge => (
        <li
          key={challenge[0]._id}
          style={{ margin: "30px", listStyleType: "none" }}
        >
          <div style={{ display: " flex", justifyContent: "center" }}>
            <ExpandableCard
              challenge={challenge[0]}
              onDelete={this.handleEntryDeletion}
              onVerify={this.handleVerification}
              type="2"
            />
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
          <div style={{ display: " flex", justifyContent: "center" }}>
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
