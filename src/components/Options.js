import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  setEmptySpace,
  setOutputRecipe,
  setShape,
  setGroup,
  setFurnaceData,
  setMinecraftVersion,
  setTab, setBedrockIdentifier
} from '../actions'

import NumericInput from 'react-numeric-input'

import { versions } from 'minecraft-textures'

import {
  Alert,
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
    const { dispatch } = this.props

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
            <option value='bedrock' key='bedrock'>Bedrock</option>
            {versions.map(v => {
              if (v.toString() !== '1.12') {
                return (<option value={v} key={v}>{v}</option>)
              }
              return null
            })}
          </FormControl>
        </Col>
      </Row>
    )

    let customOptions
    if (tab === 'crafting') {
      customOptions = (
        <>
          <legend><h5>Crafting Options</h5></legend>
          <Row>
            <Col md={4}>
              {shapelessCheckbox}
            </Col>
            <Col md={8}>
              {shape === 'shaped' ? removeEmptySpaceCheckbox : null}
            </Col>
          </Row>
        </>
      )
    } else if (['furnace', 'blast', 'campfire', 'smoking'].includes(tab) && minecraftVersion !== 'bedrock') {
      customOptions = (
        <>
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
              <strong>Note</strong>: Note that Bedrock support is partial.
            </Alert>
          ) : null}
          {versionSelector}
          {minecraftVersion === 'bedrock' ? (
            // set the identifier for bedrock
            <Row>
              <Col md={2}>
                <ControlLabel>Bedrock Identifier:</ControlLabel>
              </Col>
              {' '}
              <Col md={10}>
                <FormControl
                  onChange={this.setBedrockIdentifier}
                  placeholder='identifier:value'
                  value={bedrockIdentifier}
                />
              </Col>
              <Col md={12}>
                <p style={{ fontSize: '12px' }}>
                  The identifier for the bedrock recipe. Must be defined. The identifier is used internally.
                </p>
              </Col>
            </Row>
          ) : null}
          {customOptions}
          {minecraftVersion !== 'bedrock' ? (
            <>
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
                  <FormControl onChange={this.setGroup} value={group} />
                </Col>
                <Col md={12}>
                  <p style={{ fontSize: '12px' }}>This will group items in the recipe book.{' '}
                    <a href='https://github.com/skylinerw/guides/blob/master/java/recipes.md#groups' target='_blank' rel='noopener noreferrer'>
                      Click here for a short explanation.
                    </a>
                  </p>
                </Col>
              </Row>
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
