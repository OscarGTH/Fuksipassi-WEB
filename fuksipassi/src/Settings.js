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
