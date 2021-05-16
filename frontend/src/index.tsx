import { render } from "preact";
import { cssRaw, cssRule } from "typestyle";
import { App } from "./app";

cssRaw(`
@import url("https://rsms.me/inter/inter.css");
@import url("https://cdn.jsdelivr.net/npm/modern-normalize/modern-normalize.min.css");
`);
cssRule("body", {
  fontFamily: "'Inter var', Inter, system-ui, sans-serif",
});
cssRule("#root", {
  color: "white",
  display: "flex",
  height: "100vh",
  width: "100vw",
});

render(<App />, document.getElementById("root")!);

// navigator.serviceWorker.register("/sw.js");
