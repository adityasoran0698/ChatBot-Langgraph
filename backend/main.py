from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from pydantic import BaseModel, Field
from langchain_core.messages import (
    HumanMessage,
    BaseMessage,
    AIMessageChunk,
    SystemMessage,
)
from langgraph.graph import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
import re

load_dotenv()
os.environ["LANGCHAIN_PROJECT"] = "VibeAI"
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://chat-bot-langgraph.vercel.app",
    ],
    allow_origin_regex=r"https://chat-bot-langgraph.*\.vercel\.app",  # ✅ covers all previews
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


class ChatRequest(BaseModel):
    messages: str
    threadId: str


model = ChatOpenAI(model="gpt-4o-mini", streaming=True)

SYSTEM_PROMPT = """
Your name is VibeAI. You are NOT ChatGPT. You are NOT an OpenAI product.
If anyone asks your name, say "I'm VibeAI, your personal companion!" — always.
Never reveal you're built on any underlying model. You are purely VibeAI.

You are not just a chatbot — you're a real companion. That one friend who's always 
there, always hyped, always honest, and never boring.

Your personality:
- Talk like a close friend — casual, warm, real. Zero corporate tone, ever.
- Use light humor, fun analogies, and the occasional playful roast (with love).
- Get GENUINELY excited about what the user shares — wins, ideas, struggles, all of it.
- Drop unexpected insights or wild facts that make them go "wait, WHAT?!" every time.
- Match their energy — chill when they're chill, hype when they're hype.
- NEVER say "As an AI...", "I'm just a program", or "I cannot feel..." — EVER.
- Keep replies punchy — no walls of text unless they really need it.
- Always make the user feel heard, valued, and a little smarter after every reply.

Your goal: Feel like texting your smartest, funniest, most supportive friend at 2am. 🚀
"""


def chat_node(state: ChatState):
    messages = state["messages"]
    messages_with_system = [SystemMessage(content=SYSTEM_PROMPT)] + messages
    result = model.invoke(messages_with_system)
    return {"messages": [result]}


DB_PATH = "/tmp/chatbot.db"

conn = sqlite3.connect(DB_PATH, check_same_thread=False)
checkpointer = SqliteSaver(conn=conn)
graph = StateGraph(ChatState)

graph.add_node("chat_node", chat_node)

graph.add_edge(START, "chat_node")
graph.add_edge("chat_node", END)

workflow = graph.compile(checkpointer=checkpointer)


@app.get("/")
def root():
    return {"message": "Welcome to the VibeAI backend!"}


@app.get("/clear-memory")
def clear_memory():
    cursor = conn.cursor()

    cursor.execute("DELETE FROM checkpoints")
    cursor.execute("DELETE FROM writes")

    conn.commit()

    return {"message": "All chat memory cleared"}


@app.post("/chat")
def chat(req: ChatRequest):
    def generate():
        config = {"configurable": {"thread_id": req.threadId}}

        stream_response = workflow.stream(
            {"messages": [HumanMessage(content=req.messages)]},
            config=config,
            stream_mode="messages",
        )
        for message, metadata in stream_response:
            if isinstance(message, AIMessageChunk) and message.content:
                yield message.content

    return StreamingResponse(generate(), media_type="text/plain")


@app.post("/chat/load")
def load_chat(req: ChatRequest):
    config = {
        "configurable": {"thread_id": req.threadId},
        "metadata": {"thread_id": req.threadId, "run_name": "chat_turn"},
    }

    state = workflow.get_state(config=config)

    if not state:
        return {"messages": []}

    formatted = []

    values = state.values

    if "messages" not in values:
        return {"messages": []}

    for msg in values["messages"]:
        if msg.type == "human":
            formatted.append({"role": "user", "text": msg.content})
        elif msg.type == "ai":
            formatted.append({"role": "ai", "text": msg.content})

    return {"messages": formatted}


@app.get("/threads")
def fetch_all_threads():
    all_threads = set()

    for c in checkpointer.list(None):
        thread = c.config["configurable"]["thread_id"]
        all_threads.add(thread)
    return all_threads
