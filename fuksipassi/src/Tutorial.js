import React from "react";
import { Typography, Button, Paper } from "@material-ui/core";

class Tutorial extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Paper style={{ maxWidth: "800px" }}>
        <div style={{ margin: "30px" }}>
          <Typography align="center" gutterBottom variant="h6">
            What is Fuksipassi?
          </Typography>
          <p>
            Fuksipassi is a web application, where users can complete challenges
            and upload pictures as proof of the completion. Anyone can create a
            new area and start creating their challenges there.
          </p>
          <p>
            To join another area after already joining some area, you have to
            make a new user or delete your current one and register again to the
            other area.
          </p>
          <Typography align="center" gutterBottom variant="h6">
            Hotkeys
          </Typography>
          <p>
            There are number of hotkeys present to assist in using the web
            application. They are listed below.
          </p>
          <ul>
            <li>
              <b>Insert</b>: Settings menu
            </li>
            <li>
              <b>End</b>: Log out
            </li>
            <li>
              <b>Delete</b>: See user list (Only for admins)
            </li>
            <li>
              <b>Home</b>: Edit your user
            </li>
          </ul>
          <Button
            onClick={this.props.onClose}
            variant="contained"
            color="primary"
          >
            Go back
          </Button>
        </div>
      </Paper>
    );
  }
}

export default Tutorial;
