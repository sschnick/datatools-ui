import { getAbbreviatedStopName } from './gtfs'
import { getConfigProperty } from '../../common/util/config'

export const CLICK_OPTIONS = ['DRAG_HANDLES', 'ADD_STOP_AT_CLICK', 'ADD_STOPS_AT_INTERVAL', 'ADD_STOPS_AT_INTERSECTIONS']
export const YEAR_FORMAT = 'YYYY-MM-DD'
export const TIMETABLE_FORMATS = ['HH:mm:ss', 'h:mm:ss a', 'h:mm:ssa', 'h:mm a', 'h:mma', 'h:mm', 'HHmm', 'hmm', 'HH:mm'].map(format => `YYYY-MM-DDT${format}`)
export const EXEMPLARS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'NO_SERVICE', 'CUSTOM', 'SWAP']

export function isTimeFormat (type) {
  return /TIME/.test(type)
}

export function getTimetableColumns (pattern, stops) {
  const columns = [
    {
      name: 'Block ID',
      width: 60,
      key: 'blockId',
      type: 'TEXT',
      placeholder: '300'
    },
    {
      name: 'Trip ID',
      width: 200,
      key: 'gtfsTripId',
      type: 'TEXT',
      placeholder: '12345678'
    },
    {
      name: 'Trip Headsign',
      width: 200,
      key: 'tripHeadsign',
      type: 'TEXT',
      placeholder: 'Destination via Transfer Center'
    }
  ]
  if (pattern && pattern.patternStops) {
    if (!pattern.useFrequency) {
      pattern.patternStops.map((ps, index) => {
        const stop = stops ? stops.find(st => st.id === ps.stopId) : null
        const stopName = stop ? stop.stop_name : ps.stopId
        const abbreviatedStopName = stop ? getAbbreviatedStopName(stop) : ps.stopId
        const TIME_WIDTH = 80
        columns.push({
          name: abbreviatedStopName,
          title: stopName,
          width: TIME_WIDTH,
          key: `stopTimes.${index}.arrivalTime`,
          colSpan: '2',
          // hidden: false,
          type: 'ARRIVAL_TIME',
          placeholder: 'HH:MM:SS'
        })
        columns.push({
          key: `stopTimes.${index}.departureTime`,
          width: TIME_WIDTH,
          // hidden: hideDepartureTimes,
          type: 'DEPARTURE_TIME',
          placeholder: 'HH:MM:SS'
        })
      })
    } else {
      // columns added if using freqency schedule type
      columns.push({
        name: 'Start time',
        width: 100,
        key: 'startTime',
        type: 'TIME',
        placeholder: 'HH:MM:SS'
      })
      columns.push({
        name: 'End time',
        width: 100,
        key: 'endTime',
        type: 'TIME',
        placeholder: 'HH:MM:SS'
      })
      columns.push({
        name: 'Headway',
        width: 60,
        key: 'headway',
        type: 'MINUTES',
        placeholder: '15 (min)'
      })
    }
  }
  return columns
}

export function getStopsForPattern (pattern, stops) {
  return pattern && pattern.patternStops && stops
    ? pattern.patternStops.map(ps => stops.find(s => s.id === ps.stopId))
    : []
}

export function sortAndFilterTrips (trips, useFrequency) {
  return trips
    ? trips.filter(t => t.useFrequency === useFrequency) // filter out based on useFrequency
    .sort((a, b) => {
      if (a.stopTimes[0].departureTime < b.stopTimes[0].departureTime) return -1
      if (a.stopTimes[0].departureTime > b.stopTimes[0].departureTime) return 1
      return 0
    })
    : []
}

export function getZones (stops, activeStop) {
  const zones = {}
  if (stops) {
    for (var i = 0; i < stops.length; i++) {
      const stop = stops[i]
      if (stop.zone_id) {
        let zone = zones[stop.zone_id]
        if (!zone) {
          zone = []
        }
        zone.push(stop)
        zones[stop.zone_id] = zone
      }
    }
    // add any new zone
    if (activeStop && activeStop.zone_id && !zones[activeStop.zone_id]) {
      let zone = zones[activeStop.zone_id]
      if (!zone) {
        zone = []
      }
      zone.push(activeStop)
      zones[activeStop.zone_id] = zone
    }
  }
  const zoneOptions = Object.keys(zones).map(key => {
    return {
      value: key,
      label: `${key} zone (${zones[key] ? zones[key].length : 0} stops)`
    }
  })
  return {zones, zoneOptions}
}

export function getEditorTable (component) {
  return getConfigProperty('modules.editor.spec').find(
    t => component === 'scheduleexception'
      ? t.id === 'calendar_dates'
      : component === 'fare'
      ? t.id === 'fare_attributes'
      : t.id === component
  )
}

export function canApproveGtfs (project, feedSource, user) {
  return project && feedSource && user && !user.permissions.hasFeedPermission(project.organizationId, project.id, feedSource.id, 'approve-gtfs')
}
