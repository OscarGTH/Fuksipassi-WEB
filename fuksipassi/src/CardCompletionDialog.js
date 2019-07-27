import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Button
} from "@material-ui/core";

// Component that handles registering.
class CompletionDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Challenge title
      title: this.props.title,
      // Image file that was uploaded
      file: "",
      // Message which informs the user about errors etc.
      message: "",
      // Toggle to disable complete-button. Used if file is too large or if there is no file.
      disableComplete: true
    };
  }

  // Handle image upload changes
  handleUpload = event => {
    // If file is not present, set message to empty.
    if (typeof event.target.files[0] === "undefined") {
      this.setState({
        message: ""
      });
      // If file is small enough (under 2MB)
    } else if (event.target.files[0].size / 1024 / 1024 < 2) {
        this.setState({
          disableComplete: false,
          file: event.target.files,
          message: ""
        });
      } else {
        // If file is too big, set message.
        this.setState({
          message: "File size exceeds limits."
        });
      }
    
  };
  // Completes the challenge and send the file to parent component.
  handleComplete = () => {
    this.props.onComplete(this.state.file);
  };

  render() {
    return (
      <Dialog open={true}>
        <DialogTitle> Complete challenge </DialogTitle>
        <DialogContent>
          {this.state.title}
          <p>Upload image as a proof of completion</p>
          <Typography
            gutterBottom
            variant="h6"
            component="h2"
            color="secondary"
          >
            {this.state.message}
          </Typography>
          <div>
            <input
              type="file"
              id="file-browser input"
              name="file-browser-input"
              ref={input => (this.fileInput = input)}
              onDragOver={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={this.handleUpload}
              onChange={this.handleUpload}
              style={{ borderStyle: "dashed", width: 400, height: 50 }}
            />
            <div>
              Drag image here or browse from folders (size limit is 2 MB)
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={this.props.onCancel}
            variant="contained"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={this.handleComplete}
            variant="contained"
            disabled={this.state.disableComplete}
            color="primary"
          >
            Complete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
export default CompletionDialog;
