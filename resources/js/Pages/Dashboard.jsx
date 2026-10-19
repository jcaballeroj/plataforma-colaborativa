import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';

// --- Iconos SVG ---
const IconUsers = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const IconFolder = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>;
const IconCheck = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconTeam = ({ className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>;

export default function Dashboard(props) {
    const { role, stats, recentProjects, allTeams, myTeams, myAssignedTasks } = props;

    // Escuchar actualizaciones en tiempo real solo si es superadmin
    useEffect(() => {
        if (role !== 'superadmin' || !window.Echo) return;

        const channel = window.Echo.private('superadmin.dashboard')
            .listen('.Progress.Updated', () => {
                console.log("⚡ ¡Progreso actualizado en tiempo real!");
                // Recarga silenciosa de las métricas y proyectos
                router.reload({ only: ['stats', 'recentProjects'], preserveScroll: true });
            });

        return () => {
            channel.stopListening('.Progress.Updated');
            window.Echo.leave('superadmin.dashboard');
        };
    }, [role]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-gray-200">
                    {role === 'superadmin' ? '🏢 Panel de Control Directivo' : '📋 Mi Espacio de Trabajo'}
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {role === 'superadmin' ? (
                        <>
                            {/* ESTADÍSTICAS GLOBALES CON ICONOS */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800 flex items-center gap-4">
                                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full dark:bg-indigo-900/30"><IconTeam /></div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Equipos Totales</p>
                                        <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.teams}</p>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800 flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900/30"><IconFolder /></div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Proyectos Activos</p>
                                        <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.projects}</p>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800 flex items-center gap-4">
                                    <div className="p-3 bg-amber-100 text-amber-600 rounded-full dark:bg-amber-900/30"><IconCheck /></div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Tareas en Sistema</p>
                                        <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.tasks}</p>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800 flex items-center gap-4">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full dark:bg-emerald-900/30"><IconUsers /></div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">Usuarios Registrados</p>
                                        <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.users}</p>
                                    </div>
                                </div>
                            </div>

                            {/* PROYECTOS EN CURSO (Se actualizan en tiempo real) */}
                            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-3 dark:border-gray-700">
                                    Supervisión de Proyectos en Curso
                                </h3>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recentProjects.map((p) => {
                                        const progress = p.tasks_count > 0 ? Math.round((p.completed_tasks_count / p.tasks_count) * 100) : 0;
                                        return (
                                            <Link key={p.id} href={route('projects.show', p.id)} className="block p-4 border rounded-lg hover:border-indigo-500 transition shadow-sm dark:border-gray-700">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{p.team?.name}</span>
                                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">{p.status}</span>
                                                </div>
                                                <h4 className="font-bold text-gray-900 dark:text-gray-100 mt-1">{p.name}</h4>
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>Progreso: {progress}%</span>
                                                        <span>{p.completed_tasks_count} / {p.tasks_count} tareas</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* NUEVA SECCIÓN: DIRECTORIO DE EQUIPOS Y MIEMBROS */}
                            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-3 dark:border-gray-700">
                                    Directorio General de Equipos
                                </h3>
                                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {allTeams?.map(team => (
                                        <div key={team.id} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-indigo-600 dark:text-indigo-400">{team.name}</h4>
                                                    <p className="text-xs text-gray-500">Propietario: <span className="font-medium text-gray-900 dark:text-gray-100">{team.owner?.name}</span></p>
                                                </div>
                                                <Link href={route('teams.show', team.slug)} className="text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded dark:bg-gray-700 dark:text-gray-200">
                                                    Gestionar
                                                </Link>
                                            </div>
                                            
                                            <div className="bg-gray-50 rounded p-3 dark:bg-gray-900/50">
                                                <p className="text-xs font-semibold text-gray-700 mb-2 dark:text-gray-300">Miembros del equipo ({team.members.length}):</p>
                                                <div className="space-y-2">
                                                    {team.members.map(member => (
                                                        <div key={member.id} className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-800 dark:text-gray-200">{member.name}</span>
                                                            <span className="text-[10px] uppercase bg-white border px-1.5 py-0.5 rounded text-gray-500 dark:bg-gray-800 dark:border-gray-600">
                                                                {member.pivot.role}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {team.members.length === 0 && <span className="text-xs text-gray-500">Sin miembros adicionales.</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* VISTA DEL MIEMBRO DE EQUIPO (Se mantiene intacta) */
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* ... (Tu código actual para mis tareas asignadas y mis equipos) ... */}
                            <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-3 dark:border-gray-700">
                                    📌 Mis Tareas Asignadas ({myAssignedTasks?.length || 0})
                                </h3>
                                <div className="mt-4 space-y-3">
                                    {!myAssignedTasks || myAssignedTasks.length === 0 ? (
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
                                                    {t.due_date && <span className="text-xs text-gray-500">📅 {new Date(t.due_date).toLocaleDateString()}</span>}
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.status === 'completed' ? 'bg-green-100 text-green-800' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {t.status}
                                                    </span>
                                                    <Link href={route('projects.show', t.project_id)} className="text-xs text-indigo-600 hover:underline">Ir al Tablero →</Link>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-3 dark:border-gray-700">
                                    👥 Mis Equipos ({myTeams?.length || 0})
                                </h3>
                                <div className="mt-4 space-y-3">
                                    {myTeams?.map((team) => (
                                        <Link key={team.id} href={route('teams.show', team.slug)} className="block p-3 border rounded-lg hover:border-indigo-500 transition dark:border-gray-700">
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