import React from 'react';
import './App.css';
import './styles/shared.css';
import Home from './components/Home';
import AboutMe from './components/AboutMe';
import MyWork from './components/MyWork';
import Contact from './components/Contact';
import DropdownMenu from './components/DropdownMenu';

const App = () => {
  return (
    <>
      {/* Dropdown Menu */}
      <DropdownMenu />
      <main>
        <Home />
        <AboutMe />
        <MyWork />
        <Contact />
      </main>
    </>
  );
};

export default App;
