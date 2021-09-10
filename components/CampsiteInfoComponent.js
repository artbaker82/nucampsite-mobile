import React, { Component } from "react";
import {
  Text,
  View,
  ScrollView,
  FlatList,
  Modal,
  Button,
  StyleSheet,
  TextInput,
  Alert,
  PanResponder,
} from "react-native";
import { Card, Icon, Rating, Input } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import { postFavorite, postComment } from "../redux/ActionCreators";
import * as Animatable from "react-native-animatable";

const mapStateToProps = (state) => {
  return {
    campsites: state.campsites,
    comments: state.comments,
    favorites: state.favorites,
  };
};

const mapDispatchToProps = {
  postFavorite: (campsiteId) => postFavorite(campsiteId),
  postComment: (campsiteId, rating, author, text) => postComment(campsiteId, rating, author, text),
};

function RenderComments({ comments }) {
  const renderCommentItem = ({ item }) => {
    return (
      <View style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.text}</Text>
        <Rating
          readonly
          startingValue={item.rating}
          imageSize={10}
          style={{ alignItems: "flex-start", paddingVertical: "5%" }}
        />
        <Text style={{ fontSize: 12 }}>{`-- ${item.author} , ${item.date}`}</Text>
      </View>
    );
  };

  return (
    <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
      <Card title="comments">
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </Card>
    </Animatable.View>
  );
}

class CampsiteInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      rating: 5,
      author: "",
      text: "",
    };
  }
  markFavorite(campsiteId) {
    this.props.postFavorite(campsiteId);
  }

  toggleModal() {
    this.setState({
      showModal: !this.state.showModal,
    });
  }

  handleComment(campsiteId) {
    console.log(campsiteId, this.state.text, "hi from handleComment");
    this.props.postComment(campsiteId, this.state.rating, this.state.author, this.state.text);
  }

  resetForm() {
    this.setState({
      showModal: false,
      rating: 5,
      author: "",
      text: "",
    });
  }

  static navigationOptions = {
    title: "Campsite Information",
  };
  render() {
    const RenderCampsite = (props) => {
      const { campsite } = props;
      const view = React.createRef();

      const recognizeDrag = ({ dx }) => (dx < -200 ? true : false);
      const recognizeComment = ({ dx }) => (dx > 200 ? true : false);
      const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          view.current
            .rubberBand(1000)
            .then((endState) => console.log(endState.finished ? "finished" : "cancelled"));
        },
        onPanResponderEnd: (e, gestureState) => {
          console.log("pan responder end", gestureState);
          if (recognizeDrag(gestureState)) {
            Alert.alert(
              "Add Favorite",
              "Are you sure you wish to add " + campsite.name + " to favorites?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => console.log("Cancel Pressed"),
                },
                {
                  text: "OK",
                  onPress: () =>
                    props.favorite
                      ? console.log("Already set as a favorite")
                      : props.markFavorite(),
                },
              ],
              { cancelable: false }
            );
          } else if (recognizeComment(gestureState)) {
            console.log("sup");
            this.toggleModal();
          }
          return true;
        },
      });
      if (campsite) {
        return (
          <Animatable.View
            animation="fadeInDown"
            duration={2000}
            delay={1000}
            ref={view}
            {...panResponder.panHandlers}
          >
            <Card featuredTitle={campsite.name} image={{ uri: baseUrl + campsite.image }}>
              <Text style={{ margin: 10 }}>{props.campsite.description}</Text>
              <View style={styles.cardRow}>
                <Icon
                  name={props.favorite ? "heart" : "heart-o"}
                  type="font-awesome"
                  color="#f50"
                  raised
                  reverse
                  onPress={() =>
                    props.favorite ? console.log("already set as favorite") : props.markFavorite()
                  }
                />
                <Icon
                  type="font-awesome"
                  name="pencil"
                  color="#5637DD"
                  raised
                  reverse
                  onPress={() => this.toggleModal()}
                />
              </View>
            </Card>
          </Animatable.View>
        );
      }
      return <View />;
    };

    const campsiteId = this.props.navigation.getParam("campsiteId");
    const campsite = this.props.campsites.campsites.filter(
      (campsite) => campsite.id === campsiteId
    )[0];
    const comments = this.props.comments.comments.filter(
      (comment) => comment.campsiteId === campsiteId
    );

    console.log(campsite);
    return (
      <ScrollView>
        <RenderCampsite
          campsite={campsite}
          favorite={this.props.favorites.includes(campsiteId)}
          markFavorite={() => this.markFavorite(campsiteId)}
        />
        <RenderComments comments={comments} />
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onRequestClose={() => this.toggleModal()}
        >
          <View style={styles.modal}>
            <Rating
              showRating
              startingValue={this.state.rating}
              imageSize={40}
              onFinishRating={(rating) => this.setState({ rating: rating })}
              style={{ paddingVertical: 10 }}
            />
            <Input
              placeholder="Comment"
              leftIcon={{ type: "font-awesome", name: "comment-o" }}
              leftIconContainerStyle={{ paddingRight: 10 }}
              onChangeText={(value) => this.setState({ text: value })}
              value={this.state.text}
            />
            <Input
              placeholder="Author"
              leftIcon={{ type: "font-awesome", name: "user-o" }}
              leftIconContainerStyle={{ paddingRight: 10 }}
              onChangeText={(value) => this.setState({ author: value })}
              value={this.state.author}
            />
            <View style={{ margin: 10 }}></View>
            <View>
              <Button
                title="Submit"
                color="#5637DD"
                onPress={() => {
                  this.handleComment(campsiteId);
                  this.toggleModal(campsiteId);
                  this.resetForm();
                }}
              ></Button>
            </View>
            <Button
              onPress={() => {
                this.toggleModal();
                this.resetForm();
              }}
              color="#808080"
              title="Cancel"
            ></Button>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  cardRow: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    margin: 20,
    flexDirection: "row",
  },
  modal: {
    justifyContent: "center",
    margin: 20,
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo);
