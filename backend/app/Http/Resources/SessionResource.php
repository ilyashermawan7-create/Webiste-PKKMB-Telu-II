<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $staff = $request->user()?->role->isStaff();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'mode' => $this->mode,
            'batch' => $this->batch,
            'faculty' => $this->whenLoaded('faculty', fn () => $this->faculty?->only('id', 'code', 'name')),
            'day_number' => $this->day_number,
            'starts_at' => $this->starts_at->toIso8601String(),
            'ends_at' => $this->ends_at->toIso8601String(),
            'location' => $this->location,
            'attendance_open' => $this->attendance_open,
            'is_mandatory' => $this->is_mandatory,
            'points' => $this->points,
            'geofence' => $this->radius_m ? ['lat' => $this->latitude, 'lng' => $this->longitude, 'radius_m' => $this->radius_m] : null,
            // Kode online hanya untuk staf (maba mendapatkannya dari pengumuman saat sesi)
            'online_code' => $this->when((bool) $staff, $this->online_code),
            'attended' => $this->when(isset($this->attended), fn () => (bool) $this->attended),
            'attendances_count' => $this->whenCounted('attendances'),
        ];
    }
}
