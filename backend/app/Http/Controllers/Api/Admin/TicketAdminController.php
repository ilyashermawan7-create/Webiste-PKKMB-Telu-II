<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\TicketReply;
use Illuminate\Http\Request;

class TicketAdminController extends Controller
{
    public function index(Request $request)
    {
        $q = Ticket::with('user:id,name,nim', 'assignee:id,name')
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
            ->when($request->string('category')->toString(), fn ($q, $c) => $q->where('category', $c))
            ->orderByRaw("CASE priority WHEN 'URGENT' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END")
            ->latest();

        return TicketResource::collection($q->paginate(30));
    }

    public function show(Ticket $ticket): TicketResource
    {
        return new TicketResource($ticket->load('replies', 'user', 'assignee'));
    }

    public function update(Request $request, Ticket $ticket): TicketResource
    {
        $data = $request->validate([
            'status' => 'sometimes|in:OPEN,IN_PROGRESS,RESOLVED,CLOSED',
            'priority' => 'sometimes|in:LOW,MEDIUM,HIGH,URGENT',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
            'reply' => 'sometimes|nullable|string|max:3000',
        ]);
        $ticket->update(collect($data)->except('reply')->all());
        if (! empty($data['reply'])) {
            TicketReply::create(['ticket_id' => $ticket->id, 'user_id' => $request->user()->id, 'body' => strip_tags($data['reply']), 'is_staff' => true]);
        }

        return new TicketResource($ticket->load('replies', 'user', 'assignee'));
    }
}
