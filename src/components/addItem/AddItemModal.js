/* global FileReader, Blob */

import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import { Button, Col, ControlLabel, FormControl, Modal, Row } from 'react-bootstrap'

import Ingredient from '../ingredient/Ingredient'
import IngredientClass from '../../classes/Ingredient'
import { addItem } from '../../actions'

class AddItemModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      show: false,
      name: '',
      id: '',
      image: null
    }

    this.importImage = this.importImage.bind(this)
    this.addItem = this.addItem.bind(this)
  }

  async importImage ({ target: { files } }) {
    const image = files[0]
    const reader = new FileReader()

    if (image instanceof Blob) {
      reader.readAsDataURL(image)

      reader.onloadend = () => {
        this.setState({
          image: reader.result
        })
      }
    }
  }

  addItem () {
    const { name, id, image } = this.state
    const { dispatch } = this.props

    if (name && id) {
      dispatch(addItem(
        id, name, image
      ))
      this.setState({
        id: '', name: '', image: null, show: false
      })
    }
  }

  render () {
    const { name, show, id, image } = this.state

    return (
      <Fragment>
        <Button bsSize='xs' bsStyle='info' onClick={() => this.setState({ show: true })}>Add Item</Button>

        <Modal show={show} onHide={() => this.setState({ show: false })}>
          <Modal.Header closeButton>
            <Modal.Title>Add Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={2}>
                <ControlLabel>Name:</ControlLabel>
              </Col>
              <Col md={10}>
                <FormControl
                  type='text'
                  autoComplete='off'
                  value={name}
                  onChange={({ target: { value: name } }) => this.setState({ name })}
                />
              </Col>
            </Row>
            <br />
            <Row>
              <Col md={2}>
                <ControlLabel>Id:</ControlLabel>
              </Col>
              <Col md={10}>
                <FormControl
                  type='text'
                  autoComplete='off'
                  placeholder='namespace:item'
                  value={id}
                  onChange={({ target: { value: id } }) => this.setState({ id })}
                />
              </Col>
            </Row>
            <br />
            <Row>
              <Col md={2}>
                <ControlLabel>Texture:</ControlLabel>
              </Col>
              <Col md={3}>
                <label className='btn btn-success btn-block'>
                  Select Texture <input type='file' accept='.png' multiple={false} style={{ display: 'none' }} onChange={this.importImage} />
                </label>
              </Col>
              <Col md={2} mdPush={2}>
                <Ingredient ingredient={new IngredientClass(
                  id || 'example:item',
                  name || '',
                  image || null
                )} size='normal' draggable={false} hover={false} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle='success' onClick={this.addItem} disabled={!name || !id}>Add</Button>
          </Modal.Footer>
        </Modal>
      </Fragment>
    )
  }
}

export default connect()(AddItemModal)
