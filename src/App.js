import React  from 'react'
import { Col, Row } from 'react-bootstrap'
import { DragDropContext } from 'react-dnd'
import TouchBackend from 'react-dnd-touch-backend'

import Navbar from './components/Navbar'
import CraftingTable from './components/CraftingTable'
import Ingredients from './components/Ingredients'

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
      <Col md={6}>
        <Ingredients />
      </Col>
    </Row>
  </div>

export default DragDropContext(TouchBackend({ enableMouseEvents: true }))(App)
