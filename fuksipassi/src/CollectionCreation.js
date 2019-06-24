import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Checkbox
} from "@material-ui/core";

// Component that handles registering.
class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      area: "",
      area_pass: "",
      passBool: false
    };
  }

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

  // Registers an user to the system.
  handleRegister = () => {
    // Create an user object
    var user = {
      email: this.state.email,
      password: this.state.password,
      area: this.state.area
    };
    if(this.state.area_pass.length > 0){
        user.areaPass = this.state.area_pass;
    }
    // Send ajax call to server with username and password.
    fetch("http://localhost:3000/api/admin", {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(user)
    })
      .then(res => this.handleErrors(res))
      .then(res => res.json())
      .then(body => {
        this.props.onClose(body.email, body.message);
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
    return (
      <Dialog open={true}>
        <DialogTitle> Register as admin </DialogTitle>
        <DialogContent>
          <div>
            Create a new area for challenges and register as the admin of
            the area.
          </div>
          <div> User </div>
          <div>
            <TextField label="Email" onChange={this.handleChange("email")} />
          </div>
          <div>
            <TextField
              label="Password"
              onChange={this.handleChange("password")}
            />
          </div>
          <div>Area</div>
          <div>
            <TextField
              label="Name"
              onChange={this.handleChange("area")}
            />
          </div>
          <Checkbox
            checked={this.state.passBool}
            onChange={this.handleChange("passBool")}
            inputProps={{
              "aria-label": "primary checkbox"
            }}
          />
          <div>
            <TextField
              disabled={this.state.passBool}
              label="Password"
              onChange={this.handleChange("area_pass")}
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={this.handleRegister}
            variant="outlined"
            color="primary"
          >
            Register
          </Button>
          <Button
            onClick={this.handleCancel}
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
export default RegisterForm;
