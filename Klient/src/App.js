import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Edit from './Edit';
import Home from './Home';
import Add from './Add';
import { ToastProvider } from './ToastContext';


export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/add" element={<Add />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
