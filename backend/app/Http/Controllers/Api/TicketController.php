<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\TicketReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

/** Tiket bantuan & pengaduan milik user yang login. */
class TicketController extends Controller
{
    public function index(Request $request)
    {
        return TicketResource::collection($request->user()->tickets()->latest()->get());
    }

    public function store(Request $request): TicketResource
    {
        $data = $request->validate([
            'category' => 'required|in:BANTUAN,PENGADUAN,KEKERASAN',
            'subject' => 'required|string|max:150',
            'body' => 'required|string|min:10|max:5000',
            'is_anonymous' => 'boolean',
        ]);
        $ticket = Ticket::create([
            'code' => 'TKT-'.Str::upper(Str::random(8)),
            // Laporan anonim tidak menyimpan user_id sama sekali
            'user_id' => ($data['is_anonymous'] ?? false) ? null : $request->user()->id,
            'category' => $data['category'],
            'subject' => strip_tags($data['subject']),
            'body' => strip_tags($data['body']),
            'priority' => match ($data['category']) { 'KEKERASAN' => 'URGENT', 'PENGADUAN' => 'HIGH', default => 'MEDIUM' },
            'is_anonymous' => $data['is_anonymous'] ?? false,
            'status' => 'OPEN',
        ]);

        return new TicketResource($ticket);
    }

    public function show(Ticket $ticket): TicketResource
    {
        Gate::authorize('view', $ticket);

        return new TicketResource($ticket->load('replies'));
    }

    public function reply(Request $request, Ticket $ticket): TicketResource
    {
        Gate::authorize('view', $ticket);
        $data = $request->validate(['body' => 'required|string|max:3000']);
        TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'body' => strip_tags($data['body']),
            'is_staff' => $request->user()->role->isStaff(),
        ]);
        if ($ticket->status === 'RESOLVED' && ! $request->user()->role->isStaff()) {
            $ticket->update(['status' => 'OPEN']);
        }

        return new TicketResource($ticket->load('replies'));
    }
}
