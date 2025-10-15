import '@ant-design/v5-patch-for-react-19';
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { PrivateRoutes } from './utils/PrivateRoutes.jsx';
import { Login } from './pages/auth/Login.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Register } from './pages/auth/Register.jsx';
import { App } from './pages/App.jsx';
import { LayoutComponent } from './components/layout/index.jsx';
import { Profile } from './pages/Profile.jsx';
import { Teams } from './pages/Teams.jsx';
import { TeamDetails } from './pages/TeamDetails.jsx';

  const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
	<QueryClientProvider client={queryClient}>
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route element={<PrivateRoutes />}>
				<Route path="/" element={<LayoutComponent title="Dashboard"><App /></LayoutComponent>} />
				<Route path="/profile" element={<LayoutComponent title="Profile"><Profile /></LayoutComponent>} />
				<Route path="/teams" element={<LayoutComponent title="Teams"><Teams /></LayoutComponent>} />
				<Route path="/teams/:id" element={<LayoutComponent title="Team Details"><TeamDetails /></LayoutComponent>} />
			</Route>
		</Routes>
	</QueryClientProvider>
	</BrowserRouter>
)
