import { Accessibility, Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePreferences } from "@/contexts/PreferencesContext";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";

export const LanguageMenu = () => {
  const { language, setLanguage } = usePreferences();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Change language">
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => void setLanguage(lang.code)}>
            <span className="flex-1">{lang.native}</span>
            {language === lang.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const AccessibilityMenu = () => {
  const { accessibility, setAccessibility } = usePreferences();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Accessibility settings">
          <Accessibility className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Text size</DropdownMenuLabel>
        {(["normal", "large", "xlarge"] as const).map((scale) => (
          <DropdownMenuCheckboxItem
            key={scale}
            checked={(accessibility.textScale ?? "normal") === scale}
            onCheckedChange={() => void setAccessibility({ textScale: scale })}
          >
            {scale === "normal" ? "Normal" : scale === "large" ? "Large" : "Extra large"}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Display</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={accessibility.contrast === "high"}
          onCheckedChange={(checked) =>
            void setAccessibility({ contrast: checked ? "high" : "normal" })
          }
        >
          High contrast
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={Boolean(accessibility.reduceMotion)}
          onCheckedChange={(checked) => void setAccessibility({ reduceMotion: checked })}
        >
          Reduce motion
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={Boolean(accessibility.readAloud)}
          onCheckedChange={(checked) => void setAccessibility({ readAloud: checked })}
        >
          Prefer read aloud
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
