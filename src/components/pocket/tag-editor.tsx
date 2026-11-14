import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo-store";
import { DESIRE_META } from "@/lib/labels";
import { DESIRE_IDS, type DesireId, type EvidenceRecord } from "@/lib/types";

export function TagEditor({ record, onClose }: { record: EvidenceRecord | null; onClose: () => void }) {
  const { setTags, resetTags, tagOverrides } = useDemo();
  const [selected, setSelected] = useState<DesireId[]>([]);

  useEffect(() => {
    if (record) setSelected(Array.from(new Set(record.codings.map((c) => c.desire))));
  }, [record]);

  if (!record) return null;
  const overridden = !!tagOverrides[record.id];

  return (
    <Dialog open={!!record} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)]">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl">Review tags · {record.id}</DialogTitle>
          <DialogDescription>
            Correct the desire tags. The original source text below is never changed.
          </DialogDescription>
        </DialogHeader>
        <blockquote className="rounded-xl border-2 border-dashed bg-muted/60 p-3 text-sm">{record.text}</blockquote>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Desire tags</legend>
          <div className="grid grid-cols-2 gap-2">
            {DESIRE_IDS.map((d) => {
              const id = `tag-${record.id}-${d}`;
              const checked = selected.includes(d);
              return (
                <label
                  key={d}
                  htmlFor={id}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-soft/40"
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(v) =>
                      setSelected((s) => (v ? [...s, d] : s.filter((x) => x !== d)))
                    }
                  />
                  {DESIRE_META[d].label}
                </label>
              );
            })}
          </div>
        </fieldset>
        <p className="text-xs text-muted-foreground">
          In this local demo, reviewer edits stay in this browser. With a connected backend, this action would require a signed-in reviewer.
        </p>
        <DialogFooter className="gap-2">
          {overridden && (
            <Button
              variant="ghost"
              onClick={() => {
                resetTags(record.id);
                toast("Restored the original tags.");
                onClose();
              }}
            >
              Restore original tags
            </Button>
          )}
          <Button
            onClick={() => {
              setTags(record.id, selected);
              toast.success(`Saved as human-reviewed · ${record.id}`);
              onClose();
            }}
          >
            Save as reviewed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
