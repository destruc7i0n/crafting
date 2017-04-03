import React  from 'react'
import { Col, Row } from 'react-bootstrap'

import { DragDropContext } from 'react-dnd'
import MultiBackend from 'react-dnd-multi-backend'
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch'

import 'babel-polyfill'

import Navbar from './components/Navbar'
import CraftingTable from './components/CraftingTable'
import Ingredients from './components/Ingredients'
import Options from './components/Options'
import Output from './components/Output'

import IngredientDragLayer from './components/IngredientDragLayer'

import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

import './assets/arrow.png'
import './assets/Minecraft.woff'

const App = () =>
  <div className="container">
    <Navbar />
    <IngredientDragLayer />
    <Row>
      <Col md={6}>
        <CraftingTable />
      </Col>
      <Col md={6} className="ingredients-col">
        <Ingredients />
      </Col>
      <Col md={6}>
        <Options />
        <Output />
      </Col>
    </Row>
  </div>

export default DragDropContext(MultiBackend(HTML5toTouch))(App)
