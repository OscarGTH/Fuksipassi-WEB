import React from "react";
import UploadZone from "./Helper.js";
import  {Dialog, DialogActions, DialogContent,DialogTitle,TextField,Button} from "@material-ui/core"

// Component that handles registering.
class CompletionDialog extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          title: this.props.title,
          file: ""
      };
      
      
    }

    // Handle image upload changes
    handleUpload = event => {
      console.log(event.target.files)
      this.setState({
        file: event.target.files
      });
    };

   
    handleComplete = (file) =>{
        this.props.onComplete(this.state.file);
    }
   
   

    render() {
      return (
        <Dialog open={true}>
          <DialogTitle> Complete challenge </DialogTitle>
          <DialogContent>
            {this.state.title}
            <p>Upload image as a proof of completion</p>
            <div >
            <input type="file" id="file-browser input" 
            name="file-browser-input"
            ref = {input => this.fileInput = input}
            onDragOver = {(e) =>{e.preventDefault(); e.stopPropagation();}}
            onDrop={this.handleUpload}
            onChange={this.handleUpload}
            style={{borderStyle: "dashed", width: 400, height: 50}}/>
            <div> Drag image here or browse from folders</div>
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