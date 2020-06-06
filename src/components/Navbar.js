import React, { memo } from 'react'
import {
  Dropdown,
  MenuItem,
  Nav,
  Navbar,
  NavDropdown,
  NavItem,
  OverlayTrigger,
  Popover,
  Tooltip
} from 'react-bootstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './Navbar.css'

const BrandToggle = (props) => (
  <Navbar.Brand onClick={(e) => props.onClick(e)}>
    <img src='/assets/crafting_table.png' alt='Logo' />
    Crafting
    <span className='caret' />
  </Navbar.Brand>
)

const CraftingNav = () => {
  const creatorTooltip = (
    <Tooltip id='creator'>Site made by TheDestruc7i0n.</Tooltip>
  )
  const updatesTooltip = (
    <Tooltip id='updates'>Follow my Twitter for updates!</Tooltip>
  )
  const supportTooltip = (
    <Popover id='supportMe' title='Support Me'>
      I've put many hours into making this. I'd really appreciate it if you could support me on Patreon!
    </Popover>
  )
  return (
    <Navbar inverse>
      <Navbar.Header>
        <Dropdown componentClass='li' id='brand-dropdown'>
          <BrandToggle bsRole='toggle' useAnchor />
          <Dropdown.Menu className='brand-menu'>
            <MenuItem eventKey={1} href='https://advancements.thedestruc7i0n.ca' target='_blank' rel='noopener noreferrer'>
              <Navbar.Brand>
                <img src='https://advancements.thedestruc7i0n.ca/assets/frame.png' alt='Crafting' />
                Advancements
              </Navbar.Brand>
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
          <OverlayTrigger placement='bottom' overlay={supportTooltip}>
            <NavItem eventKey={2} href='https://patreon.com/destruc7i0n' target='_blank'>
              <FontAwesomeIcon icon={['fab', 'patreon']} />
              &nbsp;
              Patreon
            </NavItem>
          </OverlayTrigger>

          <OverlayTrigger placement='bottom' overlay={creatorTooltip}>
            <NavItem eventKey={3} href='https://thedestruc7i0n.ca' target='_blank'>Creator</NavItem>
          </OverlayTrigger>

          <OverlayTrigger placement='bottom' overlay={updatesTooltip}>
            <NavItem eventKey={4} href='https://twitter.com/thedestruc7i0n' target='_blank'>Updates</NavItem>
          </OverlayTrigger>

          <NavDropdown eventKey={5} title='Disclaimer' id='disclaimer-dropdown'>
            <MenuItem eventKey={5.1} href='https://minecraft.net' target='_blank'>
              The Minecraft item icons are copyright © 2009-{new Date().getFullYear()} Mojang AB.
            </MenuItem>
            <MenuItem eventKey={5.2} href='https://mojang.com' target='_blank'>
              This site is not affiliated with Mojang AB.
            </MenuItem>
            <MenuItem eventKey={5.3} href='https://thedestruc7i0n.ca' target='_blank'>
              (c) {new Date().getFullYear()} TheDestruc7i0n
            </MenuItem>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default memo(CraftingNav)
