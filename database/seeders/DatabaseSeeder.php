<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Team;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        // 1. Crear tu usuario principal (Superadmin)
        $admin = User::create([
            'name' => 'José David Caballero',
            'email' => 'admin@uis.edu.co',
            'password' => Hash::make('password'),
            'job_title' => 'Superadmin / Full-Stack',
            'role' => 'superadmin',
        ]);

        // 2. Crear 100 usuarios ficticios de golpe
        $users = User::factory()->count(100)->create([
            'password' => Hash::make('password'),
            'role' => 'user',
            'job_title' => $faker->randomElement(['Desarrollador', 'Diseñador UI', 'QA Tester', 'DevOps', 'Scrum Master']),
        ]);
        
        $users->push($admin); // Añadimos tu usuario a la bolsa para que te asignen tareas

        // Arrays para aleatorizar
        $statuses = ['pending', 'in_progress', 'completed'];
        $priorities = ['low', 'medium', 'high', 'urgent'];

        // 3. Crear 5 Equipos grandes
        for ($i = 1; $i <= 5; $i++) {
            $team = Team::create([
                'name' => "Unidad " . $faker->company,
                // 'description' => "Equipo dedicado a: " . $faker->catchPhrase,
                'slug' => \Illuminate\Support\Str::slug("Unidad $i " . $faker->word),
                'owner_id' => $admin->id,
            ]);

            // Asignar entre 20 y 30 usuarios a este equipo
            $teamUsers = $users->random(rand(20, 30))->pluck('id')->toArray();
            if (!in_array($admin->id, $teamUsers)) {
                $teamUsers[] = $admin->id; // Asegurar que siempre estés en los equipos
            }
            $team->members()->attach($teamUsers);

            // 4. Crear 15 Eventos para el Calendario del Equipo
            for ($e = 1; $e <= 15; $e++) {
                $startDate = Carbon::now()->addDays(rand(-10, 30))->setTime(rand(8, 16), 0);
                DB::table('events')->insert([
                    'title' => $faker->randomElement(['Sprint Planning', 'Review', 'Daily', 'Auditoría']) . ': ' . $faker->word,
                    'description' => $faker->sentence,
                    'start_time' => $startDate,
                    'end_time' => (clone $startDate)->addHours(rand(1, 3)),
                    'team_id' => $team->id,
                    'creator_id' => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 5. Crear 3 Proyectos por Equipo
            for ($p = 1; $p <= 3; $p++) {
                $project = Project::create([
                    'name' => 'App ' . $faker->domainWord,
                    'description' => $faker->realText(100),
                    'team_id' => $team->id,
                    'status' => 'active',
                ]);

                // 6. Estrés del Kanban: Crear 40 tareas por proyecto (120 por equipo)
                for ($t = 1; $t <= 40; $t++) {
                    $task = Task::create([
                        'title' => $faker->sentence(4),
                        'description' => $faker->paragraph(2),
                        'status' => $statuses[array_rand($statuses)],
                        'priority' => $priorities[array_rand($priorities)],
                        'due_date' => Carbon::now()->addDays(rand(-5, 45)),
                        'project_id' => $project->id,
                        'creator_id' => $admin->id,
                    ]);

                    // Asignar entre 1 y 4 miembros del equipo a la tarea
                    $assignees = (array) array_rand(array_flip($teamUsers), rand(1, 4));
                    $task->assignees()->attach($assignees);
                }
            }
        }
    }
}