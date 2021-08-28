import React, { Component } from "react";
import { Text, View } from "react-native";
import { Card } from "react-native-elements";
import { CAMPSITES } from "../shared/campsites";

function RenderCampsite({ campsite }) {
  if (campsite) {
    return (
      <Card featuredTitle={campsite.name} image={require("./images/react-lake.jpg")}>
        <Text style={{ margin: 10 }}>{campsite.description}</Text>
      </Card>
    );
  }
  return <View />;
}

class CampsiteInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      campsites: CAMPSITES,
    };
  }

  static navigationOptions = {
    title: "Campsite Information",
  };
  render() {
    //this comes from the onPress prop in the Directory component, it passes props through props.navigation
    const campsiteId = this.props.navigation.getParam("campsiteId");
    //filter through all campsites against the one that was pressed in the directory component
    const campsite = this.state.campsites.filter((campsite) => campsite.id === campsiteId)[0];
    //pass that filtered campsite to campsite info component on this page
    return <RenderCampsite campsite={campsite} />;
  }
}

export default CampsiteInfo;
