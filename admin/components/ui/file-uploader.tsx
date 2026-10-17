"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  X,
  Upload,
  FileIcon,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(file: File) {
  if (file.type.startsWith("image/"))
    return <ImageIcon className="size-5 text-muted-foreground" />;
  if (file.type === "application/pdf")
    return <FileText className="size-5 text-muted-foreground" />;
  return <FileIcon className="size-5 text-muted-foreground" />;
}

// ─── Context ─────────────────────────────────────────────────────────

interface FileUploaderContextValue {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const FileUploaderContext =
  React.createContext<FileUploaderContextValue | null>(null);

function useFileUploaderContext() {
  const ctx = React.useContext(FileUploaderContext);
  if (!ctx)
    throw new Error(
      "FileUploader compound components must be used within <FileUploader>",
    );
  return ctx;
}

// ─── Root ────────────────────────────────────────────────────────────

interface FileUploaderProps {
  value: File[];
  onValueChange: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

function FileUploader({
  value,
  onValueChange,
  accept,
  maxFiles,
  maxSize,
  multiple = false,
  disabled = false,
  children,
  className,
}: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const contextValue = React.useMemo<FileUploaderContextValue>(
    () => ({
      files: value,
      onFilesChange: onValueChange,
      accept,
      maxFiles,
      maxSize,
      multiple,
      disabled,
      inputRef,
    }),
    [value, onValueChange, accept, maxFiles, maxSize, multiple, disabled],
  );

  const onInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFiles = Array.from(e.target.files ?? []);
      const countLimit = multiple ? (maxFiles ?? newFiles.length) : 1;
      const accepted = validateFiles(newFiles, {
        accept,
        maxFiles,
        maxSize,
        maxFilesCount: countLimit,
      });
      if (accepted.length > 0) {
        onValueChange([...accepted]);
      }
      e.target.value = "";
    },
    [onValueChange, accept, maxFiles, maxSize, multiple],
  );

  return (
    <FileUploaderContext.Provider value={contextValue}>
      <div className={cn("flex flex-col gap-2", className)}>
        {children}
        <input
          type="file"
          ref={inputRef}
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={onInputChange}
        />
      </div>
    </FileUploaderContext.Provider>
  );
}

function validateFiles(
  files: File[],
  opts: {
    accept?: string;
    maxFiles?: number;
    maxSize?: number;
    maxFilesCount?: number;
  },
): File[] {
  const result: File[] = [];
  const count = opts.maxFilesCount ?? opts.maxFiles ?? files.length;
  for (const file of files) {
    if (result.length >= count) break;
    if (opts.maxSize && file.size > opts.maxSize) continue;
    if (opts.accept && !matchAccept(file.type, opts.accept)) continue;
    result.push(file);
  }
  return result;
}

function matchAccept(fileType: string, accept: string): boolean {
  const patterns = accept.split(",").map((s) => s.trim());
  return patterns.some((p) => {
    if (p.endsWith("/*")) return fileType.startsWith(p.replace("/*", "/"));
    if (p.startsWith(".")) {
      // extension check — approximate via mime
      return true; // fallback: allow
    }
    return fileType === p;
  });
}

// ─── Dropzone ────────────────────────────────────────────────────────

interface FileUploaderDropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const FileUploaderDropzone = React.forwardRef<
  HTMLDivElement,
  FileUploaderDropzoneProps
>(({ className, children, ...props }, ref) => {
  const {
    files,
    onFilesChange,
    accept,
    maxFiles,
    maxSize,
    disabled,
    multiple,
    inputRef,
  } = useFileUploaderContext();
  const [dragOver, setDragOver] = React.useState(false);

  const onDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const onDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const onDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      const countLimit = multiple ? (maxFiles ?? droppedFiles.length) : 1;
      const validated = validateFiles(droppedFiles, {
        accept,
        maxFiles,
        maxSize,
        maxFilesCount: countLimit,
      });
      if (validated.length > 0) {
        onFilesChange([...validated]);
      }
    },
    [disabled, files, onFilesChange, accept, maxFiles, maxSize, multiple],
  );

  const onClick = React.useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled, inputRef]);

  return (
    <div
      ref={ref}
      role="region"
      data-dragging={dragOver ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "relative flex select-none flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 outline-none transition-colors",
        "hover:bg-accent/30 focus-visible:border-ring/50",
        "data-dragging:border-primary data-dragging:bg-accent/30",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        dragOver && "border-primary bg-accent/30",
        className,
      )}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      tabIndex={disabled ? undefined : 0}
      {...props}
    >
      {children}
    </div>
  );
});
FileUploaderDropzone.displayName = "FileUploaderDropzone";

// ─── File List ───────────────────────────────────────────────────────

interface FileUploaderListProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

function FileUploaderList({
  className,
  orientation = "vertical",
  ...props
}: FileUploaderListProps) {
  const { files } = useFileUploaderContext();
  if (files.length === 0) return null;

  return (
    <div
      role="list"
      aria-orientation={orientation}
      className={cn(
        "flex flex-col gap-2",
        orientation === "horizontal" && "flex-row overflow-x-auto",
        className,
      )}
      {...props}
    />
  );
}

// ─── File Item ───────────────────────────────────────────────────────

interface FileUploaderItemProps extends React.HTMLAttributes<HTMLDivElement> {
  file: File;
}

function FileUploaderItem({
  file,
  className,
  children,
  ...props
}: FileUploaderItemProps) {
  return (
    <div
      role="listitem"
      className={cn(
        "relative flex items-center gap-2.5 rounded-md border p-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Item Preview ────────────────────────────────────────────────────

interface FileUploaderItemPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  file: File;
  render?: (file: File) => React.ReactNode;
}

function FileUploaderItemPreview({
  file,
  render,
  className,
  ...props
}: FileUploaderItemPreviewProps) {
  const isImage = file.type.startsWith("image/");

  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted",
        className,
      )}
      {...props}
    >
      {render ? (
        render(file)
      ) : isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="size-full object-cover"
          onLoad={(e) => {
            const target = e.target as HTMLImageElement;
            URL.revokeObjectURL(target.src);
          }}
        />
      ) : (
        getFileIcon(file)
      )}
    </div>
  );
}

// ─── Item Metadata ───────────────────────────────────────────────────

interface FileUploaderItemMetadataProps extends React.HTMLAttributes<HTMLDivElement> {
  file: File;
}

function FileUploaderItemMetadata({
  file,
  className,
  ...props
}: FileUploaderItemMetadataProps) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col", className)} {...props}>
      <span className="truncate text-sm font-medium">{file.name}</span>
      <span className="text-xs text-muted-foreground">
        {formatBytes(file.size)}
      </span>
    </div>
  );
}

// ─── Item Delete ─────────────────────────────────────────────────────

interface FileUploaderItemDeleteProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  file: File;
}

function FileUploaderItemDelete({
  file,
  className,
  onClick,
  ...props
}: FileUploaderItemDeleteProps) {
  const { files, onFilesChange } = useFileUploaderContext();

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      onFilesChange(files.filter((f) => f !== file));
    },
    [file, files, onFilesChange, onClick],
  );

  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <X className="size-4" />
    </button>
  );
}

// ─── Exports ─────────────────────────────────────────────────────────

export {
  FileUploader,
  FileUploaderDropzone,
  FileUploaderList,
  FileUploaderItem,
  FileUploaderItemPreview,
  FileUploaderItemMetadata,
  FileUploaderItemDelete,
};
