import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PrimeReactProvider } from "primereact/api";
import { store } from "./app/store.js";
import App from "./App.jsx";

// PrimeReact: structural CSS (layout, no colors) + a theme closest to the
// app's existing green palette, so PrimeReact components (Toast, Dialog,
// Dropdown, DataTable, ...) look native here rather than dropped-in.
// globals.css loads last so our --primary/--surface tokens still win on
// anything we explicitly override.
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-green/theme.css";
import "remixicon/fonts/remixicon.css";
import "./styles/globals.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PrimeReactProvider value={{ ripple: true }}>
      <Provider store={store}>
        <App />
      </Provider>
    </PrimeReactProvider>
  </React.StrictMode>
);
