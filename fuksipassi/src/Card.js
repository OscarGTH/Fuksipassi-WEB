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
import Button from "@material-ui/core/Button";
import CompletionDialog from "./CardCompletionDialog.js";
import DeletionDialog from "./CardDeletionDialog.js";
const styles = theme => ({
  card: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
      challenge: this.props.challenge,
      expanded: false,
      showCompDialog: false,
      showDelDialog: false,
      admin: this.props.admin
    };
  }

  handleCompletion = file => {
    this.handleDialog();
    this.props.onCompletion(this.state.challenge.challengeId, file);
  };

  handleDeletionDialog = () => {
    this.setState({
      showDelDialog: !this.state.showDelDialog
    });
  };

  handleDeletion = () => {
    this.props.onDeletion(this.state.challenge.challengeId);
    this.handleDeletionDialog();
  };
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

  handleDialog = () => {
    this.setState({
      showCompDialog: !this.state.showCompDialog
    });
  };

  undoneCard = () => {
    const { classes } = this.props;
    return (
      <Card className={classes.card}>
        <CardHeader> Card </CardHeader>
        <CardContent>
          <Typography>{this.state.challenge.title}</Typography>
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
          {this.state.admin == 0 ? (
            <Button size="small" color="primary" onClick={this.handleDialog}>
              Complete
            </Button>
          ) : null}

          {this.state.admin == 1 ? (
            <Button
              size="small"
              color="primary"
              onClick={this.handleDeletionDialog}
            >
              Delete
            </Button>
          ) : null}
        </CardActions>
        <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>
              {this.state.challenge.description}
            </Typography>
          </CardContent>
        </Collapse>
      </Card>
    );
  };

  unverifiedCard = () => {
    const { classes } = this.props;
    return (
      <Card className={classes.card}>
        <CardHeader> Card </CardHeader>
        <CardContent>
          <Typography>{this.state.challenge.title}</Typography>
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
          <Button
            size="small"
            color="primary"
            onClick={this.handleUnverifiedDelete}
          >
            Delete
          </Button>
        </CardActions>
        <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>
              {this.state.challenge.description}
            </Typography>
            <img
              className={classes.media}
              src={`data:image/jpeg;base64,${
                this.state.challenge.image.img.data
              }`}
              alt="Proof of completion"
            />
          </CardContent>
        </Collapse>
      </Card>
    );
  };
  pendingCard = () => {
    console.log("Lol oon pendingisss!")
    const { classes } = this.props;
    return (
      <Card className={classes.card}>
        <CardHeader> Card </CardHeader>
        <CardContent>
          <Typography>{this.state.challenge.info.title}</Typography>
          <Typography>
            <b>User:</b> {this.state.challenge.email}
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
          <Button
            size="small"
            color="primary"
            onClick={this.handlePendingDelete}
          >
            Delete
          </Button>

          <Button
            size="small"
            color="primary"
            onClick={this.handleVerifyDialog}
          >
            Verify
          </Button>
        </CardActions>
        <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>
              {this.state.challenge.info.description}
            </Typography>
            <img
              className={classes.media}
              src={`data:image/jpeg;base64,${
                this.state.challenge.img.data
              }`}
              alt="Proof of completion"
            />
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
          <Typography>{this.state.challenge.title}</Typography>
          <Typography>
            <b>Date of completion:</b> {this.state.challenge.image.date}
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
            <Typography>{this.state.challenge.description}</Typography>
            <img
              className={classes.media}
              src={`data:image/jpeg;base64,${
                this.state.challenge.image.img.data
              }`}
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
        {this.state.showCompDialog && (
          <CompletionDialog
            onCancel={this.handleDialog}
            onComplete={this.handleCompletion}
          />
        )}
        {this.props.type == 0 && this.undoneCard()}
        {this.props.type == 1 && this.unverifiedCard()}
        {this.props.type == 2 && this.pendingCard()}
        {this.props.type == 3 && this.doneCard()}
        {this.state.showDelDialog && (
          <DeletionDialog
            title={this.state.challenge.title}
            onCancel={this.handleDeletionDialog}
            onDeletion={this.handleDeletion}
          />
        )}
      </div>
    );
  }
}
ExpandableCard.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ExpandableCard);
