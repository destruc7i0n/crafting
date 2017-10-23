import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'

const propTypes = {
  attributes: PropTypes.object,
  debounced: PropTypes.func.isRequired,
  debounceTime: PropTypes.number
}

const defaultProps = {
  attributes: {},
  debounceTime: 200
}

class DebouncedInput extends Component {
  constructor (props) {
    super(props)

    this.state = {
      input: ''
    }

    this.debounce = this.debounce.bind(this)

    // grab the function to run
    const { debounced, debounceTime } = props
    // the debounced function itself
    this.debouncedSet = debounce((input) => {
      debounced(input)
    }, debounceTime)
  }

  debounce (e) {
    e.persist()
    const { value } = e.target
    this.setState({ input: value })
    this.debouncedSet(value)
  }

  render () {
    const { input } = this.state
    const { attributes } = this.props
    return (
      <input type='text' value={input} onChange={this.debounce} {...attributes} />
    )
  }
}

DebouncedInput.propTypes = propTypes
DebouncedInput.defaultProps = defaultProps

export default DebouncedInput