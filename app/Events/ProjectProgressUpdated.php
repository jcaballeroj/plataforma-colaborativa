<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectProgressUpdated implements ShouldBroadcastNow
{
    // Añadimos InteractsWithSockets aquí:
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct()
    {
        // Vacío, no necesitamos enviar datos extra
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('superadmin.dashboard'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'Progress.Updated';
    }
}