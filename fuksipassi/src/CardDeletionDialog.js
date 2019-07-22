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
      title: this.props.title
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
    // If ESC is pressed, close the component
    if(e.KeyCode == 27){
      this.props.onClose();
      // ENTER pressed to delete challenge
    } else if(e.KeyCode == 13){
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
