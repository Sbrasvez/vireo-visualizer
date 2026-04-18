import { useState } from "react";
import { Heart, MessageCircle, ImagePlus, Send, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import EditorialPageHeader from "@/components/EditorialPageHeader";
import MotionCard from "@/components/MotionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCommunityList } from "@/components/EditorialSkeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  useCommunityPosts,
  useCreatePost,
  useToggleLike,
  usePostComments,
  useAddComment,
  type CommunityPost,
} from "@/hooks/useCommunity";
import { Link } from "react-router-dom";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ora";
  if (mins < 60) return `${mins}m fa`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h fa`;
  return `${Math.floor(h / 24)}g fa`;
}

function CreatePostDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [tags, setTags] = useState("");
  const create = useCreatePost();

  const submit = () => {
    if (!title.trim()) return;
    create.mutate(
      {
        title,
        body,
        image,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle(""); setBody(""); setImage(null); setTags("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <ImagePlus className="size-4 mr-2" /> Pubblica
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-light">
            Condividi un piatto
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Titolo (es. Pasta zucchine e menta)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Racconta la ricetta o l'ispirazione…" value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
          <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
          <Input placeholder="Tag (separati da virgola): vegano, estate" value={tags} onChange={(e) => setTags(e.target.value)} />
          <Button onClick={submit} disabled={create.isPending || !title.trim()} className="w-full rounded-full">
            {create.isPending ? <Loader2 className="size-4 animate-spin" /> : "Pubblica"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CommentsSection({ postId }: { postId: string }) {
  const { data: comments = [], isLoading } = usePostComments(postId);
  const addComment = useAddComment();
  const [body, setBody] = useState("");
  const { user } = useAuth();

  return (
    <div className="border-t border-border/60 pt-4 mt-4 space-y-3">
      {isLoading ? (
        <Skeleton className="h-4 w-32" />
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Nessun commento ancora.</p>
          )}
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-2 text-sm">
              <Avatar className="size-7">
                <AvatarImage src={c.author?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">{c.author?.display_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-muted/60 rounded-2xl px-3 py-2">
                <p className="text-xs font-semibold">{c.author?.display_name ?? "Utente"}</p>
                <p className="text-sm">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {user && (
        <div className="flex gap-2">
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Scrivi un commento…"
            className="rounded-full"
            onKeyDown={(e) => {
              if (e.key === "Enter" && body.trim()) {
                addComment.mutate({ postId, body });
                setBody("");
              }
            }}
          />
          <Button
            size="icon"
            disabled={!body.trim() || addComment.isPending}
            className="rounded-full shrink-0"
            onClick={() => {
              addComment.mutate({ postId, body });
              setBody("");
            }}
          >
            <Send className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, index }: { post: CommunityPost; index: number }) {
  const toggleLike = useToggleLike();
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();

  return (
    <MotionCard
      delay={Math.min(index, 8) * 0.05}
      lift="subtle"
      className="group rounded-2xl border border-border/60 bg-card overflow-hidden"
    >
      <div className="p-5 space-y-4">
        {/* Author + index */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 ring-2 ring-background">
              <AvatarImage src={post.author?.avatar_url ?? undefined} />
              <AvatarFallback>{post.author?.display_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display text-sm font-medium leading-tight">
                {post.author?.display_name ?? "Utente Vireo"}
              </p>
              <p className="text-xs text-muted-foreground font-mono tracking-wider">
                {timeAgo(post.created_at)}
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            N°{String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Title + body */}
        <div>
          <h3 className="font-display text-2xl font-light leading-snug text-foreground">
            {post.title}
          </h3>
          {post.body && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {post.body}
            </p>
          )}
        </div>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="relative overflow-hidden bg-muted">
          <img
            src={post.image_url}
            alt={post.title}
            loading="lazy"
            className="w-full object-cover max-h-[500px] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          />
        </div>
      )}

      <div className="p-5 pt-4 space-y-3">
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="text-[10px] font-mono tracking-wider uppercase border-border/60"
              >
                #{t}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 pt-3 border-t border-border/60">
          <Button
            variant="ghost"
            size="sm"
            disabled={!user}
            onClick={() => toggleLike.mutate({ postId: post.id, liked: !!post.liked_by_me })}
            className={`rounded-full transition-all ${post.liked_by_me ? "text-destructive" : ""}`}
          >
            <Heart
              className={`size-4 mr-1.5 transition-transform ${post.liked_by_me ? "fill-current scale-110" : ""}`}
            />
            <span className="font-mono tabular-nums text-xs">{post.likes_count}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments((v) => !v)}
            className="rounded-full"
          >
            <MessageCircle className="size-4 mr-1.5" />
            <span className="font-mono tabular-nums text-xs">{post.comments_count}</span>
          </Button>
        </div>

        {showComments && <CommentsSection postId={post.id} />}
      </div>
    </MotionCard>
  );
}

export default function Community() {
  const { data: posts, isLoading } = useCommunityPosts();
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-10 max-w-2xl mx-auto">
        {/* Editorial header */}
        <header className="space-y-5 animate-fade-in">
          <EditorialPageHeader
            surface="plain"
            containerClassName="max-w-none px-0"
            eyebrow="Community · Voci e piatti"
            number="06"
            title="Racconti dalla"
            italic="cucina viva"
            trailing="."
            lead="Condividi i tuoi piatti, ispira chi cucina con te. Una community che cresce piatto dopo piatto."
            aside={
              user ? (
                <div className="flex md:justify-end">
                  <CreatePostDialog />
                </div>
              ) : (
                <div className="flex md:justify-end">
                  <Button asChild className="rounded-full">
                    <Link to="/login">Accedi per pubblicare</Link>
                  </Button>
                </div>
              )
            }
          />
        </header>

        {/* Section divider */}
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            {posts?.length ?? 0} pubblicazioni
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {isLoading ? (
          <SkeletonCommunityList count={3} />
        ) : posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
          </div>
        ) : (
          <div className="border border-dashed border-border/60 rounded-2xl py-16 text-center text-muted-foreground">
            <p className="font-display text-xl mb-2">Nessun racconto ancora</p>
            <p className="text-sm">Sii il primo a condividere un piatto con la community.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
