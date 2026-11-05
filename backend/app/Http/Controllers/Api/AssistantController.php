<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssistantController extends Controller
{
    public function ask(Request $request, AssistantService $assistant): JsonResponse
    {
        $data = $request->validate(['question' => 'required|string|min:3|max:500']);

        return response()->json(['data' => $assistant->ask(strip_tags($data['question']))]);
    }
}
