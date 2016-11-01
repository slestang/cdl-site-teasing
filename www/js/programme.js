(function(global, moment) {
  "use strict";

  var TIME_SLICE = 5 // minutes
  var SLOT_DURATION = 30 // minutes
  var config = {
    programmeUrl: "https://participez-2016.capitoledulibre.org/planning/program/public/?format=xml"
  }

  function getChildText(parent, elemTagName) {
    return parent.getElementsByTagName(elemTagName)[0].textContent
  }

  // the time unit used is the number of TIME_SLICE since the beginning of the day
  function timeStrToInt(timeStr) {
    var startSplit = timeStr.split(':')
    return parseInt(startSplit[0]) * 60 / TIME_SLICE + parseInt(startSplit[1]) / TIME_SLICE
  }

  function timeIntToStr(timeInt) {
    var hours = Math.floor(timeInt / 60 * TIME_SLICE)
    hours = (hours < 10) ? '0' + hours.toString() : hours.toString()
    var minutes = (timeInt % (60 / TIME_SLICE)) * TIME_SLICE
    minutes = (minutes < 10) ? '0' + minutes.toString() : minutes.toString()
    return hours + ':' + minutes
  }

  function convertDateStrToHumanDateStr(dateStr) {
    moment.locale('fr')
    var humanDate = moment(dateStr, 'YYYY-MM-DD').format('dddd DD MMMM')
    return humanDate.substring(0, 1).toUpperCase() + humanDate.substr(1)
  }

  function fetchProgram(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      callback(xhr.responseXML);
    }
    xhr.onerror = function() {
      console.error("Error while getting program XML.", xhr.status, xhr.statusText);
    }
    xhr.open("GET", config.programmeUrl);
    xhr.responseType = "document";
    xhr.send();
  }

  function createProgramTables(programXML) {
    var programmeContainer = document.getElementById('programme')
    programmeContainer.innerHTML = '' // we remove the loader

    var days = new Map()
    var rooms = new Set()
    var events = []

    var dayElems = Array.prototype.slice.call(programXML.getElementsByTagName('day'))
    dayElems.forEach(function(dayElem) {
      var dayIndex = parseInt(dayElem.getAttribute('index'))
      var dayDate = dayElem.getAttribute('date')
      var dayInfo = { date: dayDate, start: 23 * (60 / TIME_SLICE), end: 0 }
      days.set(dayIndex, dayInfo)

      var roomElems = Array.prototype.slice.call(dayElem.children)
      roomElems = roomElems.filter(function(r) { return r.nodeName === 'room' })
      roomElems.forEach(function(roomElem) {
        var roomName = roomElem.getAttribute('name')
        rooms.add(roomName)
      })

      var eventElems = Array.prototype.slice.call(dayElem.getElementsByTagName('event'))
      eventElems.forEach(function(eventElem) {
        try {
          var start = timeStrToInt(getChildText(eventElem, 'start'))
          var duration = timeStrToInt(getChildText(eventElem, 'duration'))
          if (dayInfo.start > start) {
            dayInfo.start = start
          }
          if (dayInfo.end < (start+duration)) {
            dayInfo.end = start+duration
          }

          var event = {
            day: dayIndex,
            id: parseInt(eventElem.getAttribute('id')),
            start: start,
            duration: duration,
            room: getChildText(eventElem, 'room'),
            slug: getChildText(eventElem, 'slug'),
            title: getChildText(eventElem, 'title'),
            subtitle: getChildText(eventElem, 'subtitle'),
            track: getChildText(eventElem, 'track'),
            type: getChildText(eventElem, 'type'),
            language: getChildText(eventElem, 'language'),
            abstract: getChildText(eventElem, 'abstract'),
            description: getChildText(eventElem, 'description'),
          }
          // console.log("Event", start, duration, dayInfo.end, event.title)
          // TODO persons and links
          /*
          <persons>
              <person id="15">ArboreSign</person>
          </persons>
          <links></links>
          */
          events.push(event)
        } catch (e) {
          console.error("Error while parsing event", eventElem, e)
        }
      })
    })
    // console.log("Events", events, days)

    var roomsArray = []
    rooms.forEach(function(r) { roomsArray.push(r) })
    var roomsHeader = roomsArray.reduce(function(acc, room) { acc += '<th class="header-room">' + room +'</th>'; return acc }, '')


    days.forEach(function(dayInfo, dayIndex) {
      var rows = ''
      var timeByRooms = new Map(roomsArray.map(function(r) { return [r, dayInfo.start]} ))
      for (var idx = dayInfo.start; idx < dayInfo.end; idx++) {
//          console.log("idx", idx, timeIntToStr(idx), (idx * TIME_SLICE) % SLOT_DURATION)
        var row = '<tr>'
        if ((idx * TIME_SLICE) % SLOT_DURATION === 0) {
          var rowSpan = SLOT_DURATION / TIME_SLICE
          var slotEndTime = idx+SLOT_DURATION/TIME_SLICE
          row += '<td rowspan="' + rowSpan + '" class="slot-times">' + timeIntToStr(idx) + ' – ' + timeIntToStr(slotEndTime) + '</td>'
          roomsArray.forEach(function(room) {
            var lastCellEndTime = timeByRooms.get(room)
            var event = events.find(function(e) { return e.day === dayIndex && e.start === idx && e.room === room })
            if (event) {
              var eventRowSpan = event.duration
              if (event.start < lastCellEndTime) {
                console.error("Two events are one the same room at the same time", room, event)
              }
              timeByRooms.set(room, event.start + event.duration)
              var typeClass = 'event-type-'
              switch (event.type) {
                case 'conference': typeClass += 'conference'; break
                case 'atelier': typeClass += 'atelier'; break
                case 'keynote': typeClass += 'keynote'; break
              }
              row += '<td rowspan="' + eventRowSpan + '" class="event ' + typeClass + '">' +
                  '<div class="event-title">'+ event.title +'</div></td>'
            } else {
              if (lastCellEndTime <= idx || (lastCellEndTime > idx && lastCellEndTime < slotEndTime)) {
                row += '<td rowspan="' + (slotEndTime - lastCellEndTime) + '" class="empty-slot"></td>'
                timeByRooms.set(room, slotEndTime)
              }
            }
          })
        }
        row += '</tr>'
        rows += row
      }

      programmeContainer.insertAdjacentHTML('beforeend',
          '<div id="day' + dayIndex + '">' +
          '<h2 class="text-center">' + convertDateStrToHumanDateStr(dayInfo.date) +'</h2>' +
          '<table id="table' + dayIndex + '" class="table table-bordered">' +
          '<thead>' +
          '<tr>' +
          '<th></th>' + // the hours column
          roomsHeader +
          '</tr>' +
          '</thead>' +
          '<tbody>' +
          rows +
          '</tbody>' +
          '</table>' +
          '</div>'
      )
    })
  }

  fetchProgram(createProgramTables)
})(window, window.moment)
