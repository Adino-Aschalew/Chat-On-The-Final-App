import { useState } from 'react';
import Modal from '../ui/Modal';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, Download, X } from '@phosphor-icons/react';
import Button from '../ui/Button';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ isOpen, onClose, fileUrl, fileName }) => {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={fileName || 'PDF Viewer'} size="xl">
      <div className="flex items-center gap-2 mb-4">
        <Button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} size="sm">
          <ZoomOut size={20} />
        </Button>
        <span className="text-slate-300">{Math.round(scale * 100)}%</span>
        <Button onClick={() => setScale((s) => Math.min(3, s + 0.25))} size="sm">
          <ZoomIn size={20} />
        </Button>
        <div className="flex-1" />
        <a
          href={fileUrl}
          download={fileName}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
        >
          <Download size={20} />
          Download
        </a>
      </div>
      <div className="max-h-[60vh] overflow-auto bg-slate-900 rounded-lg">
        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={scale} />
          ))}
        </Document>
      </div>
    </Modal>
  );
};

export default PDFViewer;
