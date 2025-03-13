import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        preserveWhitespace={true}
        style={{ height: '300px', marginBottom: '50px' }}
      />
      <style jsx>{`
        .rich-text-editor {
          margin-bottom: 3rem;
        }
        .ql-editor {
          min-height: 200px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor; 