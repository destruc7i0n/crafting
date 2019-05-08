import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { setEmptySpace, setOutputRecipe, setShape, setGroup, setFurnaceData, setMinecraftVersion } from '../actions'

import DebouncedInput from './DebouncedInput'
import NumericInput from 'react-numeric-input'

import {
  Checkbox,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  OverlayTrigger,
  Panel,
  Row,
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

    let outputName = value.replace(/[^a-z0-9_]+/, '')

    dispatch(setOutputRecipe(outputName))
  }

  setGroup (value) {
    const { dispatch } = this.props

    dispatch(setGroup(value))
  }

  setMinecraftVersion ({ target: { value } }) {
    const { dispatch } = this.props

    dispatch(setMinecraftVersion(value))
  }

  render () {
    const { dispatch, emptySpace, shape, outputRecipe, tab, furnace, minecraftVersion } = this.props

    const shapelessTooltip = (
      <Tooltip id='shapeless'>This will allow the items to be placed in anywhere in the crafting table to get the
        output.</Tooltip>
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

    let versionSelector = (
      ['crafting', 'furnace'].includes(tab)
        ? (
          <Row>
            <Col md={2}>
              <ControlLabel>Minecraft Version:</ControlLabel>
            </Col>
            <Col md={10}>
              <FormControl
                componentClass='select'
                placeholder='select'
                value={minecraftVersion}
                onChange={this.setMinecraftVersion}
              >
                <option value={1.14} key={1.14}>1.14</option>
                <option value={1.13} key={1.13}>1.13</option>
              </FormControl>
            </Col>
          </Row>
        ) : null
    )

    let customOptions
    if (tab === 'crafting') {
      customOptions = (
        <Fragment>
          <legend><h5>Crafting Options</h5></legend>
          <Row>
            <Col md={4}>
              {shapelessCheckbox}
            </Col>
            <Col md={8}>
              {shape === 'shaped' ? removeEmptySpaceCheckbox : null}
            </Col>
          </Row>
        </Fragment>
      )
    } else if (['furnace', 'blast', 'campfire', 'smoking'].includes(tab)) {
      customOptions = (
        <Fragment>
          <legend><h5>Furnace Options</h5></legend>
          <Row>
            <Col md={2}>
              <ControlLabel style={{ fontSize: '12px' }}>Experience:</ControlLabel>
            </Col>
            {' '}
            <Col md={10}>
              <NumericInput
                className='form-control'
                min={0}
                precision={1}
                step={1}
                value={furnace.experience}
                onChange={(v) => dispatch(setFurnaceData('experience', v))}
                placeholder='Enter amount'
              />
            </Col>
            <Col md={12}>
              <p style={{ fontSize: '12px', margin: '5px 0 5px 0' }}>
                The output experience.
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={2}>
              <ControlLabel>Crafting Time:</ControlLabel>
            </Col>
            {' '}
            <Col md={10}>
              <NumericInput
                className='form-control'
                min={0}
                value={furnace.cookingTime}
                onChange={(v) => dispatch(setFurnaceData('cookingTime', v))}
                placeholder='Enter amount'
              />
            </Col>
            <Col md={12}>
              <p style={{ fontSize: '12px', margin: '5px 0 5px 0' }}>
                The cook time in ticks.
              </p>
            </Col>
          </Row>
        </Fragment>
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
          {versionSelector}
          {customOptions}
          <legend><h5>Default Options</h5></legend>
          <Row>
            <Col md={2}>
              <ControlLabel>Output Recipe:</ControlLabel>
            </Col>
            {' '}
            <Col md={10}>
              <input type='text' value={outputRecipe} onChange={this.setOutput} className='form-control' />
            </Col>
            <Col md={12}>
              <p style={{ fontSize: '12px' }}>
                The file name to output as.
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={2}>
              <ControlLabel>Group:</ControlLabel>
            </Col>
            {' '}
            <Col md={10}>
              <DebouncedInput debounced={this.setGroup} attributes={{ className: 'form-control' }} />
            </Col>
            <Col md={12}>
              <p style={{ fontSize: '12px' }}>This will group items in the recipe book.{' '}
                <a href='https://github.com/skylinerw/guides/blob/master/java/recipes.md#groups' target='_blank' rel='noopener noreferrer'>
                  Click here for a short explanation.
                </a>
              </p>
            </Col>
          </Row>
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
    furnace: store.Data.furnace
  }
})(Options)
