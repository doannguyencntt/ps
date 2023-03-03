import portalAxios from '@/services/portalAxios'
import configurateInterceptor from './configurateInterceptor'

configurateInterceptor(portalAxios)

export default portalAxios
