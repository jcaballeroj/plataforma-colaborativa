import Brand from '@/Components/Brand';
import { Head, Link } from '@inertiajs/react';

const columns = [
    {
        title: 'Pendiente',
        dot: 'bg-marker',
        note: 'bg-marker-soft',
        notes: [
            { text: 'Definir responsables del módulo de pagos', who: 'LR', tilt: '-1.5deg', delay: 0 },
            { text: 'Reservar sala para la reunión del viernes', who: 'JC', tilt: '1deg', delay: 120 },
        ],
    },
    {
        title: 'En progreso',
        dot: 'bg-indigo-400',
        note: 'bg-indigo-100',
        notes: [
            { text: 'Diseñar la pantalla de inicio', who: 'AM', tilt: '1.2deg', delay: 240 },
            { text: 'Revisar el presupuesto del proyecto', who: 'SG', tilt: '-0.8deg', delay: 360 },
        ],
    },
    {
        title: 'Completada',
        dot: 'bg-indigo-700',
        note: 'bg-white',
        notes: [
            { text: 'Subir el acta de la reunión', who: 'LR', tilt: '-1deg', delay: 480 },
            { text: 'Enviar la primera entrega', who: 'AM', tilt: '1.4deg', delay: 600 },
        ],
    },
];

const features = [
    {
        title: 'Equipos',
        text: 'Crea equipos, invita a tus compañeros y define el rol de cada persona.',
    },
    {
        title: 'Proyectos y tareas',
        text: 'Divide cada proyecto en tareas, asígnalas y sigue su avance de Pendiente a Completada.',
    },
    {
        title: 'Calendario',
        text: 'Agenda reuniones y fechas de entrega en un calendario que todo el equipo puede ver.',
    },
    {
        title: 'Chat y archivos',
        text: 'Conversa con el equipo o en privado, y guarda los archivos de cada proyecto junto a su trabajo.',
    },
];

function Board() {
    return (
        <div
            role="img"
            aria-label="Ejemplo de tablero con tareas pendientes, en progreso y completadas"
            className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6"
            style={{
                backgroundImage:
                    'radial-gradient(#DEE5E0 1.2px, transparent 1.2px)',
                backgroundSize: '18px 18px',
            }}
        >
            <div className="grid gap-6 sm:grid-cols-3 sm:gap-4">
                {columns.map((column) => (
                    <div key={column.title}>
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <span
                                className={`h-2.5 w-2.5 rounded-full ${column.dot}`}
                            />
                            {column.title}
                        </div>

                        <div className="space-y-3">
                            {column.notes.map((note) => (
                                <div
                                    key={note.text}
                                    className={`note rounded-md p-3 shadow-[0_2px_0_rgba(23,33,28,0.12)] ${column.note}`}
                                    style={{
                                        '--tilt': note.tilt,
                                        '--delay': `${note.delay}ms`,
                                    }}
                                >
                                    <p className="text-sm leading-snug text-gray-900">
                                        {note.text}
                                    </p>
                                    <span className="mt-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[10px] font-semibold text-white">
                                        {note.who}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Trabaja en equipo, sin perder el hilo" />

            <div className="min-h-screen bg-gray-100">
                <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
                    <Brand />

                    <nav className="flex items-center gap-2">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Ir a mi panel
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:text-gray-900"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    Crear cuenta
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto max-w-6xl px-5 sm:px-8">
                    <section className="grid items-center gap-12 py-12 lg:grid-cols-[5fr_6fr] lg:py-20">
                        <div>
                            <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                                Todo lo que tu equipo tiene que hacer, en un
                                mismo tablero.
                            </h1>
                            <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-600">
                                Crea proyectos, reparte tareas, agenda reuniones
                                y conversa con tu equipo sin saltar entre
                                aplicaciones.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                    >
                                        Ir a mi panel
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                        >
                                            Crear cuenta
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                                        >
                                            Ya tengo cuenta
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        <Board />
                    </section>

                    <section className="grid gap-x-12 gap-y-10 border-t border-gray-300 py-16 md:grid-cols-2">
                        {features.map((feature) => (
                            <div key={feature.title}>
                                <h2 className="font-display text-xl font-bold text-gray-900">
                                    {feature.title}
                                </h2>
                                <p className="mt-2 max-w-md leading-relaxed text-gray-600">
                                    {feature.text}
                                </p>
                            </div>
                        ))}
                    </section>
                </main>

                <footer className="mx-auto max-w-6xl border-t border-gray-300 px-5 py-8 text-sm text-gray-500 sm:px-8">
                    © {new Date().getFullYear()} Plataforma Colaborativa
                </footer>
            </div>
        </>
    );
}
