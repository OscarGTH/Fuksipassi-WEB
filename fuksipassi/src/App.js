import React from 'react';
import ExpandableCard from './Card.js'





class App extends React.Component {
  constructor() {
    super();
    this.state = {result: [],url:"http://localhost:3000/api/"};
    
  }
  
  componentDidMount(){
    fetch(this.state.url + "challenge/done/5cfe97bfe4ed3430fc5ff976", {
      method: "GET",
      headers: {
        "Content-type": "application/json"
      },
      cache: "no-cache"
    }).then(res => {
      res.json().then(body => {
        console.log(body.data[0])
        // Set the current user as the user that was returned as response.
        this.setState({
          result: body.data,
          image: body.data[0].img.data
        });
        
      });
    });
  }
 

  
  render() {
    return(
      <div>
       {this.state.result.map(challenge => (
                      <li key={challenge.date} style={{ margin: "30px", listStyleType: "none" }}>
                        <div>
                        <ExpandableCard challenge={challenge}></ExpandableCard>
                        </div>
                        </li>))}
      </div>
    )
  }
}


export default App;
