import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
const styles = theme => ({
    card: {
      maxWidth: 400,
    },
    media: {
      height: 0,
      paddingTop: '56.25%', // 16:9
    },
    actions: {
      display: 'flex',
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
  });
class ExpandableCard extends React.Component{
    state = {
        object: this.props.challenge,
        expanded: false
    };
    // Handles the expansion of the card 
    handleExpansion = () => {
        this.setState({
            expanded: !this.state.expanded
        });
          this.delayClosing();
    }
    // Closes the card after 5 seconds.
    delayClosing = () => {
      if(this.state.expanded !== true){
        setTimeout(function(){
          this.setState({expanded: false})
        }.bind(this),5000);
      }
    }

    render(){
      const { classes } = this.props;
        return(
            <Card className={classes.card}>
                <CardHeader> Card </CardHeader>
                <CardContent>
                   <Typography><b>Name:</b> {this.state.object.title}</Typography> 
                   <Typography><b>Description:</b> {this.state.object.description} </Typography>  
                   <Typography><b>Completion date:</b> {this.state.object.date} </Typography> 
                </CardContent>
                <CardActions className={classes.actions}>
                    <IconButton
                    className={classnames(classes.expand, {
                      [classes.expandOpen]: this.state.expanded,
                    })}
                    onClick={this.handleExpansion}
                    aria-expanded={this.state.expanded}
                    ><ExpandMoreIcon /></IconButton>
                </CardActions>
                <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>   
              This window will close in 3 seconds and you will not say a word about this...
            </Typography>
            <img src={`data:image/jpeg;base64,${this.state.object.img.data}`} height={200} alt="Proof image"/>
          </CardContent>
        </Collapse>

            </Card>
        );
    }
}
ExpandableCard.propTypes = {
    classes: PropTypes.object.isRequired,
  };
export default withStyles(styles)(ExpandableCard);

