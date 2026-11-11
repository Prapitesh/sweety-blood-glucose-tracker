import {useAuth} from './context/AuthContext';
import AuthPage from './components/AuthPage';
import Dashboard from './pages/Dashboard';
export default function App(){const {token}=useAuth();return token?<Dashboard/>:<AuthPage/>}
