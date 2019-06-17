import React from "react";
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
      this.setState({
        file: event.target.files
      });
    };

   
    handleComplete = () =>{
        this.props.onComplete(this.state.file);
    }
   
   

    render() {
      return (
        <Dialog open={true}>
          <DialogTitle> Complete challenge </DialogTitle>
          <DialogContent>
            {this.state.title}
            <p>Upload image as a proof of completion</p>
            <input type="file" onChange={this.handleUpload}/>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={this.handleComplete}
              variant="outlined"
              color="primary"
            >
              Complete
            </Button>
            <Button
              onClick={this.props.onCancel}
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
  export default CompletionDialog;