<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * Marca una notificación específica como leída y redirige.
     */
    public function markAsRead(Request $request, $id)
    {
        /** @var DatabaseNotification $notification */
        $notification = $request->user()->notifications()->findOrFail($id);
        
        $notification->markAsRead();

        // 1. Obtenemos la URL completa guardada en la base de datos
        $fullUrl = $notification->data['url'] ?? back()->getTargetUrl();

        // 2. Extraemos SOLO la ruta (ej: de "http://localhost:8000/chat/private/1" sacamos "/chat/private/1")
        // Esto evita el error CORS sin importar desde qué dominio entres.
        $path = parse_url($fullUrl, PHP_URL_PATH);

        // 3. Devolvemos el redirect nativo que el <Link> de Inertia sí entiende perfectamente
        return redirect($path);
    }

    /**
     * Marca todas las notificaciones como leídas de un solo clic.
     */
    public function markAllAsRead(Request $request)
    {
        /** @var \Illuminate\Database\Eloquent\Collection $unreadNotifications */
        $unreadNotifications = $request->user()->unreadNotifications;
        $unreadNotifications->markAsRead();
        
        return back();
    }
}