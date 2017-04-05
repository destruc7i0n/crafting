import React, { Component }  from 'react'
import { Col, Row } from 'react-bootstrap'

import { DragDropContext } from 'react-dnd'
import MultiBackend from 'react-dnd-multi-backend'
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch'

import 'babel-polyfill'

import { debounce } from 'lodash'

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

class App extends Component {
  constructor (props) {
    super(props)

    this.handleResize = this.handleResize.bind(this)
  }

  // bad hack, remove soon
  handleResize() {
    return debounce(() => this.forceUpdate(), 100)
  }

  componentDidMount () {
    window.addEventListener('resize', this.handleResize())
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize);
  }
  // end bad hack

  render () {
    const isMobile = window.matchMedia && window.matchMedia('only screen and (max-width : 992px)').matches

    return (
      <div className="container">
        <Navbar />
        <IngredientDragLayer />
        <Row>
          <Col md={6} sm={12}>
            <CraftingTable />
            { isMobile ? <Ingredients /> : null }
            <Options />
            <Output />
          </Col>
          <Col md={6} sm={12} className="pull-right">
            { !isMobile ? <Ingredients /> : null }
          </Col>
        </Row>
      </div>
    )
  }
}

export default DragDropContext(MultiBackend(HTML5toTouch))(App)
