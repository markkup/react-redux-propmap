import PropEvent from "./PropEvent"

test("pass action to constructor", () => {
  let arg = "arg";
  let t = new PropEvent(arg);
  expect(t.action).toBe(arg);
})