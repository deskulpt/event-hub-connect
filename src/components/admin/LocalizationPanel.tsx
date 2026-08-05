import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listLanguages, updateLanguage, listAllLocalities, setLocalityActive } from "@/services/adminConfig";
import type { Locality } from "@/types/community";

export const LocalizationPanel = () => {
  const queryClient = useQueryClient();
  const languagesQuery = useQuery({ queryKey: ["admin-languages"], queryFn: listLanguages });
  const localitiesQuery = useQuery({ queryKey: ["admin-localities"], queryFn: listAllLocalities });

  const toggleLanguage = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => updateLanguage(id, { enabled }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-languages"] });
      toast.success("Language updated");
    },
    onError: () => toast.error("Could not update the language. Please try again."),
  });

  const toggleLocality = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setLocalityActive(id, active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-localities"] });
      toast.success("Locality updated");
    },
    onError: () => toast.error("Could not update the locality. Please try again."),
  });

  const localities = (localitiesQuery.data ?? []) as Locality[];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Languages</CardTitle>
          <CardDescription>Enable the languages members can switch between.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {languagesQuery.isLoading && <Skeleton className="h-40 w-full rounded-xl" />}
          {languagesQuery.isError && (
            <p className="text-sm text-muted-foreground">Could not load languages. Refresh to try again.</p>
          )}
          {!languagesQuery.isLoading && (languagesQuery.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No languages are configured yet.</p>
          )}
          {(languagesQuery.data ?? []).map((language) => (
            <div key={language.id} className="flex items-center justify-between gap-4 rounded-xl border p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {language.label}
                  {language.native_label ? ` · ${language.native_label}` : ""}
                </p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {language.language_code} · {language.coverage_percent}% translated
                </p>
              </div>
              <div className="flex items-center gap-2">
                {language.is_default && <Badge variant="outline">Default</Badge>}
                <Switch
                  checked={language.enabled}
                  disabled={toggleLanguage.isPending}
                  onCheckedChange={(enabled) => toggleLanguage.mutate({ id: language.id, enabled })}
                  aria-label={`Toggle ${language.label}`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Localities</CardTitle>
          <CardDescription>Neighbourhood catchments used for proposals and circles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {localitiesQuery.isLoading && <Skeleton className="h-40 w-full rounded-xl" />}
          {localitiesQuery.isError && (
            <p className="text-sm text-muted-foreground">Could not load localities. Refresh to try again.</p>
          )}
          {!localitiesQuery.isLoading && localities.length === 0 && (
            <p className="text-sm text-muted-foreground">No localities yet.</p>
          )}
          {localities.map((locality) => (
            <div key={locality.id} className="flex items-center justify-between gap-4 rounded-xl border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{locality.name}</p>
                <p className="truncate text-xs tabular-nums text-muted-foreground">
                  {[locality.city, locality.state, locality.country].filter(Boolean).join(", ")} ·{" "}
                  {locality.member_count} members · {locality.radius_miles} mi
                </p>
              </div>
              <Switch
                checked={locality.active}
                disabled={toggleLocality.isPending}
                onCheckedChange={(active) => toggleLocality.mutate({ id: locality.id, active })}
                aria-label={`Toggle ${locality.name}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
