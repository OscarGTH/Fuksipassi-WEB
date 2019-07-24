import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Typography
} from "@material-ui/core";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  root: {
    display: "flex"
  },
  typography: {
    paddingTop: "20px",
    paddingBottom: "5px",
    color: "primary",
    align: "center"
  }
});
// Component that handles registering.
class CreationDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      description: "",
      message: ""
    };
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleHotkey);
  }
  componentDidMount() {
    window.addEventListener("keydown", this.handleHotkey);
  }

  // Handles the key press
  handleHotkey = e => {
    // If ESC is pressed, close settings view.
    if (e.keyCode == 27) {
      this.props.onClose();
    } else if (e.keyCode == 13) {
      // If the information for challenge has been set, allow to continue.
      if (this.state.title.length > 0 && this.state.description.length > 0) {
        this.handleCreation();
      }
    }
  };

  // Handle text field changes
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  // Close the popup window
  handleCancel = () => {
    this.props.onClose();
  };

  // Called when challenge information has been given by the user and the challenge needs to be saved into database.
  handleCreation = () => {
    var challenge = {
      title: this.state.title,
      description: this.state.description
    };
    console.log(challenge);
    fetch("http://localhost:3000/api/challenge", {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(challenge)
    }).then(res => {
      if (res.ok) {
        this.props.onClose();
      } else {
        res.json(body => {
          this.setState({
            message: body.message
          });
        });
      }
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <Dialog open={true}>
        <DialogTitle> Challenge creation </DialogTitle>
        <DialogContent>
          <div>
            Create a new challenge for users to complete. This challenge is only
            going to be seen by members in your challenge area.
          </div>
          <Typography className={classes.typography}> Challenge </Typography>
          <div>
            <TextField
              className={classes.fields}
              label="Title"
              onChange={this.handleChange("title")}
            />
          </div>
          <div>
            <TextField
              className={classes.fields}
              label="Description"
              multiline={true}
              onChange={this.handleChange("description")}
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={this.handleCancel}
            variant="contained"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={this.handleCreation}
            variant="contained"
            color="primary"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
CreationDialog.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(CreationDialog);
