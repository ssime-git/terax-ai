import { cn } from "@/lib/utils";
import type { MarkdownPreviewTab, Tab } from "@/modules/tabs";
import { useEffect, useRef } from "react";
import {
  MarkdownPreviewPane,
  type MarkdownPreviewPaneHandle,
} from "./MarkdownPreviewPane";

type Props = {
  tabs: Tab[];
  activeId: number;
  onPathChange: (id: number, path: string) => void;
  registerHandle: (id: number, handle: MarkdownPreviewPaneHandle | null) => void;
};

export function MarkdownPreviewStack({
  tabs,
  activeId,
  onPathChange,
  registerHandle,
}: Props) {
  const previews = tabs.filter(
    (t): t is MarkdownPreviewTab => t.kind === "markdown-preview",
  );

  const registerRef = useRef(registerHandle);
  const pathChangeRef = useRef(onPathChange);
  useEffect(() => {
    registerRef.current = registerHandle;
  }, [registerHandle]);
  useEffect(() => {
    pathChangeRef.current = onPathChange;
  }, [onPathChange]);

  const refCallbacks = useRef(
    new Map<number, (h: MarkdownPreviewPaneHandle | null) => void>(),
  );
  const pathCallbacks = useRef(new Map<number, (path: string) => void>());

  const getRefCallback = (id: number) => {
    let cb = refCallbacks.current.get(id);
    if (!cb) {
      cb = (h: MarkdownPreviewPaneHandle | null) => registerRef.current(id, h);
      refCallbacks.current.set(id, cb);
    }
    return cb;
  };
  const getPathCallback = (id: number) => {
    let cb = pathCallbacks.current.get(id);
    if (!cb) {
      cb = (path: string) => pathChangeRef.current(id, path);
      pathCallbacks.current.set(id, cb);
    }
    return cb;
  };

  useEffect(() => {
    const live = new Set(previews.map((t) => t.id));
    for (const id of refCallbacks.current.keys()) {
      if (!live.has(id)) refCallbacks.current.delete(id);
    }
    for (const id of pathCallbacks.current.keys()) {
      if (!live.has(id)) pathCallbacks.current.delete(id);
    }
  }, [previews]);

  if (previews.length === 0) return null;
  return (
    <div className="relative h-full w-full">
      {previews.map((t) => {
        const visible = t.id === activeId;
        return (
          <div
            key={t.id}
            className={cn(
              "absolute inset-0",
              !visible && "invisible pointer-events-none",
            )}
            aria-hidden={!visible}
          >
            <MarkdownPreviewPane
              path={t.path}
              visible={visible}
              onPathChange={getPathCallback(t.id)}
              ref={getRefCallback(t.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
