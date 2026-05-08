import { useState } from 'react';
import { fileService } from '../services/fileService';
import { toast } from 'sonner';

export const useAvatarUpload = (onAvatarUpdate) => {
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }

    setUploading(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    try {
      // Upload file to server
      const uploadedFile = await fileService.uploadFile(file);
      const avatarUrl = uploadedFile.url;
      
      // Call the callback with the new avatar URL
      if (onAvatarUpdate) {
        onAvatarUpdate(avatarUrl);
      }
      
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to upload avatar');
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const resetPreview = () => {
    setAvatarPreview(null);
  };

  return {
    uploading,
    avatarPreview,
    handleAvatarUpload,
    resetPreview
  };
};
