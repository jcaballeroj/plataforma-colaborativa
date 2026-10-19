import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const Avatar = ({ user, className = "h-10 w-10" }) => (
    <div className={`${className} rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden flex items-center justify-center border border-gray-400 dark:border-gray-500 shrink-0`}>
        {user?.avatar ? (
            <img src={`/storage/${user.avatar}`} alt={user.name} className="h-full w-full object-cover" />
        ) : (
            <span className="text-gray-600 font-bold dark:text-gray-300">{user?.name?.charAt(0)}</span>
        )}
    </div>
);

export default function PrivateChat({ contacts, activeContact, messages }) {
    const authUser = usePage().props.auth.user;
    const messagesEndRef = useRef(null);
    
    // El estado local de los mensajes
    const [chatMessages, setChatMessages] = useState(messages || []);
    // Usamos un estado simple para el input en lugar de Inertia useForm
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Sincronizar al cargar un contacto nuevo
    useEffect(() => {
        setChatMessages(messages || []);
    }, [messages, activeContact]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Escucha de WebSockets (Exclusiva para recibir mensajes del otro)
    useEffect(() => {
        if (!window.Echo || !authUser) return;

        const channel = window.Echo.private(`private.chat.${authUser.id}`)
            .listen('.PrivateMessage.Sent', (e) => {
                if (activeContact && e.message.sender_id == activeContact.id) {
                    setChatMessages(prev => [...prev, e.message]);
                }
            });

        return () => window.Echo.leave(`private.chat.${authUser.id}`);
    }, [authUser, activeContact]);

    // Función de envío usando Axios (Clon exacto de la lógica del Chat de Equipo)
    const submitMessage = async (e) => {
        e.preventDefault();
        if (!content.trim() || isSending) return;

        const textToSend = content;
        setContent(''); // Limpiamos el input al instante
        setIsSending(true);

        // 1. DIBUJO INSTANTÁNEO (Optimistic UI) - El emisor lo ve sin esperar al servidor
        const tempMessage = {
            id: Date.now(),
            content: textToSend,
            sender_id: authUser.id,
            created_at: new Date().toISOString(),
        };
        setChatMessages(prev => [...prev, tempMessage]);

        // 2. PETICIÓN INVISIBLE (Axios)
        try {
            await axios.post(route('chat.private.store', activeContact.id), {
                content: textToSend,
            });
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Mensajería Privada</h2>}>
            <Head title="Chat Privado" />
            <div className="py-8 h-[calc(80vh-80px)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg flex h-[80vh] overflow-hidden border dark:border-gray-700">
                        
                        {/* COLUMNA IZQUIERDA: Contactos */}
                        <div className="w-1/3 border-r dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900/50">
                            <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                                <h3 className="font-bold text-gray-700 dark:text-gray-200">Contactos</h3>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-thin">
                                {contacts.map(contact => {
                                    const isActive = activeContact?.id === contact.id;
                                    return (
                                        <Link
                                            key={contact.id}
                                            href={route('chat.private', contact.id)}
                                            preserveState
                                            className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${
                                                // CORRECCIÓN CSS: Fondo oscuro amigable para modo oscuro para no perder el texto
                                                isActive 
                                                ? 'bg-gray-200 border-gray-400 dark:bg-gray-700 dark:border-gray-500 shadow-sm' 
                                                : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <Avatar user={contact} />
                                            <div className="overflow-hidden">
                                                <p className={`font-semibold text-sm truncate ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {contact.name}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Área de Chat */}
                        <div className="w-2/3 flex flex-col bg-white dark:bg-gray-900">
                            {activeContact ? (
                                <>
                                    <div className="p-4 border-b bg-white dark:bg-gray-800 flex items-center gap-3 dark:border-gray-700">
                                        <Avatar user={activeContact} className="h-10 w-10" />
                                        <h3 className="font-bold dark:text-gray-100">{activeContact.name}</h3>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                                        {chatMessages.map((msg, index) => {
                                            const isMine = msg.sender_id === authUser.id;
                                            return (
                                                <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] rounded-lg p-3 text-sm shadow-sm ${
                                                        isMine 
                                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                                        : 'bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-bl-none dark:text-gray-100'
                                                    }`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="p-4 bg-white border-t dark:bg-gray-800 dark:border-gray-700">
                                        <form onSubmit={submitMessage} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={content}
                                                onChange={e => setContent(e.target.value)}
                                                placeholder="Escribe un mensaje..."
                                                className="flex-1 rounded-full border-gray-300 bg-gray-100 dark:bg-gray-900 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 px-4"
                                                autoComplete="off"
                                            />
                                            <button 
                                                type="submit" 
                                                disabled={isSending || !content.trim()} 
                                                className="bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-full p-2.5 flex items-center justify-center w-10 h-10 disabled:opacity-50"
                                            >
                                                <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" /></svg>
                                            </button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">Selecciona un contacto</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}