import '@ant-design/v5-patch-for-react-19';
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { App } from './pages/App.jsx';
import { LayoutComponent } from './components/Layout.jsx';

createRoot(document.getElementById('root')).render(
	<BrowserRouter>
		<Routes>
			<Route path="/"  			element={<LayoutComponent><App /></LayoutComponent>} />
		</Routes>
	</BrowserRouter>
)
