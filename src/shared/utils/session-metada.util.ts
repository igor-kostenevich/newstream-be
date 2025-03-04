import type { Request } from 'express'
import type { SessionMetadata } from '../types/session-metadata.types'
import { IS_DEV_ENV } from './is-dev.util'
import DeviceDetector = require('device-detector-js')
import { lookup } from 'geoip-lite'
import * as countries from 'i18n-iso-countries'

countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export function getSessionMetadata(req: Request, userAgent: string): SessionMetadata {
  const ip = IS_DEV_ENV 
    ? '173.166.164.121'
    : Array.isArray(req.headers['cf-connecting-ip']) 
      ? req.headers['cf-connecting-ip'][0] 
      : req.headers['cf-connecting-ip'] || 
        (typeof req.headers['x-forwarder-for'] === 'string' 
          ? req.headers['x-forwarder-for'].split(',')[0] 
          : req.ip
        ) 

  const location = lookup(ip || '')
  const device = new DeviceDetector().parse(userAgent)

  return {
    ip: ip ?? '',
    location: {
      country: location?.country ? countries.getName(location.country, 'en') || 'Unknown' : 'Unknown',
      city: location?.city || 'Unknown',
      latidute: location?.ll[0] || 0,
      longitude: location?.ll[1] || 0
    },
    device: {
      browser: device.client?.name || 'Unknown',
      os: device.os?.name || 'Unknown',
      type: device.device?.type || 'Unknown',
    }
  }
}