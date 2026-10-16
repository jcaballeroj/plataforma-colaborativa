<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Team;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /*
    * Crear un nuevo proyecto dentro de un equipo en especifico
    */
    public function store(Request $request, Team $team){
        //Validar que el usuario pertenezca al equipo 
        $user = $request->user();
        if($team->owner_id !== $user->id && !$team->members->contains($user->id) ){
            abort(403, 'No tiene permisos para crear proyectos en este equipo');
        }

        $validate = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string','max:100'],
        ]);

        $team->projects()->create([
            'name'=>$validate['name'],
            'descripcion'=>$validate['descripcion'] ?? null,
            'status' => 'active',
        ]);

        return redirect()->back()->with('message', 'Proyecto creado correctamente');



    }

    /**
     * Muestra el tablero de tareas del proyecto.
     */
    public function show(Request $request, Project $project)
    {
        $project->load([
            'team.members:id,name,email',
            'tasks' => function ($query) {
                $query->with(['assignees:id,name,email', 'labels'])->latest();
            },
            'files.uploader:id,name',
        ]);

        return \Inertia\Inertia::render('Projects/Show', [
            'project' => $project,
        ]);
    }

    /**
     * Actualizar estado del proyecto (Activo, Completado, Archivado)
     */
    public function updateStatus(Request $request, Project $project)
    {
        $user = $request->user();
        $team = $project->team;
        $isOwner = $team->owner_id === $user->id;
        $isAdmin = $team->members()->where('user_id', $user->id)->wherePivot('role', 'admin')->exists();

        if (!$isOwner && !$isAdmin && $user->role !== 'superadmin') {
            abort(403, 'No tienes permisos para modificar el estado de este proyecto.');
        }

        $validated = $request->validate([
            'status' => ['required', 'in:active,completed,archived'],
        ]);

        $project->update([
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('message', 'Estado del proyecto actualizado.');
    }

    
}
