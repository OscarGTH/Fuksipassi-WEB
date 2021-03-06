import React from "react";
import { Typography, Button, Paper } from "@material-ui/core";
import ProfileDialog from "./ProfileDialog";

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Array of users in the area.
      users: [],
      // Message to display to page user in case there is a problem etc.
      message: "",
      // Toggle to show editing dialog.
      showEdit: false
    };
  }
  // Removing event listener when unmounting.
  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleHotkey);
  }
  // When component mounts, fetch users of the area.
  componentDidMount() {
    window.addEventListener("keydown", this.handleHotkey);
    fetch("http://localhost:3000/api/user", {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + this.props.token
      },
      cache: "no-cache"
    }).then(res => {
      if (res.ok) {
        res.json().then(body => {
          // Set the current user as the user that was returned as response.
          this.setState({
            users: body.users
          });
        });
      } else {
        this.setState({ message: "Your area has everything but users." });
      }
    });
  }
  // Handles the opening of edit dialog. Gets user as a parameter.
  openEditDialog = user => {
    this.setState({
      targetUser: user,
      showEdit: true
    });
  };
  // Closes edit dialog
  closeEditDialog = () => {
    this.setState({
      showEdit: false
    });
  };
  // Handles the key press
  handleHotkey = (e) =>{
    // If ESC is pressed, close the user list.
    if(e.keyCode == 27){
      this.props.onClose();
    }
  }
  // Handles the user deleting
  handleUserDelete = id => {
    // Copy the user array
    let remainingUsers = this.state.users;
    // Loop through it
    for (var i = 0; i < remainingUsers.length; i++) {
      // When correct id is found, remove the user from the array
      if (remainingUsers[i].userId == id) {
        remainingUsers.splice(i, 1);
        // Update state.
        this.setState({
          users: remainingUsers,
          showEdit: false
        });
      }
    }
  };
  render() {
    return (
      <Paper>
        {this.state.showEdit && (
          <ProfileDialog
            targetUser={this.state.targetUser}
            currentUser={this.props.user}
            token={this.props.token}
            onClose={this.closeEditDialog}
            onDelete={this.handleUserDelete}
            onEdit={this.closeEditDialog}
          />
        )}
        <div>
          <Typography>List of users in your area</Typography>
          <Typography>
            Number of users: <b>{this.state.users.length}</b>
          </Typography>
          <table>
          <tbody>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th />
            </tr>

            {this.state.users.map(user => (
              
                <tr key={user.userId}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {user.email}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {user.role ? <p>Admin</p> : <p>Basic</p>}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    <Button onClick={() => this.openEditDialog(user)}>
                      Edit
                    </Button>
                  </td>
                </tr>
             
            ))}
             </tbody>
          </table>
          <Button
            onClick={this.props.onClose}
            variant="contained"
            color="secondary"
            style={{ margin: "10px" }}
          >
            Go back
          </Button>
        </div>
      </Paper>
    );
  }
}

export default UserList;
