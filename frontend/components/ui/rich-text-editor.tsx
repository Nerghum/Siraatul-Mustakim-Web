"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  type LexicalEditor,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $isElementNode,
  $isDecoratorNode,
} from "lexical";
import { TOGGLE_LINK_COMMAND, $isLinkNode, LinkNode } from "@lexical/link";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import {
  $isHeadingNode,
  $createHeadingNode,
  HeadingNode,
  type HeadingTagType,
} from "@lexical/rich-text";
import {
  TableNode,
  TableRowNode,
  TableCellNode,
  INSERT_TABLE_COMMAND,
} from "@lexical/table";
import {
  DecoratorNode,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Image as ImageIcon,
  Video,
  Table,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
// ─── ImageNode (inlined to avoid cross-module duplication) ───────────

type SerializedImageNode = Spread<
  {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    type: "image";
    version: 1;
  },
  SerializedLexicalNode
>;

type ImagePayload = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

function ImageComponent({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}) {
  return (
    <div className="rte-image-wrapper my-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="rte-image max-w-full h-auto rounded-md"
        style={{
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
        }}
        draggable={false}
      />
    </div>
  );
}

class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __alt: string;
  __width: number | undefined;
  __height: number | undefined;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__alt,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  constructor(
    src: string,
    alt: string,
    width?: number,
    height?: number,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
    this.__height = height;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement("div");
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.ReactNode {
    return (
      <ImageComponent
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
      />
    );
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__alt);
    if (this.__width) element.setAttribute("width", String(this.__width));
    if (this.__height) element.setAttribute("height", String(this.__height));
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: (el: HTMLElement) => {
          const img = el as HTMLImageElement;
          return {
            node: new ImageNode(
              img.getAttribute("src") || "",
              img.getAttribute("alt") || "",
              img.width || undefined,
              img.height || undefined,
            ),
          };
        },
        priority: 1,
      }),
    };
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
      type: "image",
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return new ImageNode(
      serializedNode.src,
      serializedNode.alt,
      serializedNode.width,
      serializedNode.height,
    );
  }
}

function $createImageNode({
  src,
  alt,
  width,
  height,
}: ImagePayload): ImageNode {
  return new ImageNode(src, alt, width, height);
}

// ─── VideoNode (inlined to avoid cross-module duplication) ───────────

type SerializedVideoNode = Spread<
  {
    url: string;
    title: string;
    type: "video";
    version: 1;
  },
  SerializedLexicalNode
>;

type VideoPayload = { url: string; title?: string };

function getVideoEmbedUrl(
  url: string,
): { type: "youtube" | "vimeo"; embedUrl: string } | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }
  return null;
}

function VideoComponent({ url, title }: { url: string; title: string }) {
  const embed = getVideoEmbedUrl(url);

  if (embed) {
    return (
      <div className="rte-video-wrapper my-2">
        <div className="relative w-full aspect-video">
          <iframe
            src={embed.embedUrl}
            title={title || "Video"}
            className="absolute inset-0 w-full h-full rounded-md"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {title && <p className="text-xs text-muted-foreground mt-1">{title}</p>}
      </div>
    );
  }

  return (
    <div className="rte-video-wrapper my-2">
      <div className="relative w-full max-w-2xl">
        <video
          src={url}
          controls
          className="w-full rounded-md"
          preload="metadata"
        />
      </div>
      {title && <p className="text-xs text-muted-foreground mt-1">{title}</p>}
    </div>
  );
}

class VideoNode extends DecoratorNode<React.ReactNode> {
  __url: string;
  __title: string;

  static getType(): string {
    return "video";
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__url, node.__title, node.__key);
  }

  constructor(url: string, title: string = "", key?: NodeKey) {
    super(key);
    this.__url = url;
    this.__title = title;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement("div");
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.ReactNode {
    return <VideoComponent url={this.__url} title={this.__title} />;
  }

  exportDOM(): DOMExportOutput {
    const embed = getVideoEmbedUrl(this.__url);
    if (embed) {
      const element = document.createElement("iframe");
      element.setAttribute("src", embed.embedUrl);
      element.setAttribute("title", this.__title || "Video");
      element.setAttribute("frameBorder", "0");
      element.setAttribute("allowFullScreen", "true");
      element.style.width = "100%";
      element.style.aspectRatio = "16/9";
      return { element };
    }

    const element = document.createElement("video");
    element.setAttribute("src", this.__url);
    element.setAttribute("controls", "true");
    if (this.__title) element.setAttribute("title", this.__title);
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: () => ({
        conversion: (el: HTMLElement) => ({
          node: new VideoNode(
            el.getAttribute("src") || "",
            el.getAttribute("title") || "",
          ),
        }),
        priority: 1,
      }),
      video: () => ({
        conversion: (el: HTMLElement) => ({
          node: new VideoNode(
            el.getAttribute("src") || "",
            el.getAttribute("title") || "",
          ),
        }),
        priority: 1,
      }),
    };
  }

  exportJSON(): SerializedVideoNode {
    return {
      url: this.__url,
      title: this.__title,
      type: "video",
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    return new VideoNode(serializedNode.url, serializedNode.title);
  }
}

function $createVideoNode({ url, title }: VideoPayload): VideoNode {
  return new VideoNode(url, title || "");
}

// ─── Theme ───────────────────────────────────────────────────────────

const editorTheme = {
  paragraph: "rte-paragraph",
  heading: { h1: "rte-h1", h2: "rte-h2", h3: "rte-h3" },
  list: {
    ul: "rte-list-ul",
    ol: "rte-list-ol",
    listitem: "rte-listitem",
    nested: { listitem: "rte-nested-listitem" },
    checklist: "rte-checklist",
  },
  link: "rte-link",
  text: {
    bold: "rte-bold",
    italic: "rte-italic",
    underline: "rte-underline",
    strikethrough: "rte-strikethrough",
  },
  table: "rte-table",
  tableRow: "rte-table-row",
  tableCell: "rte-table-cell",
  tableCellHeader: "rte-table-cell-header",
};

// ─── Toolbar state ───────────────────────────────────────────────────

interface ToolbarState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isLink: boolean;
  blockType: string;
}

const defaultToolbarState: ToolbarState = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isLink: false,
  blockType: "paragraph",
};

// ─── Toolbar button ──────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded transition-colors text-gray-600 dark:text-gray-400 [&_svg]:shrink-0",
        "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
        "disabled:pointer-events-none disabled:opacity-50",
        active && "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
      )}
      style={{ width: 22, height: 22, margin: 1 }}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

// ─── Link dialog ─────────────────────────────────────────────────────

function LinkDialog({
  open,
  onOpenChange,
  editor,
  initialUrl,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editor: LexicalEditor;
  initialUrl: string;
}) {
  const [url, setUrl] = React.useState(initialUrl);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || null);
    onOpenChange(false);
  }

  function handleRemove() {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {initialUrl ? "Edit Link" : "Insert Link"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="rte-link-url">URL</Label>
            <Input
              id="rte-link-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            {initialUrl && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
              >
                Remove Link
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Image dialog ────────────────────────────────────────────────────

function ImageDialog({
  open,
  onOpenChange,
  editor,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editor: LexicalEditor;
}) {
  const [src, setSrc] = React.useState("");
  const [alt, setAlt] = React.useState("");
  const [mode, setMode] = React.useState<"url" | "file">("url");
  const [previewUrl, setPreviewUrl] = React.useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSrc(url);
      setMode("url"); // Switch to url mode so the preview shows
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!src.trim()) return;
    editor.update(() => {
      const node = $createImageNode({ src, alt });
      $getSelection()?.insertNodes([node]);
      $getSelection()?.insertNodes([$createParagraphNode()]);
    });
    setSrc("");
    setAlt("");
    setPreviewUrl("");
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setSrc("");
          setAlt("");
          setPreviewUrl("");
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex gap-2 border-b">
              <button
                type="button"
                className={cn(
                  "pb-2 text-sm font-medium border-b-2 transition-colors",
                  mode === "url"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setMode("url")}
              >
                From URL
              </button>
              <button
                type="button"
                className={cn(
                  "pb-2 text-sm font-medium border-b-2 transition-colors",
                  mode === "file"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setMode("file")}
              >
                Upload File
              </button>
            </div>
            {mode === "url" ? (
              <div className="space-y-2">
                <Label htmlFor="rte-image-url">Image URL</Label>
                <Input
                  id="rte-image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={src}
                  onChange={(e) => {
                    setSrc(e.target.value);
                    setPreviewUrl("");
                  }}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Choose Image File</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rte-image-alt">Alt Text</Label>
              <Input
                id="rte-image-alt"
                placeholder="Image description"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
              />
            </div>
            {(previewUrl || src) && (
              <div className="border rounded-md p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl || src}
                  alt={alt || "Preview"}
                  className="max-w-full max-h-40 mx-auto rounded"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!src.trim()}>
              Insert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Video dialog ────────────────────────────────────────────────────

function VideoDialog({
  open,
  onOpenChange,
  editor,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editor: LexicalEditor;
}) {
  const [url, setUrl] = React.useState("");
  const [title, setTitle] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    editor.update(() => {
      const node = $createVideoNode({ url, title });
      $getSelection()?.insertNodes([node]);
      $getSelection()?.insertNodes([$createParagraphNode()]);
    });
    setUrl("");
    setTitle("");
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setUrl("");
          setTitle("");
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Insert Video</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rte-video-url">Video URL</Label>
              <Input
                id="rte-video-url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Supports YouTube, Vimeo, or direct video file URLs (.mp4, .webm)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rte-video-title">Title (optional)</Label>
              <Input
                id="rte-video-title"
                placeholder="Video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim()}>
              Insert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Table dialog ────────────────────────────────────────────────────

function TableDialog({
  open,
  onOpenChange,
  editor,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editor: LexicalEditor;
}) {
  const [rows, setRows] = React.useState(3);
  const [cols, setCols] = React.useState(3);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows: String(rows),
      columns: String(cols),
    });
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setRows(3);
          setCols(3);
        }
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex gap-4">
            <div className="space-y-2">
              <Label htmlFor="rte-table-rows">Rows</Label>
              <Input
                id="rte-table-rows"
                type="number"
                min={1}
                max={50}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rte-table-cols">Columns</Label>
              <Input
                id="rte-table-cols"
                type="number"
                min={1}
                max={20}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Insert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Date dialog ─────────────────────────────────────────────────────

function DateDialog({
  open,
  onOpenChange,
  editor,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editor: LexicalEditor;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [dateValue, setDateValue] = React.useState(today);
  const [format, setFormat] = React.useState<"full" | "short" | "iso">("full");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const date = new Date(dateValue + "T00:00:00");
    let formatted: string;
    switch (format) {
      case "full":
        formatted = date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        break;
      case "short":
        formatted = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        break;
      case "iso":
      default:
        formatted = dateValue;
        break;
    }

    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) {
        sel.insertText(formatted);
      }
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Insert Date</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rte-date">Date</Label>
              <Input
                id="rte-date"
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <div className="flex gap-3">
                {(["full", "short", "iso"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm border transition-colors",
                      format === f
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-accent",
                    )}
                    onClick={() => setFormat(f)}
                  >
                    {f === "full"
                      ? new Date(dateValue + "T00:00:00").toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )
                      : f === "short"
                        ? new Date(dateValue + "T00:00:00").toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : dateValue}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Insert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── ToolbarStatePlugin ──────────────────────────────────────────────

function ToolbarStatePlugin({
  onStateChange,
}: {
  onStateChange: (s: ToolbarState) => void;
}) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection();
        if (!$isRangeSelection(sel)) return;

        const node = sel.anchor.getNode();
        let blockType = "paragraph";

        const element =
          node.getKey() === "root" ? node : node.getTopLevelElementOrThrow();

        if ($isHeadingNode(element)) {
          blockType = element.getTag();
        } else {
          const parentBlock = node.getParent();
          if (parentBlock) {
            const listNode = $getNearestNodeOfType(parentBlock, ListNode);
            if (listNode) blockType = listNode.getListType();
          }
        }

        onStateChange({
          isBold: sel.hasFormat("bold"),
          isItalic: sel.hasFormat("italic"),
          isUnderline: sel.hasFormat("underline"),
          isStrikethrough: sel.hasFormat("strikethrough"),
          isLink: $isLinkNode(node),
          blockType,
        });
      });
    });
  }, [editor, onStateChange]);

  return null;
}

// ─── SyncPlugin ──────────────────────────────────────────────────────

function SyncPlugin({ value }: { value?: string }) {
  const [editor] = useLexicalComposerContext();
  const prevValueRef = React.useRef("");
  const isSyncingRef = React.useRef(false);

  React.useEffect(() => {
    const incoming = value || "";
    if (incoming === prevValueRef.current) return;
    prevValueRef.current = incoming;

    isSyncingRef.current = true;
    editor.update(() => {
      const dom = new DOMParser().parseFromString(incoming, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();

      const blockNodes = [];
      let currentParagraph = null;

      for (const node of nodes) {
        if ($isElementNode(node) && !node.isInline()) {
          if (currentParagraph) {
            blockNodes.push(currentParagraph);
            currentParagraph = null;
          }
          blockNodes.push(node);
        } else if ($isDecoratorNode(node) && !node.isInline()) {
          if (currentParagraph) {
            blockNodes.push(currentParagraph);
            currentParagraph = null;
          }
          blockNodes.push(node);
        } else {
          if (!currentParagraph) {
            currentParagraph = $createParagraphNode();
          }
          currentParagraph.append(node);
        }
      }
      if (currentParagraph) {
        blockNodes.push(currentParagraph);
      }

      root.append(...blockNodes);
    });
    isSyncingRef.current = false;

    // Read back the canonical HTML from Lexical so that any subsequent
    // onChange → value round-trip won't trigger an unnecessary re-sync.
    editor.read(() => {
      prevValueRef.current = $generateHtmlFromNodes(editor, null);
    });
  }, [value, editor]);

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      if (isSyncingRef.current) return;
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        prevValueRef.current = html;
      });
    });
  }, [editor]);

  return null;
}

// ─── ChangeEmitterPlugin ─────────────────────────────────────────────

function ChangeEmitterPlugin({
  onChange,
}: {
  onChange?: (html: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const latestOnChange = React.useRef(onChange);
  React.useEffect(() => {
    latestOnChange.current = onChange;
  });

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      if (!latestOnChange.current) return;
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        latestOnChange.current?.(html);
      });
    });
  }, [editor]);

  return null;
}

// ─── Inline toolbar ──────────────────────────────────────────────────

function InlineToolbar({ toolbarState }: { toolbarState: ToolbarState }) {
  const [editor] = useLexicalComposerContext();
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [imageOpen, setImageOpen] = React.useState(false);
  const [videoOpen, setVideoOpen] = React.useState(false);
  const [tableOpen, setTableOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);

  function openLinkDialog() {
    editor.read(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) {
        const n = sel.anchor.getNode();
        const parent = n.getParent();
        let url = "";
        if ($isLinkNode(parent)) url = parent.getURL();
        else if ($isLinkNode(n)) url = n.getURL();
        setLinkUrl(url);
      }
    });
    setLinkOpen(true);
  }

  return (
    <>
      <div className="flex flex-wrap items-center border-b border-border px-1 py-1 bg-gray-50 dark:bg-gray-900/50" style={{ gap: "2px" }}>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          title="Undo"
        >
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          title="Redo"
        >
          <Redo size={14} />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        {/* Block type selector */}
        <select
          className="rounded border border-gray-300 bg-transparent px-1 text-[11px] outline-none focus:border-primary cursor-pointer appearance-none text-center bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22currentColor%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px_14px] bg-[right_2px_center] bg-no-repeat pr-4"
          style={{ height: 22, width: 75, margin: "0 2px" }}
          value={toolbarState.blockType}
          onChange={(e) => {
            const val = e.target.value;
            editor.update(() => {
              const sel = $getSelection();
              if (!$isRangeSelection(sel)) return;
              const node = sel.anchor.getNode();
              if (val === "paragraph") {
                if ($isHeadingNode(node)) {
                  node.replace($createParagraphNode());
                }
              } else {
                const tag = val as HeadingTagType;
                if ($isHeadingNode(node)) {
                  node.setTag(tag);
                } else {
                  node.replace($createHeadingNode(tag));
                }
              }
            });
          }}
        >
          <option value="paragraph">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          active={toolbarState.isBold}
          title="Bold"
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          active={toolbarState.isItalic}
          title="Italic"
        >
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
          }
          active={toolbarState.isUnderline}
          title="Underline"
        >
          <Underline size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
          }
          active={toolbarState.isStrikethrough}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
          title="Align Left"
        >
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")
          }
          title="Align Center"
        >
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")
          }
          title="Align Right"
        >
          <AlignRight size={14} />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarButton
          onClick={() => {
            if (
              toolbarState.blockType === "ul" ||
              toolbarState.blockType === "checklist" ||
              toolbarState.blockType === "bullet"
            ) {
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
            } else {
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            }
          }}
          active={
            toolbarState.blockType === "ul" ||
            toolbarState.blockType === "bullet"
          }
          title="Bullet List"
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            if (
              toolbarState.blockType === "ol" ||
              toolbarState.blockType === "number"
            ) {
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
            } else {
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            }
          }}
          active={
            toolbarState.blockType === "ol" ||
            toolbarState.blockType === "number"
          }
          title="Numbered List"
        >
          <ListOrdered size={14} />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarButton
          onClick={openLinkDialog}
          active={toolbarState.isLink}
          title="Insert Link"
        >
          <Link size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => setImageOpen(true)} title="Insert Image">
          <ImageIcon size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => setVideoOpen(true)} title="Insert Video">
          <Video size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => setTableOpen(true)} title="Insert Table">
          <Table size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => setDateOpen(true)} title="Insert Date">
          <CalendarDays size={14} />
        </ToolbarButton>
      </div>

      <LinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        editor={editor}
        initialUrl={linkUrl}
      />
      <ImageDialog
        open={imageOpen}
        onOpenChange={setImageOpen}
        editor={editor}
      />
      <VideoDialog
        open={videoOpen}
        onOpenChange={setVideoOpen}
        editor={editor}
      />
      <TableDialog
        open={tableOpen}
        onOpenChange={setTableOpen}
        editor={editor}
      />
      <DateDialog open={dateOpen} onOpenChange={setDateOpen} editor={editor} />
    </>
  );
}

// ─── Props ───────────────────────────────────────────────────────────

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  className?: string;
  id?: string;
  disabled?: boolean;
}

// ─── Main component ──────────────────────────────────────────────────

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Type here...",
  dir,
  className,
  id,
  disabled = false,
}: RichTextEditorProps) {
  const [toolbarState, setToolbarState] =
    React.useState<ToolbarState>(defaultToolbarState);

  const handleStateChange = React.useCallback((s: ToolbarState) => {
    setToolbarState(s);
  }, []);

  return (
    <div
      className={cn(
        "relative rounded-lg border border-gray-300 bg-transparent text-base transition-colors",
        "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
        "disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
        "dark:bg-input/30 dark:disabled:bg-input/80",
        className,
      )}
      dir={dir}
    >
      <LexicalComposer
        initialConfig={{
          namespace: "RichTextEditor",
          theme: editorTheme,
          nodes: [
            LinkNode,
            ListNode,
            ListItemNode,
            HeadingNode,
            ImageNode,
            VideoNode,
            TableNode,
            TableRowNode,
            TableCellNode,
          ],
          onError: (err: Error) => console.error("[Lexical]", err),
          editable: !disabled,
        }}
      >
        <div className="flex flex-col overflow-hidden rounded-lg">
          {!disabled && <InlineToolbar toolbarState={toolbarState} />}
          <div className="relative min-h-20 max-h-75 overflow-auto">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  id={id}
                  className="rte-content min-h-20 w-full resize-none px-2.5 py-2 outline-none"
                  aria-placeholder={placeholder}
                  placeholder={
                    <div className="pointer-events-none absolute left-2.5 top-2 text-muted-foreground select-none">
                      {placeholder}
                    </div>
                  }
                />
              }
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <SyncPlugin value={value} />
            {!disabled && <ChangeEmitterPlugin onChange={onChange} />}
            <HistoryPlugin />
            <LinkPlugin />
            <ListPlugin />
            <CheckListPlugin />
            <TablePlugin />
            {!disabled && (
              <ToolbarStatePlugin onStateChange={handleStateChange} />
            )}
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}

export default RichTextEditor;
