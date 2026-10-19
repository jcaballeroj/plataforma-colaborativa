<?php

namespace App\Http\Controllers;

use App\Events\PrivateMessageSent;
use App\Models\PrivateMessage;
use App\Models\User;
use App\Notifications\NewPrivateMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PrivateMessageController extends Controller
{
    public function index(Request $request, User $user = null)
    {
        // 1. Obtener la lista de contactos (todos excepto yo)
        $contacts = User::where('id', '!=', $request->user()->id)
            ->select('id', 'name', 'avatar', 'job_title', 'role')
            ->get();

        $messages = [];
        $activeContact = null;

        // 2. Si se seleccionó un usuario, cargar su historial
        if ($user && $user->id) {
            $activeContact = $user->only('id', 'name', 'avatar', 'job_title', 'role');
            
            // Marcar los mensajes entrantes como leídos
            PrivateMessage::where('sender_id', $user->id)
                ->where('receiver_id', $request->user()->id)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            // Traer el historial de la conversación ordenado por fecha
            $messages = PrivateMessage::with(['sender:id,name,avatar'])
                ->where(function ($q) use ($request, $user) {
                    $q->where('sender_id', $request->user()->id)
                      ->where('receiver_id', $user->id);
                })
                ->orWhere(function ($q) use ($request, $user) {
                    $q->where('sender_id', $user->id)
                      ->where('receiver_id', $request->user()->id);
                })
                ->orderBy('created_at', 'asc')
                ->get();
        }

        return Inertia::render('Chat/PrivateChat', [
            'contacts' => $contacts,
            'activeContact' => $activeContact,
            'messages' => $messages,
        ]);
    }

    public function store(Request $request, User $user)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $message = PrivateMessage::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $user->id,
            'content' => $validated['content'],
        ]);

        // Cargamos los datos del emisor para mandarlos por WebSocket
       $message->load('sender:id,name,avatar');

        // 1. Envía al chat abierto
        broadcast(new PrivateMessageSent($message));

        // 2. Envía a la campanita global
        $user->notify(new NewPrivateMessage($message, $request->user(), $user->id));

        return back();
    }
}