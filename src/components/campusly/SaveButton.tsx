import { Bookmark } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCampus } from "@/hooks/useCampus";
import { useAuth } from "@/hooks/useAuth";

export function SaveButton({
  eventId,
  title,
  variant = "overlay",
}: {
  eventId: string;
  title: string;
  variant?: "overlay" | "plain";
}) {
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useCampus();
  const { isAuthenticated } = useAuth();
  const saved = isSaved(eventId);

  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isAuthenticated) {
          await navigate({
            to: "/login",
            search: { redirect: `${window.location.pathname}${window.location.search}` },
          });
          return;
        }
        try {
          await toggleSaved(eventId);
          toast(saved ? "Removed from saved" : "Saved for later", { description: title });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Unable to update saved events.");
        }
      }}
      className={cn(
        "flex size-9 items-center justify-center rounded-full transition-all active:scale-95",
        variant === "overlay"
          ? "bg-card/85 text-foreground backdrop-blur-md hover:bg-card"
          : "border border-border bg-card text-foreground hover:bg-secondary",
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-primary text-primary")} />
    </button>
  );
}
