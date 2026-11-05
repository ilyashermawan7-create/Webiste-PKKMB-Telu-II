<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

/**
 * CRUD generik konten admin: /admin/content/{resource}.
 * Setiap resource mendefinisikan model, aturan validasi (Zod-equivalent di server), dan field file.
 */
class ContentController extends Controller
{
    private function config(string $resource): array
    {
        $map = [
            'sessions' => [Models\PkkmbSession::class, [
                'title' => 'required|string|max:200', 'description' => 'nullable|string|max:3000',
                'type' => 'required|in:PRE,UNIVERSITAS,FAKULTAS,PRODI', 'mode' => 'required|in:ONLINE,OFFLINE',
                'batch' => 'nullable|integer|min:1|max:20', 'faculty_id' => 'nullable|exists:faculties,id',
                'day_number' => 'required|integer|min:0|max:14', 'starts_at' => 'required|date', 'ends_at' => 'required|date|after:starts_at',
                'location' => 'nullable|string|max:200', 'latitude' => 'nullable|numeric|between:-90,90', 'longitude' => 'nullable|numeric|between:-180,180',
                'radius_m' => 'nullable|integer|min:20|max:5000', 'online_code' => 'nullable|alpha_num|max:12',
                'attendance_open' => 'boolean', 'is_mandatory' => 'boolean', 'points' => 'integer|min:0|max:500',
            ], null, ['faculty:id,code,name'], 'starts_at'],
            'announcements' => [Models\Announcement::class, [
                'title' => 'required|string|max:200', 'body' => 'required|string|max:10000', 'category' => 'required|string|max:40',
                'audience' => 'required|in:ALL,MABA,MENTOR,GROUP,FACULTY', 'group_id' => 'nullable|required_if:audience,GROUP|exists:groups,id',
                'faculty_id' => 'nullable|required_if:audience,FACULTY|exists:faculties,id', 'is_pinned' => 'boolean', 'published_at' => 'nullable|date',
            ], null, ['author:id,name'], 'published_at'],
            'materials' => [Models\Material::class, [
                'title' => 'required|string|max:200', 'description' => 'nullable|string|max:3000', 'type' => 'required|in:PDF,VIDEO,LINK',
                'url' => 'nullable|url:https|max:500', 'session_id' => 'nullable|exists:sessions_pkkmb,id', 'order' => 'integer|min:0',
                'file' => 'nullable|file|max:20480|mimetypes:application/pdf',
            ], 'file_path', ['quiz'], 'order'],
            'assignments' => [Models\Assignment::class, [
                'title' => 'required|string|max:200', 'description' => 'required|string|max:5000', 'type' => 'required|in:FILE,LINK,TEXT',
                'due_at' => 'required|date', 'max_score' => 'integer|min:1|max:1000', 'points' => 'integer|min:0|max:500',
                'is_required' => 'boolean', 'session_id' => 'nullable|exists:sessions_pkkmb,id',
            ], null, [], 'due_at'],
            'faqs' => [Models\Faq::class, [
                'question' => 'required|string|max:255', 'answer' => 'required|string|max:5000', 'category' => 'required|string|max:40', 'order' => 'integer|min:0',
            ], null, [], 'order'],
            'gallery' => [Models\GalleryItem::class, [
                'title' => 'required|string|max:150', 'caption' => 'nullable|string|max:255', 'taken_at' => 'nullable|date',
                'file' => 'nullable|file|max:8192|mimetypes:image/jpeg,image/png,image/webp',
            ], 'image_path', [], 'taken_at'],
            'faculties' => [Models\Faculty::class, [
                'code' => 'required|string|max:10', 'name' => 'required|string|max:150', 'name_en' => 'nullable|string|max:150', 'description' => 'nullable|string|max:3000',
            ], null, [], 'id'],
            'organizations' => [Models\Organization::class, [
                'name' => 'required|string|max:150', 'category' => 'required|string|max:40', 'description' => 'required|string|max:3000', 'instagram' => 'nullable|string|max:60|regex:/^[A-Za-z0-9_.]+$/',
            ], null, [], 'name'],
            'places' => [Models\CampusPlace::class, [
                'name' => 'required|string|max:150', 'category' => 'required|string|max:40', 'description' => 'required|string|max:2000',
                'latitude' => 'required|numeric|between:-90,90', 'longitude' => 'required|numeric|between:-180,180',
            ], null, [], 'name'],
            'badges' => [Models\Badge::class, [
                'code' => 'required|string|max:40|alpha_dash', 'name' => 'required|string|max:80', 'description' => 'required|string|max:255', 'icon' => 'required|string|max:40', 'points' => 'integer|min:0|max:500',
            ], null, [], 'points'],
            'missions' => [Models\Mission::class, [
                'title' => 'required|string|max:120', 'description' => 'required|string|max:255', 'date' => 'required|date',
                'action' => 'required|in:ATTEND,SUBMIT,QUIZ,READ_FAQ,VISIT_MAP', 'points' => 'integer|min:0|max:100',
            ], null, [], 'date'],
        ];

        abort_unless(isset($map[$resource]), 404);
        [$model, $rules, $fileField, $with, $order] = $map[$resource];

        return compact('model', 'rules', 'fileField', 'with', 'order');
    }

    public function index(Request $request, string $resource): JsonResponse
    {
        $c = $this->config($resource);
        $q = $c['model']::query()->with($c['with'])->orderByDesc($c['order']);
        if ($search = $request->string('q')->toString()) {
            $col = array_key_first($c['rules']);
            $q->whereLike($col, "%{$search}%");
        }

        $page = $q->paginate(min($request->integer('per_page', 25), 100));
        // Kode presensi daring disembunyikan di model, tapi dibutuhkan admin
        $page->getCollection()->each(fn ($m) => $m->makeVisible($m->getHidden()));

        return response()->json($page);
    }

    public function store(Request $request, string $resource): JsonResponse
    {
        $c = $this->config($resource);
        $data = $this->payload($request, $c);
        if ($resource === 'announcements') {
            $data['author_id'] = $request->user()->id;
        }
        $item = $c['model']::create($data);
        $this->flush($resource);

        return response()->json(['data' => $item], 201);
    }

    public function update(Request $request, string $resource, int $id): JsonResponse
    {
        $c = $this->config($resource);
        $item = $c['model']::findOrFail($id);
        $item->update($this->payload($request, $c, partial: true));
        $this->flush($resource, $id);

        return response()->json(['data' => $item->fresh()]);
    }

    public function destroy(string $resource, int $id): JsonResponse
    {
        $c = $this->config($resource);
        $c['model']::findOrFail($id)->delete();
        $this->flush($resource, $id);

        return response()->json(null, 204);
    }

    private function payload(Request $request, array $c, bool $partial = false): array
    {
        $rules = $partial ? array_map(fn ($r) => 'sometimes|'.$r, $c['rules']) : $c['rules'];
        $data = $request->validate($rules);
        if ($c['fileField'] && $request->hasFile('file')) {
            $data[$c['fileField']] = $request->file('file')->store('content', config('filesystems.public_uploads'));
        } elseif ($c['fileField'] === 'image_path' && ! $partial) {
            $request->validate(['file' => 'required']);
        }
        unset($data['file']);

        return $data;
    }

    private function flush(string $resource, ?int $id = null): void
    {
        Cache::forget('public.stats');
        Cache::forget('assistant.docs');
        if ($resource === 'sessions' && $id) {
            Cache::forget("session:{$id}");
        }
    }
}
