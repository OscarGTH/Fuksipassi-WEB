import React from "react";
import ExpandableCard from './Card.js'
import Button from "@material-ui/core/Button"
class ChallengeList extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user: this.props.user,
            undoneChall: [], doneChall: [],
            url: "http://localhost:3000/api/",
            loaded: false
        }
        console.log(this.props.user)
    }
    async componentDidMount(){
         await this.getChallenges();
         
         this.setState({loaded: true})
    }
    getChallenges = () => {
      fetch(this.state.url + "challenge/done/"+this.state.user.userId, {
        method: "GET",
        headers: {
          "Content-type": "application/json"
        },
        cache: "no-cache"
      }).then(res => {
        res.json().then(body => {
          // Set the current user as the user that was returned as response.
          this.setState({
            doneChall: body.data,
          });
          
        });
      });
      // Fetch challenges that haven't been completed.
      console.log(this.state.user + this.state.user.userId)
    fetch( this.state.url + "challenge/undone/"+this.state.user.userId, {
        method: "GET",
        headers: {
          "Content-type": "application/json"
        },
        cache: "no-cache"
      }).then(res => {
        res.json().then(body => {
          
          // Set the current user as the user that was returned as response.
          this.setState({
            undoneChall: body.data,
          });
        });
      });
     
      return true;
    }
     // Handles the logging out
     handleLogout = () => {
      this.props.onLogout();
    };

    content() {
      return(this.state.doneChall.map(challenge => (
        <li
          key={challenge[0].image.date}
          style={{ margin: "30px", listStyleType: "none" }}
        >
          <div>
            <ExpandableCard challenge={challenge[0]} />
          </div>
        </li>
      ))
      );
      
    }
  render() {
    return (
      <div>
        <Button onClick={this.handleLogout}>Log out</Button>
        {this.state.loaded ? this.content():<div>Loading.. Please wait!</div>} 
      </div>
    );
  }
}
export default ChallengeList;


