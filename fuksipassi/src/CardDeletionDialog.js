import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography
} from "@material-ui/core";

// Component that handles registering.
class DeletionDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Challenge title
      title: this.props.title
    };
  }
  // Called when component is unmounting.
  componentWillUnmount() {
    // Removing key press listener
    window.removeEventListener("keydown", this.handleHotkey);
  }
  // Add key listener when mounting
  componentDidMount() {
    window.addEventListener("keydown", this.handleHotkey);
  }
  
   // Handles the key press
   handleHotkey = (e) =>{
    // If ESC is pressed, close the component
    if(e.keyCode == 27){
      this.props.onClose();
      // ENTER pressed to delete challenge
    } else if(e.keyCode == 13){
      this.props.onDeletion();
    }
  }

  // Handles the deletion selection.
  handleDeletion = () => {
    this.props.onDeletion();
  };

 

  render() {
    return (
      <Dialog open={true}>
        <DialogTitle> Delete a challenge </DialogTitle>
        <DialogContent>
            <Typography><i>{this.state.title}</i></Typography>
            Are you sure you want to delete this challenge? All information about the completions of this challenge will also be deleted.
        </DialogContent>

        <DialogActions>
        <Button
            onClick={this.props.onCancel}
            variant="contained"
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={this.handleDeletion}
            variant="contained"
            color="secondary"
          >
              Delete
          </Button>
         
        </DialogActions>
      </Dialog>
    );
  }
}
export default DeletionDialog;
