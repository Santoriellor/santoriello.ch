import { act, render } from "@testing-library/react";
import CodeRain from "./CodeRain";

// CodeRain drives its fall animation with a self-rescheduling
// requestAnimationFrame loop. Its cleanup calls
// cancelAnimationFrame(animate) — passing the callback where the frame id
// belongs — so cancelAnimationFrame silently does nothing and the loop
// survives unmount, calling setState on an unmounted component once per frame
// for as long as the page is open.
//
// A half-fix that captures only the *first* requestAnimationFrame id and
// never reassigns it also passes a naive "was cancelAnimationFrame called
// with a number" check, because the stale id is still a number — it is just
// the wrong number. To rule that out, this test drives one frame of the loop
// before unmounting (so the loop reschedules itself and a second, different
// id is handed out) and asserts cancelAnimationFrame is called with the
// *latest* id, not the first one.
test("the animation loop is cancelled on unmount, using the current frame id", () => {
  let nextId = 1;
  const scheduled = [];
  const raf = jest
    .spyOn(window, "requestAnimationFrame")
    .mockImplementation((cb) => {
      const id = nextId++;
      scheduled.push({ id, cb });
      return id;
    });
  const cancel = jest.spyOn(window, "cancelAnimationFrame");

  const { unmount } = render(<CodeRain />);

  expect(scheduled.length).toBe(1);
  const firstId = scheduled[0].id;

  // Drive the loop forward one frame: this invokes the loop's callback,
  // which (in a correct fix) reschedules itself and hands out a new id.
  act(() => {
    scheduled[0].cb();
  });

  expect(scheduled.length).toBe(2);
  const latestId = scheduled[scheduled.length - 1].id;
  expect(latestId).not.toBe(firstId);

  unmount();

  expect(cancel).toHaveBeenCalledWith(latestId);
  expect(cancel).not.toHaveBeenCalledWith(firstId);

  raf.mockRestore();
  cancel.mockRestore();
});

test("the drop interval is cleared on unmount", () => {
  const clear = jest.spyOn(window, "clearInterval");
  const { unmount } = render(<CodeRain />);
  unmount();

  expect(clear).toHaveBeenCalled();
  clear.mockRestore();
});
