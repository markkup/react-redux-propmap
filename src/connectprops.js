import { connect, connectAdvanced } from "react-redux"
import PropMap from "./PropMap"

function selectorFactory(dispatch, opts) {

  return (nextState, nextOwnProps) => {

    // instantiate propmap class
    var propMap = new opts.propMap(nextState, nextOwnProps, dispatch, opts);

    // have class map properties
    return propMap.mapAdvanced(nextState, nextOwnProps, dispatch, opts);
  }
}

export default function connectprops(propMap) {
  return connectAdvanced(selectorFactory, {propMap: propMap});
}
