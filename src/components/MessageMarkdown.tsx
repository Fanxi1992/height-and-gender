import React, { FC, memo } from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import { MessageCodeBlock } from './MessageCodeBlock'; // 导入代码块组件

interface MessageMarkdownProps {
  content: string;
}

// 使用 memo 封装 ReactMarkdown 以优化性能
const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

export const MessageMarkdown: FC<MessageMarkdownProps> = ({ content }) => {
  return (
    <MemoizedReactMarkdown
      // 添加 prose 类以应用 Tailwind Typography 样式，并增强对比度
      className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full break-words prose-headings:text-white prose-a:text-blue-400 prose-strong:text-white prose-strong:font-bold"
      remarkPlugins={[remarkGfm, remarkMath]} // 启用 GFM 和数学公式支持
      rehypePlugins={[rehypeRaw]} // 允许渲染原始 HTML (如果你需要的话，例如处理特殊标记)
      components={{
        // 定制 p 标签渲染 (可选, prose 类已处理大部分样式)
        p({ children }) {
          return <p className="mb-2 last:mb-0 text-white">{children}</p>;
        },
        // 定制列表项渲染，提高对比度
        li({ children }) {
          return <li className="text-white">{children}</li>;
        },
        // 定制代码块渲染
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeContent = String(children).replace(/\n$/, ''); // 获取代码内容并去除末尾换行符

          // 处理行内代码
          if (!match || typeof children !== 'string' || !children.includes('\n')) {
            return (
              <code className={`${className} text-xs bg-gray-700 text-amber-400 px-1 py-0.5 rounded`} {...props}>
                {children}
              </code>
            );
          }

          // 处理代码块
          return (
            <MessageCodeBlock
              key={Math.random()} // 简单的 key 生成方式
              language={match[1]} // 提取语言类型
              value={codeContent}
              {...props}
            />
          );
        },
        // 定制表格样式，增强对比度
        table({ children }) {
          return <table className="border-collapse border border-gray-700 text-white my-4">{children}</table>;
        },
        th({ children }) {
          return <th className="border border-gray-700 bg-gray-800 px-4 py-2 text-white">{children}</th>;
        },
        td({ children }) {
          return <td className="border border-gray-700 px-4 py-2 text-white">{children}</td>;
        },
      }}
    >
      {content}
    </MemoizedReactMarkdown>
  );
};

MessageMarkdown.displayName = 'MessageMarkdown'; 