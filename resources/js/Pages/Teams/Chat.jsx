import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Icono de enviar
const IconSend = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);

export default function Chat({ team, initialMessages }) {
    const { auth } = usePage().props;
    const [messages, setMessages] = useState(initialMessages);
    const messagesEndRef = useRef(null);

    const { data, setData, reset, processing } = useForm({
        content: '',
    });

    // Auto-scroll al último mensaje
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Conexión a WebSockets con Laravel Echo
    useEffect(() => {
        const channel = window.Echo.private(`team.${team.id}`)
            .listen('MessageSent', (e) => {
                if (e.message.user_id !== auth.user.id) {
                    setMessages((prevMessages) => [...prevMessages, e.message]);
                }
            });

        return () => {
            channel.stopListening('MessageSent');
            window.Echo.leave(`team.${team.id}`);
        };
    }, [team.id, auth.user.id]);

    const submitMessage = async (e) => {
        e.preventDefault();
        if (!data.content.trim()) return;

        const contentTemp = data.content;
        reset('content');

        const tempMessage = {
            id: Date.now(),
            content: contentTemp,
            user_id: auth.user.id,
            user: { name: auth.user.name },
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMessage]);

        try {
            await axios.post(route('messages.store', team.slug), {
                content: contentTemp,
            });
        } catch (error) {
            console.error("Error enviando mensaje", error);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={route('teams.show', team.slug)} className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
                            {team.name}
                        </Link>
                        <span className="text-xs text-gray-400">/</span>
                        <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-gray-200">
                            Chat de Equipo
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`Chat - ${team.name}`} />

            <div className="py-8 h-[calc(100vh-140px)] flex flex-col">
                {/* Se añade min-h-0 para forzar a Flexbox a respetar los límites */}
                <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 flex-1 flex flex-col min-h-0">
                    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm overflow-hidden dark:bg-gray-800 border border-gray-200 dark:border-gray-700 min-h-0">
                        
                        {/* ZONA DE MENSAJES: Se añade min-h-0 y las clases de personalización del scrollbar */}
                        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-4 bg-gray-50 dark:bg-gray-900/50 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                    No hay mensajes aún. ¡Escribe el primero!
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMine = msg.user_id === auth.user.id;
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[10px] text-gray-500 mb-1 px-1">
                                                {isMine ? 'Tú' : msg.user?.name}
                                            </span>
                                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm text-sm ${
                                                isMine 
                                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                    : 'bg-white text-gray-800 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 rounded-tl-none'
                                            }`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[9px] text-gray-400 mt-1 px-1">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT DE ENVÍO */}
                        <div className="p-3 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                            <form onSubmit={submitMessage} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 rounded-full border-gray-300 bg-gray-100 px-4 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:bg-gray-900"
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    disabled={processing || !data.content.trim()}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    <IconSend className="w-4 h-4 ml-0.5" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}