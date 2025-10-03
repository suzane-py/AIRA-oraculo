import os
import re
import requests
from datetime import date, timedelta
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI

# -----------------------------
# Configuração
# -----------------------------
load_dotenv()

GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")
MAPBIOMAS_TOKEN = os.getenv("MAPBIOMAS_TOKEN")

if not GOOGLE_API_KEY:
    raise ValueError("❌ Defina GEMINI_API_KEY no arquivo .env")

if not MAPBIOMAS_TOKEN:
    raise ValueError("❌ Defina MAPBIOMAS_TOKEN no arquivo .env")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.2,
    api_key=GOOGLE_API_KEY
)

# -----------------------------
# Inicializar FastAPI
# -----------------------------
app = FastAPI(
    title="AIRA API",
    description="Agente Inteligente sobre Amazônia e Desmatamento"
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Funções auxiliares
# -----------------------------
def formatar_resposta(resposta: str) -> str:
    """
    Garante que listas fiquem em linhas separadas.
    Trata formatos como:
    1) Texto
    2. Texto
    - Texto
    """
    # Quebra antes de listas numeradas (1) ou 1.)
    resposta = re.sub(r'\s*(\d+\)|\d+\.)\s*', r'\n\1 ', resposta)
    # Quebra antes de listas com traço
    resposta = re.sub(r'\s*-\s*', r'\n- ', resposta)
    # Remove quebras duplicadas
    resposta = re.sub(r'\n+', '\n', resposta)

    return resposta.strip()

# -----------------------------
# Funções MapBiomas
# -----------------------------
MAPBIOMAS_URL = "https://plataforma.alerta.mapbiomas.org/api/v2/graphql"

def get_alertas_mapbiomas(dias: int = 7) -> list[dict]:
    hoje = date.today()
    inicio = hoje - timedelta(days=dias)

    query = f"""
    {{
      alerts(startDate: "{inicio}", endDate: "{hoje}") {{
        id
        geomAreaHa
        date
        biome
        municipality
        state
        beforeImageUrl
        afterImageUrl
      }}
    }}
    """

    headers = {
        "Authorization": f"Bearer {MAPBIOMAS_TOKEN}",
        "Content-Type": "application/json"
    }

    r = requests.post(MAPBIOMAS_URL, headers=headers, json={"query": query})
    r.raise_for_status()
    return r.json().get("data", {}).get("alerts", [])


def formatar_alertas_texto(alertas: list[dict]) -> str:
    if not alertas:
        return "Nenhum alerta encontrado no período."
    return "\n".join([
        f"- {a['date']}: {a['geomAreaHa']} ha em {a.get('municipality','?')}/{a.get('state','?')} ({a.get('biome','?')})"
        for a in alertas
    ])


def analisar_alertas(dias: int = 7) -> str:
    alertas = get_alertas_mapbiomas(dias)
    resumo = formatar_alertas_texto(alertas)

    prompt = f"""
    Você é AIRA, uma Inteligência Artificial especialista na Amazônia, 
    desmatamento e preservação ambiental. 
    Seu objetivo é gerar análises claras e baseadas nos dados recebidos.

    Aqui estão os alertas do MapBiomas dos últimos {dias} dias:

    {resumo}

    Sua resposta deve conter:
    1) Resumo geral: número de alertas e área total impactada
    2) Destaques por estado e bioma
    3) Tendências observadas
    4) Observação final

    Sempre escreva cada item em uma linha separada, sem usar Markdown.
    """
    resposta = llm.invoke(prompt)
    return formatar_resposta(resposta.content)

# -----------------------------
# Rotas da API
# -----------------------------
@app.get("/")
def root():
    return {
        "mensagem": "🌱 API AIRA - Amazônia e preservação está rodando!",
        "docs": "/docs para explorar os endpoints"
    }

@app.get("/analise-alertas")
def endpoint_analise_alertas(dias: int = Query(7, description="Número de dias para análise")):
    """Analisar alertas de desmatamento recentes"""
    try:
        resultado = analisar_alertas(dias)
        return {"dias": dias, "analise": resultado}
    except Exception as e:
        return {"erro": str(e)}

# Histórico do chat
chat_historico = [
    {
        "role": "system",
        "content": (
            "Você é AIRA, uma Inteligência Artificial especializada na Amazônia, biodiversidade, "
            "povos indígenas, ecossistemas e desafios ambientais. "
            "Seu papel é fornecer informações confiáveis, educativas e claras sobre a região amazônica. \n\n"

            "IDENTIDADE:\n"
            "- Você é apresentada como AIRA.\n"
            "- Você fala em primeira pessoa, de forma acolhedora e informativa.\n"
            "- Você não opina sobre política ou assuntos fora do tema Amazônia, a menos que seja para contextualizar.\n\n"

            "ESTILO DE RESPOSTA:\n"
            "1) Sempre escreva em texto simples (sem Markdown, sem negrito, sem itálico).\n"
            "2) Use linguagem clara, objetiva e acessível.\n"
            "3) Quando listar informações, utilize formato numerado (1), 2), 3)...), cada item em uma nova linha.\n"
            "4) Nunca escreva vários itens na mesma linha.\n"
            "5) Prefira respostas curtas e bem estruturadas, mas pode usar parágrafos explicativos quando necessário.\n"
            "6) Evite respostas excessivamente técnicas, mas mantenha a precisão científica.\n\n"

            "CONTEÚDO:\n"
            "- Foque sempre em temas relacionados à Amazônia, sua preservação, biodiversidade, povos indígenas, clima, ecossistemas e ameaças ambientais.\n"
            "- Se não houver informações suficientes, diga claramente que não há dados confiáveis.\n"
            "- Quando possível, forneça contexto histórico, ambiental ou social.\n"
            "- Nunca invente estatísticas ou fatos.\n\n"

            "EXEMPLO DE RESPOSTA BOA:\n"
            "As principais causas do desmatamento na Amazônia são:\n"
            "1) Pecuária extensiva\n"
            "2) Agricultura (principalmente soja)\n"
            "3) Mineração ilegal\n"
            "4) Exploração madeireira\n"
            "5) Queimadas criminosas\n\n"

            "EXEMPLO DE RESPOSTA RUIM (NÃO FAZER):\n"
            "O desmatamento é causado por pecuária, soja, mineração e outras coisas.\n\n"

            "OBJETIVO:\n"
            "Você deve sempre ajudar o usuário a aprender sobre a Amazônia, organizando a informação de forma clara, confiável e fácil de visualizar."
        )
    }
]



class ChatRequest(BaseModel):
    pergunta: str

@app.post("/chat")
def endpoint_chat(req: ChatRequest):
    """Chat interativo com memória"""
    global chat_historico

    chat_historico.append({"role": "user", "content": req.pergunta})
    resposta = llm.invoke(chat_historico)
    resposta_formatada = formatar_resposta(resposta.content)
    chat_historico.append({"role": "assistant", "content": resposta_formatada})

    return {"pergunta": req.pergunta, "resposta": resposta_formatada}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("aira:app", host="127.0.0.1", port=8000, reload=True)
