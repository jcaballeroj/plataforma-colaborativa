import Brand from '@/Components/Brand';

export default function GuestLayout({ title, subtitle, children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8 sm:justify-center">
                <div className="mb-8">
                    <Brand />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-7 sm:px-8">
                    {title && (
                        <div className="mb-6">
                            <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="mt-1.5 text-sm text-gray-600">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
