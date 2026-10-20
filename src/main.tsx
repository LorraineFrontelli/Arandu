import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/global.css';
import './styles/magazine.css';
import './styles/desk.css';
import './styles/interactions.css';

createRoot(document.getElementById('root')!).render(<App />);
