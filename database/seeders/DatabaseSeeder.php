<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Superadmin (Dueño de la Empresa)
        User::firstOrCreate(
            ['email' => 'admin@collab.com'],
            [
                'name' => 'Director General (Superadmin)',
                'password' => Hash::make('password123'),
                'role' => 'superadmin',
            ]
        );

        // 2. Colaborador de prueba
        User::firstOrCreate(
            ['email' => 'colaborador@collab.com'],
            [
                'name' => 'Carlos Colaborador',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ]
        );
    }
}
