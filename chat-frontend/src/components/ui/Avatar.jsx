import { User } from '@phosphor-icons/react';

const Avatar = ({ src, alt, size = 'md', className = '', onClick }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const fontSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  // Extract first name from username/email and get its first character
  const getFirstNameInitial = (altText) => {
    if (!altText) return '?';
    
    // If it's an email, use the part before @
    if (altText.includes('@')) {
      altText = altText.split('@')[0];
    }
    
    // Split by common separators and get the first part
    const firstName = altText.split(/[\s._-]/)[0];
    return firstName.charAt(0).toUpperCase();
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden cursor-pointer ${className}`}
      onClick={onClick}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className={`${fontSize[size]} font-bold text-white`}>
          {getFirstNameInitial(alt)}
        </span>
      )}
    </div>
  );
};

export default Avatar;
