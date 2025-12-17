export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-[60vh] gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-4 h-4 rounded-full bg-yellow-400 animate-bounce [animation-delay:-0s]"></div>
            <div className="w-4 h-4 rounded-full bg-green-500 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-4 h-4 rounded-full bg-primary-500 animate-bounce [animation-delay:-0.3s]"></div>
        </div>
    );
}
