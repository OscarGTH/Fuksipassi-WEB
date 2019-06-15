import React from "react";
import ExpandableCard from './Card.js'
class ChallengeList extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user: this.props.user,
            undoneChall: [], doneChall: [],
            url: "http://localhost:3000/api/"
        }
    }
    componentDidMount(){
        console.log("Called mount")
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
                doneChall: body.data
              });
              console.log(body.data)
            });
          });
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
                undoneChall: body.data
              });
            });
          });
        
    }
  render() {
    return (
      <div>
        {this.state.doneChall.map(challenge => (
          <li
            key={challenge.date}
            style={{ margin: "30px", listStyleType: "none" }}
          >
            <div>
              <ExpandableCard challenge={challenge} />
            </div>
          </li>
        ))}
        
      </div>
    );
  }
}
export default ChallengeList;


