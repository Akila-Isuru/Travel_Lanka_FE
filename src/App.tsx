import React from "react";
import AuthRouter from "./routers/AuthRouter";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routers/AppRouter";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
