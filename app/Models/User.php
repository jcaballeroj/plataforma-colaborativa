<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'job_title',
        'timezone'
    ];   

    /**
     * Equipos creador por el usuario(propietario/admin)
     */

    public function ownedTeams(){
        return $this->hasMany(Team::class , 'owner_id');
    }

    /**
     * Equipos a los que pertecene el usuario
     */

    public function teams(){
        return $this->belongsToMany(Team::class)
                    ->withPivot('role')
                    ->withTimestamps();

    }

    public function sentPrivateMessages()
    {
        return $this->hasMany(PrivateMessage::class, 'sender_id');
    }

    public function receivedPrivateMessages()
    {
        return $this->hasMany(PrivateMessage::class, 'receiver_id');
    }


}
