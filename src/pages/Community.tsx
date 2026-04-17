import { useState } from "react";
import { Heart, MessageCircle, ImagePlus, Send, Users, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
        <Button><ImagePlus className="size-4 mr-2" /> Pubblica</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Condividi un piatto</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Titolo (es. Pasta zucchine e menta)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Racconta la ricetta o l'ispirazione…" value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
          <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
          <Input placeholder="Tag (separati da virgola): vegano, estate" value={tags} onChange={(e) => setTags(e.target.value)} />
          <Button onClick={submit} disabled={create.isPending || !title.trim()} className="w-full">
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
    <div className="border-t pt-3 mt-3 space-y-3">
      {isLoading ? (
        <Skeleton className="h-4 w-32" />
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground">Nessun commento ancora.</p>
          )}
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-2 text-sm">
              <Avatar className="size-7">
                <AvatarImage src={c.author?.avatar_url ?? undefined} />
                <AvatarFallback>{c.author?.display_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-muted rounded-lg px-3 py-1.5">
                <p className="text-xs font-semibold">{c.author?.display_name ?? "Utente"}</p>
                <p>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {user && (
        <div className="flex gap-2">
          <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Scrivi un commento…" onKeyDown={(e) => {
            if (e.key === "Enter" && body.trim()) {
              addComment.mutate({ postId, body });
              setBody("");
            }
          }} />
          <Button size="icon" disabled={!body.trim() || addComment.isPending} onClick={() => {
            addComment.mutate({ postId, body });
            setBody("");
          }}><Send className="size-4" /></Button>
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: CommunityPost }) {
  const toggleLike = useToggleLike();
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-9">
            <AvatarImage src={post.author?.avatar_url ?? undefined} />
            <AvatarFallback>{post.author?.display_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{post.author?.display_name ?? "Utente Vireo"}</p>
            <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
          </div>
        </div>
        <div>
          <h3 className="font-display text-lg">{post.title}</h3>
          {post.body && <p className="text-sm text-muted-foreground mt-1">{post.body}</p>}
        </div>
        {post.image_url && (
          <img src={post.image_url} alt={post.title} loading="lazy" className="w-full rounded-lg object-cover max-h-96" />
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>)}
          </div>
        )}
        <div className="flex items-center gap-4 pt-1 border-t">
          <Button
            variant="ghost"
            size="sm"
            disabled={!user}
            onClick={() => toggleLike.mutate({ postId: post.id, liked: !!post.liked_by_me })}
            className={post.liked_by_me ? "text-destructive" : ""}
          >
            <Heart className={`size-4 mr-1.5 ${post.liked_by_me ? "fill-current" : ""}`} /> {post.likes_count}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowComments((v) => !v)}>
            <MessageCircle className="size-4 mr-1.5" /> {post.comments_count}
          </Button>
        </div>
        {showComments && <CommentsSection postId={post.id} />}
      </CardContent>
    </Card>
  );
}

export default function Community() {
  const { data: posts, isLoading } = useCommunityPosts();
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="size-6 text-primary" />
              <h1 className="text-3xl font-display font-bold">Community</h1>
            </div>
            <p className="text-muted-foreground mt-1">Condividi i tuoi piatti, ispira la community Vireo.</p>
          </div>
          {user ? <CreatePostDialog /> : <Button asChild><Link to="/login">Accedi per pubblicare</Link></Button>}
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="size-12 mx-auto mb-3 opacity-30" />
              <p>Nessun post ancora. Sii il primo a condividere un piatto!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
