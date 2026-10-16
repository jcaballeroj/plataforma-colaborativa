<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class TeamController extends Controller
{
    /**
     * Muestra la lista de equipoas a los que pertenece el usuario autenticado
     */
   
    public function index(Request $request){
        $user = $request->user();

        //Equipos donde es dueño o miembro
        $teams = Team::where('owner_id', $user->id)
            ->orWhereHas('members', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->withCount(['members','projects'])
            ->with('owner:id,name,email')
            ->latest()
            ->get();
        return Inertia::render('Teams/Index', [
            'teams' => $teams,
        ]);    
    }

    /**
     * Almacena un nuevo equipo y asigna al creador como admin en la tabla pivote
     */
public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $slug = Str::slug($validated['name']);
        
        // Si el slug ya existe, añade un sufijo aleatorio
        if (Team::where('slug', $slug)->exists()) {
            $slug .= '-' . Str::lower(Str::random(5));
        }

        $team = Team::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'owner_id' => $request->user()->id,
        ]);

        // Registrar al creador también como miembro con rol 'admin'
        $team->members()->attach($request->user()->id, ['role' => 'admin']);

        return redirect()->route('teams.show', $team->slug)
            ->with('message', 'Equipo creado exitosamente.');
    }

    /**
     * Muestra el detalle del equipo (miembros y proyectos).
     */
    public function show(Request $request, string $slug)
    {
        $user = $request->user();

        $team = Team::where('slug', $slug)
            ->with([
                'owner:id,name,email',
                'members:id,name,email',
                'projects' => function ($query) {
                    $query->latest();
                },
            ])
            ->firstOrFail();

        // Validar que el usuario pertenezca al equipo o sea el owner
        $isMember = $team->owner_id === $user->id || $team->members->contains($user->id);
        if (!$isMember) {
            abort(403, 'No tienes acceso a este equipo.');
        }

        return Inertia::render('Teams/Show', [
            'team' => $team,
        ]);
    }
}