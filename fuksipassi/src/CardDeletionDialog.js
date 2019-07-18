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
