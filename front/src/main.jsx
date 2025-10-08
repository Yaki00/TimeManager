import '@ant-design/v5-patch-for-react-19';
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Login } from './pages/Login.jsx'
import {LayoutComponent} from './components/Layout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Teams } from './pages/Teams.jsx';
import { SearchUser } from './pages/SearchUser.jsx';

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<LayoutComponent><Dashboard /></LayoutComponent>} />
			<Route path="/login" element={<LayoutComponent><Login /></LayoutComponent>} />
			<Route path="/teams" element={<LayoutComponent>< Teams/></LayoutComponent>} />
			<Route path="/search-user" element={<LayoutComponent><SearchUser /></LayoutComponent>} />
		</Routes>
	</BrowserRouter>
)
