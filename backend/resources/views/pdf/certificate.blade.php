<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Sertifikat PKKMB - {{ $user->name }}</title>
<style>
  @page { margin: 0; }
  body { margin: 0; font-family: DejaVu Sans, sans-serif; color: #16161a; }
  .page { position: relative; width: 297mm; height: 210mm; }
  .band { position: absolute; left: 0; top: 0; bottom: 0; width: 18mm; background: #B6252A; }
  .band-accent { position: absolute; left: 18mm; top: 0; bottom: 0; width: 3mm; background: #ED1E28; }
  .content { position: absolute; left: 36mm; right: 20mm; top: 22mm; }
  .brand { font-size: 11pt; letter-spacing: 3px; color: #55565B; text-transform: uppercase; }
  h1 { font-size: 34pt; margin: 10mm 0 2mm; color: #B6252A; letter-spacing: 1px; }
  .sub { font-size: 12pt; color: #55565B; }
  .name { font-size: 28pt; font-weight: bold; margin: 10mm 0 2mm; }
  .meta { font-size: 11pt; color: #55565B; }
  .body { font-size: 12pt; margin-top: 8mm; line-height: 1.6; width: 190mm; }
  .theme { color: #B6252A; font-weight: bold; }
  .footer { position: absolute; left: 36mm; right: 20mm; bottom: 18mm; }
  .sign { display: inline-block; width: 80mm; vertical-align: bottom; font-size: 10pt; }
  .sign .line { border-top: 1px solid #959597; margin-top: 18mm; padding-top: 2mm; }
  .qr { position: absolute; right: 0; bottom: 0; text-align: center; font-size: 8pt; color: #55565B; }
  .number { font-size: 9pt; color: #959597; margin-top: 2mm; }
</style>
</head>
<body>
<div class="page">
  <div class="band"></div><div class="band-accent"></div>
  <div class="content">
    <div class="brand">Telkom University &middot; Direktorat Kemahasiswaan</div>
    <h1>SERTIFIKAT</h1>
    <div class="sub">Pengenalan Kehidupan Kampus bagi Mahasiswa Baru (PKKMB) {{ $year }}</div>
    <div class="body">Diberikan kepada:</div>
    <div class="name">{{ $user->name }}</div>
    <div class="meta">NIM {{ $user->nim }} &middot; {{ $user->studyProgram?->name }} &middot; {{ $user->faculty?->name }}</div>
    <div class="body">
      atas partisipasi aktif dan telah menyelesaikan seluruh rangkaian PKKMB Telkom University
      dengan tema <span class="theme">&ldquo;{{ $theme }}&rdquo;</span> sebagai Young TeluTizen.
    </div>
  </div>
  <div class="footer">
    <div class="sign">
      Bandung, {{ $certificate->issued_at->translatedFormat('d F Y') }}
      <div class="line">Direktur Kemahasiswaan<br>Telkom University</div>
    </div>
    <div class="qr">
      <img src="data:image/svg+xml;base64,{{ $qr }}" width="110" height="110" alt="QR verifikasi"><br>
      Pindai untuk verifikasi
      <div class="number">No. {{ $certificate->number }}</div>
    </div>
  </div>
</div>
</body>
</html>
