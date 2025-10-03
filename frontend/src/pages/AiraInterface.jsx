import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import styles from "./AiraInterface.module.css";

export default function AiraInterface() {
  const [chats, setChats] = useState([]);
  const [currentChatIndex, setCurrentChatIndex] = useState(0);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [savedQueries, setSavedQueries] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const messages = chats[currentChatIndex] || [];

  // 🔽 Scroll sempre pro final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 📎 Upload de arquivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  // ✉️ Enviar mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !selectedFile) || isLoading) return;

    const userMessage = inputMessage.trim()
      ? {
          id: messages.length + 1,
          text: inputMessage,
          sender: "user",
          timestamp: new Date(),
        }
      : null;

    // Atualiza chat local
    let updatedChats;
    if (chats[currentChatIndex]) {
      updatedChats = [...chats];
      updatedChats[currentChatIndex] = [
        ...messages,
        ...(userMessage ? [userMessage] : []),
      ];
    } else {
      updatedChats = [[...(userMessage ? [userMessage] : [])]];
      setCurrentChatIndex(chats.length);
    }
    setChats(updatedChats);

    // Salvar consulta
    if (userMessage) {
      const alreadyHasUserMessage = messages.some((m) => m.sender === "user");
      if (!alreadyHasUserMessage) {
        setSavedQueries((prev) => [inputMessage, ...prev.slice(0, 9)]);
      }
    }

    // Reset input
    setInputMessage("");
    setSelectedFile(null);
    setIsLoading(true);

    try {
      // 👉 chamada ao backend FastAPI
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: userMessage.text }),
      });

      if (!res.ok) throw new Error("Erro ao conectar com o backend");
      const data = await res.json();

      // Mensagem da IA
      const aiMessage = {
        id: (updatedChats[currentChatIndex]?.length || 0) + 1,
        text: data.resposta,
        sender: "ai",
        timestamp: new Date(),
      };

      const updatedChats2 = [...updatedChats];
      updatedChats2[currentChatIndex] = [
        ...(updatedChats2[currentChatIndex] || []),
        aiMessage,
      ];
      setChats(updatedChats2);
    } catch (error) {
      console.error(error);
      setChats((prev) => {
        const updated = [...prev];
        updated[currentChatIndex] = [
          ...(updated[currentChatIndex] || []),
          {
            id: (updated[currentChatIndex]?.length || 0) + 1,
            text: "⚠️ Erro ao falar com o servidor.",
            sender: "ai",
            timestamp: new Date(),
          },
        ];
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // ➕ Novo chat
  const handleNewChat = () => {
    setChats((prev) => [...prev, []]);
    setCurrentChatIndex(chats.length);
    setIsMenuOpen(false);
  };

  // 👤 Usuário autenticado
  const user = auth.currentUser;
  const userName = user?.displayName || user?.email?.split("@")[0] || "Usuário";
  const userInitial = userName.charAt(0).toUpperCase();
  const userPhotoURL = user?.photoURL;

  return (
    <div className={styles["aira-interface"]}>
      {/* Menu Lateral - Sempre overlay */}
      {isMenuOpen && (
        <div
          className={styles["sidebar-overlay"]}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div
        className={`${styles.sidebar} ${
          isMenuOpen ? styles["sidebar-open"] : ""
        }`}
      >
        <div className={styles["sidebar-header"]}>
          <div className={styles["user-info"]}>
            <div className={styles["user-avatar"]}>
              {userPhotoURL ? (
                <img
                  src={userPhotoURL}
                  alt={userName}
                  className={styles["user-avatar-img"]}
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            <div className={styles["user-details"]}>
              <div className={styles["user-name"]}>{userName}</div>
              <div className={styles["user-email"]}>{user?.email}</div>
            </div>
          </div>
          <button
            className={styles["close-menu"]}
            onClick={() => setIsMenuOpen(false)}
          >
            <span>×</span>
          </button>
        </div>

        <nav className={styles["sidebar-nav"]}>
          <button className={styles["nav-item"]} onClick={handleNewChat}>
            <span className={styles["nav-icon"]}>+</span>
            Novo Chat
          </button>

          <div className={styles["saved-queries"]}>
            <h3>Chats Recentes</h3>
            {savedQueries.length === 0 ? (
              <p className={styles["no-queries"]}>Nenhuma conversa ainda</p>
            ) : (
              <ul>
                {savedQueries.map((query, index) => (
                  <li key={index} className={styles["query-item"]}>
                    {query}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        <div className={styles["sidebar-footer"]}>
          <button onClick={handleLogout} className={styles["logout-btn"]}>
            <span className={styles["logout-icon"]}>↩</span>
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className={styles["main-content"]}>
        <header className={styles["aira-header"]}>
          <div className={styles["header-left"]}>
            <button
              className={styles["menu-button"]}
              onClick={() => setIsMenuOpen(true)}
            >
              <span>☰</span>
            </button>
            <div className={styles["header-title"]}>
              <h1>AIRA</h1>
              <span>Amazonia Inteligente com Recursos de Análise</span>
            </div>
          </div>
          <div className={styles["header-logo"]}>
            <img src="/fortos.png" alt="Logo" />
          </div>
        </header>

        <div className={styles["chat-area"]}>
          <div className={styles["messages-container"]}>
            {messages.length === 0 ? (
              <div className={styles["empty-chat"]}>
                <h3>Bem-vindo ao AIRA</h3>
                <p>Como posso ajudar você hoje?</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${styles[message.sender]}`}
                >
                  {message.sender === "ai" && (
                    <div className={styles["message-avatar"]}>
                      <span>AI</span>
                    </div>
                  )}
                  <div className={styles["message-content"]}>
                    <div className={styles["message-text"]}>{message.text}</div>
                    <div className={styles["message-time"]}>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {message.sender === "user" && (
                    <div className={styles["message-avatar"]}>
                      {userPhotoURL ? (
                        <img
                          src={userPhotoURL}
                          alt={userName}
                          className={styles["user-avatar-img"]}
                        />
                      ) : (
                        <span>VC</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className={`${styles.message} ${styles.ai}`}>
                <div className={styles["message-avatar"]}>
                  <span>AI</span>
                </div>
                <div className={styles["message-content"]}>
                  <div className={styles["typing-indicator"]}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Área de Input */}
          <form onSubmit={handleSendMessage} className={styles["input-area"]}>
            <div className={styles["input-container"]}>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className={styles["attach-button"]}
              >
                📎
              </button>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className={styles["message-input"]}
              />

              <button
                type="submit"
                disabled={(!inputMessage.trim() && !selectedFile) || isLoading}
                className={styles["send-button"]}
              >
                <span className={styles["send-icon"]}>↑</span>
              </button>
            </div>

            {selectedFile && (
              <div className={styles["file-preview"]}>
                <span>📎 {selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className={styles["remove-file"]}
                >
                  ×
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
