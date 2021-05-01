import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setTab } from '../actions'
import { Tabs, Tab, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { invert } from 'lodash'

import classNames from 'classnames'

import CraftingGrid from './crafting/CraftingGrid'

import './CraftingArea.scss'

const CraftingTabImage = ({ title, image }) => (
  <OverlayTrigger placement='top' overlay={<Tooltip>{title}</Tooltip>}>
    <img src={image} alt={title} />
  </OverlayTrigger>
)

class CraftingArea extends Component {
  constructor (props) {
    super(props)

    this.keyMapping = {
      1: 'crafting',
      2: 'furnace',
      3: 'blast',
      4: 'campfire',
      5: 'smoking',
      6: 'stonecutter',
      7: 'smithing'
    }
  }

  render () {
    const { dispatch, crafting, furnace, generic, output, tab, minecraftVersion } = this.props
    const selectedTab = parseInt(invert(this.keyMapping)[tab], 10) // grab the selected tab index

    const titles = {
      crafting: 'Crafting',
      furnace: 'Smelting',
      blast: 'Blasting',
      campfire: 'Campfire',
      smoking: 'Smoking',
      stonecutter: 'Stonecutter',
      smithing: 'Smithing Table'
    }

    const images = {
      crafting: 'data:image/png;base64,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',
      furnace: 'data:image/png;base64,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',
      blast: 'data:image/png;base64,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',
      campfire: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABvUlEQVR4XmOgFKy3Y/gPwuSaw8QwwICRXPtx+TrwEANJZg54CLCQGwISuswoWl9c/kuWUUMnDcDiHBbHdxZI/wd5+fXpF1hDgti0MPTSwPFs5v/IXhY1lWDAFhLEJojBHwLo+R3mYwFtKzRPHgPzX1x+CqbR0wyuEBk6aUA3SRqrJ7hkQ1DEdZMgIXF53lOiksHgDwH0Eg8W9+g+R/cuXN8h/CXk4A0Bbxs1cH5/cfkW1HOwEg8Sx7AQYBX2h8g/XgOmYSUjrG6AmbP1yC2steTgqwtgLi6Ntwb76Nt3SBxycUJqP/YLi8DiJhO+okT7mQJuMP+nQRxWfaX9u8Dip689RQmJwZMGYD5HT83PP7wDC0kyCIHp92j1/u+3G8HisDgXNICYgK4PZq6pFqQWhYXE4MsFwrwsKHEoKQDx+b2Hj8Dip7i1wPSROFuUwJIxcgTz2aFpBl2fpjw/WP76w48o+gZfCIgKQFLziu1nwC59+/kPios1ZCE+kRHnQRF/8vILmH/+Jn59gz8ElOWEwT6B0XcfvUWNa6jPYT5+/QG1PIAphoUUjI8eYjDxwVMSwvInA53AoCkHGEY8AAB0K5RfCM/gXgAAAABJRU5ErkJggg==',
      smoking: 'data:image/png;base64,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',
      stonecutter: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEkElEQVR4XmMYBaMhMBoC1AqB0NDQ/+SYxUipA5ycnP4rKyuDjbl79y6DsLAww+rVq4k2l4VcB6SmpsJ9/OHDBwYBAQEGkENAjiDFTLJCAORrkE9hFoEsB7G/f//OwMnJyQByELGhQFIINDU1/X/8+DHYXpivYY4AWf7z50+wA2AOIiYkiAoBkMWfPn0Cm/fw4UMwDbIE2REwB4Ak3759y+Dg4MBQV1dH0Hy8CpAt/vbtG8ONGzfAiYydnZ0B5FsQDQpymOUwR3FxcTFwc3MzgGg+Pj68DsHqgKysrP8gzehB+PHjRwaYr0E0yKegtHDv3j0GJSUlBiYmJrAWbW1tBliIwcwAeWDatGkY9qEIdKbr/792GxLH3BoRYL1fv34F0yADYD6EGQoKERBbS0sLw2KQemQPfL2xAszVUpVlKJ95EW4vE0yRm640OFvxC4igeByUtWD5HDnOQb4GWQzCIB/LysrCfQ2yXEJCAhwFIA/APAEzW06YG56F4S6x1ZAEC3LJ64HzM8gAUDDCDDtw4AADLOvBghrGh0UXSC0yG+QTWDp48eIFw5EjRxi+vnwA9uDdl5/AdsMdYKok/F+Qm4NBUMsGnMBACcva2hqsGOQQUPz/+vWL4cePHwwg375+/RosBwsdWLCBLAL5WFRUlAGUAEHia9asAUuzsLAwfHtxl+H33/8MOB3w/usPBl0HfwaQIaCUDtJpZGQEdwi6xbDEBotzmI9BGjZs2IASnW8e3mTgYocUPTeefcQMAQ42NoYfQF+CaJBOKX07cHaCxSEorkHiIEthDgFlN5AYSA0sNGA+hsm9f3gN7Ovff/4ysLIwM7AyMzJgOACUBkCWgwwDRQUoJEA0iC9j6g72ybt378C0lJQUA8uLPQwfP7wB80GJ64+EC8P+/fvBfFDZACoj0C0GOQCkABQKGA4A5YLvv/8xgBIhSNG722fAhoFCg5OViQEkBwoRkOD7a0fAfB97MbCaWRvuM4AMF5FXB/NB8QxigOIaTAN9zi0mB5b7+uoRA0EHIOf3bw8vMcAAyCGgkIE5CsT+/OMPA8wyWBDDaJA4m5A0WJ6VlZXh9+/fDL/ePQXzYYkQXhnBghwUfKDEJy0tzQCJez2wBpBDQGpAHJBDQDTIIe++/gbHKShefwPdAgtmmMUg8xiQwH9g/MNCBiQMdwAs4QkJCUGCCloCwg0Alg9cQBlY1ICiBKQQYiEkYYH4sKAG+RjEB6UFEA3yFChR/gImG5gjURxw+MZzcLYI1/oKLpBAikEhgO4gBlUTBli0wEIC5kGQ5aDog1VUMIth8iBxWOKDieGsDcPDw/8jGwTLUk+fPmX4/+wKAyzK7r76DE6AoITFyC/FgB7ksBA4fvw4VrtwOgDmwoCAgP8wQ2A+enrpMFgalE0fvf0Cz+MC0srgcgPk8D9//jCASr5z587htYOgA2AOSUpKglcglw9sZIClmdefvjHAEpWYkjYDzPJLly4RZTbRDoA5BBQ1zy4eYoCVDQ9ffwLn628//zCAygFCPmZAAyQ7AKYfVHCB0gEsG6InLoahAgC13zizwnPHRQAAAABJRU5ErkJggg==',
      smithing: 'data:image/png;base64,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'
    }

    return (
      <div className='panel panel-default'>
        <div className='panel-heading'>
          <div className='panel-title'>
            Crafting
          </div>
        </div>
        <div className='panel-body'>
          <Tabs
            activeKey={selectedTab}
            animation={false}
            onSelect={(key) => dispatch(setTab(this.keyMapping[key]))}
            id='selected-tab'
          >
            <Tab eventKey={1} title={<CraftingTabImage title={titles.crafting} image={images.crafting} />} />
            <Tab eventKey={2} title={<CraftingTabImage title={titles.furnace} image={images.furnace} />} />
            <Tab eventKey={3} title={<CraftingTabImage title={titles.blast} image={images.blast} />} />
            <Tab eventKey={4} title={<CraftingTabImage title={titles.campfire} image={images.campfire} />} />
            <Tab eventKey={5} title={<CraftingTabImage title={titles.smoking} image={images.smoking} />} />
            {minecraftVersion !== 'bedrock' ? [
              <Tab key={6} eventKey={6} title={<CraftingTabImage title={titles.stonecutter} image={images.stonecutter} />} />,
              <Tab key={7} eventKey={7} title={<CraftingTabImage title={titles.smithing} image={images.smithing} />} />
            ] : null}
          </Tabs>
          <div className='crafting-holder'>
            <h6 className='crafting-title'>{titles[tab]}</h6>
            <div className={classNames('crafting', { full: tab === 'smithing' })}>
              <div className='recipe'>
                {tab === 'crafting'
                  ? (
                    <div className='table-wrap'>
                      {crafting.map((key, index) => {
                        return (
                          <CraftingGrid key={index} index={index} ingredient={key} size='normal' type='crafting' />
                        )
                      })}
                    </div>
                  )
                  : null}
                {['furnace', 'blast', 'campfire', 'smoking'].includes(tab)
                  ? (
                    <div className='vertical'>
                      <CraftingGrid index={0} ingredient={furnace.input} size='furnace' type='furnace' />
                      <div className='flame' />
                      <CraftingGrid index={0} ingredient={null} size='furnace' type='furnace' disabled />
                    </div>
                  )
                  : null}
                {tab === 'smithing'
                  ? (
                    <div className='horizontal'>
                      <CraftingGrid index={0} ingredient={generic.input[0]} size='large' type='generic' />
                      <div className='plus' />
                      <CraftingGrid index={1} ingredient={generic.input[1]} size='large' type='generic' />
                    </div>
                  )
                  : null}
                {tab === 'stonecutter'
                  ? <CraftingGrid index={0} ingredient={generic.input[0]} output={false} type='generic' size='large' />
                  : null}
              </div>
              <div className='arrow' />
              <div className='crafting-table-output'>
                <CraftingGrid ingredient={output} output size='large' />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect((store) => {
  return {
    tab: store.Options.tab,
    minecraftVersion: store.Options.minecraftVersion,
    crafting: store.Data.crafting,
    furnace: store.Data.furnace,
    generic: store.Data.generic,
    output: store.Data.output
  }
})(CraftingArea)
