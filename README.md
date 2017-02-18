React Redux PropMap
=========================

Introduces a PropMap class to make connecting state and actions to components cleaner

## Installation

```
npm install --save react-redux-propmap
```

## Example 

```
import React, { Component } from "react"
import { StyleSheet, View, Text, Button, Image } from "react-native"
import { connectProps, PropMap } from "react-redux-propmap";
import * as authActions from "../state/actions/authActions"

class LoginProps extends PropMap {
  map(props) {
    props.isAuthenticated = this.state.auth.isAuthenticated;
    props.loginClick = this.bindEvent(authActions.login);
  }
}

@connectProps(LoginProps)
export default class LoginScreen extends Component {

  _onLoginClick() {
    this.props.loginClick(this.state.username, this.state.password)
  }

  render() {
    return (
      ...
      <Text>{this.props.isAuthenticated}</Text>
      ...
    )
  }
}
```