from pydantic import BaseModel
from typing import Optional

class Chapter(BaseModel):
    chapter_id: str
    title: str
    page_start: int
    page_end: int
    content: str
    char_count: int

class Textbook(BaseModel):
    textbook_id: str
    filename: str
    title: str
    total_pages: int
    total_chars: int
    chapters: list[Chapter]

class KnowledgeNode(BaseModel):
    id: str
    name: str
    definition: str
    category: str
    chapter: str
    page: int
    textbook_id: str
    textbook_name: str

class KnowledgeRelation(BaseModel):
    source: str
    target: str
    relation_type: str
    description: str

class IntegrationDecision(BaseModel):
    decision_id: str
    action: str
    affected_nodes: list[str]
    result_node: str
    reason: str
    confidence: float

class RAGQuery(BaseModel):
    question: str

class RAGResponse(BaseModel):
    answer: str
    citations: list[dict]
    source_chunks: list[str]

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
