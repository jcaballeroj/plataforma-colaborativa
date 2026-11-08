import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            title="Entra a tu espacio"
            subtitle="Retoma tus proyectos y tareas donde los dejaste."
        >
            <Head title="Iniciar sesión" />

            {status && (
                <div className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Correo electrónico" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contraseña" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Mantener la sesión iniciada
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded text-sm font-medium text-indigo-700 hover:text-indigo-900"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}
                </div>

                <PrimaryButton className="mt-6 w-full" disabled={processing}>
                    Iniciar sesión
                </PrimaryButton>

                <p className="mt-6 text-center text-sm text-gray-600">
                    ¿Aún no tienes cuenta?{' '}
                    <Link
                        href={route('register')}
                        className="rounded font-semibold text-indigo-700 hover:text-indigo-900"
                    >
                        Crear cuenta
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
