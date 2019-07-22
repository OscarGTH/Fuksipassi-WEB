import { SketchPicker } from "react-color";
import React from "react";
import { Typography, Button, Paper } from "@material-ui/core";

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      barColor: ""
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
    if(e.KeyCode == 27){
      this.props.onClose();
    }
  }
  handleChangeComplete = color => {
    this.setState({ barColor: color.hex });
  };

  handleSaving = () => {
    this.props.onSave(this.state.barColor);
  };

  render() {
    return (
      <Paper style={{maxWidth: "500px"}}>
        <div>
          <Typography>Theme color</Typography>
          <SketchPicker
            color={this.state.barColor}
            onChangeComplete={this.handleChangeComplete}
          />
          <Button onClick={this.props.onClose} variant="contained" color="secondary" style={{margin: "10px"}}> Go back </Button>
          <Button onClick={this.handleSaving}variant="contained" color="primary" style={{margin: "10px"}}> Save </Button>
        </div>
      </Paper>
    );
  }
}

export default Settings;
