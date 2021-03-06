import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Checkbox,
  Typography,
  FormControlLabel,
  FormGroup
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
class CollectionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // User given email
      email: "",
      // User given password
      password: "",
      // User given area name
      area: "",
      // User given area password
      area_pass: "",
      // Toggles the password text field
      passBool: false
    };
  }
  // Remove event listener when unmounting.
  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleHotkey);
  }
  // Add key listener when mounting.
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
      if (this.state.email.length > 0 && this.state.password.length > 0 && this.state.area.length > 0) {
        this.handleRegister();
      }
    }
  };

  // Handle text field changes
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  // Handles checkbox to toggle password text field
  handleCheckBox = () => {
    this.setState({
      passBool: !this.state.passBool
    });
  };

  // Close the popup window
  handleCancel = () => {
    this.props.onClose();
  };

  // Registers an user to the system.
  handleRegister = () => {
    // Create an user object
    var user = {
      email: this.state.email,
      password: this.state.password,
      area: this.state.area
    };
    if (this.state.area_pass.length > 0) {
      user.areaPass = this.state.area_pass;
    }
    // Send ajax call to server with username and password.
    fetch("http://localhost:3000/api/admin", {
      credentials: "same-origin",
      headers: {
        "Content-type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(user)
    })
      .then(res => this.handleErrors(res))
      .then(res => res.json())
      .then(body => {
        this.props.onClose(body.message);
      });
  };
  // Handles errors when signing up.
  handleErrors = response => {
    if (!response.ok) {
      this.props.onClose();
    }
    return response;
  };

  render() {
    const { classes } = this.props;
    return (
      <Dialog open={true}>
        <DialogTitle> Create a new area </DialogTitle>
        <DialogContent>
          <div>
            Create a new area to store your upcoming challenges and become the admin user of the
            area.
          </div>
          <Typography className={classes.typography}>
            <b>User </b>
          </Typography>
          <div>
            <TextField label="Email" onChange={this.handleChange("email")} />
          </div>
          <div>
            <TextField
              label="Password"
              type="password"
              onChange={this.handleChange("password")}
            />
          </div>
          <Typography className={classes.typography}>
            <b>Area</b>
          </Typography>

          <TextField label="Name" onChange={this.handleChange("area")} />
          <FormGroup row>
            <FormControlLabel
            control={
            <Checkbox
            onChange={this.handleCheckBox}
            inputProps={{
              "aria-label": "primary checkbox"
            }}
            value={this.state.passBool}
          />
            }
            label="Password protected"
           />
          </FormGroup>
          
          {this.state.passBool && (
            <TextField
              disabled={!this.state.passBool}
              label="Password"
              type="password"
              onChange={this.handleChange("area_pass")}
            />
          )}
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
            onClick={this.handleRegister}
            variant="contained"
            color="primary"
          >
            Register
          </Button>
          
        </DialogActions>
      </Dialog>
    );
  }
}
CollectionForm.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(CollectionForm);
