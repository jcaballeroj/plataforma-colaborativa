<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * Marca una notificación específica como leída y redirige a su URL.
     */
    public function markAsRead(Request $request, $id)
    {
        /** @var DatabaseNotification $notification */
        $notification = $request->user()->notifications()->findOrFail($id);
        
        $notification->markAsRead();

        // Redirigir a la URL del proyecto que viene en la notificación, o volver atrás
        return redirect($notification->data['url'] ?? back()->getTargetUrl());
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