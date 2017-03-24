import React, { Component } from 'react'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className='crafting-holder'>
        <div className='crafting clearfix'>
          <div className='recipe'>
            <h6>Crafting</h6>
            <div id='crafting-table'>
              <span className='grid grid-crafting' />
              <span className='grid grid-crafting' />
              <span className='grid grid-crafting' />
              <span className='grid grid-crafting' />
              <span className='grid grid-crafting' />
              <span className='grid grid-crafting' />
              <span className='grid grid-crafting' />
              <span className='grid grid-crafting' />
              <span className='grid grid-crafting' />
            </div>
          </div>
          <div className='arrow' />
          <div id='crafting-table-output'><span className='grid-large output' /></div>
        </div>
      </div>
    )
  }
}

export default App
