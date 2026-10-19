<?php

use App\Models\Team;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

//Canal de chat de equipo
Broadcast::channel('team.{teamId}', function ($user, $teamId) {
    //Verificamos que el usuario sea miembro del equipo
    $team = Team::find($teamId);

    if(!$team){
        return false;
    }

    //Verificar sies el superadmin, dueño o miembro del equipo
    return $user->role === 'superadmin' 
        || $team->owner_id === $user->id 
        || $team->members->contains($user->id);

});
Broadcast::channel('superadmin.dashboard', function ($user) {
    // Convierte a minúsculas, quita espacios y acepta 'superadmin' o 'admin'
    $rol = strtolower(trim($user->role));
    return in_array($rol, ['superadmin', 'admin']);
});

Broadcast::channel('user.alerts.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('private.chat.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});