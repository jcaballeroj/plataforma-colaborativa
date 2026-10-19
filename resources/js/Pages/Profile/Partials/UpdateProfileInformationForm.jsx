import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        job_title: user.job_title || '',
        avatar: null, // Guardará el archivo de imagen
        _method: 'patch', // Necesario para enviar archivos en rutas PATCH con Inertia
    });

    const submit = (e) => {
        e.preventDefault();
        // Usamos post en lugar de patch porque estamos enviando un archivo (multipart/form-data)
        post(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-800">Información del Perfil</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-600">
                    Actualiza la información de tu cuenta, tu cargo y tu foto de perfil.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6" encType="multipart/form-data">
                
                {/* Foto de Perfil Actual (Vista Previa) */}
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center border">
                        {user.avatar ? (
                            <img src={`/storage/${user.avatar}`} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-gray-500 font-bold text-xl">{user.name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <InputLabel htmlFor="avatar" value="Subir nueva foto" />
                        <input
                            id="avatar"
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={(e) => setData('avatar', e.target.files[0])}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        <InputError className="mt-2" message={errors.avatar} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Nombre Completo" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* NUEVO: Campo para el Cargo/Rol */}
                <div>
                    <InputLabel htmlFor="job_title" value="Cargo / Rol en el Proyecto" />
                    <TextInput
                        id="job_title"
                        className="mt-1 block w-full"
                        value={data.job_title}
                        onChange={(e) => setData('job_title', e.target.value)}
                        placeholder="Ej. Desarrollador Backend, Arquitecto IA..."
                    />
                    <InputError className="mt-2" message={errors.job_title} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Correo Electrónico" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Guardar Cambios</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">Guardado correctamente.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}