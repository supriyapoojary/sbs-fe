import React from "react";
import { Provider } from "react-redux";
import store from "./store/Store";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.scss";
import "./App.scss";

// App is the root — only Provider and routing live here.
// All layout, pages, and toasts are handled inside AppRoutes.
const App = () => (
    <Provider store={store}>
        <AppRoutes />
    </Provider>
);

export default App;
