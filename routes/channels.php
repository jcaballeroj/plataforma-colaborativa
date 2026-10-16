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