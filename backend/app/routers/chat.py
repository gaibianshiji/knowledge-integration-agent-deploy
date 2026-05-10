from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm_service import call_deepseek
from app.services.integration_service import get_integration_result, adjust_decision

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []

@router.post("/message")
async def chat_message(request: ChatRequest):
    integration = get_integration_result()

    context = ""
    if integration:
        stats = integration.get("stats", {})
        decisions = integration.get("decisions", [])[:10]
        context = f"\n当前整合状态：共{stats.get('original', 0)}个知识点，整合后{stats.get('merged', 0)}个，{stats.get('decisions_count', 0)}项决策。"
        if decisions:
            context += "\n最近的整合决策：\n"
            for d in decisions:
                context += f"- {d['action']}: {d['reason']}\n"

    system_prompt = f"""你是一个学科知识整合助手，帮助教师理解和调整教材整合方案。
你可以：
1. 解释整合决策的原因
2. 根据教师反馈调整整合方案
3. 回答关于知识图谱和教材内容的问题
{context}
请用专业但易懂的语言回答。"""

    response = await call_deepseek(request.message, system_prompt)

    return {
        "response": response,
        "role": "assistant"
    }

@router.post("/adjust")
async def adjust_integration(decision_id: str, action: str, reason: str):
    result = await adjust_decision(decision_id, action, reason)
    return result
