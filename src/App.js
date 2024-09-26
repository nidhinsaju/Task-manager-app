import Taskmanager from './Components/Taskmanager';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import UserList from './Components/Api_Demo';

function App() {
  return (
    <div>
       <Router>
        <Routes>
        <Route path={`${process.env.PUBLIC_URL + "/"}`} element={<Taskmanager />} />
        <Route path={`${process.env.PUBLIC_URL + "/Api-demo"}`} element={<UserList />} />
        </Routes>
       </Router>
    </div>
  );
}

export default App;
