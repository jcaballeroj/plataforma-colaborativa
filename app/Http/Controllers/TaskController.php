<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Crear una tarea dentro de un proyecto.
     */
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'in:low,medium,high,urgent'],
            'due_date' => ['nullable', 'date'],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => ['exists:users,id'],
        ]);

        $task = $project->tasks()->create([
            'creator_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'],
            'status' => 'pending',
            'due_date' => $validated['due_date'] ?? null,
        ]);

        if (!empty($validated['assignee_ids'])) {
            $task->assignees()->sync($validated['assignee_ids']);
        }

        return redirect()->back()->with('message', 'Tarea creada correctamente.');
    }

    /**
     * Actualizar estado rápido de la tarea (Mover entre columnas Kanban).
     */
    public function updateStatus(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,in_progress,completed'],
        ]);

        $task->update(['status' => $validated['status']]);

        return redirect()->back();
    }

    /**
     * Eliminar una tarea.
     */
    public function destroy(Task $task)
    {
        $task->delete();
        return redirect()->back()->with('message', 'Tarea eliminada.');
    }
}