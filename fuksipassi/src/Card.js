import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import classnames from "classnames";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Collapse from "@material-ui/core/Collapse";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import CompletionDialog from "./CardCompletionDialog.js";
import DeletionDialog from "./CardDeletionDialog.js";
import { CardMedia } from "@material-ui/core";
const styles = theme => ({
  card: {
    backgroundColor: "#FFFF88",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 350,
    maxWidth: 500
  },
  media: {
    maxHeight: 250,
    maxWidth: 500,
    paddingTop: "5%",
    marginLeft: "auto",
    marginRight: "auto",
    display: "block"
  },
  thumbtack: {
    height: "55px",
    maxWidth: "57px",
    position: "relative",
    top: "15px",
    right: "10px",
    display: "block"
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
      admin: this.props.admin,
      timeout: null
    };
  }
  // Stopping the timeout when unmounting.
  componentWillUnmount() {
    if (this.state.timeout != null) {
      clearTimeout(this.state.timeout);
    }
  }
  componentDidUpdate(prevProps) {
    // Check if challenge props have been updated.
    if (prevProps.challenge !== this.props.challenge) {
      this.setState({ challenge: this.props.challenge });
    } 
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
  };

  handleDialog = () => {
    this.setState({
      showCompDialog: !this.state.showCompDialog
    });
  };

  // Downloads the given image
  download = (name, image) => {
    // Create a new <a> element
    var link = document.createElement("a");
    // Set id to it
    link.setAttribute("id", name);
    // Set image as the href
    link.href = `data:image/jpeg;base64,${image}`;
    // Set image name as the challenge title
    link.download = name;
    // Append the created element to body as invisible element
    document.body.appendChild(link);
    // Force a click on the link to download the image.
    link.click();
  };

  undoneCard = () => {
    const { classes } = this.props;
    return (
      <Card className={classes.card}>
        <img
          className={classes.thumbtack}
          src={process.env.PUBLIC_URL + "/tack.png"}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="h2">
            {this.state.challenge.title}
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
        <img
          className={classes.thumbtack}
          src={process.env.PUBLIC_URL + "/tack.png"}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="h2">
            {this.state.challenge.title}
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
            onClick={() =>
              this.props.onDelete(
                this.props.userId,
                this.state.challenge.challengeId
              )
            }
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
    const { classes } = this.props;
    return (
      <Card className={classes.card}>
        <img
          className={classes.thumbtack}
          src={process.env.PUBLIC_URL + "/tack.png"}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="h2">
            {this.state.challenge.info.title}
          </Typography>
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
            color="secondary"
            variant="contained"
            onClick={() =>
              this.props.onDelete(
                this.state.challenge.userId,
                this.state.challenge.challengeId
              )
            }
          >
            Delete
          </Button>

          <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={() =>
              this.props.onVerify(
                this.state.challenge.userId,
                this.state.challenge.challengeId,
                this.state.challenge.info.title
              )
            }
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
              src={`data:image/jpeg;base64,${this.state.challenge.img.data}`}
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
        <img
          className={classes.thumbtack}
          src={process.env.PUBLIC_URL + "/tack.png"}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="h2">
            {this.state.challenge.title}
          </Typography>
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
            <Button
              onClick={() =>
                this.download(
                  this.state.challenge.title,
                  this.state.challenge.image.img.data
                )
              }
            >
              Download image
            </Button>
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
