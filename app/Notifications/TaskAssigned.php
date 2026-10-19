<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TaskAssigned extends Notification implements ShouldBroadcastNow
{
    public Task $task;
    public User $assigner;
    public $notifiableId; // Guardaremos el ID del usuario aquí
    public string $action;

    public function __construct(Task $task, User $assigner, $notifiableId, string $action = 'asignada')
    {
        $this->task = $task;
        $this->assigner = $assigner;
        $this->notifiableId = $notifiableId;
        $this->action = $action;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => "{$this->assigner->name} te ha {$this->action} la tarea: {$this->task->title} (Prioridad: {$this->task->priority})",
            'project_id' => $this->task->project_id,
            'url' => route('projects.show', $this->task->project_id),
            'type' => 'task_assigned'
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'message' => "Nueva tarea {$this->action}",
        ]);
    }

    // --- FORZAMOS A QUE SE COMPORTE COMO UN EVENTO NORMAL ---
    public function broadcastOn(): array
    {
        return [new PrivateChannel('user.alerts.' . $this->notifiableId)];
    }

    public function broadcastAs(): string
    {
        return 'Task.Assigned';
    }
}