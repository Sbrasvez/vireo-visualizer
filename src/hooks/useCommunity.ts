import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  recipe_external_id: string | null;
  recipe_title: string | null;
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: { display_name: string | null; avatar_url: string | null };
  liked_by_me?: boolean;
}

export function useCommunityPosts() {
  return useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const posts = (data ?? []) as CommunityPost[];

      // Fetch authors
      const userIds = [...new Set(posts.map((p) => p.user_id))];
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      const profMap = new Map(profs?.map((p) => [p.user_id, p]) ?? []);

      // My likes
      let likedSet = new Set<string>();
      if (user) {
        const { data: likes } = await supabase
          .from("community_post_likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", posts.map((p) => p.id));
        likedSet = new Set(likes?.map((l) => l.post_id) ?? []);
      }

      return posts.map((p) => ({
        ...p,
        author: profMap.get(p.user_id)
          ? {
              display_name: profMap.get(p.user_id)!.display_name,
              avatar_url: profMap.get(p.user_id)!.avatar_url,
            }
          : undefined,
        liked_by_me: likedSet.has(p.id),
      }));
    },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      body?: string;
      image?: File | null;
      tags?: string[];
      recipe_external_id?: string;
      recipe_title?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per pubblicare");

      let image_url: string | null = null;
      if (payload.image) {
        const ext = payload.image.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("community")
          .upload(path, payload.image, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("community").getPublicUrl(path);
        image_url = pub.publicUrl;
      }

      const { data, error } = await supabase
        .from("community_posts")
        .insert({
          user_id: user.id,
          title: payload.title,
          body: payload.body ?? null,
          image_url,
          tags: payload.tags ?? [],
          recipe_external_id: payload.recipe_external_id ?? null,
          recipe_title: payload.recipe_title ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Post pubblicato!");
      qc.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per mettere mi piace");
      if (liked) {
        const { error } = await supabase
          .from("community_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("community_post_likes")
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-posts"] }),
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: ["post-comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const userIds = [...new Set((data ?? []).map((c) => c.user_id))];
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      const map = new Map(profs?.map((p) => [p.user_id, p]) ?? []);
      return (data ?? []).map((c) => ({
        ...c,
        author: map.get(c.user_id),
      }));
    },
    enabled: !!postId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, body }: { postId: string; body: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per commentare");
      const { error } = await supabase
        .from("community_post_comments")
        .insert({ post_id: postId, user_id: user.id, body });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["post-comments", vars.postId] });
      qc.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}
