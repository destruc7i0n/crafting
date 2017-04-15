import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setOutputSlot, toggleCountMenu } from '../../actions'
import PropTypes from 'prop-types'
import { Button, Modal } from 'react-bootstrap'

import NumericInput from 'react-numeric-input'

const propTypes = {
  output: PropTypes.object,
  showingCountModal: PropTypes.bool,
  dispatch: PropTypes.func
}

class CraftingModal extends Component {
  constructor (props) {
    super(props)

    this.state = {
      outputCount: 1
    }

    this.handleOutputCountNumberChange = this.handleOutputCountNumberChange.bind(this)
  }

  componentWillReceiveProps () {
    const {output} = this.props

    // if the output is not populated/filled, reset the amount for the next item to be placed
    // this only occurs when the item will be updated
    if (!output.isPopulated()) {
      this.setState({
        outputCount: 1
      })
    }
  }

  handleOutputCountNumberChange (number) {
    const {dispatch, output} = this.props

    // set to state for fast rendering to the input
    this.setState({
      outputCount: number
    })

    // check if number is valid and then set the output slot
    if (number >= 1 && number <= 64) {
      dispatch(setOutputSlot({...output.toJSON(), count: number}))
    }
  }

  render () {
    const {dispatch, showingCountModal} = this.props
    const {outputCount} = this.state

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
          className="form-control"
          min={0}
          max={64}
          value={outputCount}
          onChange={this.handleOutputCountNumberChange}
          placeholder="Enter amount"
          autoFocus
        />
      )
      show = showingCountModal
      hide = () => dispatch(toggleCountMenu())
    }

    return (
      <Modal show={show}>
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

CraftingModal.propTypes = propTypes

export default connect((store) => {
  return {
    output: store.Data.output,
    showingCountModal: store.Private.showingCountModal
  }
})(CraftingModal)
