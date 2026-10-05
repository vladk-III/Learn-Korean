"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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
    <div className="pt-safe px-4">
      <header className="flex items-center gap-2 pt-5">
        <Link href="/news/" aria-label="Back" className="p-1">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-extrabold">Paste an article</h1>
      </header>
      <p className="muted mt-2 text-sm">
        Copy a Korean news story (e.g. from Naver News, KBS, or a kids&apos; news site) and paste it here. You&apos;ll
        get the same tap-to-gloss reader; words outside the built-in dictionary are looked up online.
      </p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="card mt-4 w-full px-4 py-3"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="여기에 기사를 붙여 넣으세요…"
        rows={12}
        className="card ko mt-3 w-full px-4 py-3"
      />
      <button
        onClick={save}
        disabled={sentences.length === 0}
        className="bg-brand-500 mt-4 w-full rounded-2xl py-4 font-bold text-white disabled:opacity-40"
      >
        Read it ({sentences.length} sentence{sentences.length === 1 ? "" : "s"})
      </button>
    </div>
  );
}
