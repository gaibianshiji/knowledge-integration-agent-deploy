import fitz
import re
import os
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent / "data" / "parsed"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def parse_pdf(file_path: str, textbook_id: str) -> dict:
    doc = fitz.open(file_path)
    filename = os.path.basename(file_path)

    # Known textbook name mapping (by filename prefix)
    TEXTBOOK_NAMES = {
        '01': '局部解剖学',
        '02': '组织学与胚胎学',
        '03': '生理学',
        '04': '医学微生物学',
        '05': '病理学',
        '06': '传染病学',
        '07': '病理生理学'
    }

    # Try to get title from filename prefix
    title = None
    for prefix, name in TEXTBOOK_NAMES.items():
        # Check if filename starts with number prefix (e.g., "01_", "02_")
        if filename[:2] == prefix and (len(filename) > 2 and filename[2] in ['_', '-', ' ']):
            title = name
            break

    # If not found in mapping, try to extract from PDF content
    if not title:
        for page_num in range(min(5, len(doc))):
            page_text = doc[page_num].get_text("text")
            lines = page_text.strip().split('\n')
            for line in lines[:15]:
                line = line.strip()
                # Look for Chinese title (typically 2-15 characters, no special chars)
                if len(line) >= 2 and len(line) <= 15 and not line.isdigit():
                    if any('一' <= c <= '鿿' for c in line):
                        # Skip lines with pipes, dashes, or author info
                        if '|' not in line and '—' not in line and '主' not in line and '编' not in line and '版' not in line and '京' not in line:
                            title = line
                            break
            if title:
                break

    if not title:
        title = Path(filename).stem

    total_pages = len(doc)

    chapters = []
    current_chapter = None
    current_content = []
    chapter_idx = 0

    chapter_pattern = re.compile(r'^(第[一二三四五六七八九十百千\d]+[章节篇])[　\s]*(.*)')

    for page_num in range(total_pages):
        page = doc[page_num]
        text = page.get_text("text")

        text = re.sub(r'^.{0,30}(目\s*录|CONTENTS?).{0,30}$', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\d+\s*$', '', text, flags=re.MULTILINE)
        text = re.sub(r'^[-–—]+\s*\d+\s*[-–—]*$', '', text, flags=re.MULTILINE)

        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            match = chapter_pattern.match(line)
            if match:
                if current_chapter and current_content:
                    content = '\n'.join(current_content).strip()
                    if len(content) > 100:
                        chapters.append({
                            "chapter_id": f"ch_{chapter_idx:02d}",
                            "title": current_chapter,
                            "page_start": current_chapter_page,
                            "page_end": page_num,
                            "content": content,
                            "char_count": len(content)
                        })
                        chapter_idx += 1
                current_chapter = line
                current_chapter_page = page_num + 1
                current_content = []
            else:
                if line and len(line) > 5:
                    current_content.append(line)

    if current_chapter and current_content:
        content = '\n'.join(current_content).strip()
        if len(content) > 100:
            chapters.append({
                "chapter_id": f"ch_{chapter_idx:02d}",
                "title": current_chapter,
                "page_start": current_chapter_page,
                "page_end": total_pages,
                "content": content,
                "char_count": len(content)
            })

    if not chapters:
        content = ""
        for page_num in range(min(total_pages, 50)):
            page = doc[page_num]
            content += page.get_text("text") + "\n"
        chapters.append({
            "chapter_id": "ch_00",
            "title": f"{title} 全文",
            "page_start": 1,
            "page_end": min(total_pages, 50),
            "content": content.strip(),
            "char_count": len(content.strip())
        })

    total_chars = sum(ch["char_count"] for ch in chapters)

    textbook = {
        "textbook_id": textbook_id,
        "filename": filename,
        "title": title,
        "total_pages": total_pages,
        "total_chars": total_chars,
        "chapters": chapters
    }

    output_path = DATA_DIR / f"{textbook_id}.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(textbook, f, ensure_ascii=False, indent=2)

    doc.close()
    return textbook

def get_parsed_textbook(textbook_id: str) -> dict | None:
    path = DATA_DIR / f"{textbook_id}.json"
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def list_parsed_textbooks() -> list[dict]:
    result = []
    for path in DATA_DIR.glob("*.json"):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            result.append({
                "textbook_id": data["textbook_id"],
                "filename": data["filename"],
                "title": data["title"],
                "total_pages": data["total_pages"],
                "total_chars": data["total_chars"],
                "chapter_count": len(data["chapters"])
            })
    return result
