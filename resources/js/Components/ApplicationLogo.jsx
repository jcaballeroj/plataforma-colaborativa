export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <rect width="40" height="40" rx="10" fill="#0E6455" />
            <rect
                x="9"
                y="9"
                width="15"
                height="15"
                rx="3"
                fill="#FFFFFF"
                transform="rotate(-8 16 16)"
            />
            <rect
                x="17"
                y="17"
                width="15"
                height="15"
                rx="3"
                fill="#F5C842"
                transform="rotate(6 24 24)"
            />
        </svg>
    );
}
