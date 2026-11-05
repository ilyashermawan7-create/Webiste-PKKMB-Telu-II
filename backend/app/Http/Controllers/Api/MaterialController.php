<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $best = QuizAttempt::where('user_id', $request->user()->id)->selectRaw('quiz_id, MAX(score) as best')->groupBy('quiz_id')->pluck('best', 'quiz_id');
        $materials = Material::with('quiz')->orderBy('order')->get()
            ->each(fn ($m) => $m->best_score = $m->quiz ? ($best[$m->quiz->id] ?? null) : null);

        return MaterialResource::collection($materials);
    }

    public function show(Request $request, Material $material): MaterialResource
    {
        $material->load('quiz');
        if ($material->quiz) {
            $material->best_score = QuizAttempt::where('quiz_id', $material->quiz->id)->where('user_id', $request->user()->id)->max('score');
        }

        return new MaterialResource($material);
    }

    /** Soal kuis tanpa kunci jawaban. */
    public function quiz(Quiz $quiz): JsonResponse
    {
        return response()->json(['data' => [
            'id' => $quiz->id,
            'title' => $quiz->title,
            'pass_score' => $quiz->pass_score,
            'questions' => $quiz->questions()->get(['id', 'question', 'options']),
        ]]);
    }

    public function attempt(Request $request, Quiz $quiz, GamificationService $game): JsonResponse
    {
        $questions = $quiz->questions()->get();
        $data = $request->validate([
            'answers' => 'required|array|size:'.$questions->count(),
            'answers.*' => 'nullable|integer|min:0|max:9',
        ]);
        $user = $request->user();
        if (QuizAttempt::where('quiz_id', $quiz->id)->where('user_id', $user->id)->count() >= 3) {
            throw ValidationException::withMessages(['answers' => 'Batas 3 kali percobaan sudah tercapai.']);
        }

        $correct = 0;
        $review = [];
        foreach ($questions as $q) {
            $given = $data['answers'][$q->id] ?? null;
            $ok = $given !== null && (int) $given === $q->answer_index;
            $correct += $ok ? 1 : 0;
            $review[] = ['question_id' => $q->id, 'correct' => $ok];
        }
        $score = (int) round($correct / max(1, $questions->count()) * 100);
        $prevPassed = QuizAttempt::where('quiz_id', $quiz->id)->where('user_id', $user->id)->where('score', '>=', $quiz->pass_score)->exists();

        QuizAttempt::create(['quiz_id' => $quiz->id, 'user_id' => $user->id, 'score' => $score, 'answers' => $data['answers']]);

        $passed = $score >= $quiz->pass_score;
        if ($passed && ! $prevPassed) {
            $game->addPoints($user, $quiz->points);
            $game->completeMission($user, 'QUIZ');
            if ($score === 100) {
                $game->award($user, 'QUIZ_MASTER');
            }
        }

        return response()->json(['data' => ['score' => $score, 'passed' => $passed, 'review' => $review]]);
    }
}
