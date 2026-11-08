import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type User as SchemaUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export type User = SchemaUser & { role: string };

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
    staleTime: Infinity, // User session rarely changes unexpectedly
  });

  const requestPhoneCodeMutation = useMutation({
    mutationFn: async (input: { mobile: string; name?: string }) => {
      const res = await fetch("/api/auth/phone-otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "تعذر إرسال رمز الدخول");
      return data as { challengeId: string; message: string };
    },
    onError: (error: Error) => {
      toast({ title: "تعذر إرسال الرمز", description: error.message, variant: "destructive" });
    },
  });

  const verifyPhoneCodeMutation = useMutation({
    mutationFn: async (input: { challengeId: string; code: string }) => {
      const res = await fetch("/api/auth/phone-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "الرمز غير صالح");
      return api.auth.me.responses[200].parse(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بك، ${data.name}`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({ title: "تعذر تسجيل الدخول", description: error.message, variant: "destructive" });
    },
  });

  const adminPasswordLoginMutation = useMutation({
    mutationFn: async (input: { mobile: string; password: string }) => {
      const res = await fetch("/api/auth/admin-password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "تعذر تسجيل دخول الإدارة");
      return api.auth.me.responses[200].parse(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بك، ${data.name}`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({ title: "تعذر تسجيل دخول الإدارة", description: error.message, variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, {
        method: api.auth.logout.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      toast({
        title: "تم تسجيل الخروج",
      });
    },
  });

  const togglePrivacyMutation = useMutation({
    mutationFn: async (isPublicDonor: boolean) => {
      const res = await fetch(api.users.togglePrivacy.path, {
        method: api.users.togglePrivacy.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublicDonor }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update privacy settings");
      return api.users.togglePrivacy.responses[200].parse(await res.json());
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData([api.auth.me.path], updatedUser);
      toast({
        title: "تم تحديث الخصوصية",
        description: updatedUser.isPublicDonor 
          ? "سيظهر اسمك في قائمة الشرف" 
          : "تم إخفاء اسمك من قائمة الشرف",
      });
    },
  });

  return {
    user,
    isLoading,
    logout: logoutMutation.mutateAsync,
    togglePrivacy: togglePrivacyMutation.mutateAsync,
    requestPhoneLoginCode: requestPhoneCodeMutation.mutateAsync,
    loginWithPhoneCode: verifyPhoneCodeMutation.mutateAsync,
    loginAdminWithPassword: adminPasswordLoginMutation.mutateAsync,
    isPhoneOtpPending: requestPhoneCodeMutation.isPending || verifyPhoneCodeMutation.isPending,
    isAdminLoginPending: adminPasswordLoginMutation.isPending,
  };
}
