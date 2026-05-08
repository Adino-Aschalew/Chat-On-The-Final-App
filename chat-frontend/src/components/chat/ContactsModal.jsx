import { useState } from 'react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChatCircle, UserPlus } from '@phosphor-icons/react';
import { toast } from 'sonner';

const ContactsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // This would normally fetch contacts from the backend
  // For now, showing a placeholder
  const contacts = [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contacts" size="md">
      {contacts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-4">No contacts yet</p>
          <p className="text-sm text-slate-500">
            Search for users and start conversations to build your contacts list
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Avatar src={contact.avatar} alt={contact.username} size="md" />
              <div className="flex-1">
                <p className="font-medium text-white">{contact.username}</p>
                <p className="text-sm text-slate-400">{contact.email}</p>
              </div>
              <Button size="sm" onClick={() => {/* Start chat */}}>
                <ChatCircle size={16} className="mr-1" />
                Message
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default ContactsModal;
