<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'name',
        'descripcion',
        'status'
    ];

    public function team(){
        return $this->belongsTo(Team::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function files()
    {
        return $this->hasMany(ProjectFile::class);
    }

}
