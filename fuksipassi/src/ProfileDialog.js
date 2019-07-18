import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
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
// A dialog component to edit selected user.
class ProfileDialog extends React.Component {
  constructor(props) {
    super(props);
    let user = this.props.targetUser;
    // Set the default value to role radio button.
    this.state = {
      // The email that the user chooses
      email: user.email,
      // User given password
      password: "",
      // User given role
      role: user.role,
      // Boolean value to check if user is admin or not.
      admin: this.props.currentUser.role,
      // The user that is sent back to parent component after editing.
      user: user
    };
  }
  // Calls method from parent component to close the dialog.
  handleCancel = () => {
    this.props.onClose();
  };

  // Calls parent component's deletion method with the user id.
  handleDelete = () => {
    this.props.onDelete(this.state.user.userId);
  };

  // Handles the value changes and saves the edited data into its corresponding variable in state.
  handleChange = field => event => {
    let value = event.target.value;
    // If the field is role, then value has to be formatted into an integer.
    value =
      field == "role"
        ? event.target.value == "admin"
          ? 1
          : 0
        : event.target.value;

    this.setState({
      [field]: value
    });
  };

  // Makes an AJAX call to server with the id of who needs to be deleted.
  handleDelete = () => {
    fetch("http://localhost:3000/api/user/" + this.state.user.userId, {
      method: "DELETE",
      mode: "cors",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + this.props.token
      },
      cache: "no-cache"
    }).then(res => {
      res.json().then(body => {
        // If deletion is succesfull, log out the current user.
        if (res.status == 200) {
          this.props.onDelete(this.state.user.userId);
        } else {
          // If deletion failed, show error message.
          alert(body.message);
        }
      });
    });
  };

  // Handles dialog user editing. Gets updated user data from dialog component
  handleUpdate = () => {
    // Validate user inputs before sending the edit to the server.
    if (this.validateInputs()) {
      // Initialize the edited user.
      let user = this.state.user;
      user.email = this.state.email;
      // If password has been edited (when it's not empty), set user password as the edited one.
      if (this.state.password != "") user.password = this.state.password;

      user.role = this.state.role;

      fetch("http://localhost:3000/api/user/" + user.userId, {
        method: "PATCH",
        mode: "cors",
        headers: {
          "Content-type": "application/json",
          Authorization: "Bearer " + this.props.token
        },
        cache: "no-cache",
        body: JSON.stringify(user)
      }).then(res => {
        res.json().then(body => {
          this.props.onEdit(body.user.email);
        });
      });
      this.handleCancel();
    } else {
      // Alert about the forbidden char's
      alert("Forbidden characters found from input.");
      // Reset the text fields.
      this.setState({
        email: this.state.user.email,
        password: ""
      });
      // Force update so the dialog updates the fields correctly.
      this.forceUpdate();
    }
  };

  // Validates that the email or password don't have blacklisted characters.
  validateInputs = () => {
    var filter = ["$", "{", "}", "[", "]"];
    var emailAndPass = this.state.email + this.state.password;
    // If emailAndPass would contain any of the characters found in filter, return false.
    if (filter.some(elem => emailAndPass.includes(elem))) {
      return false;
    }
    return true;
  };

  // Set user into state
  render() {
    return (
      <Dialog open={true} onClose={this.handleDialog}>
        <DialogTitle> Edit user information </DialogTitle>
        <DialogContent>
          <div>
            <TextField
              value={this.state.email}
              margin="normal"
              label="Email"
              type="email"
              onChange={this.handleChange("email")}
            />
          </div>
          <div>
            <TextField
              value={this.state.password}
              margin="normal"
              label="Password"
              type="password"
              onChange={this.handleChange("password")}
            />
          </div>
          {/* Show optional editing fields if the user is admin */}
          {this.state.admin ? (
            <div>
              <FormControl>
                <FormLabel> Role </FormLabel>
                <RadioGroup
                  value={this.state.role ? "admin" : "basic"}
                  onChange={this.handleChange("role")}
                >
                  <FormControlLabel
                    value="admin"
                    control={<Radio />}
                    label="Admin"
                  />
                  <FormControlLabel
                    value="basic"
                    control={<Radio />}
                    label="Basic"
                  />
                </RadioGroup>
              </FormControl>
            </div>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={this.handleDelete}
            style={{ backgroundColor: "red" }}
            variant="contained"
            color="secondary"
            
          >
            Unregister
          </Button>
          <Button
            onClick={this.handleCancel}
            variant="contained"
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={this.handleUpdate} variant="contained" color="primary">
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
ProfileDialog.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ProfileDialog);
