import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Viewer from './components/Viewer';
import Creator from './components/Creator';

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                <Route path="/view" element={<Viewer />} />
                <Route path="/" element={<Creator />} />

                    
                </Routes>
            </div>
        </Router>
    );
}

export default App;
