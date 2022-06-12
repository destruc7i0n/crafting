import React from 'react'

import { useSelector } from 'react-redux'

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
import Footer from './components/Footer'

import IngredientDragLayer from './components/ingredient/IngredientDragLayer'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faPatreon } from '@fortawesome/free-brands-svg-icons'
import { faPlus, faTimes, faFileImage } from '@fortawesome/free-solid-svg-icons'

import 'bootstrap/dist/css/bootstrap.css'
import './App.css'

import './assets/arrow.png'
import './assets/Minecraft.woff'

library.add(faPatreon, faPlus, faTimes, faFileImage)

const App = () => {
  const minecraftVersion = useSelector((store) => store.Options.minecraftVersion)

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div className='container'>
        <Navbar />
        <IngredientDragLayer />
        <div className='row'>
          <div className='col-md-12'>
            <HelpAlert />
          </div>
          <div className='col-md-6 col-sm-12'>
            <CraftingTable />
            {isMobile ? <Ingredients /> : null}
            {minecraftVersion !== 'bedrock' && <Tags />}
            <Options />
            <Output />
          </div>
          <div className='pull-right col-md-6 col-sm-12'>
            {!isMobile ? <Ingredients /> : null}
          </div>
        </div>
        <Footer />
        <CraftingModal />
      </div>
    </DndProvider>
  )
}

export default App
