<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request){
        $user = $request->user();
        // 1. Si es SUPERADMIN (Dueño de la Empresa / Dirección Global)
        if ($user->role === 'superadmin') {
            $totalTeams = Team::count();
            $totalProjects = Project::count();
            $totalTasks = Task::count();
            $totalUsers = User::count();

            $recentProjects = Project::with(['team:id,name,slug'])
                ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($q) {
                    $q->where('status', 'completed');
                }])
                ->latest()
                ->take(6)
                ->get();
            // NUEVO: Cargar todos los equipos con sus miembros y el rol pivote
            $allTeams = Team::with(['owner', 'members' => function($q) {
                $q->withPivot('role');
            }])->get();

            return Inertia::render('Dashboard', [
                'role' => 'superadmin',
                'stats' => [
                    'teams' => $totalTeams,
                    'projects' => $totalProjects,
                    'tasks' => $totalTasks,
                    'users' => $totalUsers,
                ],
                'recentProjects' => $recentProjects,
                'allTeams' => $allTeams,
            ]);
        }

        // 2. Si es USUARIO REGULAR / MIEMBRO DE EQUIPO
        // Equipos a los que pertenece
        $myTeams = $user->teams()->withCount('projects')->get();

        // Mis tareas asignadas personalmente en todos mis proyectos
        $myAssignedTasks = Task::whereHas('assignees', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->with(['project.team:id,name,slug'])
        ->orderBy('due_date', 'asc')
        ->get();

        return Inertia::render('Dashboard', [
            'role' => 'user',
            'myTeams' => $myTeams,
            'myAssignedTasks' => $myAssignedTasks,
        ]);
    }
}
