import React from 'react';
import './App.css';
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
      <Home />
      <AboutMe />
      <MyWork />
      <Contact />
    </>
  );
};

export default App;
