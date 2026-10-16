<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request, Team $team)
    {
        $user = $request->user();
        if ($team->owner_id !== $user->id && !$team->members->contains($user->id) && $user->role !== 'superadmin') {
            abort(403, 'No tienes acceso al calendario de este equipo.');
        }

        // Cargamos los miembros con su rol en el pivote para que el Frontend sepa quién es admin
        $team->load(['members' => function ($query) {
            $query->select('users.id', 'users.name', 'users.email');
        }]);

        $events = $team->events()->with('creator:id,name')->get();

        $tasks = $team->projects()->with(['tasks' => function($q) {
            $q->whereNotNull('due_date');
        }])->get()->pluck('tasks')->flatten();

        return Inertia::render('Teams/Calendar', [
            'team' => $team,
            'events' => $events,
            'tasks' => $tasks,
        ]);
    }

    public function store(Request $request, Team $team)
    {
        $user = $request->user();
        $isAdmin = $team->members()->where('user_id', $user->id)->wherePivot('role', 'admin')->exists();

        if ($team->owner_id !== $user->id && !$isAdmin && $user->role !== 'superadmin') {
            abort(403, 'Solo los administradores pueden programar eventos.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
            'color' => 'nullable|string',
        ]);

        $team->events()->create([
            'creator_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'color' => $validated['color'] ?? '#3B82F6',
        ]);

        return redirect()->back()->with('message', 'Evento programado con éxito.');
    }

    public function destroy(Request $request, Event $event)
    {
        $user = $request->user();
        $team = $event->team;
        $isAdmin = $team->members()->where('user_id', $user->id)->wherePivot('role', 'admin')->exists();

        if ($team->owner_id !== $user->id && !$isAdmin && $user->role !== 'superadmin') {
            abort(403, 'Solo los administradores pueden eliminar eventos.');
        }

        $event->delete();
        return redirect()->back()->with('message', 'Evento eliminado.');
    }
}