<?php

namespace Database\Seeders;

use App\Models\Faculty;
use App\Models\StudyProgram;
use Illuminate\Database\Seeder;

/** Fakultas & program studi Telkom University (data contoh). */
class AcademicSeeder extends Seeder
{
    public const FACULTIES = [
        'FTE' => ['Fakultas Teknik Elektro', 'School of Electrical Engineering', 'Mencetak insinyur elektro, telekomunikasi, komputer, fisika, dan biomedis yang inovatif.', [
            ['1101', 'S1 Teknik Telekomunikasi'], ['1102', 'S1 Teknik Elektro'], ['1103', 'S1 Teknik Fisika'], ['1104', 'S1 Teknik Komputer'], ['1105', 'S1 Teknik Biomedis'],
        ]],
        'FRI' => ['Fakultas Rekayasa Industri', 'School of Industrial Engineering', 'Rekayasa sistem industri, informasi, dan logistik berbasis data.', [
            ['1201', 'S1 Teknik Industri'], ['1202', 'S1 Sistem Informasi'], ['1203', 'S1 Teknik Logistik'],
        ]],
        'FIF' => ['Fakultas Informatika', 'School of Computing', 'Pusat keunggulan informatika, rekayasa perangkat lunak, dan sains data.', [
            ['1301', 'S1 Informatika'], ['1302', 'S1 Rekayasa Perangkat Lunak'], ['1303', 'S1 Teknologi Informasi'], ['1304', 'S1 Sains Data'],
        ]],
        'FEB' => ['Fakultas Ekonomi dan Bisnis', 'School of Economics and Business', 'Manajemen, akuntansi, dan bisnis di era digital.', [
            ['1401', 'S1 Manajemen Bisnis Telekomunikasi dan Informatika'], ['1402', 'S1 Akuntansi'], ['1403', 'S1 Leisure Management'], ['1404', 'S1 Bisnis Digital'],
        ]],
        'FKB' => ['Fakultas Komunikasi dan Bisnis', 'School of Communication and Business', 'Komunikasi, administrasi bisnis, dan hubungan masyarakat digital.', [
            ['1501', 'S1 Ilmu Komunikasi'], ['1502', 'S1 Administrasi Bisnis'], ['1503', 'S1 Digital Public Relations'],
        ]],
        'FIK' => ['Fakultas Industri Kreatif', 'School of Creative Industries', 'Desain, seni, kriya, film, dan animasi untuk industri kreatif.', [
            ['1601', 'S1 Desain Komunikasi Visual'], ['1602', 'S1 Desain Interior'], ['1603', 'S1 Desain Produk'], ['1604', 'S1 Kriya'], ['1605', 'S1 Seni Rupa'], ['1606', 'S1 Film dan Animasi'],
        ]],
        'FIT' => ['Fakultas Ilmu Terapan', 'School of Applied Science', 'Pendidikan vokasi (D3) yang siap kerja dan tersertifikasi industri.', [
            ['6701', 'D3 Teknologi Telekomunikasi'], ['6702', 'D3 Sistem Informasi'], ['6703', 'D3 Rekayasa Perangkat Lunak Aplikasi'], ['6704', 'D3 Sistem Informasi Akuntansi'],
            ['6705', 'D3 Manajemen Pemasaran'], ['6706', 'D3 Perhotelan'], ['6707', 'D3 Teknologi Komputer'],
        ]],
    ];

    public function run(): void
    {
        foreach (self::FACULTIES as $code => [$name, $en, $desc, $programs]) {
            $faculty = Faculty::updateOrCreate(['code' => $code], ['name' => $name, 'name_en' => $en, 'description' => $desc]);
            foreach ($programs as [$pcode, $pname]) {
                StudyProgram::updateOrCreate(['code' => $pcode], [
                    'faculty_id' => $faculty->id,
                    'name' => $pname,
                    'degree' => str_starts_with($pname, 'D3') ? 'D3' : 'S1',
                    'accreditation' => 'Unggul',
                ]);
            }
        }
    }
}
