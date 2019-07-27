import { SketchPicker } from "react-color";
import React from "react";
import {
  Typography,
  Button,
  Paper,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio
} from "@material-ui/core";

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      barColor: this.props.barColor,
      sorting: this.props.sorting,
      cardColor: this.props.cardColor
    };
    this.ascended = React.createRef();
    this.descended = React.createRef();
  }
  // Removing key listener when unmounting.
  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleHotkey);
  }
  // Adding key listener when mounting.
  componentDidMount() {
    window.addEventListener("keydown", this.handleHotkey);
  }

  // Handles the key press
  handleHotkey = e => {
    // If ESC is pressed, close settings view.
    if (e.keyCode == 27) {
      this.props.onClose();
    } else if (e.keyCode == 13) {
      this.handleSaving();
    } else if (e.keyCode == 38 || e.keyCode == 40) {
      this.setState({ sorting: !this.state.sorting });
    }
  };
  // Handles the color change of app bar
  handleBarColorChange = color => {
    this.setState({
      barColor: color.hex
    });
  };
  // Handles the card color change
  handleCardColorChange = color => {
    this.setState({
      cardColor: color.hex
    });
  };
  // Handles the radio button change of sorting types.
  handleSortingChange = event => {
    let value = event.target.value;
    // If edited value is sorting radio buttons, determine which value needs to be set.
    value = event.target.value == "ascending" ? 1 : 0;
    this.setState({
      sorting: value
    });
  };
  // Handles the parent function calling with appropriate parameters.
  handleSaving = () => {
    this.props.onSave(
      this.state.sorting,
      this.state.barColor,
      this.state.cardColor
    );
  };

  render() {
    return (
      <Paper>
        <div style={{ display: "flex" }}>
          <div style={{ margin: "20px" }}>
            <Typography>Theme color</Typography>
            <SketchPicker
              color={this.state.barColor}
              onChangeComplete={ this.handleBarColorChange}
            />
          </div>
          <div style={{ margin: "20px" }}>
            <Typography>Challenge card color</Typography>
            <SketchPicker
              color={this.state.cardColor}
              onChangeComplete={this.handleCardColorChange}
            />
          </div>

          <div style={{ margin: "20px" }}>
            <FormControl>
              <Typography> Sort challenges </Typography>
              <RadioGroup
                value={this.state.sorting ? "ascending" : "descending"}
                onChange={this.handleSortingChange}
              >
                <FormControlLabel
                  value="ascending"
                  control={<Radio />}
                  label="A-Z"
                />
                <FormControlLabel
                  value="descending"
                  control={<Radio />}
                  label="Z-A"
                />
              </RadioGroup>
            </FormControl>
          </div>
        </div>

        <div>
          <Button
            onClick={this.props.onClose}
            variant="contained"
            color="secondary"
            style={{ margin: "10px" }}
          >
            Go back
          </Button>
          <Button
            onClick={this.handleSaving}
            variant="contained"
            color="primary"
            style={{ margin: "10px" }}
          >
            Save
          </Button>
        </div>
      </Paper>
    );
  }
}

export default Settings;
