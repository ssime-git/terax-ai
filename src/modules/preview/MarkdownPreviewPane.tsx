import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDocument } from "@/modules/editor/lib/useDocument";
import { HugeiconsIcon } from "@hugeicons/react";
import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { Streamdown } from "streamdown";
import { MarkdownCode } from "@/components/ai-elements/markdown-code";

type Props = {
  path: string;
  visible: boolean;
  onPathChange: (path: string) => void;
};

export type MarkdownPreviewPaneHandle = {
  reload: () => boolean;
  focusAddressBar: () => void;
  getPath: () => string;
};

const streamdownPlugins = { math, mermaid };
const streamdownComponents = { code: MarkdownCode };

export const MarkdownPreviewPane = forwardRef<MarkdownPreviewPaneHandle, Props>(
  function MarkdownPreviewPane({ path, visible, onPathChange }, ref) {
    const { doc, reload } = useDocument({ path });

    useImperativeHandle(
      ref,
      () => ({
        reload,
        focusAddressBar: () => {},
        getPath: () => path,
      }),
      [path, reload],
    );

    const body = useMemo(() => {
      if (doc.status === "loading") {
        return (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Loading…
          </div>
        );
      }
      if (doc.status === "error") {
        return (
          <div className="flex h-full items-center justify-center px-6 text-center text-xs text-destructive">
            {doc.message}
          </div>
        );
      }
      if (doc.status === "binary") {
        return (
          <div className="flex h-full items-center justify-center px-6 text-center text-xs text-muted-foreground">
            Binary file
          </div>
        );
      }
      if (doc.status === "toolarge") {
        return (
          <div className="flex h-full items-center justify-center px-6 text-center text-xs text-muted-foreground">
            File too large
          </div>
        );
      }
      return (
        <Streamdown
          className={cn(
            "markdown-preview size-full overflow-auto px-5 py-4 text-[13px] leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          )}
          plugins={streamdownPlugins}
          components={streamdownComponents}
        >
          {doc.content}
        </Streamdown>
      );
    }, [doc]);

    return (
      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-md border border-border/60 bg-background"
        style={{
          visibility: visible ? "visible" : "hidden",
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3">
          <div className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
            {path}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void reload();
              onPathChange(path);
            }}
            className="h-7 gap-1.5 px-2.5 text-[11px]"
          >
            <HugeiconsIcon icon={Refresh01Icon} size={12} strokeWidth={1.75} />
            Refresh
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">{body}</div>
      </div>
    );
  },
);
