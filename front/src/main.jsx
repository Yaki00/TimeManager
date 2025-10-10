import '@ant-design/v5-patch-for-react-19';
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { PrivateRoutes } from './utils/PrivateRoutes.jsx';
import { Login } from './pages/auth/Login.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Register } from './pages/auth/Register.jsx';
import { App } from './pages/App.jsx';
import { LayoutComponent } from './components/Layout.jsx';

  const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
	<QueryClientProvider client={queryClient}>
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route element={<PrivateRoutes />}>
				<Route path="/" element={<LayoutComponent title="Dashboard"><App /></LayoutComponent>} />
			</Route>
		</Routes>
	</QueryClientProvider>
	</BrowserRouter>
)
