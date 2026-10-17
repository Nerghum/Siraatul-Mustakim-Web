import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { DecoratorNode } from "lexical";
import * as React from "react";

export type VideoPayload = {
  url: string;
  title?: string;
};

type SerializedVideoNode = Spread<
  {
    url: string;
    title: string;
    type: "video";
    version: 1;
  },
  SerializedLexicalNode
>;

function getEmbedUrl(
  url: string,
): { type: "youtube" | "vimeo" | "other"; embedUrl: string } | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }

  // Vimeo
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
  const embed = getEmbedUrl(url);

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

  // Direct video file
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

export class VideoNode extends DecoratorNode<React.ReactNode> {
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
    const div = document.createElement("div");
    return div;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.ReactNode {
    return <VideoComponent url={this.__url} title={this.__title} />;
  }

  exportDOM(): DOMExportOutput {
    const embed = getEmbedUrl(this.__url);
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

  getUrl(): string {
    return this.__url;
  }

  getTitle(): string {
    return this.__title;
  }
}

export function $createVideoNode({ url, title }: VideoPayload): VideoNode {
  return new VideoNode(url, title);
}

export function $isVideoNode(
  node: LexicalNode | null | undefined,
): node is VideoNode {
  return node instanceof VideoNode;
}
