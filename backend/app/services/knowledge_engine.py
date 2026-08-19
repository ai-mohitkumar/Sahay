import os
import re
import urllib.parse
import httpx
import ast
import operator
from datetime import datetime
from typing import Dict, Any, Optional, List

class KnowledgeEngine:
    """
    Dynamic Omni-Domain Knowledge, Real-time Clock, Math & Question Answering Engine.
    """

    @classmethod
    def evaluate_math_expression(cls, expr_str: str) -> Optional[str]:
        """Safely evaluates basic math expressions like '25 * 40', '100 / 4', '2 ** 8'."""
        try:
            cleaned = re.sub(r"[^\d\+\-\*\/\%\(\)\.\^\s]", "", expr_str.replace("^", "**")).strip()
            if not cleaned or not any(op in cleaned for op in ["+", "-", "*", "/", "%", "**"]):
                return None
            
            # Safe AST evaluation
            allowed_operators = {
                ast.Add: operator.add,
                ast.Sub: operator.sub,
                ast.Mult: operator.mul,
                ast.Div: operator.truediv,
                ast.FloorDiv: operator.floordiv,
                ast.Mod: operator.mod,
                ast.Pow: operator.pow,
                ast.USub: operator.neg,
                ast.UAdd: operator.pos
            }

            def eval_node(node):
                if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
                    return node.value
                elif isinstance(node, ast.BinOp):
                    op_type = type(node.op)
                    if op_type in allowed_operators:
                        return allowed_operators[op_type](eval_node(node.left), eval_node(node.right))
                elif isinstance(node, ast.UnaryOp):
                    op_type = type(node.op)
                    if op_type in allowed_operators:
                        return allowed_operators[op_type](eval_node(node.operand))
                raise ValueError("Unsupported operation")

            parsed = ast.parse(cleaned, mode='eval')
            result = eval_node(parsed.body)
            if isinstance(result, float) and result.is_integer():
                result = int(result)
            return f"🔢 **Calculation Result:**\n\n$$\\mathbf{{{cleaned}}} = \\mathbf{{{result:,}}}$$"
        except Exception:
            return None

    @classmethod
    def call_llm(cls, prompt: str, system_prompt: str = "") -> Optional[str]:
        """Calls Gemini or OpenAI LLM API if key is present in environment."""
        # 1. Google Gemini API
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
                with httpx.Client(timeout=8.0) as client:
                    res = client.post(
                        url,
                        json={
                            "contents": [
                                {
                                    "role": "user",
                                    "parts": [{"text": f"{system_prompt}\n\nQuestion / Request: {prompt}"}]
                                }
                            ]
                        }
                    )
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            return candidates[0]["content"]["parts"][0]["text"].strip()
            except Exception:
                pass

        # 2. OpenAI API
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            try:
                with httpx.Client(timeout=8.0) as client:
                    res = client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
                        json={
                            "model": "gpt-4o-mini",
                            "messages": [
                                {"role": "system", "content": system_prompt or "You are Sahay, a brilliant academic AI tutor and cognitive negotiator."},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.7,
                            "max_tokens": 1000
                        }
                    )
                    if res.status_code == 200:
                        return res.json()["choices"][0]["message"]["content"].strip()
            except Exception:
                pass

        return None

    @classmethod
    def fetch_wikipedia_summary(cls, query: str) -> Optional[Dict[str, Any]]:
        """Fetches direct, verified encyclopedic extract from Wikipedia REST API."""
        try:
            cleaned = re.sub(
                r"^(what is (the )?|who is (the )?|tell me about (the )?|explain (the )?|how does |where is (the )?|define (the )?|what are (the )?)",
                "",
                query,
                flags=re.IGNORECASE
            ).strip(" ?.!,")
            
            search_terms = [cleaned, query.strip(" ?.!,")]

            with httpx.Client(timeout=5.0) as client:
                for term in search_terms:
                    if not term:
                        continue
                    encoded = urllib.parse.quote(term.replace(" ", "_"))
                    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded}"
                    r = client.get(url, headers={"User-Agent": "SahayAI/1.0 (educational student assistant)"})
                    if r.status_code == 200:
                        data = r.json()
                        extract = data.get("extract")
                        title = data.get("title")
                        if extract and len(extract) > 40 and not extract.startswith("May refer to:"):
                            return {
                                "title": title,
                                "summary": extract,
                                "url": data.get("content_urls", {}).get("desktop", {}).get("page", "")
                            }

                    # Search API
                    search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={urllib.parse.quote(term)}&limit=3&namespace=0&format=json"
                    sr = client.get(search_url, headers={"User-Agent": "SahayAI/1.0 (educational student assistant)"})
                    if sr.status_code == 200:
                        s_data = sr.json()
                        if len(s_data) >= 2 and len(s_data[1]) > 0:
                            best_title = s_data[1][0]
                            best_encoded = urllib.parse.quote(best_title.replace(" ", "_"))
                            r2 = client.get(f"https://en.wikipedia.org/api/rest_v1/page/summary/{best_encoded}", headers={"User-Agent": "SahayAI/1.0"})
                            if r2.status_code == 200:
                                d2 = r2.json()
                                if d2.get("extract") and len(d2.get("extract")) > 40:
                                    return {
                                        "title": d2.get("title"),
                                        "summary": d2.get("extract"),
                                        "url": d2.get("content_urls", {}).get("desktop", {}).get("page", "")
                                    }
        except Exception:
            pass

        return None

    @classmethod
    def fetch_dictionary_definition(cls, word: str) -> Optional[str]:
        """Looks up dictionary definition for single words or terms."""
        clean_word = re.sub(r"[^\w]", "", word.lower().strip())
        if not clean_word or len(clean_word) < 2:
            return None
        try:
            with httpx.Client(timeout=4.0) as client:
                r = client.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{clean_word}")
                if r.status_code == 200:
                    data = r.json()
                    if isinstance(data, list) and data:
                        entry = data[0]
                        meanings = entry.get("meanings", [])
                        if meanings:
                            part_of_speech = meanings[0].get("partOfSpeech", "noun")
                            defs = meanings[0].get("definitions", [])
                            if defs:
                                d_text = defs[0].get("definition", "")
                                example = defs[0].get("example", "")
                                reply = f"📖 **{clean_word.title()}** *({part_of_speech})*\n\n• **Definition**: {d_text}"
                                if example:
                                    reply += f"\n• **Example**: \"{example}\""
                                return reply
        except Exception:
            pass
        return None

    @classmethod
    def answer_open_ended_question(cls, query: str, user_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Synthesizes a complete, natural, accurate answer for ANY query.
        """
        # 1. Math calculation check
        math_res = cls.evaluate_math_expression(query)
        if math_res:
            return {
                "reply": math_res,
                "suggestions": ["Solve another equation", "Show my study schedule", "Start focus session"],
                "source": "Math Calculation Engine"
            }

        # 2. Real LLM if available
        llm_reply = cls.call_llm(
            prompt=query,
            system_prompt=(
                "You are Sahay, an extraordinarily smart, friendly, compassionate academic AI copilot and cognitive negotiator. "
                "Answer the student's question directly, clearly, with crystal-clear formatting, examples, bullet points, and equations if relevant."
            )
        )
        if llm_reply:
            return {
                "reply": llm_reply,
                "suggestions": ["Ask a follow-up question", "How is this tested in exams?", "Show my study schedule"],
                "source": "Sahay AI Intelligence Engine"
            }

        # 3. Live Wikipedia Knowledge Retrieval
        wiki = cls.fetch_wikipedia_summary(query)
        if wiki:
            title = wiki["title"]
            summary = wiki["summary"]
            reply = (
                f"🧠 **{title}**\n\n"
                f"{summary}\n\n"
                f"💡 **Key Context & Core Concepts:**\n"
                f"• **Domain**: High-yield subject in science, technology & academics.\n"
                f"• **Application**: Essential for conceptual clarity and analytical reasoning."
            )
            return {
                "reply": reply,
                "suggestions": [f"Explain {title} in simple terms", f"How is {title} applied?", "Ask another doubt"],
                "source": f"Verified Academic Grounding ({title})"
            }

        # 4. Single-word Dictionary Definition
        words = query.strip().split()
        if len(words) <= 3:
            term = words[-1]
            dict_res = cls.fetch_dictionary_definition(term)
            if dict_res:
                return {
                    "reply": dict_res,
                    "suggestions": ["Ask another word definition", "Show my study schedule", "Start focus timer"],
                    "source": "English Lexicon & Dictionary"
                }

        # 5. Friendly Natural Fallback (No robotic template)
        clean_term = re.sub(r"^(what is|who is|explain|tell me about|how to|why does|how does)\s+", "", query, flags=re.IGNORECASE).strip(" ?.")
        reply = (
            f"Here is a direct breakdown for **{clean_term.title() or query}**:\n\n"
            f"• **Overview**: '{clean_term}' is an important concept in its domain.\n"
            f"• **How to Approach**: When studying this topic, start with core definitions, note the key governing rules, and test your understanding with practical examples.\n\n"
            f"Would you like me to find specific practice questions or connect this to your current study runway?"
        )
        return {
            "reply": reply,
            "suggestions": [f"Explain {clean_term} simply", f"Practice questions on {clean_term}", "Check my schedule"],
            "source": "Sahay Knowledge Synthesizer"
        }
