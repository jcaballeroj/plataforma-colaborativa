export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                'inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 disabled:opacity-50 ' +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
