<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index(Request $request, Team $team)
    {
        $user = $request->user();
        if ($team->owner_id !== $user->id && !$team->members->contains($user->id) && $user->role !== 'superadmin') {
            abort(403, 'No tienes acceso al chat de este equipo.');
        }

        // Cargar los últimos 50 mensajes con el nombre del usuario
        $messages = $team->messages()->with('user:id,name')->latest()->take(50)->get()->reverse()->values();

        return Inertia::render('Teams/Chat', [
            'team' => $team,
            'initialMessages' => $messages,
        ]);
    }

    public function store(Request $request, Team $team)
    {
        $user = $request->user();
        if ($team->owner_id !== $user->id && !$team->members->contains($user->id) && $user->role !== 'superadmin') {
            abort(403, 'No puedes enviar mensajes aquí.');
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $message = $team->messages()->create([
            'user_id' => $user->id,
            'content' => $validated['content'],
        ]);

        // Emitir el evento por WebSockets a los demás
        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message->load('user:id,name'));
    }
}