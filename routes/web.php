<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\TaskController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard dinámico con estadísticas o tareas asignadas
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Equipos
    Route::get('/teams', [TeamController::class, 'index'])->name('teams.index');
    Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
    Route::get('/teams/{team:slug}', [TeamController::class, 'show'])->name('teams.show');

    // Proyectos
    Route::post('/teams/{team:slug}/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::patch('/projects/{project}/status', [ProjectController::class, 'updateStatus'])->name('projects.update-status');

    // Miembros de Equipo (Añadir, Cambiar Rol, Remover)
    Route::post('/teams/{team:slug}/members', [TeamMemberController::class, 'store'])->name('team-members.store');
    Route::patch('/teams/{team:slug}/members/{user}', [TeamMemberController::class, 'update'])->name('team-members.update');
    Route::delete('/teams/{team:slug}/members/{user}', [TeamMemberController::class, 'destroy'])->name('team-members.destroy');



    // Calendario de Eventos// Calendario de Equipo
    Route::get('/teams/{team:slug}/calendar', [EventController::class, 'index'])->name('teams.calendar');
    Route::post('/teams/{team:slug}/events', [EventController::class, 'store'])->name('events.store');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');


    // Tareas
    Route::post('/projects/{project}/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.update-status');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';