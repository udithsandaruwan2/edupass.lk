import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import { subscribeStore } from "@/mocks/store";
import { useEffect } from "react";

export function useInvalidateOnStoreChange(keys: string[][]) {
  const qc = useQueryClient();
  useEffect(() => {
    return subscribeStore(() => {
      keys.forEach((key) => qc.invalidateQueries({ queryKey: key }));
    });
  }, [qc, keys]);
}

export function useSeminars(filters?: Parameters<typeof api.listSeminars>[0]) {
  return useQuery({
    queryKey: ["seminars", filters],
    queryFn: () => api.listSeminars(filters),
  });
}

export function useSeminar(id: string) {
  return useQuery({
    queryKey: ["seminar", id],
    queryFn: () => api.getSeminar(id),
    enabled: !!id,
  });
}

export function useLecturers(filters?: Parameters<typeof api.listLecturers>[0]) {
  return useQuery({
    queryKey: ["lecturers", filters],
    queryFn: () => api.listLecturers(filters),
  });
}

export function useLecturer(slug: string) {
  return useQuery({
    queryKey: ["lecturer", slug],
    queryFn: () => api.getLecturerBySlug(slug),
    enabled: !!slug,
  });
}

export function useMyPasses() {
  return useQuery({ queryKey: ["my-passes"], queryFn: () => api.listMyPasses() });
}

export function useMyPayments() {
  return useQuery({ queryKey: ["my-payments"], queryFn: () => api.listMyPayments() });
}

export function usePendingPayments() {
  return useQuery({
    queryKey: ["payments", "pending"],
    queryFn: () => api.listPayments({ status: "pending" }),
  });
}

export function useAdminStats() {
  return useQuery({ queryKey: ["admin-stats"], queryFn: () => api.adminStats() });
}

export function useApprovePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      api.approvePayment(id, approve),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["my-passes"] });
      qc.invalidateQueries({ queryKey: ["my-payments"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}

export function useClasses(instituteId?: string) {
  return useQuery({
    queryKey: ["classes", instituteId],
    queryFn: () => api.listClasses(instituteId),
  });
}

export function useFees(filter?: Parameters<typeof api.listFees>[0]) {
  return useQuery({
    queryKey: ["fees", filter],
    queryFn: () => api.listFees(filter),
  });
}

export function useMyAttendance() {
  return useQuery({
    queryKey: ["my-attendance"],
    queryFn: () => api.listMyAttendance(),
  });
}
