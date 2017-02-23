jest.mock("redux")

import PropMap from "./PropMap"

class PropMapNoProps extends PropMap {
  map(props) {
  }
}

class PropMapOneProp extends PropMap {
  map(props) {
    props.prop1 = "prop1"
  }
}

class PropMapOneEvent extends PropMap {
  map(props) {
    props.event1 = this.bindEvent(this.event1)
  }
  event1() {}
}

class PropMapPropAndEvent extends PropMap {
  map(props) {
    props.prop1 = "prop1"
    props.event1 = this.bindEvent(this.event1)
  }
  event1() {}
}

test("map with empty prop", () => {
  let p = new PropMap();
  let props = {};
  p.map(props);
  expect(props).toBe(props);
})

test("map with one prop", () => {
  let p = new PropMapOneProp();
  let props = {};
  p.map(props);
  expect(props.prop1).toBe("prop1");
  expect(props).toBe(props);
})

test("map with one event", () => {
  let p = new PropMapOneEvent();
  let props = {};
  p.map(props);
  expect(props.event1.action).toBe(p.event1);
  expect(props).toBe(props);
})

test("map with prop and event", () => {
  let p = new PropMapPropAndEvent();
  let props = {};
  p.map(props);
  expect(props.prop1).toBe("prop1");
  expect(props.event1.action).toBe(p.event1);
  expect(props).toBe(props);
})

test("map/merge with prop and event", () => {
  let p = new PropMapPropAndEvent();
  let props = {
    prop2: "prop2"
  };
  p.map(props);
  expect(props.prop1).toBe("prop1");
  expect(props.prop2).toBe("prop2");
  expect(props.event1.action).toBe(p.event1);
  expect(props).toBe(props);
})

test("parseProps with prop and event", () => {
  let p = new PropMapPropAndEvent();
  let parsed = p.parseProps();
  expect(parsed.newProps.prop1).toBe("prop1");
  expect(parsed.newEvents.event1).toBe(parsed.newEvents.event1);
  expect(parsed.hasProps).toBe(true);
  expect(parsed.hasEvents).toBe(true);
})

test("parseProps with empty props", () => {
  let p = new PropMapNoProps();
  let parsed = p.parseProps();
  expect(Object.keys(parsed.newProps).length).toBe(0);
  expect(Object.keys(parsed.newEvents).length).toBe(0);
  expect(parsed.hasProps).toBe(false);
  expect(parsed.hasEvents).toBe(false);
})

test("mapAdvanced with empty state", () => {
  let p = new PropMapNoProps();
  let props = p.mapAdvanced({}, {}, null, {});
  expect(Object.keys(props).length).toBe(0);
})

test("mapAdvanced with prop and event", () => {
  let p = new PropMapPropAndEvent();
  let props = p.mapAdvanced({}, {}, null, {});
  expect(props.prop1).toBe("prop1");
  expect(props.event1).toBe(p.event1);
})


const stateWithProp = {
  stateprop1: "stateprop1"
}

const ownPropsWithProp1 = {
  id: "15"
}

const ownPropsWithProp2 = {
  id: "51"
}

class PropMapFromState extends PropMap {
  map(props) {
    props.prop1 = this.state.stateprop1;
    props.event1 = this.bindEvent(this.event1)
    props.ownprop1 = this.ownProps.id;
  }
  event1() {}
}

test("mapAdvanced w props based on state", () => {
  let p = new PropMapFromState();
  let state = stateWithProp;
  let ownProps = {};
  let props = p.mapAdvanced(state, ownProps, null, {});
  expect(props.prop1).toBe(stateWithProp.stateprop1);
  expect(props.event1).toBe(p.event1);
  expect(props).not.toBe(state);
})

test("mapAdvanced w props based on ownProps", () => {
  let p = new PropMapFromState();
  let state = stateWithProp;
  let ownProps = ownPropsWithProp1;
  let props = p.mapAdvanced(state, ownProps, null, {});
  expect(props.ownprop1).toBe(ownPropsWithProp1.id);
})

test("mapAdvanced no state change on 2nd call", () => {
  let p = new PropMapPropAndEvent();
  let state = {};
  let ownProps = {};
  let props1 = p.mapAdvanced(state, ownProps, null, {});
  let props2 = p.mapAdvanced(state, ownProps, null, {});
  expect(props1).toBe(props2);
})

test("mapAdvanced w state change on 2nd call w no props, ownProps change", () => {
  let p = new PropMapPropAndEvent();
  let state = {};
  let ownProps = {};
  let props1 = p.mapAdvanced(state, ownProps, null, {});
  let props2 = p.mapAdvanced({p: 1}, ownProps, null, {});
  expect(props1).toBe(props2);
})

test("mapAdvanced w state, props change on 2nd call w no ownProps change", () => {
  let p = new PropMapFromState();
  let state = stateWithProp;
  let ownProps = {};
  let props1 = p.mapAdvanced(state, ownProps, null, {});
  let props2 = p.mapAdvanced({p: 1}, ownProps, null, {});
  expect(props1).not.toBe(props2);
})

test("mapAdvanced w ownProps change on 2nd call w no state, props change and dependsOnOwnProps is false", () => {
  let p = new PropMapFromState();
  p.dependsOnOwnProps = false; // ownprop1 should NOT change
  let state = {};
  let props1 = p.mapAdvanced(state, ownPropsWithProp1, null, {});
  let props2 = p.mapAdvanced(state, ownPropsWithProp2, null, {});
  expect(props1).not.toBe(props2);
  expect(props2.ownprop1).toBe(ownPropsWithProp1.id);
})

test("mapAdvanced w ownProps change on 2nd call w no state, props change and dependsOnOwnProps is true", () => {
  let p = new PropMapFromState();
  p.dependsOnOwnProps = true; // ownprop1 should change
  let state = {};
  let props1 = p.mapAdvanced(state, ownPropsWithProp1, null, {});
  let props2 = p.mapAdvanced(state, ownPropsWithProp2, null, {});
  expect(props1).not.toBe(props2);
  expect(props2.ownprop1).toBe(ownPropsWithProp2.id);
})

test("mapAdvanced w state, props, ownProps change on 2nd call", () => {
  let p = new PropMapFromState();
  p.dependsOnOwnProps = true; // ownprop1 should change
  let state = stateWithProp;
  let props1 = p.mapAdvanced(state, ownPropsWithProp1, null, {});
  let props2 = p.mapAdvanced({p: 1}, ownPropsWithProp2, null, {});
  expect(props1).not.toBe(props2);
  expect(props2.ownprop1).toBe(ownPropsWithProp2.id);
  expect(props2.prop1).toBe(undefined);
  expect(props2.event1).toBe(p.event1);
})
