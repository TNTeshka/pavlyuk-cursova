import type { ReactNode } from "react";
import { Header } from "./Header";

export function SidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <Header />
      <main className="main">
        <div className="main-content">{children}</div>
      </main>
    </div>
  );
}
