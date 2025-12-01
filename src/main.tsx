import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Rss } from "lucide-react";

createRoot(document.getElementById("root")!).render(<App />);