from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage, BaseMessage
from langgraph.graph import add_messages
from langgraph.checkpoint.memory import MemorySaver
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


model = ChatOpenAI(model="gpt-4o-mini")


def chat_node(state: ChatState):
    messages = state["messages"]
    result = model.invoke(messages)
    return {"messages": [result]}


checkpointer = MemorySaver()
graph = StateGraph(ChatState)

graph.add_node("chat_node", chat_node)

graph.add_edge(START, "chat_node")
graph.add_edge("chat_node", END)

workflow = graph.compile(checkpointer=checkpointer)

thread_id="1"
config = {"configurable": {"thread_id":thread_id}}

@app.post("/chat")
def chat(req: ChatRequest):
    result = workflow.invoke({"messages": HumanMessage(req.messages)}, config=config)
    return {"messages": result["messages"][-1].content}
