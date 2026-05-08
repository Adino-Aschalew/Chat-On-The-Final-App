import Modal from '../ui/Modal';
import { FileText, Download, X } from '@phosphor-icons/react';
import Button from '../ui/Button';

const DocumentPreview = ({ isOpen, onClose, file }) => {
  if (!file) return null;

  const isDocument = ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimeType);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Document Preview" size="md">
      <div className="text-center py-8">
        <FileText size={64} className="text-slate-400 mx-auto mb-4" />
        <p className="text-white text-lg font-medium mb-2">{file.fileName}</p>
        <p className="text-slate-400 mb-6">
          {file.fileSize ? `${(file.fileSize / 1024).toFixed(2)} KB` : 'Unknown size'}
        </p>
        <div className="flex justify-center gap-4">
          <a
            href={file.url}
            download={file.fileName}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Download size={20} />
            Download
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentPreview;
