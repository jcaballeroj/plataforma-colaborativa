import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Calendar({ team, events, tasks }) {
    const { auth } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);

    // Verificar permisos del usuario actual
    const isOwner = team.owner_id === auth.user.id;
    const isSuperadmin = auth.user.role === 'superadmin';
    const isTeamAdmin = team.members?.find((m) => m.id === auth.user.id)?.pivot?.role === 'admin';
    const canManageEvents = isOwner || isTeamAdmin || isSuperadmin;

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        color: '#3B82F6',
    });

    const formattedEvents = events.map((e) => ({
        id: `event-${e.id}`,
        title: e.title,
        start: e.start_time,
        end: e.end_time,
        backgroundColor: e.color,
        borderColor: e.color,
        extendedProps: { type: 'event', originalId: e.id, description: e.description },
    }));

    const formattedTasks = tasks.map((t) => ({
        id: `task-${t.id}`,
        title: `📌 Tarea: ${t.title}`,
        start: t.due_date,
        allDay: true,
        backgroundColor: '#F59E0B',
        borderColor: '#F59E0B',
        url: route('projects.show', t.project_id),
        extendedProps: { type: 'task' },
    }));

    const calendarData = [...formattedEvents, ...formattedTasks];

    const handleDateClick = (arg) => {
        // Bloquear clic si no tiene permisos
        if (!canManageEvents) return;

        setData({
            ...data,
            start_time: `${arg.dateStr}T09:00`,
            end_time: `${arg.dateStr}T10:00`,
        });
        setModalOpen(true);
    };

    const handleEventClick = (info) => {
        if (info.event.extendedProps.type === 'task') return;

        // Bloquear eliminación si no tiene permisos
        if (!canManageEvents) {
            alert('Detalle del evento: ' + info.event.title + '\n' + (info.event.extendedProps.description || 'Sin descripción adicional.'));
            return;
        }

        if (confirm(`¿Deseas eliminar el evento "${info.event.title}"?`)) {
            router.delete(route('events.destroy', info.event.extendedProps.originalId), {
                preserveScroll: true,
            });
        }
    };

    const submitEvent = (e) => {
        e.preventDefault();
        post(route('events.store', team.slug), {
            onSuccess: () => {
                reset();
                setModalOpen(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('teams.show', team.slug)}
                                className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                                {team.name}
                            </Link>
                            <span className="text-xs text-gray-400">/</span>
                            <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-gray-200">
                                Calendario Compartido
                            </h2>
                        </div>
                    </div>
                    {/* Renderizar el botón SOLO si el usuario tiene permisos */}
                    {canManageEvents && (
                        <button
                            onClick={() => {
                                reset();
                                setModalOpen(true);
                            }}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                        >
                            + Programar Evento
                        </button>
                    )}
                </div>
            }
        >
            <Head title={`Calendario - ${team.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {!canManageEvents && (
                        <div className="mb-4 rounded-md border border-blue-200 bg-blue-100 p-4 text-sm font-medium text-blue-950 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-100">
                            Estás visualizando el calendario en modo de solo lectura. Solo los administradores pueden programar o modificar eventos.
                        </div>
                    )}

                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <div className="calendar-container text-gray-900 dark:text-gray-100">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                events={calendarData}
                                dateClick={handleDateClick}
                                eventClick={handleEventClick}
                                height="auto"
                                locale="es"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CREAR EVENTO */}
            {canManageEvents && modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Programar Nuevo Evento
                        </h3>
                        <form onSubmit={submitEvent} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Título del Evento
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Ej: Reunión de Sprint, Revisión..."
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Inicio
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                    {errors.start_time && <p className="mt-1 text-xs text-red-500">{errors.start_time}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Fin
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                    {errors.end_time && <p className="mt-1 text-xs text-red-500">{errors.end_time}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Color de la etiqueta
                                </label>
                                <input
                                    type="color"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="mt-1 block h-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="2"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Guardando...' : 'Programar Evento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}