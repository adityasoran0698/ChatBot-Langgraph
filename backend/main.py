from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage, BaseMessage, AIMessageChunk
from langgraph.graph import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
)


class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


class ChatRequest(BaseModel):
    messages: str
    threadId: str


model = ChatOpenAI(model="gpt-4o-mini", streaming=True)


def chat_node(state: ChatState):
    messages = state["messages"]
    result = model.invoke(messages)
    return {"messages": [result]}


conn = sqlite3.connect(database="chatbot.db", check_same_thread=False)
checkpointer = SqliteSaver(conn=conn)
graph = StateGraph(ChatState)

graph.add_node("chat_node", chat_node)

graph.add_edge(START, "chat_node")
graph.add_edge("chat_node", END)

workflow = graph.compile(checkpointer=checkpointer)


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
    config = {"configurable": {"thread_id": req.threadId}}

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
