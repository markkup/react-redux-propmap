import { connect, connectAdvanced } from "react-redux"
import { bindActionCreators } from "redux"

class PropEvent {
  constructor(action) {
    this.action = action;
  }
}

export class PropMap {
  state = null;
  ownProps = null;
  map(props) {
  }
  bindEvent(action) {
    return new PropEvent(action);
  }
}

function selectorFactory(dispatch, opts) {
  var propMap = new opts.propMap();
  return (nextState, nextOwnProps) => {

    var props = {};
    propMap.state = nextState;
    propMap.ownProps = nextOwnProps;
    propMap.map(props);

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

    const finalEvents = bindActionCreators(actualEvents, dispatch);

    const result = { ...nextOwnProps, ...actualProps, ...finalEvents }
    return result;
  }
}

function connectProps(arg1, arg2, arg3, arg4) {
  return connectAdvanced(selectorFactory, {propMap: arg1});
}

export { connectProps as connectProps }
