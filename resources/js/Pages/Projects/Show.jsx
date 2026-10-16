import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ project }) {
    const [taskModal, setTaskModal] = useState(false);

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
        router.patch(route('tasks.update-status', taskId), {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    const deleteTask = (taskId) => {
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            router.delete(route('tasks.destroy', taskId), {
                preserveScroll: true,
            });
        }
    };

    // Agrupación de tareas por estado
    const columns = [
        { id: 'pending', title: 'Pendiente', color: 'border-yellow-500' },
        { id: 'in_progress', title: 'En Progreso', color: 'border-blue-500' },
        { id: 'completed', title: 'Completada', color: 'border-green-500' },
    ];

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'medium':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('teams.show', project.team.slug)}
                                className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                                {project.team.name}
                            </Link>
                            <span className="text-xs text-gray-400">/</span>
                            <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-gray-200">
                                {project.name}
                            </h2>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{project.description || 'Sin descripción'}</p>
                    </div>
                    
                    {/* AQUÍ SE INTEGRÓ EL PASO 7 (Selector de estado + Botón Nueva Tarea) */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-500">Estado:</span>
                            <select
                                value={project.status}
                                onChange={(e) => {
                                    router.patch(route('projects.update-status', project.id), {
                                        status: e.target.value,
                                    }, { preserveScroll: true });
                                }}
                                className="rounded border-gray-300 py-1 px-2 text-xs font-bold uppercase shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="active">Activo</option>
                                <option value="completed">Completado</option>
                                <option value="archived">Archivado</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setTaskModal(true)}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                        >
                            + Nueva Tarea
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Proyecto - ${project.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Tablero Kanban */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {columns.map((col) => {
                            const colTasks = project.tasks.filter((t) => t.status === col.id);

                            return (
                                <div
                                    key={col.id}
                                    className={`flex flex-col rounded-lg border-t-4 bg-gray-100 p-4 shadow-sm dark:bg-gray-800 ${col.color}`}
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                                            {col.title}
                                        </h3>
                                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                            {colTasks.length}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        {colTasks.length === 0 ? (
                                            <p className="py-8 text-center text-xs text-gray-400">
                                                No hay tareas en esta columna
                                            </p>
                                        ) : (
                                            colTasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="rounded-lg bg-white p-4 shadow transition hover:shadow-md dark:bg-gray-700"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                            {task.title}
                                                        </h4>
                                                        <button
                                                            onClick={() => deleteTask(task.id)}
                                                            className="text-xs text-red-500 hover:text-red-700"
                                                            title="Eliminar tarea"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>

                                                    {task.description && (
                                                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                                            {task.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${getPriorityBadge(
                                                                task.priority
                                                            )}`}
                                                        >
                                                            {task.priority}
                                                        </span>

                                                        {task.due_date && (
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                                📅 {new Date(task.due_date).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Asignados */}
                                                    {task.assignees.length > 0 && (
                                                        <div className="mt-3 flex items-center gap-1">
                                                            <span className="text-[10px] text-gray-400">Para:</span>
                                                            {task.assignees.map((u) => (
                                                                <span
                                                                    key={u.id}
                                                                    className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                                                                >
                                                                    {u.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Select rápido de cambio de estado */}
                                                    <div className="mt-4 border-t pt-2 dark:border-gray-600">
                                                        <label className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            Mover a:
                                                        </label>
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
            </div>

            {/* MODAL CREAR TAREA */}
            {taskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Nueva Tarea
                        </h3>
                        <form onSubmit={submitTask} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Título de la tarea
                                </label>
                                <input
                                    type="text"
                                    value={taskForm.data.title}
                                    onChange={(e) => taskForm.setData('title', e.target.value)}
                                    placeholder="Ej: Diseñar arquitectura de BD..."
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    autoFocus
                                />
                                {taskForm.errors.title && (
                                    <p className="mt-1 text-xs text-red-500">{taskForm.errors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    value={taskForm.data.description}
                                    onChange={(e) => taskForm.setData('description', e.target.value)}
                                    rows="2"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Prioridad
                                    </label>
                                    <select
                                        value={taskForm.data.priority}
                                        onChange={(e) => taskForm.setData('priority', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                        <option value="urgent">Urgente</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Fecha Límite
                                    </label>
                                    <input
                                        type="date"
                                        value={taskForm.data.due_date}
                                        onChange={(e) => taskForm.setData('due_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Asignar a miembros
                                </label>
                                <select
                                    multiple
                                    value={taskForm.data.assignee_ids}
                                    onChange={(e) =>
                                        taskForm.setData(
                                            'assignee_ids',
                                            Array.from(e.target.selectedOptions, (option) => option.value)
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    {project.team.members.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.email})
                                        </option>
                                    ))}
                                </select>
                                <span className="text-[10px] text-gray-500">Mantén Ctrl presionado para seleccionar varios.</span>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setTaskModal(false)}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={taskForm.processing}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {taskForm.processing ? 'Guardando...' : 'Crear Tarea'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}