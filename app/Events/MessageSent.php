<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    public function __construct(Message $message)
    {
        // Cargamos la información del usuario para que el frontend sepa quién lo envió
        $this->message = $message->load('user:id,name');
    }

    /**
     * Canal privado exclusivo para los miembros del equipo.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('team.' . $this->message->team_id),
        ];
    }
}