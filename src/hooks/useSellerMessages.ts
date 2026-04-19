import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SellerMessage {
  id: string;
  seller_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SendSellerMessageInput {
  seller_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  subject: string;
  message: string;
  /** Honeypot — must remain empty. */
  website?: string;
}

/** Public: anyone (anon or authenticated) can send a message to an approved seller. */
export function useSendSellerMessage() {
  return useMutation({
    mutationFn: async (input: SendSellerMessageInput) => {
      const payload = {
        seller_id: input.seller_id,
        sender_name: input.sender_name.trim(),
        sender_email: input.sender_email.trim().toLowerCase(),
        sender_phone: input.sender_phone?.trim() || null,
        subject: input.subject.trim(),
        message: input.message.trim(),
        website: input.website ?? "",
      };
      const { data, error } = await supabase.functions.invoke("send-seller-message", {
        body: payload,
      });
      if (error) throw error;
      if (data && typeof data === "object" && "error" in data && data.error) {
        throw new Error(typeof data.error === "string" ? data.error : "Errore invio");
      }
    },
  });
}

/** Seller dashboard: list messages for the current seller. */
export function useSellerMessages(sellerId: string | undefined) {
  return useQuery({
    queryKey: ["seller-messages", sellerId],
    enabled: !!sellerId,
    queryFn: async (): Promise<SellerMessage[]> => {
      const { data, error } = await supabase
        .from("seller_messages" as any)
        .select("*")
        .eq("seller_id", sellerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as SellerMessage[]) ?? [];
    },
  });
}

export function useMarkSellerMessageRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const { error } = await supabase
        .from("seller_messages" as any)
        .update({ is_read })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller-messages"] }),
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}

export function useMarkSellerMessageReplied() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("seller_messages" as any)
        .update({ replied_at: new Date().toISOString(), is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Segnato come risposto");
      qc.invalidateQueries({ queryKey: ["seller-messages"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Errore"),
  });
}
