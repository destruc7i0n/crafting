import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  setEmptySpace,
  setOutputRecipe,
  setShape,
  setGroup,
  setFurnaceData,
  setMinecraftVersion,
  setTab,
  setBedrockIdentifier,
  resetCrafting
} from '../actions'

import NumericInput from 'react-numeric-input'

import { versions } from 'minecraft-textures'

import {
  Alert,
  Checkbox,
  ControlLabel,
  FormControl,
  FormGroup,
  OverlayTrigger,
  Panel,
  Tooltip
} from 'react-bootstrap'

import infoCircle from '../assets/info-circle.png'

class Options extends Component {
  constructor (props) {
    super(props)

    this.toggleShape = this.toggleShape.bind(this)
    this.toggleEmptySpace = this.toggleEmptySpace.bind(this)
    this.setOutput = this.setOutput.bind(this)
    this.setGroup = this.setGroup.bind(this)
    this.setBedrockIdentifier = this.setBedrockIdentifier.bind(this)
    this.setMinecraftVersion = this.setMinecraftVersion.bind(this)
  }

  toggleShape (e) {
    const { dispatch } = this.props

    dispatch(setShape(e.target.checked ? 'shapeless' : 'shaped'))
  }

  toggleEmptySpace (e) {
    const { dispatch } = this.props

    dispatch(setEmptySpace(!e.target.checked))
  }

  setOutput ({ target: { value } }) {
    const { dispatch } = this.props

    const outputName = value.replace(/[^a-z0-9_]+/, '')

    dispatch(setOutputRecipe(outputName))
  }

  setGroup ({ target: { value } }) {
    const { dispatch } = this.props

    dispatch(setGroup(value))
  }

  setBedrockIdentifier ({ target: { value } }) {
    const { dispatch } = this.props

    dispatch(setBedrockIdentifier(value))
  }

  setMinecraftVersion ({ target: { value } }) {
    const { dispatch, minecraftVersion } = this.props

    // remove bedrock items
    if (minecraftVersion === 'bedrock' || value === 'bedrock') dispatch(resetCrafting())

    dispatch(setMinecraftVersion(value))
    dispatch(setTab('crafting'))
  }

  render () {
    const { dispatch, emptySpace, shape, outputRecipe, tab, furnace, minecraftVersion, bedrockIdentifier, group } = this.props

    const shapelessTooltip = (
      <Tooltip id='shapeless'>This will allow the items to be placed in anywhere in the crafting table to get the
        output.
      </Tooltip>
    )

    const shapelessCheckbox = (
      <FormGroup controlId='shapeless'>
        <Checkbox
          inline
          checked={shape === 'shapeless'}
          onChange={this.toggleShape}
        >
          Shapeless?{' '}
          <OverlayTrigger placement='bottom' overlay={shapelessTooltip}>
            <img className='inline' src={infoCircle} alt='info' />
          </OverlayTrigger>
        </Checkbox>
      </FormGroup>
    )

    const removeEmptySpaceTooltip = (
      <Tooltip id='removeEmptySpace'>
        <strong>If this is checked</strong>, the generator will ensure that the item will be placed exactly where placed
        in the crafting table above.
        <br />
        <strong>If this isn't checked</strong>, the generator will make the recipe be able to be placed anywhere in the
        table. (Useful for 2x2 crafting)
      </Tooltip>
    )

    const removeEmptySpaceCheckbox = (
      <FormGroup controlId='emptySpace'>
        <Checkbox
          inline
          checked={!emptySpace}
          onChange={this.toggleEmptySpace}
        >
          Exactly where placed?{' '}
          <OverlayTrigger placement='bottom' overlay={removeEmptySpaceTooltip}>
            <img className='inline' src={infoCircle} alt='info' />
          </OverlayTrigger>
        </Checkbox>
      </FormGroup>
    )

    const versionSelector = (
      <div className='row'>
        <div className='col-md-2'>
          <ControlLabel>Minecraft Version:</ControlLabel>
        </div>
        <div className='col-md-10'>
          <FormControl
            componentClass='select'
            placeholder='select'
            value={minecraftVersion}
            onChange={this.setMinecraftVersion}
          >
            <option value='bedrock' key='bedrock'>Bedrock</option>
            {versions.map(v => {
              if (v.toString() !== '1.12') {
                return (<option value={v} key={v}>Java {v}</option>)
              }
              return null
            })}
          </FormControl>
        </div>
      </div>
    )

    let customOptions
    if (tab === 'crafting') {
      customOptions = (
        <>
          <legend><h5>Crafting Options</h5></legend>
          <div className='row'>
            <div className='col-md-4'>
              {shapelessCheckbox}
            </div>
            <div className='col-md-8'>
              {shape === 'shaped' ? removeEmptySpaceCheckbox : null}
            </div>
          </div>
        </>
      )
    } else if (['furnace', 'blast', 'campfire', 'smoking'].includes(tab) && minecraftVersion !== 'bedrock') {
      customOptions = (
        <>
          <legend><h5>Furnace Options</h5></legend>
          <div className='row'>
            <div className='col-md-2'>
              <ControlLabel style={{ fontSize: '12px' }}>Experience:</ControlLabel>
            </div>
            {' '}
            <div className='col-md-10'>
              <NumericInput
                className='form-control'
                min={0}
                precision={1}
                step={1}
                value={furnace.experience}
                onChange={(v) => dispatch(setFurnaceData('experience', v))}
                placeholder='Enter amount'
              />
            </div>
            <div className='col-md-12'>
              <p style={{ fontSize: '12px', margin: '5px 0 5px 0' }}>
                The output experience.
              </p>
            </div>
          </div>
          <div className='row'>
            <div className='col-md-2'>
              <ControlLabel>Crafting Time:</ControlLabel>
            </div>
            {' '}
            <div className='col-md-10'>
              <NumericInput
                className='form-control'
                min={0}
                value={furnace.cookingTime}
                onChange={(v) => dispatch(setFurnaceData('cookingTime', v))}
                placeholder='Enter amount'
              />
            </div>
            <div className='col-md-12'>
              <p style={{ fontSize: '12px', margin: '5px 0 5px 0' }}>
                The cook time in ticks.
              </p>
            </div>
          </div>
        </>
      )
    }

    return (
      <Panel defaultExpanded>
        <Panel.Heading>
          <Panel.Title toggle>
            Options
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body collapsible>
          {minecraftVersion === 'bedrock' ? (
            <Alert>
              <strong>Note</strong>: Bedrock support is WIP.
            </Alert>
          ) : null}
          {versionSelector}
          {minecraftVersion === 'bedrock' ? (
            // set the identifier for bedrock
            <div className='row'>
              <div className='col-md-2'>
                <ControlLabel>Bedrock Identifier:</ControlLabel>
              </div>
              {' '}
              <div className='col-md-10'>
                <FormControl
                  onChange={this.setBedrockIdentifier}
                  placeholder='identifier:value'
                  value={bedrockIdentifier}
                />
              </div>
              <div className='col-md-12'>
                <p style={{ fontSize: '12px' }}>
                  The identifier for the bedrock recipe. Must be defined. The identifier is used internally.
                </p>
              </div>
            </div>
          ) : null}
          {customOptions}
          {minecraftVersion !== 'bedrock' ? (
            <>
              <legend><h5>Default Options</h5></legend>
              <div className='row'>
                <div className='col-md-2'>
                  <ControlLabel>Output Recipe:</ControlLabel>
                </div>
                {' '}
                <div className='col-md-10'>
                  <input type='text' value={outputRecipe} onChange={this.setOutput} className='form-control' />
                </div>
                <div className='col-md-12'>
                  <p style={{ fontSize: '12px' }}>
                    The file name to output as.
                  </p>
                </div>
              </div>
              <div className='row'>
                <div className='col-md-2'>
                  <ControlLabel>Group:</ControlLabel>
                </div>
                {' '}
                <div className='col-md-10'>
                  <FormControl onChange={this.setGroup} value={group} />
                </div>
                <div className='col-md-12'>
                  <p style={{ fontSize: '12px' }}>This will group items in the recipe book.{' '}
                    <a href='https://github.com/skylinerw/guides/blob/master/java/recipes.md#groups' target='_blank' rel='noopener noreferrer'>
                      Click here for a short explanation.
                    </a>
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </Panel.Body>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    shape: store.Options.shape,
    emptySpace: store.Options.emptySpace,
    outputRecipe: store.Options.outputRecipe,
    tab: store.Options.tab,
    minecraftVersion: store.Options.minecraftVersion,
    bedrockIdentifier: store.Options.bedrockIdentifier,
    furnace: store.Data.furnace
  }
})(Options)
