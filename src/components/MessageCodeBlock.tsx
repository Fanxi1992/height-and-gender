import { FC, memo } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism" // 选择一个主题

interface Props {
  language: string
  value: string
}

interface languageMap {
  [key: string]: string | undefined
}

export const programmingLanguages: languageMap = {
  javascript: ".js",
  python: ".py",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  "c++": ".cpp",
  "c#": ".cs",
  ruby: ".rb",
  php: ".php",
  swift: ".swift",
  "objective-c": ".m",
  kotlin: ".kt",
  typescript: ".ts",
  go: ".go",
  perl: ".pl",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  shell: ".sh",
  sql: ".sql",
  html: ".html",
  css: ".css"
  // 添加更多语言映射
}

export const MessageCodeBlock: FC<Props> = memo(({ language, value }) => {
  const copyToClipboard = () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      return
    }

    navigator.clipboard.writeText(value).then(() => {
      // 可以添加复制成功的提示，例如使用 toast
      console.log("Code copied to clipboard!")
    })
  }

  const downloadAsFile = () => {
    const blob = new Blob([value], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = language
      ? `code-${language}${programmingLanguages[language] || ".txt"}`
      : "code.txt"
    link.href = url
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative w-full font-sans text-[14px]">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-1.5 text-xs text-gray-300 rounded-t-md">
        <span className="">{language || "code"}</span>
        <div className="flex items-center space-x-2">
          <button onClick={copyToClipboard} className="hover:text-white">
            复制
          </button>
          <button onClick={downloadAsFile} className="hover:text-white">
            下载
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={coldarkDark} // 使用导入的主题
        customStyle={{ 
          margin: 0, 
          width: "100%", 
          background: "#2d2d2d", // 略微提亮背景色
          padding: "1rem", 
          borderRadius:"0 0 0.375rem 0.375rem",
          fontSize: "14px", // 调整代码字体大小
        }} 
        codeTagProps={{
          style: {
            fontSize: "14px",
            fontFamily: "var(--font-mono)", // 使用你的 monospaced 字体变量
            color: "#f8f8f8" // 更亮的文字颜色
          }
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
})

MessageCodeBlock.displayName = "MessageCodeBlock" 