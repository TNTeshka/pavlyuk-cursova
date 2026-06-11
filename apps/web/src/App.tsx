import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSocket } from "./hooks/useSocket";

import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Groups } from "./pages/Groups";
import { GroupTasks } from "./pages/GroupTasks";
import { Protected } from "./components/Protected";
import { Tasks } from "./pages/Tasks";

import { ThemeProvider } from "./theme/theme";
import { Admin } from "./pages/Admin";
import { SidebarLayout } from "./components/SidebarLayout";
export default function App() {
  useSocket();
  return (
      <ThemeProvider><BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/tasks"
            element={
              <Protected>
                <SidebarLayout>
                  <Tasks />
                </SidebarLayout>
              </Protected>
            }
          />
          <Route
            path="/groups"
            element={
              <Protected>
                <SidebarLayout>
                  <Groups />
                </SidebarLayout>
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected>
                <SidebarLayout>
                  <Admin />
                </SidebarLayout>
              </Protected>
            }
          />

          <Route
            path="/groups/:groupId/tasks"
            element={
              <Protected>
                <SidebarLayout>
                  <GroupTasks />
                </SidebarLayout>
              </Protected>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
