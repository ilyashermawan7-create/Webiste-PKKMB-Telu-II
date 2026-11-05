<?php

namespace Database\Seeders;

use App\Models\Faculty;
use App\Models\StudyProgram;
use App\Models\User;
use App\Services\GroupAssigner;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Akun demo per role + maba & mentor dummy.
 * Jumlah maba dummy dapat diatur lewat env SEED_MABA (default 280).
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');
        $fif = Faculty::where('code', 'FIF')->first();
        $if = StudyProgram::where('code', '1301')->first();

        // ---- Akun demo ----
        User::updateOrCreate(['email' => 'admin@pkkmb.telkomuniversity.ac.id'], [
            'name' => 'Admin Ditmawa', 'role' => 'ADMIN', 'password' => $password, 'gender' => 'L',
        ]);
        User::updateOrCreate(['email' => 'panitia@pkkmb.telkomuniversity.ac.id'], [
            'name' => 'Nadia Panitia', 'role' => 'PANITIA', 'password' => $password, 'gender' => 'P',
        ]);
        User::updateOrCreate(['email' => 'mentor@pkkmb.telkomuniversity.ac.id'], [
            'name' => 'Raka Mentor', 'role' => 'MENTOR', 'password' => $password, 'gender' => 'L',
            'faculty_id' => $fif->id, 'phone' => '6281234500001',
        ]);
        User::updateOrCreate(['nim' => '1301260001'], [
            'email' => '1301260001@student.telkomuniversity.ac.id', 'name' => 'Alya Putri Ramadhani', 'role' => 'MABA',
            'password' => $password, 'gender' => 'P', 'faculty_id' => $fif->id, 'study_program_id' => $if->id, 'batch' => 1,
        ]);

        // ---- Mentor dummy: 4 per fakultas ----
        $faker = Faker::create('id_ID');
        $faker->seed(2026);
        foreach (Faculty::all() as $faculty) {
            for ($i = 1; $i <= 4; $i++) {
                $email = strtolower("mentor.{$faculty->code}{$i}@pkkmb.telkomuniversity.ac.id");
                $gender = $i % 2 ? 'L' : 'P';
                User::updateOrCreate(['email' => $email], [
                    'name' => $faker->name($gender === 'L' ? 'male' : 'female'), 'role' => 'MENTOR', 'password' => $password,
                    'gender' => $gender, 'faculty_id' => $faculty->id, 'phone' => '6281'.$faker->numerify('#########'),
                ]);
            }
        }

        // ---- Maba dummy, NIM = kode prodi + angkatan (26) + nomor urut ----
        $total = (int) env('SEED_MABA', 280);
        $programs = StudyProgram::all();
        $counters = [];
        for ($n = 0; $n < $total; $n++) {
            $prodi = $programs[$n % $programs->count()];
            $counters[$prodi->code] = ($counters[$prodi->code] ?? ($prodi->code === '1301' ? 1 : 0)) + 1;
            $nim = sprintf('%s26%04d', $prodi->code, $counters[$prodi->code]);
            $gender = $faker->randomElement(['L', 'P']);
            User::updateOrCreate(['nim' => $nim], [
                'email' => "{$nim}@student.telkomuniversity.ac.id",
                'name' => $faker->name($gender === 'L' ? 'male' : 'female'),
                'role' => 'MABA', 'password' => $password, 'gender' => $gender,
                'faculty_id' => $prodi->faculty_id, 'study_program_id' => $prodi->id,
                'accessibility_needs' => $n % 47 === 0 ? 'Membutuhkan akses kursi roda' : null,
            ]);
        }

        // ---- Pembagian gugus otomatis lalu tetapkan mentor ----
        app(GroupAssigner::class)->assign(groupSize: 10);
        foreach (Faculty::with('groups')->get() as $faculty) {
            $mentors = User::where('role', 'MENTOR')->where('faculty_id', $faculty->id)->orderBy('id')->get();
            foreach ($faculty->groups as $idx => $group) {
                $group->update(['mentor_id' => $mentors[$idx % max(1, $mentors->count())]->id ?? null]);
            }
        }
        // Pastikan akun demo mentor membimbing gugus akun demo maba
        $alya = User::where('nim', '1301260001')->first();
        $alya->group?->update(['mentor_id' => User::where('email', 'mentor@pkkmb.telkomuniversity.ac.id')->value('id')]);
    }
}
