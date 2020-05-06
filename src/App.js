import React from 'react'
import { Col, Row } from 'react-bootstrap'

import { DndProvider } from 'react-dnd'
import MultiBackend from 'react-dnd-multi-backend'
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch'

import { isMobile } from 'react-device-detect'

import Navbar from './components/Navbar'
import HelpAlert from './components/HelpAlert'
import CraftingTable from './components/CraftingArea'
import Ingredients from './components/Ingredients'
import Options from './components/Options'
import Output from './components/Output'
import CraftingModal from './components/crafting/CraftingModal'
import Tags from './components/tags/Tags'

import IngredientDragLayer from './components/ingredient/IngredientDragLayer'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPatreon } from '@fortawesome/free-brands-svg-icons/faPatreon'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes'

import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

import './assets/arrow.png'
import './assets/Minecraft.woff'

library.add(faPatreon, faPlus, faTimes)

const App = () => {
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div className='container'>
        <Navbar />
        <IngredientDragLayer />
        <Row>
          <Col md={12}>
            <HelpAlert />
          </Col>
          <Col md={6} sm={12}>
            <CraftingTable />
            {isMobile ? <Ingredients /> : null}
            <Tags />
            <Options />
            <Output />
          </Col>
          <Col md={6} sm={12} className='pull-right'>
            {!isMobile ? <Ingredients /> : null}
          </Col>
        </Row>
        <CraftingModal />
      </div>
    </DndProvider>
  )
}

export default App
