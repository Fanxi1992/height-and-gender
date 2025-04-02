import React, { useState, useRef, useCallback } from 'react';
import { Plus, Send, Square, Paperclip, Mic, X, Image as ImageIcon } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize'; // 需要安装： npm install react-textarea-autosize

// 文件预览接口
interface FilePreview {
  id: string;
  file: File;
  previewUrl: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void; // 更新发送函数以接收文件
  isSubmitting: boolean; // 新增：是否正在提交/等待 AI 回复
  onStopGenerating: () => void; // 新增：停止生成的回调
  files: FilePreview[]; // 新增：文件列表状态
  setFiles: React.Dispatch<React.SetStateAction<FilePreview[]>>; // 新增：更新文件列表的函数
  filesLoading?: boolean; // (可选) 文件是否正在加载
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isSubmitting,
  onStopGenerating,
  files,
  setFiles,
  filesLoading = false, // 默认值
}) => {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文本变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  // 处理发送
  const handleSend = useCallback(() => {
    if ((inputText.trim() || files.length > 0) && !isSubmitting) {
      // 提取 File 对象列表
      const fileList = files.map(f => f.file);
      onSendMessage(inputText.trim(), fileList);
      setInputText('');
      setFiles([]); // 发送后清空文件
    }
  }, [inputText, files, isSubmitting, onSendMessage, setFiles]);

  // 处理键盘事件 (Enter 发送)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行行为
      handleSend();
    }
  };

  // 处理文件选择
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     if (event.target.files) {
       const selectedFiles = Array.from(event.target.files);
       const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));

       if (imageFiles.length > 0) {
         const newFilePreviews = imageFiles.map(file => ({
           id: `${file.name}-${Date.now()}`, // 简单唯一 ID
           file: file,
           previewUrl: URL.createObjectURL(file),
         }));
         // 附加新文件，而不是替换
         setFiles(prev => [...prev, ...newFilePreviews]);
       }
       // 清空 input value 允许再次选择相同文件
       event.target.value = '';
     }
  };

  // 触发文件输入点击
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 移除文件
  const removeFile = (fileId: string) => {
    setFiles(prevFiles => {
       const fileToRemove = prevFiles.find(f => f.id === fileId);
       if (fileToRemove) {
         // 释放对象 URL
         URL.revokeObjectURL(fileToRemove.previewUrl);
       }
       return prevFiles.filter(f => f.id !== fileId);
     });
  };

  // --- 模拟 LibreChat 结构 ---
  return (
    <div className="p-2 sm:p-4 border-t border-gray-800 bg-black">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex flex-col gap-2"
      >
        {/* 文件预览区域 (FileFormChat simulation) */}
        {files.length > 0 && (
           <div className="mx-2 flex flex-wrap gap-2 px-3">
             {files.map((filePreview) => (
               <div key={filePreview.id} className="relative group w-16 h-16">
                 <img
                   src={filePreview.previewUrl}
                   alt={filePreview.file.name}
                   className="w-full h-full object-cover rounded-md border border-gray-600"
                 />
                 <button
                   type="button"
                   onClick={() => removeFile(filePreview.id)}
                   className="absolute -top-1 -right-1 bg-gray-700 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                   aria-label="Remove file"
                 >
                   <X size={14} />
                 </button>
               </div>
             ))}
           </div>
        )}

        {/* 输入框和按钮区域 */}
        <div className="flex items-end gap-2 bg-[#1e1e1e] rounded-3xl p-2 border border-gray-700 focus-within:border-blue-500 transition-colors">
           {/* 附件按钮 (AttachFile simulation) */}
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isSubmitting || filesLoading}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 flex-shrink-0"
            aria-label="Attach image"
          >
            <Paperclip size={20} />
          </button>
          {/* 隐藏的原生文件输入 */}
          <input
            type="file"
            ref={fileInputRef}
            multiple // 允许选择多个文件
            accept="image/*" // 只接受图片
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={isSubmitting || filesLoading}
          />

          {/* 文本输入框 (TextareaAutosize) */}
          <TextareaAutosize
            value={inputText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="给 Healthbot 发送消息"
            className="flex-1 bg-transparent text-white border-none outline-none text-sm resize-none max-h-40 overflow-y-auto px-2 py-1.5 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
            rows={1}
            disabled={isSubmitting || filesLoading}
          />

          {/* 语音按钮 (AudioRecorder placeholder) - 可选 */}
           {/*
           <button type="button" className="p-2 text-gray-400 hover:text-white disabled:opacity-50 flex-shrink-0" disabled={isSubmitting || filesLoading}>
             <Mic size={20} />
           </button>
           */}

          {/* 发送/停止按钮 (SendButton/StopButton simulation) */}
          <div className="flex-shrink-0">
            {isSubmitting ? (
              <button
                type="button"
                onClick={onStopGenerating}
                className="bg-gray-700 text-white rounded-full p-2 hover:bg-gray-600"
                aria-label="Stop generating"
              >
                <Square size={20} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={(!inputText.trim() && files.length === 0) || filesLoading}
                className="bg-blue-500 text-white rounded-full p-2 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-600"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
