import '@ant-design/v5-patch-for-react-19';
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { PrivateRoutes } from './utils/PrivateRoutes.jsx';
import { Login } from './pages/auth/Login.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Register } from './pages/auth/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { LayoutComponent } from './components/layout/index.jsx';
import { Profile } from './pages/Profile.jsx';
import { Teams } from './pages/Teams.jsx';
import { TeamDetails } from './pages/TeamDetails.jsx';
import { Time } from './pages/TIme.jsx';

  const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
	<QueryClientProvider client={queryClient}>
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route element={<PrivateRoutes />}>
				<Route path="/" element={<LayoutComponent title="Dashboard"><Dashboard /></LayoutComponent>} />
				<Route path="/profile" element={<LayoutComponent title="Profile"><Profile /></LayoutComponent>} />
				<Route path="/teams" element={<LayoutComponent title="Teams"><Teams /></LayoutComponent>} />
				<Route path="/teams/:id" element={<LayoutComponent title="Team Details"><TeamDetails /></LayoutComponent>} />
				<Route path="/time" element={<LayoutComponent title="Gestion du temps"><Time /></LayoutComponent>} />
			</Route>
		</Routes>
	</QueryClientProvider>
	</BrowserRouter>
)
