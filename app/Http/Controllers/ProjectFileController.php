<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectFileController extends Controller
{
    /*
    * Sube un nuevo archivo al proyecto    
    */ 

    public function store(Request $request, Project $project){
        $user = $request->user();
        $team = $project->team;

        // validar permisos (miembros del equipo y super admin)
        if ($team->owner_id !== $user->id && !$team->members->contains($user->id) && $user->role !== 'superadmin') {
            abort(403, 'No tienes permisos para subir archivos a este proyecto.');
        }


        $request->validate([
            'file' => ['required', 'file', 'max:10240'], // 10MB
        ],[
            'file.max' => 'El archivo no debe pesar más de 10MB'
        ]);

        $file = $request->file('file');

        // Guardar el archivo en la carpeta 'project_files' del almacenamiento privado'
        $path = $file->store('project_files');

        $project->files()->create([
            'uploader_id' => $user->id,
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);
        return redirect()->back()->with('success', 'Archivo subido exitosamente.');

    }

    /**
     * Descarga el archivo de forma segura
     */

    public function download(Request $request, Project $project, ProjectFile $file){
        $user = $request->user();
        $team = $project->team;

        // validar permisos (miembros del equipo y super admin)
        if ($team->owner_id !== $user->id && !$team->members->contains($user->id) && $user->role !== 'superadmin') {
            abort(403, 'No tienes permisos para descargar archivos de este proyecto.');
        }

        // Verificar que el archivo pertenece al proyecto
        if ($file->project_id !== $project->id) {
            abort(404, 'Archivo no encontrado en este proyecto.');
        }

        return Storage::download($file->file_path, $file->original_name);
    }


    /**
     * Elimina el archivo del servidor y la base de datos
     */
    public function destroy(Request $request, Project $project, ProjectFile $file){
        $user = $request->user();
        $team = $project->team;
        $isAdmin = $team->members()->where('user_id', $user->id)->wherePivot('role', 'admin')->exists();

        // Solo puede borrarlo el uploader, un admin del equipo o un superadmin
        if ($file->uploader_id !== $user->id && !$isAdmin && $team->owner_id !== $user->id && $user->role !== 'superadmin') {
            abort(403, 'No tienes permisos para eliminar este archivo.');
        }

        Storage::delete($file->file_path);
        $file->delete();
        return redirect()->back()->with('success', 'Archivo eliminado exitosamente.');
    }
}
