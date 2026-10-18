import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const { auth } = usePage().props;
    useEffect(() => {
        if (!window.Echo || !auth.user) return;

        // Laravel transmite notificaciones al canal App.Models.User.{id}
        const channel = window.Echo.private(`App.Models.User.${auth.user.id}`)
            .notification((notification) => {
                // Al recibir notificación, recarga solo los props de 'auth' en segundo plano
                router.reload({ only: ['auth'] });
            });

        return () => {
            window.Echo.leave(`App.Models.User.${auth.user.id}`);
        };
    }, [auth.user]);
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink href={route('teams.index')} active={route().current('teams.*')}>
                                    Equipos
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            {/* --- MENÚ DE NOTIFICACIONES --- */}
                            <div className="relative mr-4">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                            </svg>
                                            {auth.unreadNotifications?.length > 0 && (
                                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow ring-2 ring-white dark:ring-gray-800">
                                                    {auth.unreadNotifications.length}
                                                </span>
                                            )}
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="right">
                                        {/* Forzamos un ancho mayor para que el texto no se apriete */}
                                        <div className="w-80">
                                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Notificaciones</h3>
                                                {auth.unreadNotifications?.length > 0 && (
                                                    <Link href={route('notifications.read-all')} method="patch" as="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
                                                        Marcar todo como leído
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="max-h-80 overflow-y-auto bg-white dark:bg-gray-900">
                                                {!auth.unreadNotifications || auth.unreadNotifications.length === 0 ? (
                                                    <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                                                        No tienes notificaciones nuevas.
                                                    </div>
                                                ) : (
                                                    auth.unreadNotifications.map((notification) => (
                                                        <Link
                                                            key={notification.id}
                                                            href={route('notifications.read', notification.id)}
                                                            method="patch"
                                                            as="button"
                                                            className="block w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-gray-100 last:border-0 dark:hover:bg-gray-800 dark:border-gray-700 transition-colors"
                                                        >
                                                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200 leading-snug">
                                                                {notification.data.message}
                                                            </p>
                                                            <span className="text-[10px] font-bold text-indigo-500 mt-1 flex items-center gap-1">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> Nueva
                                                            </span>
                                                        </Link>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                            {/* --- FIN MENÚ NOTIFICACIONES --- */}
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('teams.index')} active={route().current('teams.*')}>
                            Equipos
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
