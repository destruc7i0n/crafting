/* global Blob */

import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { removeTag, removeTagItem, updateTag } from '../../actions'

import FileSaver from 'file-saver'

import {
  Button,
  Checkbox,
  Col,
  ControlLabel,
  FormControl,
  OverlayTrigger,
  Panel,
  Row,
  Tab,
  Tabs,
  Tooltip
} from 'react-bootstrap'

import TagDropArea from './TagDropArea'
import Ingredient from '../ingredient/Ingredient'

import Tag from '../../classes/Tag'

import infoCircle from '../../assets/info-circle.png'

class Tags extends Component {
  constructor (props) {
    super(props)

    this.state = {
      currentTag: ''
    }

    this.updateTagName = this.updateTagName.bind(this)
    this.updateTagNamespace = this.updateTagNamespace.bind(this)
    this.setAsTag = this.setAsTag.bind(this)
    this.removeTagItem = this.removeTagItem.bind(this)
    this.downloadTag = this.downloadTag.bind(this)
    this.removeTag = this.removeTag.bind(this)
  }

  componentDidUpdate (nextProps) {
    const { currentTag } = this.state
    if (currentTag && !nextProps.tags[currentTag]) {
      this.setState({ currentTag: '' })
    }
  }

  updateTagName ({ target: { value } }) {
    const { currentTag } = this.state
    const { dispatch } = this.props
    dispatch(updateTag(currentTag, { name: value }))
  }

  updateTagNamespace ({ target: { value } }) {
    const { currentTag } = this.state
    const { dispatch } = this.props
    dispatch(updateTag(currentTag, { namespace: value }))
  }

  setAsTag ({ target: { checked } }) {
    const { currentTag } = this.state
    const { dispatch } = this.props
    dispatch(updateTag(currentTag, { asTag: checked }))
  }

  removeTagItem (index) {
    const { currentTag } = this.state
    const { dispatch } = this.props
    dispatch(removeTagItem(currentTag, index))
  }

  removeTag () {
    const { currentTag } = this.state
    const { dispatch } = this.props
    dispatch(removeTag(currentTag))
  }

  downloadTag () {
    const { currentTag } = this.state
    const { tags } = this.props

    const tag = tags[currentTag]

    const json = {
      replace: false,
      values: tag.items.map((item) => item.id)
    }

    let toCopy = JSON.stringify(json, null, 4)
    let blob = new Blob([toCopy], { type: 'text/plain;charset=utf-8' })
    FileSaver.saveAs(blob, `${tag.name}.json`)
  }

  render () {
    const { currentTag } = this.state
    const { tags } = this.props

    const tag = tags[currentTag]

    const tagItemTooltip = (
      <Tooltip id='tafItem'>You can drag and drop this. It behaves like a regular item.</Tooltip>
    )

    let tagOptions = null
    if (tag) {
      tagOptions = (
        <Fragment>
          <br />
          <Row>
            <Col md={3}>
              <ControlLabel>
                Tag Item:{' '}
                <OverlayTrigger placement='bottom' overlay={tagItemTooltip}>
                  <img className='inline' src={infoCircle} alt='info' />
                </OverlayTrigger>
              </ControlLabel>
            </Col>
            <Col md={1}>
              <Ingredient size='normal' ingredient={new Tag(currentTag)} />
            </Col>
            <Col md={3}>
              <ControlLabel>Add Item:</ControlLabel>
            </Col>
            <Col md={1}>
              <TagDropArea id={currentTag} />
            </Col>
            <Col mdPush={1} md={3}>
              <Button bsStyle='danger' block onClick={this.removeTag}>Delete</Button>
            </Col>
          </Row>
          <br />
          <Row>
            <Col md={3}>
              <ControlLabel>Tag Name:</ControlLabel>
            </Col>
            <Col md={9}>
              <FormControl type='text' value={tag.name} onChange={this.updateTagName} />
            </Col>
            <Col md={12}>
              <p style={{ fontSize: '12px' }}>You can only use underscores, numbers, and lowercase letters.</p>
            </Col>
          </Row>
          <Row>
            <Col md={3}>
              <ControlLabel>Namespace:</ControlLabel>
            </Col>
            <Col md={9}>
              <FormControl type='text' value={tag.namespace} onChange={this.updateTagNamespace} />
            </Col>
            <Col md={12}>
              <p style={{ fontSize: '12px' }}>You can only use underscores, numbers, and lowercase letters.</p>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Checkbox
                inline
                checked={tag.asTag}
                onChange={this.setAsTag}
              >
                Create Tag?
              </Checkbox>
            </Col>
            <Col md={12}>
              <p style={{ fontSize: '12px' }}>This will only allow this tag to be used in this recipe, rather than a tag to add to your datapack.</p>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <legend><h5>Items</h5></legend>
              <p style={{ fontSize: '12px' }}>Click on the items to remove them.</p>
            </Col>
            <Col md={12}>
              <div className='ingredients' style={{ maxHeight: '60px' }}>
                {tag.items.map((item, index) => (
                  <div
                    key={`item_${index}`}
                    onClick={() => this.removeTagItem(index)}>
                    <Ingredient draggable={false} size='normal' ingredient={item} />
                  </div>
                ))}
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Button
                disabled={!tag.asTag}
                onClick={this.downloadTag}
                className='download-button'
                bsStyle='primary'
                block
              >Download <code>{`${tag.name}.json`}</code></Button>
              <p style={{ fontSize: '12px' }}>Place the above file in your tags folder.</p>
            </Col>
          </Row>
        </Fragment>
      )
    }

    if (!Object.keys(tags).length) return null
    return (
      <Panel defaultExpanded>
        <Panel.Heading>
          <Panel.Title toggle>
            Tags
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body collapsible>
          <Tabs
            activeKey={currentTag}
            animation={false}
            onSelect={(key) => this.setState({ currentTag: key })}
            id='selected-tab'>
            {Object.keys(tags).map((id) => <Tab key={id} eventKey={id} title={tags[id].name} />)}
          </Tabs>
          {tagOptions}
        </Panel.Body>
      </Panel>
    )
  }
}

export default connect((store) => {
  return {
    tags: store.Data.tags
  }
})(Tags)
