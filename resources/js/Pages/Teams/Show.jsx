import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// --- Componentes SVG para reemplazar Emojis ---
const IconChat = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 2c-5.523 0-10 4.059-10 9.06 0 1.764.57 3.407 1.55 4.805.15.213.23.473.18.735l-.41 2.195a.3.3 0 00.395.348l2.42-.969a.88.88 0 01.7-.024C6.442 18.72 8.167 19.12 10 19.12c5.523 0 10-4.059 10-9.06C20 6.059 15.523 2 10 2zM6.5 10c-.828 0-1.5-.672-1.5-1.5S5.672 7 6.5 7 8 7.672 8 8.5 7.328 10 6.5 10zm5 0c-.828 0-1.5-.672-1.5-1.5S10.672 7 11.5 7 13 7.672 13 8.5 12.328 10 11.5 10zm3.5 1.5c.828 0 1.5-.672 1.5-1.5S15.828 7 15 7s-1.5.672-1.5 1.5.672 1.5 1.5 1.5z" clipRule="evenodd" />
    </svg>
);

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

const IconCrown = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.5.5 0 01.478.362l.38 1.332a.25.25 0 00.171.171l1.332.38a.5.5 0 010 .956l-1.332.38a.25.25 0 00-.171.171l-.38 1.332a.5.5 0 01-.956 0l-.38-1.332a.25.25 0 00-.171-.171l-1.332-.38a.5.5 0 010-.956l1.332-.38a.25.25 0 00.171-.171l.38-1.332A.5.5 0 0118 1.5z" clipRule="evenodd" />
    </svg>
);

const IconArrowLeft = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

export default function Show({ team }) {
    const { auth } = usePage().props;
    const isOwner = team.owner_id === auth.user.id;

    // Estado de modales
    const [projectModal, setProjectModal] = useState(false);
    const [memberModal, setMemberModal] = useState(false);
    
    // Estado para notificaciones de chat
    const [unreadCount, setUnreadCount] = useState(0);

    // Escuchar mensajes en tiempo real para la burbuja de notificación
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.private(`team.${team.id}`)
            .listen('MessageSent', (e) => {
                if (e.message.user_id !== auth.user.id) {
                    setUnreadCount(prev => prev + 1);
                }
            });

        return () => {
            channel.stopListening('MessageSent');
            window.Echo.leave(`team.${team.id}`);
        };
    }, [team.id, auth.user.id]);

    // Formulario de Proyecto
    const projectForm = useForm({
        name: '',
        description: '',
    });

    const submitProject = (e) => {
        e.preventDefault();
        projectForm.post(route('projects.store', team.slug), {
            onSuccess: () => {
                projectForm.reset();
                setProjectModal(false);
            },
        });
    };

    // Formulario de Miembro
    const memberForm = useForm({
        email: '',
        role: 'member',
    });

    const submitMember = (e) => {
        e.preventDefault();
        memberForm.post(route('team-members.store', team.slug), {
            onSuccess: () => {
                memberForm.reset();
                setMemberModal(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            {team.name}
                        </h2>
                        <span className="text-xs text-gray-500">Slug: {team.slug}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('teams.index')}
                            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                            <IconArrowLeft /> Volver a Equipos
                        </Link>

                        <Link
                            href={route('teams.chat', team.slug)}
                            onClick={() => setUnreadCount(0)}
                            className="relative inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors"
                        >
                            <IconChat />
                            Chat de Equipo
                            
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 animate-bounce items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow ring-2 ring-white dark:ring-gray-800">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>

                        <Link
                            href={route('teams.calendar', team.slug)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-indigo-600 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900 transition-colors"
                        >
                            <IconCalendar /> Ver Calendario
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Equipo - ${team.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* SECCIÓN PROYECTOS */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Proyectos ({team.projects.length})
                                </h3>
                                <p className="text-xs text-gray-500">Espacios de trabajo y tableros de tareas</p>
                            </div>
                            <button
                                onClick={() => setProjectModal(true)}
                                className="rounded-md bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                            >
                                + Nuevo Proyecto
                            </button>
                        </div>

                        <div className="mt-4">
                            {team.projects.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No hay proyectos creados en este equipo todavía.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {team.projects.map((proj) => (
                                        <Link
                                            key={proj.id}
                                            href={route('projects.show', proj.id)}
                                            className="block rounded-lg border border-gray-200 p-4 transition hover:border-indigo-500 hover:shadow-sm dark:border-gray-700"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {proj.name}
                                                </h4>
                                                <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800 dark:bg-green-900 dark:text-green-200 uppercase">
                                                    {proj.status}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                                {proj.description || 'Sin descripción'}
                                            </p>
                                            <span className="mt-3 block text-right text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                                                Ver tablero →
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN MIEMBROS */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Miembros del Equipo ({team.members.length})
                                </h3>
                                <p className="text-xs text-gray-500">Colaboradores con acceso a proyectos y chat</p>
                            </div>
                            <button
                                onClick={() => setMemberModal(true)}
                                className="rounded-md bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                + Añadir Miembro
                            </button>
                        </div>

                        <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
                            {team.members.map((member) => (
                                <li key={member.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {member.name}
                                            </p>
                                            {member.id === team.owner_id && (
                                                <span className="text-yellow-500" title="Propietario">
                                                    <IconCrown />
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {member.id === team.owner_id ? (
                                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                Propietario
                                            </span>
                                        ) : isOwner ? (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={member.pivot?.role}
                                                    onChange={(e) => {
                                                        router.patch(route('team-members.update', [team.slug, member.id]), {
                                                            role: e.target.value,
                                                        }, { preserveScroll: true });
                                                    }}
                                                    className="rounded border-gray-300 py-1 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                >
                                                    <option value="member">Miembro</option>
                                                    <option value="admin">Administrador</option>
                                                </select>

                                                <button
                                                    onClick={() => {
                                                        if (confirm(`¿Remover a ${member.name} del equipo?`)) {
                                                            router.delete(route('team-members.destroy', [team.slug, member.id]), {
                                                                preserveScroll: true,
                                                            });
                                                        }
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                                    title="Remover miembro"
                                                >
                                                    <IconTrash />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300 uppercase">
                                                {member.pivot?.role}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* MODAL CREAR PROYECTO */}
            {projectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Crear Nuevo Proyecto
                        </h3>
                        <form onSubmit={submitProject} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Nombre del Proyecto
                                </label>
                                <input
                                    type="text"
                                    value={projectForm.data.name}
                                    onChange={(e) => projectForm.setData('name', e.target.value)}
                                    placeholder="Ej: Sprint 1, Rediseño Web..."
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    autoFocus
                                />
                                {projectForm.errors.name && (
                                    <p className="mt-1 text-xs text-red-500">{projectForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    value={projectForm.data.description}
                                    onChange={(e) => projectForm.setData('description', e.target.value)}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setProjectModal(false)}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={projectForm.processing}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {projectForm.processing ? 'Guardando...' : 'Crear Proyecto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL AGREGAR MIEMBRO */}
            {memberModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Añadir Miembro al Equipo
                        </h3>
                        <form onSubmit={submitMember} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Correo del Usuario
                                </label>
                                <input
                                    type="email"
                                    value={memberForm.data.email}
                                    onChange={(e) => memberForm.setData('email', e.target.value)}
                                    placeholder="usuario@ejemplo.com"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    autoFocus
                                />
                                {memberForm.errors.email && (
                                    <p className="mt-1 text-xs text-red-500">{memberForm.errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Rol en el Equipo
                                </label>
                                <select
                                    value={memberForm.data.role}
                                    onChange={(e) => memberForm.setData('role', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="member">Miembro</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setMemberModal(false)}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={memberForm.processing}
                                    className="rounded-md bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
                                >
                                    {memberForm.processing ? 'Añadiendo...' : 'Añadir al Equipo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}