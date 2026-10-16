import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard(props) {
    const { role, stats, recentProjects, myTeams, myAssignedTasks } = props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-gray-200">
                    {role === 'superadmin' ? '🏢 Panel de Control Directivo (Superadmin)' : '📋 Mi Espacio de Trabajo'}
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* VISTA DEL DUEÑO / SUPERADMIN */}
                    {role === 'superadmin' ? (
                        <>
                            {/* Estadísticas Globales */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
                                    <p className="text-xs font-medium text-gray-500 uppercase">Equipos Totales</p>
                                    <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.teams}</p>
                                </div>
                                <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
                                    <p className="text-xs font-medium text-gray-500 uppercase">Proyectos Activos</p>
                                    <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.projects}</p>
                                </div>
                                <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
                                    <p className="text-xs font-medium text-gray-500 uppercase">Tareas en Sistema</p>
                                    <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.tasks}</p>
                                </div>
                                <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
                                    <p className="text-xs font-medium text-gray-500 uppercase">Usuarios Registrados</p>
                                    <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.users}</p>
                                </div>
                            </div>

                            {/* Proyectos Recientes y Progreso */}
                            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-3 dark:border-gray-700">
                                    Supervisión de Proyectos en Curso
                                </h3>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recentProjects.map((p) => {
                                        const progress = p.tasks_count > 0 ? Math.round((p.completed_tasks_count / p.tasks_count) * 100) : 0;
                                        return (
                                            <Link
                                                key={p.id}
                                                href={route('projects.show', p.id)}
                                                className="block p-4 border rounded-lg hover:border-indigo-500 transition shadow-sm dark:border-gray-700"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{p.team?.name}</span>
                                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                        {p.status}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-gray-900 dark:text-gray-100 mt-1">{p.name}</h4>
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>Progreso: {progress}%</span>
                                                        <span>{p.completed_tasks_count} / {p.tasks_count} tareas</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* VISTA DEL MIEMBRO DE EQUIPO / COLABORADOR */
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Mis Tareas Asignadas */}
                            <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-3 dark:border-gray-700">
                                    📌 Mis Tareas Asignadas ({myAssignedTasks.length})
                                </h3>
                                <div className="mt-4 space-y-3">
                                    {myAssignedTasks.length === 0 ? (
                                        <p className="text-sm text-gray-500 py-6 text-center">¡Estás al día! No tienes tareas pendientes asignadas.</p>
                                    ) : (
                                        myAssignedTasks.map((t) => (
                                            <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Proyecto: <span className="font-medium text-indigo-600 dark:text-indigo-400">{t.project?.name}</span> ({t.project?.team?.name})
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {t.due_date && (
                                                        <span className="text-xs text-gray-500">
                                                            📅 {new Date(t.due_date).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        t.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {t.status}
                                                    </span>
                                                    <Link
                                                        href={route('projects.show', t.project_id)}
                                                        className="text-xs text-indigo-600 hover:underline"
                                                    >
                                                        Ir al Tablero →
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Mis Equipos */}
                            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-3 dark:border-gray-700">
                                    👥 Mis Equipos ({myTeams.length})
                                </h3>
                                <div className="mt-4 space-y-3">
                                    {myTeams.map((team) => (
                                        <Link
                                            key={team.id}
                                            href={route('teams.show', team.slug)}
                                            className="block p-3 border rounded-lg hover:border-indigo-500 transition dark:border-gray-700"
                                        >
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{team.name}</p>
                                            <p className="text-xs text-gray-500">{team.projects_count} proyectos activos</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}