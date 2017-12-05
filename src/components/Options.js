import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { setEmptySpace, setOutputRecipe, setShape, setGroup } from '../actions'

import DebouncedInput from './DebouncedInput'

import {
  Checkbox,
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  OverlayTrigger,
  Panel,
  Row,
  Tooltip
} from 'react-bootstrap'

import infoCircle from '../assets/info-circle.png'
import RecipeNames from '../resources/recipe-names.json'

const propTypes = {
  shape: PropTypes.string,
  emptySpace: PropTypes.bool,
  outputRecipe: PropTypes.string,
  dispatch: PropTypes.func
}

class Options extends Component {
  constructor (props) {
    super(props)

    this.toggleShape = this.toggleShape.bind(this)
    this.toggleEmptySpace = this.toggleEmptySpace.bind(this)
    this.setOutput = this.setOutput.bind(this)
    this.setGroup = this.setGroup.bind(this)
  }

  toggleShape (e) {
    const {dispatch} = this.props

    dispatch(setShape(e.target.checked ? 'shapeless' : 'shaped'))
  }

  toggleEmptySpace (e) {
    const {dispatch} = this.props

    dispatch(setEmptySpace(!e.target.checked))
  }

  setOutput (e) {
    const {dispatch} = this.props

    dispatch(setOutputRecipe(e.target.value))
  }

  setGroup (value) {
    const {dispatch} = this.props

    dispatch(setGroup(value))
  }

  render () {
    const {emptySpace, shape, outputRecipe} = this.props

    const shapelessTooltip = (
      <Tooltip id='shapeless'>This will allow the items to be placed in anywhere in the crafting table to get the output.</Tooltip>
    )

    const shapelessCheckbox = (
      <FormGroup controlId='shapeless'>
        <Checkbox
          inline
          checked={shape === 'shapeless'}
          onChange={this.toggleShape}
        >
          Shapeless?
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
          Exactly where placed?
          <OverlayTrigger placement='bottom' overlay={removeEmptySpaceTooltip}>
            <img className='inline' src={infoCircle} alt='info' />
          </OverlayTrigger>
        </Checkbox>
      </FormGroup>
    )

    return (
      <Panel collapsible defaultExpanded header='Options'>
        <Row>
          <Col md={4}>
            { shapelessCheckbox }
          </Col>

          <Col md={8}>
            { shape === 'shaped' ? removeEmptySpaceCheckbox : null }
          </Col>

          <Col md={12}>
            <Form horizontal onSubmit={(e) => e.preventDefault()}>
              <FormGroup controlId='recipe'>
                <Col md={2}>
                  <ControlLabel>Output Recipe:</ControlLabel>
                </Col>
                {' '}
                <Col md={10}>
                  <FormControl
                    componentClass='select'
                    placeholder='select'
                    value={outputRecipe}
                    onChange={this.setOutput}
                  >
                    <option value='auto' key={-1}>Auto</option>
                    {RecipeNames.names.map((name, index) => {
                      let nameParts = name.split('_')
                      let namePartsUppercase = nameParts.map((name) => name.charAt(0).toUpperCase() + name.slice(1))
                      let nameReadable = namePartsUppercase.join(' ')
                      return (
                        <option value={name} key={index}>{nameReadable}</option>
                      )
                    })}
                  </FormControl>
                </Col>
              </FormGroup>
              <p style={{fontSize: '12px', margin: '5px 0 5px 0'}}>
                When 'Auto' is selected, the file name will be taken based off of the item name if possible, otherwise the name will be{' '}
                <code>crafting_recipe.json</code>
              </p>
            </Form>
          </Col>

          <Col md={12}>
            <Form horizontal onSubmit={(e) => e.preventDefault()}>
              <FormGroup controlId='groups'>
                <Col md={2}>
                  <ControlLabel>Group:</ControlLabel>
                </Col>
                {' '}
                <Col md={10}>
                  <DebouncedInput debounced={this.setGroup} attributes={{className: 'form-control'}} />
                </Col>
              </FormGroup>
              <p style={{fontSize: '12px', margin: '5px 0 5px 0'}}>This will group items in the recipe book.{' '}
                <a href='http://www.minecraftforum.net/forums/minecraft-java-edition/redstone-discussion-and/commands-command-blocks-and/2810250-1-12-custom-recipes#Groups'>
                  Click here for a short explanation.
                </a>
              </p>
            </Form>
          </Col>

        </Row>
      </Panel>
    )
  }
}

Options.propTypes = propTypes

export default connect((store) => {
  return {
    shape: store.Options.shape,
    emptySpace: store.Options.emptySpace,
    outputRecipe: store.Options.outputRecipe
  }
})(Options)
