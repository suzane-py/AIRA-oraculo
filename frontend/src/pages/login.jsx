// src/pages/Login.jsx
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config.js";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { useState } from "react";
import styles from "./login.module.css"; // ✅ agora usando CSS Module

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Erro no login:", error.message);
      setError("Falha no login: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro no login com Google:", error.message);
      setError("Falha no login com Google: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginFormContainer}>
        <h2>Faça login</h2>
        {error && <div className={styles.loginErrorMessage}>{error}</div>}
        <form onSubmit={handleEmailLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? "Carregando..." : "Entrar"}
          </button>
        </form>
        <div className={styles.loginDivider}>OU</div>
        <div className={styles.loginOptions}>
          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            type="button"
          >
            <FcGoogle size={20} />
            <span>Google</span>
          </button>
          <button disabled={loading} type="button">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" width={20} />
            <span>Apple</span>
          </button>
        </div>
        <p className={styles.loginText}>
          Não tem uma conta? <Link to="/cadastro">Faça cadastro</Link>
        </p>
      </div>
      <div className={styles.loginSideText}>
        <div className={styles.loginLetter2}>
          <span className={styles.loginLetter}>A</span>
          <span>mazônia</span>
        </div>
        <div className={styles.loginLetter2}>
          <span className={styles.loginLetter}>I</span>
          <span>nteligente com</span>
        </div>
        <div className={styles.loginLetter2}>
          <span className={styles.loginLetter}>R</span>
          <span>ecursos de</span>
        </div>
        <div className={styles.loginLetter2}>
          <span className={styles.loginLetter}>A</span>
          <span>nálise</span>
        </div>
      </div>
    </div>
  );
}
