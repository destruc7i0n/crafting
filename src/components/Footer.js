/* eslint-disable react/jsx-no-target-blank */
import React from 'react'

import './Footer.scss'

const Footer = () => {
  return (
    <div className='footer'>
      <p className='me'>Website by <a href='https://thedestruc7i0n.ca' target='_blank' rel='noopener'>destruc7i0n</a> · <a href='https://twitter.com/TheDestruc7i0n' target='_blank' rel='noopener'>Twitter</a></p>
      <br />
      <p>The Minecraft item icons are copyright © 2009-{new Date().getFullYear()} Mojang Studios</p>
      <p>This site is not affiliated with Mojang Studios</p>
    </div>
  )
}

export default Footer
