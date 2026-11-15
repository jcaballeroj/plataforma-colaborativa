<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Cargos de ejemplo para el campo job_title.
     */
    protected const JOB_TITLES = [
        'Desarrollador Backend',
        'Desarrolladora Frontend',
        'Diseñador UX/UI',
        'Project Manager',
        'Analista QA',
        'DevOps Engineer',
        'Científico de Datos',
        'Product Owner',
        'Scrum Master',
        'Analista Funcional',
        'Arquitecto de Software',
        'Soporte Técnico',
        'Marketing Digital',
        'Redactor de Contenidos',
        'Analista Financiero',
    ];

    /**
     * Zonas horarias de ejemplo para el campo timezone.
     */
    protected const TIMEZONES = [
        'America/Bogota',
        'America/Mexico_City',
        'America/Lima',
        'America/Santiago',
        'America/Argentina/Buenos_Aires',
        'Europe/Madrid',
        'UTC',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Nombres en español; el email sigue usando el locale por defecto
            'name' => fake('es_ES')->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'user',
            'job_title' => fake()->randomElement(self::JOB_TITLES),
            'timezone' => fake()->randomElement(self::TIMEZONES),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user is a superadmin.
     */
    public function superadmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'superadmin',
        ]);
    }
}