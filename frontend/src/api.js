const API_URL = "http://127.0.0.1:8000"; // backend FastAPI

export async function getAlertas(dias = 7) {
  const res = await fetch(`${API_URL}/analise-alertas?dias=${dias}`);
  if (!res.ok) throw new Error("Erro ao buscar alertas");
  return res.json();
}

export async function chatAira(pergunta) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pergunta }),
  });
  if (!res.ok) throw new Error("Erro no chat da AIRA");
  return res.json();
}
