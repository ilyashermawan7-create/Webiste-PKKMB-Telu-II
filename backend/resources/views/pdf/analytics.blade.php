<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Laporan PKKMB</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; color: #16161a; }
  h1 { color: #B6252A; font-size: 18pt; margin-bottom: 2px; }
  h2 { font-size: 12pt; border-bottom: 2px solid #ED1E28; padding-bottom: 3px; margin-top: 18px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { background: #B6252A; color: #fff; text-align: left; padding: 5px; font-size: 9pt; }
  td { border-bottom: 1px solid #e4e4e7; padding: 4px 5px; }
  .muted { color: #55565B; }
  .kpi td { font-size: 12pt; font-weight: bold; }
</style>
</head>
<body>
  <h1>Laporan PKKMB Telkom University</h1>
  <div class="muted">Dibuat {{ $generatedAt->translatedFormat('d F Y H:i') }} WIB</div>

  <h2>Ringkasan</h2>
  <table>
    <tr><th>Maba</th><th>Mentor</th><th>Presensi</th><th>Pengumpulan tugas</th><th>Sertifikat</th><th>Tiket terbuka</th></tr>
    <tr class="kpi">
      <td>{{ number_format($data['totals']['maba']) }}</td><td>{{ $data['totals']['mentors'] }}</td>
      <td>{{ number_format($data['totals']['attendances']) }}</td><td>{{ number_format($data['totals']['submissions']) }}</td>
      <td>{{ number_format($data['totals']['certificates']) }}</td><td>{{ $data['totals']['open_tickets'] }}</td>
    </tr>
  </table>

  <h2>Kehadiran per sesi</h2>
  <table>
    <tr><th>Hari</th><th>Sesi</th><th>Hadir</th><th>Persentase</th></tr>
    @foreach ($data['attendance'] as $s)
      <tr><td>{{ $s['day'] }}</td><td>{{ $s['title'] }}</td><td>{{ $s['attended'] }}</td><td>{{ round($s['rate'] * 100, 1) }}%</td></tr>
    @endforeach
  </table>

  <h2>Sebaran maba per fakultas</h2>
  <table>
    <tr><th>Fakultas</th><th>Total</th><th>Putra</th><th>Putri</th></tr>
    @foreach ($data['by_faculty'] as $f)
      <tr><td>{{ $f->faculty }}</td><td>{{ $f->total }}</td><td>{{ $f->male }}</td><td>{{ $f->female }}</td></tr>
    @endforeach
  </table>

  <h2>Progres tugas</h2>
  <table>
    <tr><th>Tugas</th><th>Dikumpulkan</th><th>Dinilai</th></tr>
    @foreach ($data['assignments'] as $a)
      <tr><td>{{ $a['title'] }}</td><td>{{ $a['submitted'] }} / {{ $a['total'] }}</td><td>{{ $a['graded'] }}</td></tr>
    @endforeach
  </table>
</body>
</html>
