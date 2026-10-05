"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { splitSentences } from "@/lib/analyzer";
import { actions } from "@/lib/store";

export default function ImportArticle() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const sentences = splitSentences(text);

  const save = () => {
    const a = actions.importArticle(
      title.trim() || sentences[0]?.slice(0, 24) || "My article",
      sentences.map((ko) => ({ ko, en: "" })),
    );
    router.push(`/reader/?id=${a.id}`);
  };

  return (
    <div className="pt-safe">
      <PageHeader back="/news/" title="Paste an article" />
      <div className="px-5">
        <p className="sub text-[15px] leading-relaxed">
          Copy a Korean news story (Naver News, KBS, a kids&apos; news site…) and paste it here. You get the same
          tap-to-gloss reader; words outside the built-in dictionary are looked up online.
        </p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="tile mt-5 w-full px-4 py-3.5 outline-none"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="여기에 기사를 붙여 넣으세요…"
          rows={12}
          className="tile ko mt-3 w-full px-4 py-3.5 outline-none"
        />
        <button onClick={save} disabled={sentences.length === 0} className="btn btn-ink mt-4 h-14 w-full">
          Read it · {sentences.length} sentence{sentences.length === 1 ? "" : "s"}
        </button>
      </div>
    </div>
  );
}
