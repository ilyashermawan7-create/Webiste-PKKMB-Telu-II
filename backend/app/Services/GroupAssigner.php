<?php

namespace App\Services;

use App\Models\Group;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Pembagian gugus otomatis yang seimbang per fakultas & gender.
 *
 * Algoritma: untuk tiap fakultas, maba diurutkan per gender lalu diselang-seling
 * (L,P,L,P,...) dan dibagikan round-robin ke gugus fakultas tersebut. Hasilnya
 * selisih jumlah anggota antar gugus ≤ 1 dan komposisi gender proporsional.
 */
class GroupAssigner
{
    /** @return array<string, int> jumlah maba yang dibagi per fakultas */
    public function assign(int $groupSize = 25, bool $onlyUnassigned = true): array
    {
        $summary = [];

        DB::transaction(function () use ($groupSize, $onlyUnassigned, &$summary) {
            $students = User::query()
                ->where('role', 'MABA')
                ->when($onlyUnassigned, fn ($q) => $q->whereNull('group_id'))
                ->with('faculty:id,code')
                ->orderBy('id')
                ->get(['id', 'faculty_id', 'gender', 'batch']);

            foreach ($students->groupBy('faculty_id') as $facultyId => $members) {
                $code = $members->first()->faculty?->code ?? 'UMUM';
                $groups = Group::where('faculty_id', $facultyId ?: null)->orderBy('id')->get();

                // Buat gugus tambahan bila kapasitas belum cukup
                $existingMembers = $onlyUnassigned ? User::whereIn('group_id', $groups->pluck('id'))->count() : 0;
                $needed = (int) ceil(($members->count() + $existingMembers) / $groupSize);
                for ($i = $groups->count() + 1; $i <= $needed; $i++) {
                    $groups->push(Group::create([
                        'code' => sprintf('%s-%02d', $code, $i),
                        'name' => sprintf('Gugus %s %02d', $code, $i),
                        'faculty_id' => $facultyId ?: null,
                        'batch' => (($i - 1) % 4) + 1,
                    ]));
                }

                $male = $members->where('gender', 'L')->values();
                $female = $members->where('gender', '!=', 'L')->values();
                $interleaved = collect();
                for ($i = 0; $i < max($male->count(), $female->count()); $i++) {
                    if (isset($male[$i])) $interleaved->push($male[$i]);
                    if (isset($female[$i])) $interleaved->push($female[$i]);
                }

                // Mulai dari gugus dengan anggota paling sedikit
                $counts = $groups->mapWithKeys(fn ($g) => [$g->id => User::where('group_id', $g->id)->count()])->sort();
                $order = $counts->keys()->values();
                foreach ($interleaved as $idx => $student) {
                    $group = $groups->firstWhere('id', $order[$idx % $order->count()]);
                    User::whereKey($student->id)->update(['group_id' => $group->id, 'batch' => $student->batch ?? $group->batch]);
                }
                $summary[$code] = $interleaved->count();
            }
        });

        return $summary;
    }
}
