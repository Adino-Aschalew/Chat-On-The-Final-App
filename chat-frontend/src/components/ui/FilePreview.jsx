import Modal from './Modal';
import { X, Download, ZoomIn } from '@phosphor-icons/react';

const FilePreview = ({ isOpen, onClose, file }) => {
  if (!file) return null;

  const isImage = file.mimeType?.startsWith('image');
  const isPdf = file.mimeType === 'application/pdf';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="File Preview" size="lg">
      <div className="relative">
        {isImage ? (
          <img src={file.url} alt={file.fileName} className="max-w-full max-h-[60vh] rounded-lg" />
        ) : isPdf ? (
          <div className="h-[60vh] flex items-center justify-center">
            <iframe src={file.url} className="w-full h-full" title={file.fileName} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">Preview not available for this file type</p>
            <a
              href={file.url}
              download={file.fileName}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Download size={20} />
              Download File
            </a>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-slate-400">{file.fileName}</p>
        <div className="flex gap-2">
          <a
            href={file.url}
            download={file.fileName}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
          >
            <Download size={20} />
            Download
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default FilePreview;
