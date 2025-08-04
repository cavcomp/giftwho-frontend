import React, { useState } from 'react';
import { Gift } from 'lucide-react';

export default function ProductImage({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  const onError = () => {
    setHasError(true);
  };

  if (!src || hasError) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
        <Gift className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover rounded-lg"
      onError={onError}
    />
  );
}