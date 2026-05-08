const GridBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex justify-center overflow-hidden">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(128, 128, 128, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(128, 128, 128, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, black 20%, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 80%)'
        }}
      />
      {/* Optional: Add a subtle glow in the top center for depth */}
      <div className="absolute top-[-20%] w-[60%] h-[50%] bg-tg-primary/10 rounded-full blur-[120px]" />
    </div>
  );
};

export default GridBackground;
