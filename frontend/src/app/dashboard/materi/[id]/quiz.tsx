"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, ClientApiError } from "@/lib/api-client";
import type { QuizQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

type Result = { score: number; passed: boolean; review: { question_id: number; correct: boolean }[] };

export function Quiz({ quizId, passScore, best, points }: { quizId: number; passScore: number; best: number | null; points: number }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    try {
      const res = await api<{ data: { questions: QuizQuestion[] } }>(`/quizzes/${quizId}`);
      setQuestions(res.data.questions); setAnswers({}); setResult(null);
    } finally { setBusy(false); }
  };

  const submit = async () => {
    setBusy(true);
    try {
      const res = await api<{ data: Result }>(`/quizzes/${quizId}/attempt`, { method: "POST", json: { answers } });
      setResult(res.data);
      toast[res.data.passed ? "success" : "warning"](res.data.passed ? `Lulus! Nilai ${res.data.score}` : `Nilai ${res.data.score}, coba lagi ya`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ClientApiError ? e.message : "Gagal mengirim jawaban.");
    } finally { setBusy(false); }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div><CardTitle>Kuis singkat</CardTitle><p className="text-sm text-muted-foreground">Lulus ≥ {passScore} untuk +{points} poin · maks 3 percobaan{best !== null && ` · nilai terbaik ${best}`}</p></div>
        {!questions && <Button onClick={start} loading={busy}>Mulai kuis</Button>}
      </CardHeader>
      {questions && (
        <CardContent className="space-y-6">
          {questions.map((q, qi) => {
            const review = result?.review.find((r) => r.question_id === q.id);
            return (
              <fieldset key={q.id}>
                <legend className="mb-3 flex gap-2 font-semibold">
                  <span className="text-primary">{qi + 1}.</span>{q.question}
                  {review && (review.correct ? <CheckCircle2 className="size-5 text-success" aria-label="Benar" /> : <XCircle className="size-5 text-primary" aria-label="Salah" />)}
                </legend>
                <div className="grid gap-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring", answers[q.id] === oi ? "border-telu-maroon bg-telu-red-50 dark:bg-telu-red/10" : "border-border hover:border-telu-red/40")}>
                      <input type="radio" name={`q-${q.id}`} className="accent-[#B6252A]" checked={answers[q.id] === oi} onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))} disabled={!!result} />
                      {opt}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}
          {result ? (
            <div className={cn("rounded-2xl p-4 text-center", result.passed ? "bg-success/10" : "bg-warning/10")} role="status">
              <p className="font-heading text-3xl font-extrabold">{result.score}</p>
              <p className="text-sm">{result.passed ? "Selamat, kamu lulus kuis!" : "Belum lulus. Pelajari lagi materinya lalu coba kembali."}</p>
              {!result.passed && <Button variant="outline" className="mt-3" onClick={start}>Coba lagi</Button>}
            </div>
          ) : (
            <Button onClick={submit} loading={busy} disabled={Object.keys(answers).length < questions.length} className="w-full">Kirim jawaban ({Object.keys(answers).length}/{questions.length})</Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
