<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;

class TeamMemberController extends Controller
{
    public function store(Request $request, Team $team)
    {
        $currentUser = $request->user();
        $isOwner = $team->owner_id === $currentUser->id;
        $isAdmin = $team->members()
            ->where('user_id', $currentUser->id)
            ->wherePivot('role', 'admin')
            ->exists();

        if (!$isOwner && !$isAdmin) {
            abort(403, 'Solo administradores pueden invitar nuevos miembros.');
        }

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'role' => ['required', 'in:admin,member'],
        ], [
            'email.exists' => 'No existe ningún usuario registrado con este correo electrónico.',
        ]);

        $userToAdd = User::where('email', $validated['email'])->first();

        if ($team->members()->where('user_id', $userToAdd->id)->exists() || $team->owner_id === $userToAdd->id) {
            return redirect()->back()->withErrors([
                'email' => 'El usuario ya es miembro o propietario de este equipo.',
            ]);
        }

        $team->members()->attach($userToAdd->id, [
            'role' => $validated['role'],
        ]);

        return redirect()->back()->with('message', 'Miembro agregado exitosamente.');
    }

    public function destroy(Request $request, Team $team, User $user)
    {
        $currentUser = $request->user();
        $isOwner = $team->owner_id === $currentUser->id;

        if (!$isOwner && $currentUser->role !== 'superadmin') {
            abort(403, 'Solo el propietario o superadministrador puede remover miembros.');
        }

        if ($user->id === $team->owner_id) {
            return redirect()->back()->withErrors(['error' => 'No puedes remover al propietario del equipo.']);
        }

        $team->members()->detach($user->id);

        return redirect()->back()->with('message', 'Miembro removido con éxito.');
    }



    /**
     * Cambiar el rol de un miembro (admin <-> member)
     */
    public function update(Request $request, Team $team, User $user)
    {
        $currentUser = $request->user();
        $isOwner = $team->owner_id === $currentUser->id;

        if (!$isOwner && $currentUser->role !== 'superadmin') {
            abort(403, 'Solo el propietario o superadministrador puede cambiar roles.');
        }

        if ($user->id === $team->owner_id) {
            return redirect()->back()->withErrors(['error' => 'No puedes modificar el rol del dueño del equipo.']);
        }

        $validated = $request->validate([
            'role' => ['required', 'in:admin,member'],
        ]);

        $team->members()->updateExistingPivot($user->id, [
            'role' => $validated['role'],
        ]);

        return redirect()->back()->with('message', 'Rol actualizado con éxito.');
    }


}