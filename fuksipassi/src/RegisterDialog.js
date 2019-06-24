import React from "react";
import  {Dialog, DialogActions, DialogContent,DialogTitle,TextField,Button} from "@material-ui/core"

// Component that handles registering.
class RegisterForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        email: "",
        password: "",
        collection: ""
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
        collection: this.state.collection
      };
      // Send ajax call to server with username and password.
      fetch("http://localhost:3000/api/user", {
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
          <DialogTitle> Register to Fuksipassi </DialogTitle>
          <DialogContent>
            <div>
              <TextField
                label="Email"
                onChange={this.handleChange("email")}
              />
            </div>
            <div>
              <TextField
                label="Password"
                onChange={this.handleChange("password")}
              />
            </div>
            <div>
              <TextField
                label="Collection name"
                onChange={this.handleChange("collection")}
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