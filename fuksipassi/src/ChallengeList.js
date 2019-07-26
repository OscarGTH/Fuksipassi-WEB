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
      // Authorization token for API calls
      token: this.props.token,
      // Contains challenges that haven't been completed
      undoneChall: [],
      // Contains  challenges that have been completed and verified by admin
      doneChall: [],
      // Contains all pending challenges for the area (Admin view only)
      pendingChall: [],
      // Contains user specific challenges which he has completed but not yet gotten verified
      unverifiedChall: [],
      // The url of the api
      url: "http://localhost:3000/api/",
      // Tab's current value
      tabValue: 0,
      // Toggle for challenge creation dialog
      showCreatDialog: false,
      // Message to display when something goes wrong or needs to be announced
      message: "",
      // Boolean to see if component has been mounted or not.
      mounted: false,
      // Tells which way challenges are sorted
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
    var tabVal = this.state.tabValue;
    if (e.keyCode == 37) {
      if (tabVal > 0) {
        tabVal--;
      }
      this.setState({ tabValue: tabVal });
      //If right arrow key is pressed, increase tab value by one.
    } else if (e.keyCode == 39) {
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
    // Variable to see if the user needs to be logged out (due to server not responding)
    var loggedOut = false;
    if (this.state.user.role == 0) {
      fetch(this.state.url + "challenge/done/" + this.state.user.userId, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: "Bearer " + this.state.token
        },
        cache: "no-cache"
      }).then(res => {
        res.json().then(body => {
          if (this.state.mounted && typeof body.data !== "undefined") {
            var array = [];
            // Move elements from two dimensional array to one dimensional
            for (var i = 0; i < body.data.length; i++) {
              array.push(body.data[i][0]);
            }
            // Sort challenges into the given order
            var challenges = this.sortByName(this.state.sortingType, array);
            this.setState({
              doneChall: challenges
            });
          }
        });
      });

      // Fetch challenges that are pending for only one user.
      fetch(this.state.url + "challenge/pending/" + this.state.user.userId, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: "Bearer " + this.state.token
        },
        cache: "no-cache"
      }).then(res => {
        res.json().then(body => {
          if (this.state.mounted && typeof body.data !== "undefined") {
            var array = new Array();
            // Move elements from two dimensional array to one dimensional
            for (var i = 0; i < body.data.length; i++) {
              array.push(body.data[i][0]);
            }
            // Sort challenges into the given order
            var challenges = this.sortByName(this.state.sortingType, array);
            this.setState({
              unverifiedChall: challenges
            });
          }
        });
      });
    } else {
      // Fetch all challenges that are not verified (Admin only)
      fetch(this.state.url + "challenge/pending", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: "Bearer " + this.state.token
        },
        cache: "no-cache"
      }).then(res => {
        res.json().then(body => {
          if (res.ok) {
            // Check if component is mounted and if body is not undefined
            if (this.state.mounted && typeof body.data !== "undefined") {
              var array = new Array();
              // Move elements from two dimensional array to one dimensional
              for (var i = 0; i < body.data.length; i++) {
                array.push(body.data[i][0]);
              }
              // Sort challenges into the given order
              var challenges = this.sortByName(this.state.sortingType, array);
              this.setState({
                pendingChall: challenges
              });
            }
          } else {
            if(!loggedOut){
              this.props.onLogout();
              loggedOut = true;
            }
          }
        });
      });
    }

    // Fetch challenges that haven't been completed.
    fetch(this.state.url + "challenge/undone/" + this.state.user.userId, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + this.state.token
      },
      cache: "no-cache"
    }).then(res => {
      res.json().then(body => {
        if (res.ok) {
          // Check if component is mounted and if body is not undefined
          if (this.state.mounted && typeof body.data !== "undefined") {
            // Sort challenges into the given order
            var challenges = this.sortByName(this.state.sortingType, body.data);
            this.setState({
              undoneChall: challenges
            });
          }
        } else {
          if(!loggedOut){
            this.props.onLogout();
            loggedOut = true;
          }
          
        }
      });
    });

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
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + this.state.token
      },
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
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + this.state.token
      },
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
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + this.state.token
      },
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
      headers: {
        Authorization: "Bearer " + this.state.token
      },
      cache: "no-cache",
      body: form_data
    }).then(res => {
      if (res.ok) {
        this.getChallenges();
      }
    });
  };

  // Sorts the challenges by their name in alphabetical (Ascending or descending) order.
  sortByName = (method, challenges) => {
    // Copy the array from state.
    let sorted = challenges.slice();
    // Check that array is not empty
    if (sorted.length > 0) {
      // If the challenge array is formed differently, go here
      if (typeof sorted[0].title == "undefined") {
        if (method === 1) {
          // Sort into ascending order.
          sorted.sort((a, b) => {
            return ("" + a.info.title).localeCompare(b.info.title);
          });
        } else {
          // Sort into descending order.
          sorted.sort((a, b) => {
            return ("" + b.info.title).localeCompare(a.info.title);
          });
        }
      } else {
        if (method === 1) {
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
      }
    }
    // Return sorted challenges.
    return sorted;
  };
  // Returns the cards for challenges that are done.
  doneContent() {
    return this.state.doneChall.map(challenge => (
      <li
        key={challenge.image.date}
        style={{ margin: "30px", listStyleType: "none" }}
      >
        <div style={{ display: " flex", justifyContent: "center" }}>
          <ExpandableCard challenge={challenge} type="3" color={this.props.cardColor} />
        </div>
      </li>
    ));
  }
  // Returns the cards for challenges that are pending.
  unverifiedContent() {
    return this.state.unverifiedChall.map(challenge => (
      <li
        key={challenge.image.date}
        style={{ margin: "30px", listStyleType: "none" }}
      >
        <div style={{ display: " flex", justifyContent: "center" }}>
          <ExpandableCard
            challenge={challenge}
            type="1"
            userId={this.state.user.userId}
            onDelete={this.handleEntryDeletion}
            color={this.props.cardColor}
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
          key={challenge._id}
          style={{ margin: "30px", listStyleType: "none" }}
        >
          <div style={{ display: " flex", justifyContent: "center" }}>
            <ExpandableCard
              challenge={challenge}
              onDelete={this.handleEntryDeletion}
              onVerify={this.handleVerification}
              color={this.props.cardColor}
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
              color={this.props.cardColor}
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
          <CreationDialog
            token={this.state.token}
            onClose={this.handleCreationClick}
          />
        )}
      </div>
    );
  }
}
ChallengeList.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ChallengeList);
