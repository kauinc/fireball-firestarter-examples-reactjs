import textBar from '../../../assets/ui/text-description-bar.png'
import comboBar from '../../../assets/ui/combo-bar.png'
import comboInactive from '../../../assets/ui/Combo_Inactive.png'
import crazyComboBar from '../../../assets/ui/crazy-combo-bar.png'
import crazyComboBarComplete from '../../../assets/ui/CrazyComboBar.png'
import historyBar from '../../../assets/ui/history-bar.png'
import myBetsHistory from '../../../assets/ui/my-bets-history.png'
import historyBetsToggleArrow from '../../../assets/ui/history-bets-toggle-arrow.png'
import balanceBar from '../../../assets/ui/balance-value-bar.png'
import hatsGlassesBar from '../../../assets/ui/hats-glasses-bar.png'
import ccBoard from '../../../assets/ui/cc-board.png'
import ccSelection from '../../../assets/ui/cc-selection.png'
import colorPatternBar from '../../../assets/ui/color-pattern-bar.png'
import patternDots from '../../../assets/ui/pattern-dots.png'
import patternSolid from '../../../assets/ui/pattern-solid.png'
import patternStripes from '../../../assets/ui/pattern-stripes.png'
import colorRedBar from '../../../assets/ui/color-red.png'
import colorYellowBar from '../../../assets/ui/color-yellow.png'
import colorGreenBar from '../../../assets/ui/color-green.png'
import colorCyanBar from '../../../assets/ui/color-cyan.png'
import colorBlueBar from '../../../assets/ui/color-blue.png'
import colorMagentaBar from '../../../assets/ui/color-magenta.png'
import accessoryHatsBar from '../../../assets/ui/accessory-hats.png'
import accessoryGlassesBar from '../../../assets/ui/accessory-glasses.png'
import hatIcon from '../../../assets/ui/hat.webp'
import glassesIcon from '../../../assets/ui/glasses.webp'
import allPositionBar from '../../../assets/ui/all-position-bar.png'
import positionFrame from '../../../assets/ui/frame-position-bar.png'
import scrollPositionBar from '../../../assets/ui/scroll-position-bar.png'
import scrollPositionThumb from '../../../assets/ui/scroll-position-thumb.png'
import betField from '../../../assets/ui/bet-field.png'
import roundButton from '../../../assets/ui/round-button.png'
import toggleFrame from '../../../assets/ui/toggle-button-frame.png'
import toggleSlide from '../../../assets/ui/toggle-slide-button.png'
import activeToggle from '../../../assets/ui/active-toggle-button.png'
import whiteChip from '../../../assets/ui/chip-white.png'
import yellowChip from '../../../assets/ui/chip-yellow.png'
import blackChip from '../../../assets/ui/chip-black.png'
import violetChip from '../../../assets/ui/chip-violet.png'
import redChip from '../../../assets/ui/chip-red.png'
import greenChip from '../../../assets/ui/chip-green.png'
import whiteChipSelected from '../../../assets/ui/WhiteSelected.png'
import yellowChipSelected from '../../../assets/ui/YellowSelected.png'
import blackChipSelected from '../../../assets/ui/BlackSelected.png'
import violetChipSelected from '../../../assets/ui/VioletSelected.png'
import redChipSelected from '../../../assets/ui/RedSelected.png'
import greenChipSelected from '../../../assets/ui/GreenSelected.png'
import fullscreen from '../../../assets/ui/fullscreen.png'

export const uiAssets = Object.freeze({
  textBar,
  comboBar,
  comboInactive,
  crazyComboBar,
  crazyComboBarComplete,
  historyBar,
  myBetsHistory,
  historyBetsToggleArrow,
  balanceBar,
  hatsGlassesBar,
  ccBoard,
  ccSelection,
  colorPatternBar,
  hatIcon,
  glassesIcon,
  comboBarIcons: Object.freeze({
    colors: Object.freeze({
      Red: colorRedBar,
      Yellow: colorYellowBar,
      Green: colorGreenBar,
      Cyan: colorCyanBar,
      Blue: colorBlueBar,
      Magenta: colorMagentaBar,
    }),
    patterns: Object.freeze({
      Dots: patternDots,
      Solid: patternSolid,
      Stripes: patternStripes,
    }),
    accessories: Object.freeze({
      Hats: accessoryHatsBar,
      Glasses: accessoryGlassesBar,
    }),
  }),
  allPositionBar,
  positionFrame,
  scrollPositionBar,
  scrollPositionThumb,
  betField,
  roundButton,
  toggleFrame,
  toggleSlide,
  activeToggle,
  fullscreen,
  chips: Object.freeze({
    0.2: whiteChip,
    0.5: yellowChip,
    1: blackChip,
    2: violetChip,
    5: redChip,
    25: greenChip,
  }),
  chipsSelected: Object.freeze({
    0.2: whiteChipSelected,
    0.5: yellowChipSelected,
    1: blackChipSelected,
    2: violetChipSelected,
    5: redChipSelected,
    25: greenChipSelected,
  }),
})
