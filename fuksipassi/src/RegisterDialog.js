import React from "react";
import  {Dialog, DialogActions, DialogContent,DialogTitle,TextField,Button} from "@material-ui/core"
import DownIcon from "@material-ui/icons/ThumbDown";
import UpIcon from "@material-ui/icons/ThumbUp";

// Component that handles registering.
class RegisterForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        email: "",
        password: "",
        area: "",
        checked: false,
        areaFound: false,
        areaPassNeeded: false,
        areaPass: ""
      };
    }

    componentWillUnmount() {
      window.removeEventListener("keydown", this.handleHotkey);
    }
    componentDidMount() {
      window.addEventListener("keydown", this.handleHotkey);
    }
    
     // Handles the key press
     handleHotkey = (e) =>{
      // If ESC is pressed, close settings view.
      if(e.keyCode == 27){
        this.props.onClose();
      } else if (e.keyCode == 13 && this.state.checked && this.state.areaFound){
        this.handleRegister()
      }
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
      if(this.state.areaPassNeeded){
        user.areaPass = this.state.areaPass
      }
      // Send ajax call to server with username and password.
      fetch("http://localhost:3000/api/user", {
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(user)
      })
        .then(res => res.json())
        .then(body => {
          this.props.onClose(body.message);
        });
    };
    
    // Checks if area exists and if it needs password for registering into it.
    checkArea = () =>{
      fetch("http://localhost:3000/api/area/"+this.state.area, {
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        method: "GET"
      })
        .then(res => res.json())
        .then(body => {
          // If area was found, set state accordingly.
          if(body.message == "Area found"){
            this.setState({
              areaFound: true,
              checked: true,
              areaPassNeeded: body.password
            })
          } else{
            this.setState({
              areaFound: false,
              checked: true
            })
          }
        });
    }
   

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
                label="Area name"
                onChange={this.handleChange("area")}
              />
              <Button onClick={this.checkArea}>Check</Button>
              {!this.state.areaFound && this.state.checked && <DownIcon color="error"></DownIcon>}
              {this.state.areaFound && <UpIcon color="primary"></UpIcon>}</div>
              
           
            {this.state.areaPassNeeded && <TextField value={this.state.areaPass} onChange={this.handleChange("areaPass")} label="Area password"/>}
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
              disabled={!this.state.checked}
            >
              Register
            </Button>
            
          </DialogActions>
        </Dialog>
      );
    }
  }
  export default RegisterForm;