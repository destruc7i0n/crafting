import React  from 'react'
import { Col, Row } from 'react-bootstrap'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import Navbar from './components/Navbar'
import CraftingTable from './components/CraftingTable'
import Ingredients from './components/Ingredients'

import './App.css'

const App = (props) =>
  <div className="container">
    <Navbar />
    <Row>
      <Col md={6}>
        <CraftingTable />
      </Col>
      <Col md={6}>
        <Ingredients />
      </Col>
    </Row>
  </div>

export default DragDropContext(HTML5Backend)(App)
