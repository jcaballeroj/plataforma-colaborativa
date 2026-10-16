import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';

// --- Componentes SVG para reemplazar Emojis ---
const IconCalendar = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
);

const IconTrash = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const IconDocument = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const IconDownload = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export default function Show({ project }) {
    const { auth } = usePage().props;
    const [taskModal, setTaskModal] = useState(false);
    const fileInputRef = useRef(null);

    // --- Formulario de Tareas ---
    const taskForm = useForm({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assignee_ids: [],
    });

    const submitTask = (e) => {
        e.preventDefault();
        taskForm.post(route('tasks.store', project.id), {
            onSuccess: () => {
                taskForm.reset();
                setTaskModal(false);
            },
        });
    };

    const changeStatus = (taskId, newStatus) => {
        router.patch(route('tasks.update-status', taskId), { status: newStatus }, { preserveScroll: true });
    };

    const deleteTask = (taskId) => {
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            router.delete(route('tasks.destroy', taskId), { preserveScroll: true });
        }
    };

    // --- Formulario de Archivos ---
    const fileForm = useForm({
        file: null,
    });

    const submitFile = (e) => {
        e.preventDefault();
        fileForm.post(route('project-files.store', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                fileForm.reset('file');
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const deleteFile = (fileId) => {
        if (confirm('¿Eliminar este archivo permanentemente?')) {
            router.delete(route('project-files.destroy', [project.id, fileId]), { preserveScroll: true });
        }
    };

    // --- Utilidades ---
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const columns = [
        { id: 'pending', title: 'Pendiente', color: 'border-yellow-500' },
        { id: 'in_progress', title: 'En Progreso', color: 'border-blue-500' },
        { id: 'completed', title: 'Completada', color: 'border-green-500' },
    ];

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link href={route('teams.show', project.team.slug)} className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
                                {project.team.name}
                            </Link>
                            <span className="text-xs text-gray-400">/</span>
                            <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-gray-200">
                                {project.name}
                            </h2>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{project.description || 'Sin descripción'}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-500">Estado:</span>
                            <select
                                value={project.status}
                                onChange={(e) => {
                                    router.patch(route('projects.update-status', project.id), { status: e.target.value }, { preserveScroll: true });
                                }}
                                className="rounded border-gray-300 py-1 px-2 text-xs font-bold uppercase shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="active">Activo</option>
                                <option value="completed">Completado</option>
                                <option value="archived">Archivado</option>
                            </select>
                        </div>

                        <button onClick={() => setTaskModal(true)} className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700">
                            <span className="mr-1">+</span> Nueva Tarea
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Proyecto - ${project.name}`} />

            <div className="py-8 space-y-8">
                {/* --- SECCIÓN 1: TABLERO KANBAN --- */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {columns.map((col) => {
                            const colTasks = project.tasks.filter((t) => t.status === col.id);
                            return (
                                <div key={col.id} className={`flex flex-col rounded-lg border-t-4 bg-gray-100 p-4 shadow-sm dark:bg-gray-800 ${col.color}`}>
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-200">{col.title}</h3>
                                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                            {colTasks.length}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        {colTasks.length === 0 ? (
                                            <p className="py-8 text-center text-xs text-gray-400">No hay tareas</p>
                                        ) : (
                                            colTasks.map((task) => (
                                                <div key={task.id} className="rounded-lg bg-white p-4 shadow transition hover:shadow-md dark:bg-gray-700">
                                                    <div className="flex items-start justify-between">
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
                                                        <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Eliminar tarea">
                                                            <IconTrash className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    {task.description && <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{task.description}</p>}

                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${getPriorityBadge(task.priority)}`}>
                                                            {task.priority}
                                                        </span>
                                                        {task.due_date && (
                                                            <span className="inline-flex items-center text-[10px] text-gray-500 dark:text-gray-400">
                                                                <IconCalendar className="mr-1 w-3.5 h-3.5" />
                                                                {new Date(task.due_date).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {task.assignees.length > 0 && (
                                                        <div className="mt-3 flex items-center gap-1">
                                                            <span className="text-[10px] text-gray-400">Para:</span>
                                                            {task.assignees.map((u) => (
                                                                <span key={u.id} className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                                                    {u.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="mt-4 border-t pt-2 dark:border-gray-600">
                                                        <label className="text-[10px] text-gray-500 dark:text-gray-400">Mover a:</label>
                                                        <select
                                                            value={task.status}
                                                            onChange={(e) => changeStatus(task.id, e.target.value)}
                                                            className="mt-1 block w-full rounded border-gray-300 py-1 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                        >
                                                            <option value="pending">Pendiente</option>
                                                            <option value="in_progress">En Progreso</option>
                                                            <option value="completed">Completada</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- SECCIÓN 2: ARCHIVOS DEL PROYECTO --- */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <IconDocument className="w-5 h-5 text-indigo-500" />
                                    Archivos y Documentos
                                </h3>
                                <p className="text-xs text-gray-500">Repositorio central del proyecto (Máx 10MB)</p>
                            </div>
                            
                            <form onSubmit={submitFile} className="mt-4 sm:mt-0 flex items-center gap-3">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => fileForm.setData('file', e.target.files[0])}
                                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={fileForm.processing || !fileForm.data.file}
                                    className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600 whitespace-nowrap"
                                >
                                    {fileForm.processing ? 'Subiendo...' : 'Subir Archivo'}
                                </button>
                            </form>
                        </div>
                        
                        {fileForm.errors.file && <p className="mt-2 text-xs text-red-500">{fileForm.errors.file}</p>}

                        <div className="mt-6">
                            {!project.files || project.files.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No hay archivos adjuntos en este proyecto.</p>
                            ) : (
                                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {project.files.map(file => (
                                        <li key={file.id} className="flex flex-col justify-between rounded-lg border border-gray-200 p-4 hover:border-indigo-500 transition-colors dark:border-gray-700">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    <IconDocument className="w-6 h-6" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100" title={file.original_name}>
                                                        {file.original_name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-1">
                                                        Subido por {file.uploader?.name} • {formatBytes(file.size)}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {new Date(file.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-end gap-3 border-t pt-3 dark:border-gray-700">
                                                <a
                                                    href={route('project-files.download', [project.id, file.id])}
                                                    className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    <IconDownload className="mr-1 w-3.5 h-3.5" /> Descargar
                                                </a>
                                                {(auth.user.id === file.uploader_id || auth.user.role === 'superadmin') && (
                                                    <button
                                                        onClick={() => deleteFile(file.id)}
                                                        className="inline-flex items-center text-xs font-medium text-red-500 hover:text-red-700"
                                                    >
                                                        <IconTrash className="mr-1 w-3.5 h-3.5" /> Eliminar
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL DE TAREAS --- */}
            {taskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Nueva Tarea</h3>
                        <form onSubmit={submitTask} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Título</label>
                                <input
                                    type="text"
                                    value={taskForm.data.title}
                                    onChange={(e) => taskForm.setData('title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Descripción (Opcional)</label>
                                <textarea
                                    value={taskForm.data.description}
                                    onChange={(e) => taskForm.setData('description', e.target.value)}
                                    rows="2"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Prioridad</label>
                                    <select
                                        value={taskForm.data.priority}
                                        onChange={(e) => taskForm.setData('priority', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                        <option value="urgent">Urgente</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Fecha Límite</label>
                                    <input
                                        type="date"
                                        value={taskForm.data.due_date}
                                        onChange={(e) => taskForm.setData('due_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Asignar a miembros</label>
                                <select
                                    multiple
                                    value={taskForm.data.assignee_ids}
                                    onChange={(e) => taskForm.setData('assignee_ids', Array.from(e.target.selectedOptions, (option) => option.value))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {project.team.members.map((member) => (
                                        <option key={member.id} value={member.id}>{member.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setTaskModal(false)} className="rounded-md border px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={taskForm.processing} className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                                    Guardar Tarea
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}