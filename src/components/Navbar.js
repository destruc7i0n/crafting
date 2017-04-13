import React from 'react'
import { MenuItem, Nav, Navbar, NavDropdown, NavItem, OverlayTrigger, Tooltip } from 'react-bootstrap'

import './Navbar.css'

const CraftingNav = () => {
  const creatorTooltip = (
    <Tooltip id="creator">Site made by TheDestruc7i0n.</Tooltip>
  )
  const updatesTooltip = (
    <Tooltip id="updates">Follow my Twitter for updates!</Tooltip>
  )
  return (
    <Navbar inverse>
      <Navbar.Header>
        <Navbar.Brand>
          <img src="/assets/crafting_table.png" alt=""/>
          Crafting
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
          <OverlayTrigger placement="bottom" overlay={creatorTooltip}>
            <NavItem eventKey={1} href="https://thedestruc7i0n.ca" target="_blank">Creator</NavItem>
          </OverlayTrigger>

          <OverlayTrigger placement="bottom" overlay={updatesTooltip}>
            <NavItem eventKey={2} href="https://twitter.com/thedestruc7i0n" target="_blank">Updates</NavItem>
          </OverlayTrigger>

          <NavDropdown eventKey={3} title="Disclaimer" id="disclaimer-dropdown">
            <MenuItem eventKey={3.1} href="https://minecraft.net" target="_blank">
              The Minecraft item icons are copyright © 2009-{new Date().getFullYear()} Mojang AB.
            </MenuItem>
            <MenuItem eventKey={3.2} href="https://mojang.com" target="_blank">
              This site is not affiliated with Mojang AB.
            </MenuItem>
            <MenuItem eventKey={3.3} href="https://thedestruc7i0n.ca" target="_blank">
              (c) {new Date().getFullYear()} TheDestruc7i0n
            </MenuItem>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )

}
export default CraftingNav
