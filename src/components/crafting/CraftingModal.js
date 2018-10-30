import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setNBT, setOutputSlot, toggleCountMenu, toggleNBTMenu } from '../../actions'
import { Button, Modal } from 'react-bootstrap'

import NumericInput from 'react-numeric-input'

class CraftingModal extends Component {
  constructor (props) {
    super(props)

    this.state = {
      outputCount: 1
    }

    this.handleOutputCountNumberChange = this.handleOutputCountNumberChange.bind(this)
  }

  static getDerivedStateFromProps (nextProps) {
    const { output } = nextProps

    // if the output is not populated/filled, reset the amount for the next item to be placed
    // this only occurs when the item will be updated
    if (output && !output.isPopulated()) {
      return {
        outputCount: 1
      }
    }
    return null
  }

  handleOutputCountNumberChange (number) {
    const { dispatch, output } = this.props

    // set to state for fast rendering to the input
    this.setState({
      outputCount: number
    })

    // check if number is valid and then set the output slot
    if (number >= 1 && number <= 64) {
      const ingredient = output
      ingredient.count = number
      dispatch(setOutputSlot(ingredient))
    }
  }

  render () {
    const { dispatch, showingCountModal, showingNBTModal, nbt } = this.props
    const { outputCount } = this.state

    let title = ''
    let body = (
      <div />
    )
    let hide = () => false
    let show = false

    if (showingCountModal) {
      title = 'Set Count'
      body = (
        <NumericInput
          className='form-control'
          min={0}
          max={64}
          value={outputCount}
          onChange={this.handleOutputCountNumberChange}
          placeholder='Enter amount'
          autoFocus
        />
      )
      show = showingCountModal
      hide = () => dispatch(toggleCountMenu())
    }

    if (showingNBTModal) {
      title = 'Set NBT'
      body = (
        <textarea
          className='form-control'
          value={nbt}
          rows={10}
          placeholder='Enter NBT'
          onChange={({ target: { value } }) => dispatch(setNBT(value))} />
      )
      show = showingNBTModal
      hide = () => dispatch(toggleNBTMenu())
    }

    return (
      <Modal show={show} onHide={hide}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {body}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={hide}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default connect((store) => {
  return {
    output: store.Data.output,
    nbt: store.Data.nbt,
    showingCountModal: store.Private.showingCountModal,
    showingNBTModal: store.Private.showingNBTModal
  }
})(CraftingModal)
