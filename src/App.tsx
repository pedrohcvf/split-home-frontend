import { Route, Routes } from "react-router-dom"
import DashboardPage from "./pages/DashboardPage"
import TenancyPage from "./pages/TenancyPage"
import ExpensePage from "./pages/ExpensePage"
import ManageSplitPage from "./pages/ManageSplitPage"
import JoinSplitPage from "./pages/JoinSplitPage"
import LoginPage from "./pages/LoginPage"

function App() {
  return (
    <div>
      <main>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tenancy" element={<TenancyPage />} />
          <Route path="/expense" element={<ExpensePage />} />
          <Route path="/manage-split" element={<ManageSplitPage />} />
          <Route path="/join-split" element={<JoinSplitPage />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App