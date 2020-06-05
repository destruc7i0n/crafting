import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setTab } from '../actions'
import { Tabs, Tab, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { invert } from 'lodash'

import classNames from 'classnames'

import CraftingGrid from './crafting/CraftingGrid'

import './CraftingArea.scss'

const CraftingTabImage = ({ title, image }) => (
  <OverlayTrigger placement='top' overlay={<Tooltip>{title}</Tooltip>}>
    <img src={image} alt={title} />
  </OverlayTrigger>
)

class CraftingArea extends Component {
  constructor (props) {
    super(props)

    this.keyMapping = {
      1: 'crafting',
      2: 'furnace',
      3: 'blast',
      4: 'campfire',
      5: 'smoking',
      6: 'stonecutter',
      7: 'smithing'
    }
  }

  render () {
    const { dispatch, crafting, furnace, generic, output, tab, minecraftVersion } = this.props
    const selectedTab = parseInt(invert(this.keyMapping)[tab], 10) // grab the selected tab index

    const titles = {
      crafting: 'Crafting',
      furnace: 'Smelting',
      blast: 'Blasting',
      campfire: 'Campfire',
      smoking: 'Smoking',
      stonecutter: 'Stonecutter',
      smithing: 'Smithing Table'
    }

    const images = {
      crafting: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABRFBMVEUAAAB2YjmLcUlfTTFQQyevckY6Lx1UOCOFa0NOPiY1Khqiaz5VRipbSS0TEAkZFAwOCwYcGA0rIxUhGxEOCwcUEAoXEgxUNyMSDwkNCga0kFpQJhZSNSFLKxirbkIUDwZVOCRxTSs/LBldQSRMMh0WEgtXRi0aFQ0WEAgsFw1TNiIgGhBBIRMsJBc3LBugaDwlHhJLMRxDJxYmHxIYEws4LRxbW1uFWDgiGxGydUkcFw9tbW0yKBiLTSyNUC2haT2xdEmgoKBbPCZJPSQPCwatcERTOiA/MR8eFgijXjSvc0dYOycuGA6ucUVDIxWdZjksIxZKMRylbkGjaz8SDgklHhGwc0eeWTJNNB2gaTyeWjNNLRknIBOpbEE7Lx+kbUGGhoZTQioyKRihaj6jbD9KKhhTNyKyjlgJBwRcSS61kVtRNSCvssljAAAAAXRSTlMAQObYZgAAAiJJREFUOE+VkUV3HDEQhFeMw7RMZmZmDDMz8/+/p2ftHT87dvJSFx36U6m6VCr9n/xq1f/L+HEYLiyEoXfF2Gfsxc74uLnHmH/J2GM3jckEuyGEmWHNiy7+0dHWlrjF5ubm55l4Zcx5Fz8MjWk0fj0wQmSZGWyAi5ma6rt4I9Xqk3b72VMzKARjmRjcfrkrxOuf1cWRHlBG/kjITCOr3zHbQnz63Pwy/nWGhb5HKicARqhWazbBv143pl6HBxjzPEIKQMpopVZj7FG7vbYmxA7bXV/fTx2nDyg0IIO7k7XaG/Yuyx7mt2+PudQh/BRAahrJycmVyPPD6rf7/mK6PzZGiNZOH0DI2okoQBj7vudR6rhDKV/lTgFYGCUJxkjicoU6nDpxTLuc0n5ILK/jILKbFgNAKOXcTelzp9jCquEcQANK5YCeJcQdcmaJ5oXDnhoOJuSAlLZc0bQLgEv1auGA0PCeSgLUQVJCBtpqvXVjiFhkkPLg/UGU2GmoFADeauk4dejZFkpi/GEikhAhzwAFfEyhJ8fR/QxWYTQawJIKMnC9sbE0BADXRQaMlQIAzp7D8jI9dDmnvOjBYoQrCZKdXgb4BPo9pqBTh8Tmd0cDazv5Fvnb+tCFg+i4dCLIkBeFNlUOgDlxU0K1Lp1J/QgiKTtWQVHkGIpKOS+dVzmBFlAekgNQiUt/ysJf9UJ29bVLxrmWep/FrxrnUkl88e1/6TfSkzftYPMEdQAAAABJRU5ErkJggg==',
      furnace: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABhlBMVEUAAABZWVk9PT1VVVU4ODgeHh4AAAAYGBhAQEB6eno1NTVISEgxMTEtLS1hYWFeXl4yMjIcHBwlJSUbGxsvLy9paWkuLi4SEhJSUlIZGRlXV1dEREQ7OzspKSkkJCR4eHhQUFAnJycmJiYXFxchISF9fX1kZGQsLCxjY2NqamqQkJBnZ2dycnI8PDyCgoI6OjpLS0tFRUU+Pj5DQ0NaWlp7e3szMzOIiIiPj49/f39+fn5vb295eXlJSUmSkpJCQkI/Pz9bW1twcHAjIyMqKiowMDBsbGxlZWUaGho0NDQ2NjZGRkYNDQ0gICCUlJQoKCgrKyuHh4c5OTmYmJh8fHyXl5cdHR0VFRWAgIBHR0dYWFhra2tMTExWVlZiYmIfHx9RUVGRkZFdXV1UVFRzc3M3NzdOTk50dHSDg4NPT08UFBRoaGhgYGCMjIxKSkpubm4LCwuFhYWdnZ1fX19cXFwMDAyTk5NTU1MQEBBNTU2JiYkWFhYiIiIKCgoODg6Li4sRERGEhISvBf36AAAAAXRSTlMAQObYZgAAAnxJREFUOMuV0lVz20AABODciRkty8zMzBRmZuakzMz/vLLlzKRp05ns635aSTc3MvKwuCYn6f/UqNfr8fD8xD21yIO6p9E4rNqT3L/GHW97tUZjvZSoVKnkvvPv8Xj8x9QzADye3sqb4+Nw+Pa3iABUKhRV741aLM3myclnAGo1u9138zQ9WTwH4BwcxOOjG7Heq+r69aLF4vEeiOIAjPvoMr/zHrygqGtqezu5u15Ll56MWlwTis0EXp9bVZNJQD2lqFAoFjtdATzvdiuPl02AwQI9FuS4ff51PB4O7+1teD2ZDCaxY0vEAASdoEUiQcWJhnmKomL98YCVFUlIb5mvQBx6LIagkXGas+d41O0mAhm/q6DNodYBWECAT/IXs8zz4ObsrCgq05FMvnzBZR1DIHdOfTguT6cOyfKSLCkcyzCOiVw2OyOZYIwR8H4wYg6QsjQLl2dyGp3rdhzspgkcBfzbgFwmnO4tl4bm81qrxZCcCzNPUgRnKy/nDZCPXmKBJUjnYWS1EOmqcMEElvacsx569x1vRj8oUgai3RlIaxCNMuY5oMV0e9FZqJc+lj6NKxJHohwtthxTUQQOgZBOC2trnS4VCjPKF5YsM6ksnwAASdmGIKQKLFtdc+524LRN03ZgIqEDoOtkYAAu7AIewVmOXWznwDLxFUanjBYxyKq5sCqo/V/AWeGqbYkQTBQYMXrkZkFlVMxqNQR3FSqqfgjAI0TXHyGQtNmGd0rGpKM+sTeLbj9EjFpHICSIW7cSw46wn1Y2bZf9pPF1OgkDt2uTYBj+Swj6SQRJkcTduh8Jm6+cyXLqzvgfK5QQ9JG2++p+GHnBNvKw/Ab1Wl3ozqEajAAAAABJRU5ErkJggg==',
      blast: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAb1BMVEUAAABoaGh0dHRPT09JSEg/PkJZWFh+fn5tbm0/Pz8oKCpbW1tCQkItLS1WVlYgHx8vLi4yMjJKSkozMzMcGx1LS0snJiYyNTBJTUYjIyM7OztXVlc5ODhCPj4tKioHBwdERERkZGRRUVE4ODj///9Y+EviAAAAAXRSTlMAQObYZgAAAAFiS0dEJLQG+ZkAAAAHdElNRQfjBAsJFBE1Si5lAAAAEGNhTnYAAAQAAAAJwAAAASAAAAmAOK9E/QAAAbRJREFUOMuVkoFyoyAURQsIjSCCgCjKNon5/3/sBUxnupt2ZiHJZDwn716Mb2//twgh9DfMWNdxTn7AgndMdB2cTrzCDXWCMcb5PwqwwAQOyhAioJFvw3kR6gx8xeZlzFMRlAAxUIGrokzoREkjtCnvF0rLT5DB6wcMLjpGaN9X4SLVUELPGLx5raFHo6ug7DA5V66zVg9cCO/DHJcquHW1Vg5OEExvXYTXxqR+2aowyF3aSVrnCMUxGCFeBxNj8kGfwpStnSZr3y/4K1DNhJRCMiH4FiFt/pOtzBl11TgbbQATMtIp2GwzlpyUtcMc4mJKgEk6nRFTzlPZ1q157c2yfcQYjEfR85ioaMvLSrnufgnpAwX9POvQbtRAqZToiC3loANOsG3jfL1FdkbsqiiyFoFggMdrEW5fwv1eFIsegzdpK/ibsN/vCkop4jwOV/F1iVsT8rErtd9VDXLocCv4Ni7mEZvgjqJA2ikdNBuLMC5LjE8hH24/sFXR+l7fGvaPGM9nqipY6lCD7n2s2H/hppQcDIGwGWP+ws8pkKrwAp9TnMu4i4+X+FRy/Bk35Vf8an0CwFMneiFnsncAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTktMDQtMTFUMTM6MjA6MTctMDQ6MDA8KzQcAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE5LTA0LTExVDEzOjIwOjE3LTA0OjAwTXaMoAAAAABJRU5ErkJggg==',
      campfire: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAANlBMVEUAAACxPwDJbAPfohvvzVb566tMPSb+/vvCnWK4lF82KxufhE1fSiuWdEF0WjaRcUKYeEn///8pE3GsAAAAAXRSTlMAQObYZgAAAAFiS0dEEeK1PboAAAAHdElNRQfjBAsJFBE1Si5lAAAAEGNhTnYAAAQAAAAJwAAAA0AAAAmA7FWSuwAAAJtJREFUOMulz+0OwyAIQFEBwY/a2vd/2snYsmRZHLb3H+HElhC+Agjz/gB4dgfg6DrQBdGEOAAikZJrQM8jiiOin6c6gD4fI7ORdaA/qGsDiKtAxI5kTilGPVRkBYjkXErOiGmEaFOtXiCiYNtKAUiJGcCmWl/EAVoro31v7Rj1/p784Dha0w/psvfP5AfnyB7XpWaTF9RJPnCzB2XXDumE2MUyAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTA0LTExVDEzOjIwOjE3LTA0OjAwPCs0HAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wNC0xMVQxMzoyMDoxNy0wNDowME12jKAAAAAASUVORK5CYII=',
      smoking: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAe1BMVEUAAABQTk5nUCw8OztoaGiFhYV3d3ddW1snJycZGRk6Lx5gSilCMxxQPyM0JxcmJiYaGhojGxAtIxM3KxhCQkItLS0zMzNVVVU7OjolHhMZFQ0RERFMTEwLCws7OzsnJiYgHx9WVlZLS0sPDAkXExBdXV0zMjIjIiL////sYQypAAAAAXRSTlMAQObYZgAAAAFiS0dEKL2wtbIAAAAHdElNRQfjBAsJFBE1Si5lAAAAEGNhTnYAAAQAAAAJwAAAAeAAAAmA0bqsJgAAAdBJREFUOMuVUouO2yAQPAyG63nZhIcPPzhfEmPf//9hF7DSVNdU7UoYyTM7Ozvi5eX/ijUN+wvMhWip+LNu2UqllBSy/ZMKV0woqThvW9KR7Lu4lG37WipThHiksPyjwD+o6BLikdI0b4xgxiueGZxaJHtrmkLogLFsrwwoAq+qlUIxBlAIGk8nzhkTdw8yC7Lz2dhDAeB0YkwKoagtW1QVtqYSOgStiUKTiUSH8/PZOWtcVQDtPSDkQUySAqdua4zt3w8PqEPww4hZpaHK3ZPp+7kHV01CCEP0HgHGrgM70ey+//iYF2sPgo9DJBWPI4IzU4GpFlNNYueH4IlBg8iL/ezngs/vxxaABEYf8kfTypdrIczzYg4POOZ+OtF3nXWXa4FvtxUOD51GjDEMZBU6az+vBTarveegYRyRnIaI2hBhvi1rssn+ihrHzIlxAHBwWZa0JgpyctVDp7dtpAzIS0R0ZlmNS2kylIc7RlBQWxahoNCY1SUKw9lkjjVxDGEbho0yGLW2sBJMcZo1mel4U/seBx+3DVGTh2manEkpfX09vEqi+C1sOwXpJkcbrL/BlRI2v9PGtN6avsGVMuxAM57AlQJo3VO4bnR3/q/1E0t/LERhHc9kAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTA0LTExVDEzOjIwOjE3LTA0OjAwPCs0HAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wNC0xMVQxMzoyMDoxNy0wNDowME12jKAAAAAASUVORK5CYII=',
      stonecutter: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH4wQLCRQRNUouZQAAABBjYU52AAAEAAAACcAAAALAAAAJgJbv8YwAAAdtSURBVFjD7ZddiJ1HGcd/8877fd6zH2c3u5ukbLqxXcVKak1tpKIQUfBCDV70Nl4ZBKUQKGilwoL4casXYivihYKIKBqKsZiUajFou2ldY1vbppvsNtnN7p49Z895z3m/5p0ZLzaNFrRNS+/s/3p45jfz/Od5noF39a7+3yVuduHCwoJ76NChO8qyPKC1Prh///78woULZ+69997Vu+++W71dAPdmF87NzU1rrX8ghPiwtVYDoTHmaaXUz8+dO/fE4uLi8/fff3/5VgHkTZ5+bGRk5EhVVV9ttVrScRxXKYXjOPsnJiY+2e/3D1+5cqX0PO+Fixcv6nc8BadOnZqrquo3jUbjUJZlADiOw8TEBFprhsMh29vb62traw+HYfjIyZMn199RgMcee+x9URQ9laZps65rgiCg0WgwGAwoioKRkREajQZbW1vV8vJyUVXVA8Ph8KcLCwvF2wZYWFhwqqraE4bhUd/3vy2EmLvtttuI45hms8nOzg5aa5IkodFoIKWkKAqeeeYZ0jRFCLHhed7X2+327+M43lxYWKhv1gPioYceek8QBJ+LouibwANSyvGiKLDW0mq1yLKM4XCIUopWq4XneVhrMcaglGJ9fZ2qqhIhxLFGo/HRIAjE0aNHh2fPnt1+oxsQD37+4O3KHTnGzMc+4SfJp6XrUtc1vu9TliW9Xo/x8XFGRkYA2Nzc5MiRIxw4cIAsyxgMBkRRxOLiIt1uF8dxroe25PngCXfryT8EWp361i9eeE6AvQHw4PH9EzPjU1/My/rYzsB+cGcoQuuNEkzfSRg1cF0XpRTWWqy1ALTbbYqiYGZmhltvvZXZ2VmCIGB0dJSrV6+yvLxMr9ejKnLyrQuQt2nGQo02zFIY2d/J3Pzw5CMvrEuAltf80NZ2+aNG6B/Ude0WVYU3dRcaie8HJElCkiT4vk+/38dxHPbu3YvjOFy5cgVjDPPz87RaLdI0pd1uk6YpAMMsp7Y+dvAqoaOk0c6+Py527nl6qfPkWr98WQLMTsiDRemdWF0fksW3s2f+47QmZwiCAMdxqOuaqqrI85wgCBBCUFUVURTRarXodrusrq7iui5CCAaDAZubm/T7fZIkoTU5jU0O8MrVguf/cZlhrj1U/cu1tHrRBai7Bd54TOC5GGtpt9tkWcb09DRCCIwx5HmOMQatNb7vI4TgejFibm4OpRSLi4tMTk5y5MgRhsMhURShtebSpUtsbGygshxjwZMOKt51xy5ADY4x+K6DKAe4pqIoHFZWVhgbGyNJEprNJnVdU5YlQgi01lRVRRAEGGMAmJqawvM8lpaW6PV69Pt92u02eZ6jqxw17CHYdZ8kBtJdANd1QThYoH9tlWLQJxnfQzQ+TZ4HVFVFGIa4rkuz2WQwGJAN+lTt5yiFoZ65Cy+IiaKIra0ter0evV5vF7TMqLobDHpdqiwl9NzXFQAXINnjUtagtcXxI0zRo7eeovqbmIkZRm+Zp6oqOp0OvZ0d/LqNm68QOiVgqTf+TFdMsawS0nSAEILAc8m21xj2tqmKDG0MwgupdIUUgCP/DeC6gJBYC970AUSQMFh/hW5nmzJLGWys4Ldmad5yO5VS7KxvIYYdDt8xinQEZ/66wXbVZ3J2Ht/3yTZXGfY2d82rDfgxUWsfaEW1tYKxFkdnr/eAsRZjLS4QNZp4cx+gTLuU3XXyMiNbX6boXMWfuAVTK7K05vSf1qkNlLXBSxrk3Q2yzgbUJdaRCL9BmLRwowQhHOq8vl55HF5rmS7AYKvAHYsASDz/Rq7LKCZrjFKmHVS/zXDYZ/jqy0gHYl9ijEc6KAlcQZV2KfsdrCPBbeA3x/DjUYLr3lFKYWuPWhtcKbHZfwA4jajrCPGiEOK9cRwTRrswnufRSJq4no8ZnSTbaaMGHUTeQxsNQqC0xpMuUkoIEmTUJEjGEY6D53mEYYi1FsdxkEYxdASmtpdSaN8A0GX3pcgGx3umPGZq8yUpZUtKiVIKz/OIomi3JwQhWWOUYmuFfOcaoSex1qKMIWiM4I3vJWmO7j4zKZFSorW+8UxrY4bGioeFW/46VemzNwCeuEwB1546DM/qexo/VkqdVEp9RWuNlBLXdYnjGM/zqJVCuS5aGxxf4rkSrQ04DtLzsYAQYhdMKaSUeJ5Hnuc/6Q3y7xaX2pefg+pN54Hjx4/PA1+z1n7G9/1xKaXrOM5uV1z9JztryzRjn3ZaobTBb7aI98wSxfFrbVlba3fCMDyjtf7Oo48++vfrNehN5wEAlpaWtufn50/7vn9OSum5rhsKISaFEGT9LuWgiyMEVW2ojcWLEkb3zCClJM/zi3Vdn5VSfqPT6Xz/8ccfv/K/9rmpkey+++6L9u7d+xHgWJ7nn+q++tL7s2uvYKygk+ZIR+CPTZFMz74Mzpksy37b7/efPH/+fPZmsW/6XwBw4sSJuCiKO3uXLxyr060vlMrMdIYlvpQdK+OfjR6Y/5WU8m+nT5/u32zMtwTwmj57eF8s7Nq+bn/yywOjoyB3vveX9e1VIPtveX4j/QulztCnQ4BwGQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOS0wNC0xMVQxMzoyMDoxNy0wNDowMDwrNBwAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTktMDQtMTFUMTM6MjA6MTctMDQ6MDBNdoygAAAAAElFTkSuQmCC',
      smithing: 'data:image/png;base64,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'
    }

    return (
      <div className='panel panel-default'>
        <div className='panel-heading'>
          <div className='panel-title'>
            Crafting
          </div>
        </div>
        <div className='panel-body'>
          <Tabs
            activeKey={selectedTab}
            animation={false}
            onSelect={(key) => dispatch(setTab(this.keyMapping[key]))}
            id='selected-tab'
          >
            <Tab eventKey={1} title={<CraftingTabImage title={titles.crafting} image={images.crafting} />} />
            <Tab eventKey={2} title={<CraftingTabImage title={titles.furnace} image={images.furnace} />} />
            {minecraftVersion !== 'bedrock' ? [
              <Tab key={3} eventKey={3} title={<CraftingTabImage title={titles.blast} image={images.blast} />} />,
              <Tab key={4} eventKey={4} title={<CraftingTabImage title={titles.campfire} image={images.campfire} />} />,
              <Tab key={5} eventKey={5} title={<CraftingTabImage title={titles.smoking} image={images.smoking} />} />,
              <Tab key={6} eventKey={6} title={<CraftingTabImage title={titles.stonecutter} image={images.stonecutter} />} />,
              <Tab key={7} eventKey={7} title={<CraftingTabImage title={titles.smithing} image={images.smithing} />} />
            ] : null}
          </Tabs>
          <div className='crafting-holder'>
            <h6 className='crafting-title'>{titles[tab]}</h6>
            <div className={classNames('crafting', { full: tab === 'smithing' })}>
              <div className='recipe'>
                {tab === 'crafting'
                  ? (
                    <div className='table-wrap'>
                      {crafting.map((key, index) => {
                        return (
                          <CraftingGrid key={index} index={index} ingredient={key} size='normal' type='crafting' />
                        )
                      })}
                    </div>
                  )
                  : null}
                {['furnace', 'blast', 'campfire', 'smoking'].includes(tab)
                  ? (
                    <div className='vertical'>
                      <CraftingGrid index={0} ingredient={furnace.input} size='furnace' type='furnace' />
                      <div className='flame' />
                      <CraftingGrid index={0} ingredient={null} size='furnace' type='furnace' disabled />
                    </div>
                  )
                  : null}
                {tab === 'smithing'
                  ? (
                    <div className='horizontal'>
                      <CraftingGrid index={0} ingredient={generic.input[0]} size='large' type='generic' />
                      <div className='plus' />
                      <CraftingGrid index={1} ingredient={generic.input[1]} size='large' type='generic' />
                    </div>
                  )
                  : null}
                {tab === 'stonecutter'
                  ? <CraftingGrid index={0} ingredient={generic.input[0]} output={false} type='generic' size='large' />
                  : null}
              </div>
              <div className='arrow' />
              <div className='crafting-table-output'>
                <CraftingGrid ingredient={output} output size='large' />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect((store) => {
  return {
    tab: store.Options.tab,
    minecraftVersion: store.Options.minecraftVersion,
    crafting: store.Data.crafting,
    furnace: store.Data.furnace,
    generic: store.Data.generic,
    output: store.Data.output
  }
})(CraftingArea)
