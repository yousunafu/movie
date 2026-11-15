#!/usr/bin/env python3
"""効果音ラボ (soundeffect-lab.info) から効果音を取得して assets/se/ (効果音の倉庫) に保存する。
書き出しに使う音だけ `npm run se` (または npm run check) で public/se/ へ自動コピーされる。

使い方:
  python3 scripts/fetch-se.py --dry-run     # 件数だけ数える
  python3 scripts/fetch-se.py               # ダウンロード実行

ライセンス: 効果音ラボは商用利用可・クレジット表記不要 (報告不要)。
"""
import argparse
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://soundeffect-lab.info"
CATEGORIES = {
    "anime": "演出・アニメ",
    "various": "生活・人物",
    "battle": "戦闘",
    "machine": "機械・乗り物",
    "environment": "環境音",
    "button": "ボタン・システム音",
    "animal": "自然・動物",
}
# battle はRPG寄りの音が大半なので既定では取らない (--categories battle で個別取得)
DEFAULT_CATEGORIES = [c for c in CATEGORIES if c != "battle"]
UA ={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
ROOT = Path(__file__).resolve().parent.parent
OUTDIR = ROOT / "assets" / "se"  # 倉庫。public/ には置かない (書き出しが遅くなる)


def get(url: str, referer: str | None = None) -> bytes:
    # mp3 は直リンク禁止 (Referer 無しだと403) なので掲載ページを Referer に入れる
    headers = {**UA, **({"Referer": referer} if referer else {})}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def strip_tags(s: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def page_urls(cat: str) -> list[str]:
    """カテゴリのトップページとサブページ (battle2.html など) を列挙。"""
    top = f"{BASE}/sound/{cat}/"
    body = get(top).decode("utf-8", "replace")
    urls = [top]
    seen = {top}
    queue = [top]
    while queue:
        cur = queue.pop(0)
        body = body if cur == top else get(cur).decode("utf-8", "replace")
        for m in re.finditer(r'href="([^"]+\.html)"', body):
            u = urllib.parse.urljoin(cur, m.group(1))
            if u.startswith(f"{BASE}/sound/{cat}/") and u not in seen:
                seen.add(u)
                urls.append(u)
                queue.append(u)
        time.sleep(0.3)
    return urls


def parse_page(url: str) -> tuple[str, list[dict]]:
    body = get(url).decode("utf-8", "replace")
    h1 = strip_tags(re.search(r"<h1>(.*?)</h1>", body, re.S).group(1))
    entries = []
    group = ""
    # <p>見出し</p> と <li><span>名前</span>説明<a href="mp3/x.mp3" download="名前.mp3">
    token = re.compile(
        r"<p>([^<>]{1,30})</p>"
        r"|<li><span>(.*?)</span>(.*?)<a href=\"([^\"]*mp3/[^\"]+\.mp3)\"",
        re.S,
    )
    for m in token.finditer(body):
        if m.group(1) is not None:
            group = strip_tags(m.group(1))
            continue
        entries.append(
            {
                "name_ja": strip_tags(m.group(2)),
                "desc": strip_tags(m.group(3)),
                "group": group,
                "url": urllib.parse.urljoin(url, m.group(4)),
                "referer": url,
                "file": m.group(4).split("/")[-1],
            }
        )
    return h1, entries


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--categories", nargs="*", default=DEFAULT_CATEGORIES)
    args = ap.parse_args()

    index: dict[str, dict] = {}
    total = 0
    for cat in args.categories:
        cat_entries = []
        for url in page_urls(cat):
            title, entries = parse_page(url)
            for e in entries:
                e["page"] = title
            cat_entries += entries
            print(f"  {cat:12s} {title:16s} {len(entries):4d}件", file=sys.stderr)
            time.sleep(0.3)
        # 同名ファイルの重複排除
        uniq = {e["file"]: e for e in cat_entries}
        index[cat] = {"label": CATEGORIES.get(cat, cat), "entries": list(uniq.values())}
        total += len(uniq)
        print(f"{cat} 合計 {len(uniq)}件", file=sys.stderr)
    print(f"=== 全合計 {total}件 ===", file=sys.stderr)

    if args.dry_run:
        (ROOT / "tmp").mkdir(exist_ok=True)
        (ROOT / "tmp" / "se-dryrun.json").write_text(
            json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8"
        )
        return 0

    done = 0
    for cat, data in index.items():
        d = OUTDIR / cat
        d.mkdir(parents=True, exist_ok=True)
        for e in data["entries"]:
            dest = d / e["file"]
            if dest.exists() and dest.stat().st_size > 0:
                e["bytes"] = dest.stat().st_size
                continue
            try:
                blob = get(e["url"], e["referer"])
            except Exception as ex:  # 取得失敗は記録だけして続行
                print(f"NG {e['url']} {ex}", file=sys.stderr)
                continue
            dest.write_bytes(blob)
            e["bytes"] = len(blob)
            done += 1
            if done % 50 == 0:
                print(f"  ...{done}件取得", file=sys.stderr)
            time.sleep(0.25)

    OUTDIR.mkdir(parents=True, exist_ok=True)
    (OUTDIR / "se-index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    write_markdown(index)
    print(f"新規ダウンロード {done}件", file=sys.stderr)
    return 0


def write_markdown(index: dict) -> None:
    lines = [
        "# 効果音インデックス (効果音ラボ)",
        "",
        "出典: https://soundeffect-lab.info/ — 商用利用可・クレジット表記不要。",
        "コードでは `staticFile('se/<カテゴリ>/<ファイル名>')` と書く。書いたあと `npm run se` で public/se/ へコピーされる。",
        "日本語名で grep して目的の音を探す。",
        "",
    ]
    for cat, data in index.items():
        lines += [f"## {cat} ({data['label']})", ""]
        group = None
        for e in data["entries"]:
            if e["group"] != group:
                group = e["group"]
                head = f"{e['page']} / {group}" if group else e["page"]
                lines += ["", f"### {head}", "", "| 日本語名 | ファイル | 説明 |", "| --- | --- | --- |"]
            lines.append(f"| {e['name_ja']} | `{cat}/{e['file']}` | {e['desc']} |")
        lines.append("")
    (OUTDIR / "INDEX.md").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    raise SystemExit(main())
