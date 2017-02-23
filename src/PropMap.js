import { bindActionCreators } from "redux"
import PropEvent from "./PropEvent"
import { strictEqual, shallowEqual } from "./utils.js"

export default class PropMap {

  // state of application
  state = null;

  // props passed to your component
  ownProps = null;

  // dispatch function
  dispatch = null;

  // selector options
  options = null;

  hasRunAtLeastOnce = false;
  mergedProps = null;
  props = null;
  events = null;
  dependsOnOwnProps = false;
  areStatesEqual = strictEqual;
  areOwnPropsEqual = shallowEqual;
  areStatePropsEqual = shallowEqual;
  areMergedPropsEqual = shallowEqual;

  // override this to map state to you component's properties
  map(props) {
  }

  // bind a single action to an event property
  bindEvent(action) {
    return new PropEvent(action);
  }

  // separate props and events
  parseProps() {

    // call to map properties
    var props = {};
    this.map(props);

    // separate props from events
    let hasEvents = false;
    let hasProps = false;
    let actualProps = {};
    let actualEvents = {};
    for (key in props) {
      var prop = props[key];
      if (prop instanceof PropEvent) {
        hasEvents = true;
        actualEvents[key] = prop.action;
      }
      else {
        hasProps = true;
        actualProps[key] = prop;
      }
    }

    if (hasEvents) {
      actualEvents = bindActionCreators(actualEvents, this.dispatch);
    }

    return {
      newProps: actualProps,
      newEvents: actualEvents,
      hasProps: hasProps,
      hasEvents: hasEvents
    }
  }

  mergeProps(stateProps, dispatchProps, ownProps) {
    return { ...ownProps, ...stateProps, ...dispatchProps }
  }

  // do mapping first time
  mapFirstCall(nextState, nextOwnProps) {
    this.state = nextState;
    this.ownProps = nextOwnProps;

    const { newProps, newEvents } = this.parseProps();
    this.props = newProps;
    this.events = newEvents;
    this.mergedProps = this.mergeProps(newProps, newEvents, nextOwnProps);

    this.hasRunAtLeastOnce = true;
    return this.mergedProps;
  }

  handleNewPropsAndNewState() {
    const { newProps, newEvents } = this.parseProps();
    this.props = newProps;
    this.events = newEvents;

    this.mergedProps = this.mergeProps(this.props, this.events, this.ownProps);
    return this.mergedProps
  }

  handleNewProps() {
    if (this.dependsOnOwnProps) {
      const { newProps, newEvents } = this.parseProps();
      this.props = newProps;
      this.events = newEvents;
    }

    this.mergedProps = this.mergeProps(this.props, this.events, this.ownProps);
    return this.mergedProps
  }

  handleNewState() {
    const { newProps, newEvents } = this.parseProps();
    const propsChanged = !this.areStatePropsEqual(newProps, this.props);
    this.props = newProps;

    //console.log("newPropsChanged", propsChanged)

    if (propsChanged)
      this.mergedProps = this.mergeProps(this.props, this.events, this.ownProps);

    return this.mergedProps
  }

  // do mapping subsequent times
  mapSubsequentCalls(nextState, nextOwnProps) {
    const propsChanged = !this.areOwnPropsEqual(nextOwnProps, this.ownProps);
    const stateChanged = !this.areStatesEqual(nextState, this.state);
    this.state = nextState;
    this.ownProps = nextOwnProps;

    //console.log("propsChanged", propsChanged)
    //console.log("stateChanged", stateChanged)

    if (propsChanged && stateChanged) return this.handleNewPropsAndNewState();
    if (propsChanged) return this.handleNewProps();
    if (stateChanged) return this.handleNewState();
    return this.mergedProps;
  }

  // overide this to do advanced mapping
  mapAdvanced(nextState, nextOwnProps, dispatch, options) {

    this.dispatch = dispatch;
    this.options = options;

    return this.hasRunAtLeastOnce
      ? this.mapSubsequentCalls(nextState, nextOwnProps)
      : this.mapFirstCall(nextState, nextOwnProps)
  }
}
