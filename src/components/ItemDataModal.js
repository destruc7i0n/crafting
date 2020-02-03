import React, { Component, Fragment } from 'react'
import { Alert, Button, Col, FormControl, Modal, Row } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class ItemDataModal extends Component {
  constructor (props) {
    super(props)

    this.state = {
      kvPairs: []
    }

    this.addRow = this.addRow.bind(this)
    this.deleteRow = this.deleteRow.bind(this)
    this.updateRow = this.updateRow.bind(this)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (!prevProps.show && this.props.show) {
      const { ingredient } = this.props
      this.setState({
        kvPairs: Object.entries(ingredient.customData)
      })
    }
  }

  addRow () {
    this.setState({
      kvPairs: [
        ...this.state.kvPairs,
        ['', '']
      ]
    })
  }

  deleteRow (index) {
    const { kvPairs } = this.state
    kvPairs.splice(index, 1)
    this.setState({
      kvPairs
    })
  }

  updateRow (index, key, value) {
    const { kvPairs } = this.state
    let row = kvPairs[index]
    if (key !== null) row[0] = key
    if (value !== null) row[1] = value
    this.setState({ kvPairs })
  }

  render () {
    const { kvPairs } = this.state
    const { show, onHide, setCustomData } = this.props

    return (
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Set Item Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={12}>
              <Alert>
                Here you can set custom data for the items, for example <code>data</code> for Bedrock Edition items.
                This will be copied verbatim to the output.
              </Alert>
            </Col>
          </Row>
          <Row>
            <Col mdPush={10} md={2}>
              <Button bsStyle='success' block onClick={this.addRow}>
                <FontAwesomeIcon icon='plus' />
              </Button>
            </Col>
          </Row>
          {kvPairs.map((pair, index) => {
            return (
              <Fragment key={index}>
                <br />
                <Row>
                  <Col md={5}>
                    <FormControl type='text' value={pair[0]} placeholder='Key' onChange={({ target: { value } }) => this.updateRow(index, value, null)} />
                  </Col>
                  <Col md={5}>
                    <FormControl type='text' value={pair[1]} placeholder='Value' onChange={({ target: { value } }) => this.updateRow(index, null, value)} />
                  </Col>
                  <Col md={2}>
                    <Button bsStyle='danger' block onClick={() => this.deleteRow(index)}>
                      <FontAwesomeIcon icon='times' />
                    </Button>
                  </Col>
                </Row>
              </Fragment>
            )
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='success' onClick={() => setCustomData(kvPairs)}>Save</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default ItemDataModal
