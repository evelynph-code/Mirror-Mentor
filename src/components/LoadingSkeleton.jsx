

function LoadingSkeleton({width = '100%', height = '16px', borderRadius = '8px', style = {}}) {
    return (
        <div style={{
            width,
            height,
            borderRadius,
            backgroundColor: '#f0d9e6',
            background: 'linear-gradient(90deg, #f0d9e6 25%, #fbdce8 50%, #f0d9e6 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            ...style,
        }} />
    )
}

export default LoadingSkeleton