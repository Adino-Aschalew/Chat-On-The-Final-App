const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full group">
      {label && (
        <label className="block text-sm font-semibold mb-1.5 transition-colors group-focus-within:text-tg-primary text-tg-text">
          {label}
        </label>
      )}
      <input
        className={`input-tg ${
          error ? 'border-red-500/50 focus:ring-red-500/50' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-red-400">
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

export default Input;
