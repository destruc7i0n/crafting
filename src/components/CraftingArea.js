import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { setTab } from '../actions'
import { Panel, Tabs, Tab } from 'react-bootstrap'
import { invert } from 'lodash'

import CraftingGrid from './crafting/CraftingGrid'

import './CraftingArea.css'

class CraftingArea extends Component {
  constructor (props) {
    super(props)

    this.keyMapping = {
      1: 'crafting',
      2: 'furnace',
      3: 'blast',
      4: 'campfire',
      5: 'smoking',
      6: 'stonecutter'
    }
  }

  render () {
    const { dispatch, crafting, furnace, generic, output, tab } = this.props
    const selectedTab = parseInt(invert(this.keyMapping)[tab], 10) // grab the selected tab index

    const titles = {
      crafting: 'Crafting',
      furnace: 'Smelting',
      blast: 'Blasting',
      campfire: 'Campfire',
      smoking: 'Smoking',
      stonecutter: 'Stonecutter'
    }

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            Crafting Area
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <Tabs
            activeKey={selectedTab}
            animation={false}
            onSelect={(key) => dispatch(setTab(this.keyMapping[key]))}
            id='selected-tab'>
            <Tab eventKey={1} title='Crafting' />
            <Tab eventKey={2} title='Furnace' />
            <Tab eventKey={3} title='Blasting' />
            <Tab eventKey={4} title='Campfire' />
            <Tab eventKey={5} title='Smoking' />
            <Tab eventKey={6} title='Stonecutter' />
          </Tabs>
          <div className='crafting-holder'>
            <div className='crafting clearfix'>
              <div className='recipe'>
                <h6>{titles[tab]}</h6>
                <div id='crafting-table'>
                  {tab === 'crafting'
                    ? crafting.map((key, index) => {
                      return (
                        <CraftingGrid key={index} index={index} ingredient={key} size='normal' type='crafting'/>
                      )
                    })
                    : null
                  }
                  {['furnace', 'blast', 'campfire', 'smoking'].includes(tab)
                    ? (
                      <Fragment>
                        <CraftingGrid index={0} ingredient={furnace.input} size='furnace' type='furnace' />
                        <div className='flame' />
                        <CraftingGrid index={0} ingredient={null} size='furnace' type='furnace' disabled />
                      </Fragment>
                    )
                    : null
                  }
                  {tab === 'stonecutter'
                    ? <CraftingGrid index={0} ingredient={generic.input} output={false} type='generic' size='large' style={{ paddingTop: '20px', paddingLeft: '30px' }} />
                    : null
                  }
                </div>
              </div>
              <div className='arrow' />
              <div className='crafting-table-output'>
                <CraftingGrid ingredient={output} output={true} size='large' />
              </div>
            </div>
          </div>
        </Panel.Body>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    tab: store.Options.tab,
    crafting: store.Data.crafting,
    furnace: store.Data.furnace,
    generic: store.Data.generic,
    output: store.Data.output
  }
})(CraftingArea)
