/* global FileReader, Blob */

import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Alert, Button, ControlLabel, FormControl, Modal } from 'react-bootstrap'

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

    let trimmedId = id.split(':').map(p => p.trim()).join(':')
    // remove spaces and transform to lower case (as most items are)
    let fixedId = trimmedId.split(' ').join('_').toLowerCase()

    if (name && id) {
      dispatch(addItem(
        fixedId,
        name,
        image
      ))
      this.setState({
        id: '', name: '', image: null, show: false
      })
    }
  }

  render () {
    const { name, show, id, image } = this.state

    return (
      <>
        <Button bsSize='xs' bsStyle='info' onClick={() => this.setState({ show: true })}>Add Item</Button>

        <Modal show={show} onHide={() => this.setState({ show: false })}>
          <Modal.Header closeButton>
            <Modal.Title>Add Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert bsStyle='info'>
              Please note that this will not add items to the game itself!<br />
              This is meant for items which are not present in the list below, or for items added to the game
              through means such as modding.
            </Alert>
            <div className='row'>
              <div className='col-md-2'>
                <ControlLabel>Name:</ControlLabel>
              </div>
              <div className='col-md-10'>
                <FormControl
                  type='text'
                  autoComplete='off'
                  value={name}
                  onChange={({ target: { value: name } }) => this.setState({ name })}
                />
              </div>
            </div>
            <br />
            <div className='row'>
              <div className='col-md-2'>
                <ControlLabel>Id:</ControlLabel>
              </div>
              <div className='col-md-10'>
                <FormControl
                  type='text'
                  autoComplete='off'
                  placeholder='namespace:item'
                  value={id}
                  onChange={({ target: { value: id } }) => this.setState({ id })}
                />
              </div>
            </div>
            <br />
            <div className='row'>
              <div className='col-md-2'>
                <ControlLabel>Texture:</ControlLabel>
              </div>
              <div className='col-md-3'>
                <label className='btn btn-success btn-block'>
                  Select Texture <input type='file' accept='.png' multiple={false} style={{ display: 'none' }} onChange={this.importImage} />
                </label>
              </div>
              <div className='col-md-2 col-md-push-2'>
                <Ingredient
                  ingredient={new IngredientClass(
                    id || 'example:item',
                    name || '',
                    image || null
                  )} size='normal' draggable={false} hover={false}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle='success' onClick={this.addItem} disabled={!name || !id}>Add</Button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }
}

export default connect()(AddItemModal)
