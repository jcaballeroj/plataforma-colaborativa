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
    
    const [chatMessages, setChatMessages] = useState(messages || []);
    const [chatContacts, setChatContacts] = useState(contacts || []);
    
    // NUEVO: Estado para el buscador de contactos
    const [searchTerm, setSearchTerm] = useState('');
    
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Sincronizar al cargar un contacto nuevo y limpiar contador
    useEffect(() => {
        setChatMessages(messages || []);
        if (activeContact) {
            setChatContacts(prev => prev.map(c => c.id === activeContact.id ? { ...c, unread_count: 0 } : c));
        }
    }, [messages, activeContact]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Escucha de WebSockets
    useEffect(() => {
        if (!window.Echo || !authUser) return;

        const channel = window.Echo.private(`private.chat.${authUser.id}`)
            .listen('.PrivateMessage.Sent', (e) => {
                
                if (activeContact && e.message.sender_id == activeContact.id) {
                    setChatMessages(prev => [...prev, e.message]);
                }

                setChatContacts(prevContacts => {
                    let updated = prevContacts.map(c => {
                        if (c.id === e.message.sender_id) {
                            return {
                                ...c,
                                last_message_time: e.message.created_at,
                                last_message_content: e.message.content,
                                unread_count: (activeContact?.id === c.id) ? 0 : (c.unread_count || 0) + 1
                            };
                        }
                        return c;
                    });
                    return updated.sort((a, b) => new Date(b.last_message_time || 0) - new Date(a.last_message_time || 0));
                });
            });

        return () => window.Echo.leave(`private.chat.${authUser.id}`);
    }, [authUser, activeContact]);

    // Función de envío
    const submitMessage = async (e) => {
        e.preventDefault();
        if (!content.trim() || isSending) return;

        const textToSend = content;
        const now = new Date().toISOString();
        setContent(''); 
        setIsSending(true);

        const tempMessage = {
            id: Date.now(),
            content: textToSend,
            sender_id: authUser.id,
            created_at: now,
        };
        setChatMessages(prev => [...prev, tempMessage]);

        setChatContacts(prevContacts => {
            let updated = prevContacts.map(c => {
                if (c.id === activeContact.id) {
                    return { ...c, last_message_time: now, last_message_content: textToSend };
                }
                return c;
            });
            return updated.sort((a, b) => new Date(b.last_message_time || 0) - new Date(a.last_message_time || 0));
        });

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

    // NUEVO: Lógica para filtrar la lista basándose en lo que escribas
    const filteredContacts = chatContacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Mensajería Privada</h2>}>
            <Head title="Chat Privado" />
            <div className="py-8 h-[calc(80vh-80px)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg flex h-[80vh] overflow-hidden border dark:border-gray-700">
                        
                        {/* COLUMNA IZQUIERDA: Contactos (Estilo WhatsApp) */}
                        <div className="w-1/3 border-r dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900/50">
                            <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                                <h3 className="font-bold text-gray-700 dark:text-gray-200">Contactos</h3>
                            </div>
                            
                            {/* NUEVO: Campo de Búsqueda */}
                            <div className="p-2 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar contacto..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                    />
                                </div>
                            </div>

                            <div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-thin">
                                {filteredContacts.length === 0 ? (
                                    <p className="text-center text-xs text-gray-500 py-4">No se encontraron contactos.</p>
                                ) : (
                                    filteredContacts.map(contact => {
                                        const isActive = activeContact?.id === contact.id;
                                        return (
                                            <Link
                                                key={contact.id}
                                                href={route('chat.private', contact.id)}
                                                preserveState
                                                onClick={() => {
                                                    setChatContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unread_count: 0 } : c));
                                                }}
                                                className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${
                                                    isActive 
                                                    ? 'bg-gray-200 border-gray-400 dark:bg-gray-700 dark:border-gray-500 shadow-sm' 
                                                    : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                <Avatar user={contact} />
                                                <div className="overflow-hidden w-full">
                                                    <div className="flex justify-between items-baseline w-full">
                                                        <p className={`font-semibold text-sm truncate ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                            {contact.name}
                                                        </p>
                                                        {contact.last_message_time && (
                                                            <span className="text-[10px] text-gray-400 font-medium ml-2">
                                                                {new Date(contact.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center w-full mt-0.5">
                                                        <p className={`text-xs truncate w-4/5 ${contact.unread_count > 0 && !isActive ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                                            {contact.last_message_content || "Inicia una conversación..."}
                                                        </p>
                                                        {contact.unread_count > 0 && !isActive && (
                                                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white shadow-sm">
                                                                {contact.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })
                                )}
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
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <div className="h-16 w-16 mb-4 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                    </div>
                                    <p>Selecciona un chat para comenzar a enviar mensajes</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}