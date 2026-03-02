import React, { memo } from 'react'
import {
  Dropdown,
  MenuItem,
  Navbar
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
      </Navbar.Header>
    </Navbar>
  )
}

export default memo(CraftingNav)
