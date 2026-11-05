<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\PkkmbSession;
use App\Models\Submission;
use App\Models\Ticket;
use App\Models\User;
use App\Services\QrTokenService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PkkmbApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        putenv('SEED_MABA=40');
        $this->seed(DatabaseSeeder::class);
    }

    private function maba(): User
    {
        return User::where('nim', '1301260001')->firstOrFail();
    }

    public function test_login_dengan_nim_dan_password_salah_ditolak(): void
    {
        $this->postJson('/api/v1/auth/login', ['login' => '1301260001', 'password' => 'password'])
            ->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'role']]);
        $this->postJson('/api/v1/auth/login', ['login' => '1301260001', 'password' => 'salah'])
            ->assertStatus(422);
    }

    public function test_qr_dinamis_valid_kedaluwarsa_dan_palsu(): void
    {
        $qr = app(QrTokenService::class);
        $now = $qr->currentWindow();
        $this->assertSame(7, $qr->verify($qr->make(7, $now)));
        $this->assertSame(7, $qr->verify($qr->make(7, $now - 1)), 'window sebelumnya masih diterima');
        $this->assertNull($qr->verify($qr->make(7, $now - 2)), 'token > 60 detik ditolak');
        $this->assertNull($qr->verify('Zm9vLjEuYmFy'));
        $forged = rtrim(strtr(base64_encode("7.{$now}.".str_repeat('a', 32)), '+/', '-_'), '=');
        $this->assertNull($qr->verify($forged));
    }

    public function test_presensi_qr_idempoten_dan_memberi_poin_sekali(): void
    {
        $user = $this->maba();
        $session = PkkmbSession::where('title', 'like', 'Simulasi%')->firstOrFail();
        $token = app(QrTokenService::class)->make($session->id);
        Sanctum::actingAs($user, ['MABA']);
        $before = $user->fresh()->points;

        $this->postJson('/api/v1/attendance/qr', ['token' => $token])->assertCreated()->assertJsonPath('data.already', false);
        $this->postJson('/api/v1/attendance/qr', ['token' => $token])->assertOk()->assertJsonPath('data.already', true);

        $this->assertSame(1, $session->attendances()->where('user_id', $user->id)->count());
        $this->assertGreaterThanOrEqual($before + $session->points, $user->fresh()->points);
    }

    public function test_presensi_ditolak_jika_sesi_ditutup_atau_di_luar_geofence(): void
    {
        $session = PkkmbSession::where('title', 'like', 'Simulasi%')->firstOrFail();
        Sanctum::actingAs($this->maba(), ['MABA']);
        $session->update(['latitude' => -6.9748, 'longitude' => 107.6305, 'radius_m' => 100]);
        $token = app(QrTokenService::class)->make($session->id);
        // ±1,1 km dari titik sesi
        $this->postJson('/api/v1/attendance/qr', ['token' => $token, 'lat' => -6.9648, 'lng' => 107.6305])->assertStatus(422)->assertJsonValidationErrors('location');

        $session->update(['attendance_open' => false, 'radius_m' => null]);
        cache()->flush();
        $this->postJson('/api/v1/attendance/qr', ['token' => $token])->assertStatus(422);
    }

    public function test_maba_tidak_bisa_akses_endpoint_admin_dan_mentor(): void
    {
        Sanctum::actingAs($this->maba(), ['MABA']);
        $this->getJson('/api/v1/admin/analytics')->assertForbidden();
        $this->getJson('/api/v1/mentor/groups')->assertForbidden();
    }

    public function test_mentor_tidak_bisa_menilai_tugas_gugus_lain(): void
    {
        $mentor = User::where('email', 'mentor@pkkmb.telkomuniversity.ac.id')->firstOrFail();
        $otherGroup = Group::where('mentor_id', '!=', $mentor->id)->whereHas('members')->firstOrFail();
        $stranger = $otherGroup->members()->firstOrFail();
        $submission = Submission::updateOrCreate(['assignment_id' => 1, 'user_id' => $stranger->id], ['text' => 'x', 'status' => 'SUBMITTED', 'submitted_at' => now()]);

        Sanctum::actingAs($mentor, ['MENTOR']);
        $this->postJson("/api/v1/mentor/submissions/{$submission->id}/grade", ['status' => 'GRADED', 'score' => 90])->assertForbidden();
        $this->getJson("/api/v1/mentor/groups/{$otherGroup->id}")->assertForbidden();
    }

    public function test_laporan_anonim_tidak_menyimpan_identitas_dan_status_butuh_token(): void
    {
        $res = $this->postJson('/api/v1/public/reports', [
            'category' => 'KEKERASAN', 'subject' => 'Bentakan', 'body' => 'Senior membentak dan memberi hukuman fisik di gugus.',
        ])->assertCreated();
        $ticket = Ticket::where('code', $res->json('data.code'))->firstOrFail();
        $this->assertNull($ticket->user_id);
        $this->assertSame('URGENT', $ticket->priority);

        $this->getJson("/api/v1/public/reports/{$ticket->code}?token=".str_repeat('x', 32))->assertNotFound();
        $this->getJson("/api/v1/public/reports/{$ticket->code}?token=".$res->json('data.token'))->assertOk()->assertJsonPath('data.status', 'OPEN');
    }

    public function test_upload_tugas_menolak_file_berbahaya(): void
    {
        Sanctum::actingAs(User::where('role', 'MABA')->where('nim', '!=', '1301260001')->firstOrFail(), ['MABA']);
        // File nyata (bukan fake) agar MIME dideteksi dari isi via finfo, bukan dari ekstensi
        $path = tempnam(sys_get_temp_dir(), 'up');
        file_put_contents($path, '<?php system($_GET["c"]); ?>');
        $evil = new \Illuminate\Http\UploadedFile($path, 'shell.pdf', null, null, true);
        $this->postJson('/api/v1/assignments/1/submit', ['file' => $evil])->assertStatus(422)->assertJsonValidationErrors('file');
    }

    public function test_endpoint_publik_tidak_membocorkan_data_pribadi(): void
    {
        $json = $this->getJson('/api/v1/public/sessions')->assertOk()->getContent();
        $this->assertStringNotContainsString('online_code', $json);
        $this->assertStringNotContainsString('TELU26', $json);
        $this->getJson('/api/v1/public/stats')->assertOk()->assertJsonMissingPath('data.users');
    }
}
