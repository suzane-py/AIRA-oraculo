// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase-config";
import Login from "./pages/login";
import Cadastro from "./pages/cadastro";
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
          element={user ? <LoggedInScreen user={user} /> : <Login />} 
        />
        <Route 
          path="/cadastro" 
          element={user ? <LoggedInScreen user={user} /> : <Cadastro />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={user ? "/login" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

// Componente para mostrar quando o usuário já está logado
function LoggedInScreen({ user }) {
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="logged-in-container">
      <div className="logged-in-card">
        <h2>Você já está logado!</h2>
        <p>Bem-vindo, <strong>{user.email}</strong></p>
        <div className="logged-in-actions">
          <button onClick={handleLogout} className="logout-btn">
            Fazer Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;