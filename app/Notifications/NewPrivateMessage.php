<?php

namespace App\Notifications;

use App\Models\PrivateMessage;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewPrivateMessage extends Notification implements ShouldBroadcastNow
{
    public PrivateMessage $message;
    public User $sender;
    public $notifiableId;

    public function __construct(PrivateMessage $message, User $sender, $notifiableId)
    {
        $this->message = $message;
        $this->sender = $sender;
        $this->notifiableId = $notifiableId;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => "{$this->sender->name} te ha enviado un mensaje privado.",
            'url' => route('chat.private', $this->sender->id),
            'type' => 'private_message'
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'message' => "Nuevo mensaje de {$this->sender->name}",
        ]);
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('user.alerts.' . $this->notifiableId)];
    }

    public function broadcastAs(): string
    {
        return 'Message.Received';
    }
}