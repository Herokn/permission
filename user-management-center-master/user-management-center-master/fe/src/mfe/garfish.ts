import Garfish from '@garfish/core'
import { GarfishRouter } from '@garfish/router'
import { GarfishBrowserVm } from '@garfish/browser-vm'
import { GarfishBrowserSnapshot } from '@garfish/browser-snapshot'
const garfish = new Garfish({ plugins: [GarfishRouter(), GarfishBrowserVm(), GarfishBrowserSnapshot()] })
export default garfish
