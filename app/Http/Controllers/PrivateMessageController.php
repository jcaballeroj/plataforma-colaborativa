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
        $userId = $request->user()->id;

        // 1. Obtener la lista de contactos con dinámica WhatsApp
        $contacts = User::where('id', '!=', $userId)
            ->select('id', 'name', 'avatar', 'job_title', 'role')
            ->get()
            ->map(function ($contact) use ($userId) {
                // Buscar el último mensaje de la conversación
                $lastMessage = PrivateMessage::where(function ($query) use ($userId, $contact) {
                    $query->where('sender_id', $userId)->where('receiver_id', $contact->id);
                })->orWhere(function ($query) use ($userId, $contact) {
                    $query->where('sender_id', $contact->id)->where('receiver_id', $userId);
                })->latest()->first();

                // Contar cuántos mensajes sin leer me ha enviado este contacto
                $unreadCount = PrivateMessage::where('sender_id', $contact->id)
                    ->where('receiver_id', $userId)
                    ->where('is_read', false)
                    ->count();

                // Inyectar estas propiedades temporales al usuario para React
                $contact->last_message_time = $lastMessage ? $lastMessage->created_at : null;
                $contact->last_message_content = $lastMessage ? $lastMessage->content : null;
                $contact->unread_count = $unreadCount;

                return $contact;
            })
            // Ordenar: Los que tienen mensajes más recientes van de primeros
            ->sortByDesc(function ($contact) {
                return $contact->last_message_time ?? '0000-00-00 00:00:00';
            })
            ->values(); // Re-indexar el arreglo para evitar errores de formato en JSON

        $messages = [];
        $activeContact = null;

        // 2. Si se seleccionó un usuario, cargar su historial
        if ($user && $user->id) {
            $activeContact = $user->only('id', 'name', 'avatar', 'job_title', 'role');
            
            // Marcar los mensajes entrantes como leídos
            PrivateMessage::where('sender_id', $user->id)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            // Traer el historial de la conversación ordenado por fecha
            $messages = PrivateMessage::with(['sender:id,name,avatar'])
                ->where(function ($q) use ($userId, $user) {
                    $q->where('sender_id', $userId)
                      ->where('receiver_id', $user->id);
                })
                ->orWhere(function ($q) use ($userId, $user) {
                    $q->where('sender_id', $user->id)
                      ->where('receiver_id', $userId);
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