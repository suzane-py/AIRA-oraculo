// src/pages/Cadastro.jsx
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config.js";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { useState } from "react";
import styles from "./Cadastro.module.css"; // ✅ agora usando CSS Module

export default function Cadastro() {
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    dataNascimento: "",
    email: "",
    senha: "",
    confirmarSenha: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem");
      return false;
    }
    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }

    const today = new Date();
    const birthDate = new Date(formData.dataNascimento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 13) {
      setError("Você deve ter pelo menos 13 anos para se cadastrar");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
    } catch (error) {
      console.error("Erro no cadastro:", error.message);
      setError("Erro no cadastro: " + error.message);
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
      console.error("Erro no cadastro com Google:", error.message);
      setError("Erro no cadastro com Google: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.cadastroContainer}>
      <div className={styles.cadastroFormContainer}>
        <h2>Crie sua conta</h2>
        {error && <div className={styles.cadastroErrorMessage}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.cadastroNameFields}>
            <input
              type="text"
              name="nome"
              placeholder="Nome"
              value={formData.nome}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="text"
              name="sobrenome"
              placeholder="Sobrenome"
              value={formData.sobrenome}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <input
            type="date"
            name="dataNascimento"
            value={formData.dataNascimento}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="password"
            name="senha"
            placeholder="Senha"
            value={formData.senha}
            onChange={handleChange}
            required
            disabled={loading}
            minLength={6}
          />
          <input
            type="password"
            name="confirmarSenha"
            placeholder="Confirmar Senha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            required
            disabled={loading}
            minLength={6}
          />
          <button type="submit" className={styles.cadastroBtn} disabled={loading}>
            {loading ? "Carregando..." : "Cadastrar"}
          </button>
        </form>
        <div className={styles.cadastroDivider}>OU</div>
        <div className={styles.cadastroOptions}>
          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            type="button"
          >
            <FcGoogle size={20} />
            <span>Cadastrar com Google</span>
          </button>
          <button disabled={loading} type="button">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" width={20} />
            <span>Cadastrar com Apple</span>
          </button>
        </div>
        <p className={styles.cadastroText}>
          Já possui uma conta? <Link to="/login">Faça Login</Link>
        </p>
      </div>
      <div className={styles.cadastroSideText}>
        <div className={styles.cadastroLetter2}>
          <span className={styles.cadastroLetter}>A</span>
          <span>mazônia</span>
        </div>
        <div className={styles.cadastroLetter2}>
          <span className={styles.cadastroLetter}>I</span>
          <span>nteligente com</span>
        </div>
        <div className={styles.cadastroLetter2}>
          <span className={styles.cadastroLetter}>R</span>
          <span>ecursos de</span>
        </div>
        <div className={styles.cadastroLetter2}>
          <span className={styles.cadastroLetter}>A</span>
          <span>nálise</span>
        </div>
      </div>
    </div>
  );
}
