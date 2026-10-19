<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrivateMessage extends Model
{
    use HasFactory;

    // Esto soluciona el error de MassAssignmentException
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'is_read',
    ];

    // Relación con el usuario que envía el mensaje
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // Relación con el usuario que recibe el mensaje
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}