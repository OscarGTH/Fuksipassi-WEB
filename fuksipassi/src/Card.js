import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Collapse from "@material-ui/core/Collapse";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button"
import CompletionDialog from "./CardCompletionDialog.js"
const styles = theme => ({
  card: {
    maxWidth: 400
  },
  media: {
    maxHeight: 250,
    paddingTop: "20%",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto"
  },
  actions: {
    display: "flex"
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: "rotate(180deg)"
  }
});
class ExpandableCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: this.props.type,
      object: this.props.challenge,
      expanded: false
    };
  }
  handleCompletion = file =>{
    this.handleDialog();
    this.props.onCompletion(this.state.object.challengeId,file)
  }
  // Handles the expansion of the card
  handleExpansion = () => {
    this.setState({
      expanded: !this.state.expanded,
      showDialog: false
    });
    if (this.state.type == 1) {
      this.delayClosing();
    }
  };
  // Closes the card after 5 seconds.
  delayClosing = () => {
    if (this.state.expanded !== true) {
      setTimeout(
        function() {
          this.setState({ expanded: false });
        }.bind(this),
        3000
      );
    }
  };

  handleDialog = () =>{
    this.setState({
      showDialog: !this.state.showDialog
    })
  }

  undoneCard = () => {
    const { classes } = this.props;
    return (
      <Card className={classes.card}>
        <CardHeader> Card </CardHeader>
        <CardContent>
          <Typography>{this.state.object.title}</Typography>
        </CardContent>
        <CardActions className={classes.actions}>
          <IconButton
            className={classnames(classes.expand, {
              [classes.expandOpen]: this.state.expanded
            })}
            onClick={this.handleExpansion}
            aria-expanded={this.state.expanded}
          >
            <ExpandMoreIcon />
          </IconButton>
          <Button size="small" color="primary" onClick={this.handleDialog}>
          Complete
        </Button>
        </CardActions>
        <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>{this.state.object.description}</Typography>
          </CardContent>
        </Collapse>
      </Card>
    );
  };
  doneCard = () => {
    const { classes } = this.props;
    return (
      <Card className={classes.card}>
        <CardHeader> Card </CardHeader>
        <CardContent>
          <Typography>{this.state.object.title}</Typography>
          <Typography>
            <b>Date of completion:</b> {this.state.object.date}
          </Typography>
        </CardContent>
        <CardActions className={classes.actions}>
          <IconButton
            className={classnames(classes.expand, {
              [classes.expandOpen]: this.state.expanded
            })}
            onClick={this.handleExpansion}
            aria-expanded={this.state.expanded}
          >
            <ExpandMoreIcon />
          </IconButton>
        </CardActions>
        <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography>{this.state.object.description}</Typography>
            <img
            className={classes.media}
              src={`data:image/jpeg;base64,${this.state.object.image.img.data}`}

              alt="Proof of completion"
            />
          </CardContent>
        </Collapse>
      </Card>
    );
  };

  render() {
    return (
      <div>
        {this.state.showDialog && <CompletionDialog onCancel={this.handleDialog} onComplete={this.handleCompletion}/>}
        {this.props.type == 0 && this.undoneCard()}
        {this.props.type == 1 && this.doneCard()}
      </div>
    );
  }
}
ExpandableCard.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ExpandableCard);
