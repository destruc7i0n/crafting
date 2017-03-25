import React, { Component } from 'react'
import { Col, Row } from 'react-bootstrap'

import CraftingTable from './CraftingTable'
import Navbar from './Navbar'

import './App.css'

class App extends Component {
  render() {
    return (
      <div className='container'>
        <Navbar />
        <Row>
          <Col md={6}>
            <CraftingTable />
          </Col>
          <Col md={6}>
          </Col>
        </Row>
      </div>
    )
  }
}

export default App
