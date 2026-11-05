<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Audit log & pengaturan tema PKKMB. */
class SystemController extends Controller
{
    public function auditLogs(Request $request): JsonResponse
    {
        $q = AuditLog::with('user:id,name,role')
            ->when($request->string('action')->toString(), fn ($q, $a) => $q->whereLike('action', "%{$a}%"))
            ->latest('created_at');

        return response()->json($q->paginate(50));
    }

    public function settings(): JsonResponse
    {
        return response()->json(['data' => Setting::allCached()]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'theme_title' => 'sometimes|string|max:120',
            'theme_tagline' => 'sometimes|string|max:200',
            'year' => 'sometimes|integer|min:2020|max:2100',
            'event_start' => 'sometimes|date',
            'event_end' => 'sometimes|date',
            'teaser_video_url' => 'sometimes|nullable|url:https',
            'virtual_tour_url' => 'sometimes|nullable|url:https',
            'hotline_whatsapp' => 'sometimes|string|regex:/^62[0-9]{8,13}$/',
            'hotline_email' => 'sometimes|email',
            'instagram' => 'sometimes|string|max:60',
            'rector_message' => 'sometimes|nullable|string|max:3000',
            'director_message' => 'sometimes|nullable|string|max:3000',
            'certificate_rules' => 'sometimes|array',
            'certificate_rules.min_attendance' => 'required_with:certificate_rules|numeric|between:0,1',
            'certificate_rules.min_score' => 'required_with:certificate_rules|integer|between:0,100',
        ]);
        foreach ($data as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return $this->settings();
    }
}
