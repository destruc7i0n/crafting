import React from 'react'
import { Navbar } from 'react-bootstrap'

const Nav = (props) =>
  <Navbar inverse collapseOnSelect>
    <Navbar.Header>
      <Navbar.Brand>
        <a href='#'>Crafting</a>
      </Navbar.Brand>
      <Navbar.Toggle />
    </Navbar.Header>
  </Navbar>

export default Nav
