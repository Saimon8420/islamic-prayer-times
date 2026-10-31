import { useTheme } from "./hooks/useTheme";
import { useNotifications } from "./hooks/useNotifications";
import { useLanguageEffect } from "./hooks/useLanguage";
import { LocationPrompt } from "./components/common/LocationPrompt";
import { AppShell } from "./redesign/AppShell";

function App() {
  useTheme();
  useNotifications();
  useLanguageEffect();

  return (
    <AppShell
      locationPrompt={
        <div className="fl-legacy flex min-h-[70vh] items-center justify-center">
          <LocationPrompt />
        </div>
      }
    />
  );
}

export default App;
