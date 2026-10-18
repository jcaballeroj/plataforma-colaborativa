<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // <-- 1. Importación nueva

class TaskAssigned extends Notification implements ShouldBroadcastNow // <-- 2. Interfaz añadida
{
    // use Queueable;

    public Task $task;
    public User $assigner;

    public function __construct(Task $task, User $assigner)
    {
        $this->task = $task;
        $this->assigner = $assigner;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast']; 
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => "{$this->assigner->name} te ha asignado la tarea: {$this->task->title}",
            'project_id' => $this->task->project_id,
            'url' => route('projects.show', $this->task->project_id),
            'type' => 'task_assigned'
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'message' => "{$this->assigner->name} te ha asignado la tarea: {$this->task->title}",
            'url' => route('projects.show', $this->task->project_id),
        ]);
    }

}