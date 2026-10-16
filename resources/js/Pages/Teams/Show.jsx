import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ team }) {
    const { auth } = usePage().props;
    const isOwner = team.owner_id === auth.user.id;

    // Estado de modales
    const [projectModal, setProjectModal] = useState(false);
    const [memberModal, setMemberModal] = useState(false);

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
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            {team.name}
                        </h2>
                        <span className="text-xs text-gray-500">Slug: {team.slug}</span>
                    </div>
                    <Link
                        href={route('teams.index')}
                        className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                        ← Volver a Equipos
                    </Link>
                    <Link
                        href={route('teams.calendar', team.slug)}
                        className="ml-4 inline-flex items-center rounded-md border border-indigo-600 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900"
                    >
                        📅 Ver Calendario
                    </Link>
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
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {member.name} {member.id === team.owner_id && '👑 (Propietario)'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Si es el dueño, solo muestra el badge. Si es otro usuario y el que navega es el dueño, muestra el selector de cambio de rol */}
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
                                                    className="text-xs text-red-500 hover:text-red-700 p-1"
                                                    title="Remover miembro"
                                                >
                                                    🗑️
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