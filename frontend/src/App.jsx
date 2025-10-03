// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase-config";

import Login from "./pages/login";
import Cadastro from "./pages/cadastro";
import AiraInterface from "./pages/AiraInterface";

import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/aira" /> : <Login />}
        />
        <Route
          path="/cadastro"
          element={user ? <Navigate to="/aira" /> : <Cadastro />}
        />
        <Route
          path="/aira"
          element={user ? <AiraInterface /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={user ? "/aira" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
