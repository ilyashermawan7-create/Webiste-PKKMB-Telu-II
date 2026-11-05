<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\GroupResource;
use App\Http\Resources\UserResource;
use App\Models\Group;
use App\Models\User;
use App\Services\GroupAssigner;
use App\Services\UserImporter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserAdminController extends Controller
{
    public function index(Request $request)
    {
        $q = User::with('faculty:id,code,name', 'group:id,code,name')
            ->when($request->string('role')->toString(), fn ($q, $r) => $q->where('role', $r))
            ->when($request->integer('faculty_id'), fn ($q, $f) => $q->where('faculty_id', $f))
            ->when($request->string('q')->toString(), fn ($q, $s) => $q->where(fn ($w) => $w->whereLike('name', "%{$s}%")->orWhereLike('nim', "%{$s}%")))
            ->orderBy('name');

        return UserResource::collection($q->paginate(min($request->integer('per_page', 25), 100)));
    }

    public function update(Request $request, User $user): UserResource
    {
        $data = $request->validate([
            'role' => 'sometimes|in:MABA,MENTOR,PANITIA,ADMIN',
            'group_id' => 'sometimes|nullable|exists:groups,id',
            'batch' => 'sometimes|nullable|integer|min:1|max:20',
            'is_active' => 'sometimes|boolean',
        ]);
        // Cegah admin menurunkan/menonaktifkan dirinya sendiri
        abort_if($user->id === $request->user()->id && (isset($data['role']) || isset($data['is_active'])), 422, 'Tidak bisa mengubah role/status akun sendiri.');
        $user->update($data);

        return new UserResource($user->load('faculty', 'group'));
    }

    public function import(Request $request, UserImporter $importer): JsonResponse
    {
        $request->validate(['file' => 'required|file|max:5120|mimes:csv,txt']);

        return response()->json(['data' => $importer->import($request->file('file'))]);
    }

    public function autoAssign(Request $request, GroupAssigner $assigner): JsonResponse
    {
        $data = $request->validate([
            'group_size' => 'integer|min:5|max:60',
            'only_unassigned' => 'boolean',
        ]);

        return response()->json(['data' => $assigner->assign($data['group_size'] ?? 25, $data['only_unassigned'] ?? true)]);
    }

    public function groups()
    {
        return GroupResource::collection(Group::with('faculty:id,code,name', 'mentor:id,name,phone')->withCount('members')->orderBy('code')->get());
    }

    public function updateGroup(Request $request, Group $group): GroupResource
    {
        $data = $request->validate(['mentor_id' => 'nullable|exists:users,id', 'batch' => 'nullable|integer|min:1|max:20', 'name' => 'sometimes|string|max:100']);
        if (! empty($data['mentor_id'])) {
            abort_unless(User::whereKey($data['mentor_id'])->where('role', 'MENTOR')->exists(), 422, 'User bukan mentor.');
        }
        $group->update($data);

        return new GroupResource($group->load('faculty', 'mentor'));
    }
}
