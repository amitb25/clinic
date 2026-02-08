const WarpLoader = ({ visible }) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        {/* Outer ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: '#3b82f6',
          animation: 'warp-spin 1.2s linear infinite',
        }} />
        {/* Middle ring */}
        <div style={{
          position: 'absolute',
          inset: '8px',
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: '#10b981',
          animation: 'warp-spin 1.6s linear infinite reverse',
        }} />
        {/* Inner ring */}
        <div style={{
          position: 'absolute',
          inset: '16px',
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: '#8b5cf6',
          animation: 'warp-spin 1s linear infinite',
        }} />
        {/* Glowing core */}
        <div style={{
          position: 'absolute',
          inset: '26px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #3b82f6, #10b981)',
          animation: 'warp-pulse 1.2s ease-in-out infinite',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(16, 185, 129, 0.3)',
        }} />
      </div>

      <style>{`
        @keyframes warp-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes warp-pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WarpLoader;
