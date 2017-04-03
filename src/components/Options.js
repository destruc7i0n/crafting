import React, { Component } from 'react'
import { connect } from 'react-redux'
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

class Options extends Component {
  constructor (props) {
    super(props)

    // bindings
    this.handleNumberChange = this.handleNumberChange.bind(this)
  }

  handleNumberChange(e) {
    const { dispatch } = this.props

    let value = e.target.value
    let number = parseInt(value, 10)

    if (number => 1 && number <= 64) {
      dispatch({ type: 'SET_OUTPUT_COUNT', payload: number })
    }
  }

  render () {
    const {dispatch, emptySpace, shape, outputRecipe, outputCount} = this.props

    const shapelessTooltip = (
      <Tooltip id="shapeless">This will allow the items to be placed in anywhere in the crafting table to get the
        output.</Tooltip>
    )

    const shapelessCheckbox = (
      <FormGroup controlId="shapeless">
        <Checkbox
          inline
          checked={shape === 'shapeless'}
          onChange={(e) => dispatch({type: 'SET_SHAPE', payload: e.target.checked ? 'shapeless' : 'shaped'})}>
          Shapeless?
          <OverlayTrigger placement="bottom" overlay={shapelessTooltip}>
            <img className="inline" src={infoCircle} alt="info"/>
          </OverlayTrigger>
        </Checkbox>
      </FormGroup>
    )

    const removeEmptySpaceTooltip = (
      <Tooltip id="removeEmptySpace">
        <strong>If this is checked</strong>, the generator will ensure that the item will be placed exactly where placed
        in the crafting table above.
        <br/>
        <strong>If this isn't checked</strong>, the generator will make the recipe be able to be placed anywhere in the
        table. (Useful for 2x2 crafting)
      </Tooltip>
    )

    const removeEmptySpaceCheckbox = (
      <FormGroup controlId="emptySpace">
        <Checkbox
          inline
          checked={!emptySpace}
          onChange={(e) => dispatch({type: 'SET_EMPTY_SPACE', payload: !e.target.checked})}>
          Exactly where placed?
          <OverlayTrigger placement="bottom" overlay={removeEmptySpaceTooltip}>
            <img className="inline" src={infoCircle} alt="info"/>
          </OverlayTrigger>
        </Checkbox>
      </FormGroup>
    )

    return (
      <Panel collapsible defaultExpanded header="Options">
        <Row>
          <Col md={4}>
            { shapelessCheckbox }
          </Col>

          <Col md={8}>
            { shape === 'shaped' ? removeEmptySpaceCheckbox : null }
          </Col>

          <Col md={12}>
            <Form horizontal onSubmit={(e) => e.preventDefault()}>
              <FormGroup controlId="recipe">
                <Col md={2}>
                  <ControlLabel>Output Recipe:</ControlLabel>
                </Col>
                {' '}
                <Col md={10}>
                  <FormControl componentClass="select"
                               placeholder="select"
                               value={outputRecipe}
                               onChange={(e) => dispatch({type: 'SET_OUTPUT_RECIPE', payload: e.target.value})}>
                    <option value="auto" key={-1}>Auto</option>
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
              <p style={{fontSize: '10px', marginTop: '5px'}}>When 'Auto' is selected, the file name will be taken based off of the item name if possible.</p>
            </Form>
          </Col>

          <Col md={12}>
            <Form horizontal onSubmit={(e) => e.preventDefault()}>
              <FormGroup controlId="recipe">
                <Col md={2}>
                  <ControlLabel>Output Quantity:</ControlLabel>
                </Col>
                {' '}
                <Col md={10}>
                  <FormControl componentClass="input"
                               placeholder="1"
                               min={1}
                               max={64}
                               value={outputCount}
                               onChange={this.handleNumberChange}
                               type="number" />
                </Col>
              </FormGroup>
              <p style={{fontSize: '10px', marginTop: '5px'}}>The amount of items to output.</p>
            </Form>
          </Col>

        </Row>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    shape: store.Options.shape,
    emptySpace: store.Options.emptySpace,
    outputRecipe: store.Options.outputRecipe,
    outputCount: store.Options.outputCount
  }
})(Options)
