export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                'inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition duration-150 ease-in-out hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 ' +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
