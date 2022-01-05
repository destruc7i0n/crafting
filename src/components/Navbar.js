import React, { memo } from 'react'
import {
  Dropdown,
  MenuItem,
  Nav,
  Navbar,
  NavItem,
  OverlayTrigger,
  Popover,
  Tooltip
} from 'react-bootstrap'

import './Navbar.css'

const BrandToggle = (props) => {
  return (
    <Navbar.Brand onClick={props.onClick}>
      <img src='/assets/crafting_table.png' alt='Logo' />
      Crafting
      <span className='caret' />
    </Navbar.Brand>
  )
}

const CraftingNav = () => {
  const creatorTooltip = (
    <Tooltip id='creator'>Site made by destruc7i0n.</Tooltip>
  )
  const supportTooltip = (
    <Popover id='supportMe' title='Support Me'>
      I've put many hours into making this. Any support is appreciated!
    </Popover>
  )
  return (
    <Navbar inverse>
      <Navbar.Header>
        <Dropdown componentClass='li' id='brand-dropdown'>
          <BrandToggle bsRole='toggle' useAnchor />
          <Dropdown.Menu className='brand-menu'>
            <MenuItem eventKey={1} href='https://advancements.thedestruc7i0n.ca' target='_blank' rel='noopener'>
              <Navbar.Brand>
                <img src='https://advancements.thedestruc7i0n.ca/assets/frame.png' alt='Advancements' />
                Advancements
              </Navbar.Brand>
            </MenuItem>
            <MenuItem eventKey={1} href='https://bedrock.dev' target='_blank' rel='noopener'>
              <Navbar.Brand>
                <img src='https://bedrock.dev/favicon/android-chrome-512x512.png' alt='bedrock.dev' />
                bedrock.dev
              </Navbar.Brand>
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
          <OverlayTrigger placement='bottom' overlay={creatorTooltip}>
            <NavItem eventKey={3} href='https://twitter.com/TheDestruc7i0n' target='_blank'>Creator</NavItem>
          </OverlayTrigger>

          <OverlayTrigger placement='bottom' overlay={supportTooltip}>
            <NavItem eventKey={2} href='https://patreon.com/destruc7i0n' target='_blank'>
              Donate
            </NavItem>
          </OverlayTrigger>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default memo(CraftingNav)
