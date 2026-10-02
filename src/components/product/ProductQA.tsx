"use client";

import { useState } from "react";
import { HelpCircle, MessageCircleQuestion } from "lucide-react";
import type { Product, QAItem } from "@/lib/types";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/Button";

const SEED_QA: QAItem[] = [
  { id: "q1", author: "Rahul", question: "Is this available in medium size?", answer: "Yes, Medium is currently available.", date: "1 week ago" },
  { id: "q2", author: "Sneha", question: "What is the return policy?", answer: "You can return within 7 days of delivery.", date: "3 weeks ago" },
  { id: "q3", author: "Amit", question: "Is the quality good for the price?", date: "1 month ago" },
];

export function ProductQA({ product }: { product: Product }) {
  const { questions, addQuestion } = useStore();
  const [text, setText] = useState("");
  const userQA = questions[product.id] ?? [];
  const all = [...userQA, ...SEED_QA];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addQuestion(product.id, text.trim());
    setText("");
  };

  return (
    <div className="mt-6 rounded-lg border border-neutral-200">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-4">
        <HelpCircle size={18} />
        <h3 className="text-base font-bold text-black">Questions & Answers</h3>
        <span className="ml-auto text-sm text-neutral-400">({all.length})</span>
      </div>

      <form onSubmit={submit} className="border-b border-neutral-100 px-5 py-4">
        <label className="mb-1.5 block text-sm font-medium text-black">
          Ask a question
        </label>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Ask about ${product.name}...`}
            className="h-11 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-black"
          />
          <Button type="submit" className="shrink-0" disabled={!text.trim()}>
            Post
          </Button>
        </div>
      </form>

      <div className="divide-y divide-neutral-100">
        {all.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-neutral-500">No questions yet. Ask the first one!</p>
        )}
        {all.map((q) => (
          <div key={q.id} className="px-5 py-4">
            <div className="flex items-start gap-2.5">
              <MessageCircleQuestion size={16} className="mt-0.5 shrink-0 text-neutral-400" />
              <div>
                <p className="text-sm font-semibold text-black">
                  Q: {q.question}
                  <span className="ml-2 text-xs font-normal text-neutral-400">
                    {q.author} · {q.date}
                  </span>
                </p>
                {q.answer ? (
                  <p className="mt-1.5 pl-4 text-sm text-neutral-600">A: {q.answer}</p>
                ) : (
                  <p className="mt-1.5 pl-4 text-xs text-neutral-400">Waiting for an answer...</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}