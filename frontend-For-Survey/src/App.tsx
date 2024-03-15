import React,{ useEffect, useState } from 'react'

import axios, { Axios } from 'axios'
import Login from './components/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './components/Signup'
import Menu from './components/Menu'

function App() {
  return(
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login></Login>}></Route>
      <Route path='/signup' element={<Signup></Signup>}></Route>
      <Route path='/menu' element={<Menu></Menu>}></Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
