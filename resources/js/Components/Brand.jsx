import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Brand({ className = '', href = '/' }) {
    return (
        <Link
            href={href}
            className={
                'inline-flex items-center gap-3 rounded-lg font-display text-lg font-bold tracking-tight text-gray-900 ' +
                className
            }
        >
            <ApplicationLogo className="h-9 w-9 shrink-0" />
            <span>Plataforma Colaborativa</span>
        </Link>
    );
}
